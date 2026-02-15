// ============================================================
// Eligibility Engine
// ============================================================
// Hybrid Matching Model:
//
// Phase 1: SQL pre-filter
//   Filters schemes by status=APPROVED, then narrows by
//   structured user fields (age, gender, category, income,
//   occupation, state).
//
// Phase 2: Refinement
//   JavaScript-level filtering using flag fields:
//   - BPL, disability, minority flags
//   - Rural/urban rules
//   - Edge-case validations
//
// The eligibility vector is stored as JSON on the user record
// for fast retrieval and future ML integration.
// ============================================================

import prisma from "@/lib/prisma";

/**
 * Calculate age from date of birth.
 */
function calculateAge(dateOfBirth) {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/**
 * Derive income bracket from annual income.
 */
export function deriveIncomeBracket(annualIncome) {
  if (annualIncome == null) return null;
  if (annualIncome <= 100000) return "BELOW_1L";
  if (annualIncome <= 250000) return "1L_TO_2_5L";
  if (annualIncome <= 500000) return "2_5L_TO_5L";
  if (annualIncome <= 800000) return "5L_TO_8L";
  if (annualIncome <= 1000000) return "8L_TO_10L";
  return "ABOVE_10L";
}

/**
 * Build eligibility vector from user profile.
 * This vector is stored on the User record for fast retrieval.
 */
export function buildEligibilityVector(user) {
  const age = user.dateOfBirth ? calculateAge(user.dateOfBirth) : null;
  const incomeBracket = deriveIncomeBracket(user.annualIncome);

  return {
    age,
    gender: user.gender,
    category: user.category,
    state: user.state,
    annualIncome: user.annualIncome,
    incomeBracket,
    occupation: user.occupation,
    isRural: user.isRural,
    isBPL: user.isBPL,
    isDisabled: user.isDisabled,
    isMinority: user.isMinority,
  };
}

/**
 * Phase 1: SQL pre-filter.
 * Fetches all APPROVED schemes (lightweight — eligibility rules are JSON).
 */
async function fetchApprovedSchemes() {
  return prisma.scheme.findMany({
    where: { status: "APPROVED" },
  });
}

/**
 * Phase 2: Refinement — check if a user matches a scheme's eligibility rules.
 */
function matchesScheme(vector, scheme) {
  const rules = scheme.eligibilityRules;

  // Age check
  if (rules.minAge != null && (vector.age == null || vector.age < rules.minAge)) {
    return false;
  }
  if (rules.maxAge != null && (vector.age == null || vector.age > rules.maxAge)) {
    return false;
  }

  // Gender check
  if (rules.genders && rules.genders.length > 0) {
    if (!vector.gender || !rules.genders.includes(vector.gender)) {
      return false;
    }
  }

  // Category check
  if (rules.categories && rules.categories.length > 0) {
    if (!vector.category || !rules.categories.includes(vector.category)) {
      return false;
    }
  }

  // Income check
  if (rules.maxIncome != null) {
    if (vector.annualIncome == null || vector.annualIncome > rules.maxIncome) {
      return false;
    }
  }

  // Occupation check
  if (rules.occupations && rules.occupations.length > 0) {
    if (!vector.occupation || !rules.occupations.includes(vector.occupation)) {
      return false;
    }
  }

  // State scoping
  if (scheme.applicableStates && scheme.applicableStates.length > 0) {
    if (!vector.state || !scheme.applicableStates.includes(vector.state)) {
      return false;
    }
  }

  // Flag-based checks
  if (rules.bplOnly && !vector.isBPL) return false;
  if (rules.disabilityOnly && !vector.isDisabled) return false;
  if (rules.minorityOnly && !vector.isMinority) return false;

  // Rural/Urban check (null isRural = unknown, don't match either restriction)
  if (rules.ruralOnly && vector.isRural !== true) return false;
  if (rules.urbanOnly && vector.isRural !== false) return false;

  return true;
}

/**
 * Main entry point: find all eligible schemes for a user.
 */
export async function findEligibleSchemes(user) {
  const vector = buildEligibilityVector(user);
  const schemes = await fetchApprovedSchemes();

  const matched = schemes.filter((scheme) => matchesScheme(vector, scheme));

  return {
    vector,
    matchedSchemeIds: matched.map((s) => s.id),
    matchedSchemes: matched,
  };
}

/**
 * Generate and persist eligibility vector for a user.
 */
export async function generateAndStoreEligibility(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const { vector, matchedSchemeIds } = await findEligibleSchemes(user);
  const incomeBracket = deriveIncomeBracket(user.annualIncome);

  await prisma.user.update({
    where: { id: userId },
    data: {
      eligibilityVector: { ...vector, matchedSchemeIds },
      incomeBracket,
    },
  });

  return { vector, matchedSchemeIds };
}
