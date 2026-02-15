// ============================================================
// Seed Schemes — Gov Scheme Teller
// ============================================================
// Populates the database with government schemes.
// Can be run multiple times to add more scheme data.
//
// Creates a diverse collection of:
// - Central Government Schemes (pan-India)
// - State-specific Schemes (various states)
// ============================================================

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";

const datasourceUrl = process.env.PRISMA_DATABASE_URL || process.env.DATABASE_URL;

const prisma = new PrismaClient({
  accelerateUrl: datasourceUrl,
});

async function main() {
  console.log("🌱 Seeding government schemes...\n");

  let createdCount = 0;

  // ─── Central Schemes ───────────────────────────────────
  console.log("📋 Adding Central schemes...");
  
  const centralSchemes = [
    {
      name: "PM Kisan Samman Nidhi",
      description:
        "Income support of Rs 6,000 per year to all land-holding farmer families across the country in three equal installments of Rs 2,000 each.",
      ministry: "Ministry of Agriculture and Farmers Welfare",
      level: "CENTRAL" as const,
      status: "APPROVED" as const,
      eligibilityRules: {
        occupations: ["FARMER"],
        maxIncome: 500000,
      },
      applicableStates: null,
      officialLink: "https://pmkisan.gov.in/",
    },
    {
      name: "Ayushman Bharat - PM-JAY",
      description:
        "Health insurance cover of Rs 5 lakh per family per year for secondary and tertiary care hospitalization to economically vulnerable families.",
      ministry: "Ministry of Health and Family Welfare",
      level: "CENTRAL" as const,
      status: "APPROVED" as const,
      eligibilityRules: {
        maxIncome: 250000,
        bplOnly: true,
      },
      applicableStates: null,
      officialLink: "https://pmjay.gov.in/",
    },
    {
      name: "PM Awas Yojana - Gramin",
      description:
        "Financial assistance for construction of pucca houses with basic amenities to all houseless and those living in kutcha/dilapidated houses in rural areas.",
      ministry: "Ministry of Rural Development",
      level: "CENTRAL" as const,
      status: "APPROVED" as const,
      eligibilityRules: {
        maxIncome: 300000,
        ruralOnly: true,
        bplOnly: true,
      },
      applicableStates: null,
      officialLink: "https://pmayg.nic.in/",
    },
    {
      name: "PM Awas Yojana - Urban",
      description:
        "Housing for all in urban areas with affordable housing for economically weaker sections, low-income groups, and middle-income groups.",
      ministry: "Ministry of Housing and Urban Affairs",
      level: "CENTRAL" as const,
      status: "APPROVED" as const,
      eligibilityRules: {
        maxIncome: 600000,
        urbanOnly: true,
      },
      applicableStates: null,
      officialLink: "https://pmaymis.gov.in/",
    },
    {
      name: "Pradhan Mantri Mudra Yojana",
      description:
        "Loans up to Rs 10 lakh to small and micro business enterprises to encourage entrepreneurship and generate employment.",
      ministry: "Ministry of Finance",
      level: "CENTRAL" as const,
      status: "APPROVED" as const,
      eligibilityRules: {
        occupations: ["SELF_EMPLOYED"],
        minAge: 18,
      },
      applicableStates: null,
      officialLink: "https://www.mudra.org.in/",
    },
    {
      name: "National Scholarship Portal",
      description:
        "Centralized portal for various scholarship schemes for students from pre-matric to post-matric and higher education.",
      ministry: "Ministry of Education",
      level: "CENTRAL" as const,
      status: "APPROVED" as const,
      eligibilityRules: {
        occupations: ["STUDENT"],
        maxIncome: 600000,
      },
      applicableStates: null,
      officialLink: "https://scholarships.gov.in/",
    },
    {
      name: "PM Ujjwala Yojana",
      description:
        "Free LPG connections to women from Below Poverty Line (BPL) households to provide clean cooking fuel.",
      ministry: "Ministry of Petroleum and Natural Gas",
      level: "CENTRAL" as const,
      status: "APPROVED" as const,
      eligibilityRules: {
        genders: ["FEMALE"],
        bplOnly: true,
        minAge: 18,
      },
      applicableStates: null,
      officialLink: "https://www.pmujjwalayojana.com/",
    },
    {
      name: "Atal Pension Yojana",
      description:
        "Pension scheme for unorganized sector workers providing guaranteed pension of Rs 1,000 to Rs 5,000 per month after 60 years.",
      ministry: "Ministry of Finance",
      level: "CENTRAL" as const,
      status: "APPROVED" as const,
      eligibilityRules: {
        minAge: 18,
        maxAge: 40,
        maxIncome: 500000,
      },
      applicableStates: null,
      officialLink: "https://www.npscra.nsdl.co.in/atal-pension-yojana.php",
    },
    {
      name: "Stand Up India Scheme",
      description:
        "Loans between Rs 10 lakh and Rs 1 crore to SC/ST and women entrepreneurs for setting up greenfield enterprises.",
      ministry: "Ministry of Finance",
      level: "CENTRAL" as const,
      status: "APPROVED" as const,
      eligibilityRules: {
        categories: ["SC", "ST"],
        minAge: 18,
        occupations: ["SELF_EMPLOYED"],
      },
      applicableStates: null,
      officialLink: "https://www.standupmitra.in/",
    },
    {
      name: "PM Matru Vandana Yojana",
      description:
        "Cash incentive of Rs 5,000 to pregnant women and lactating mothers for first living child to improve health and nutrition.",
      ministry: "Ministry of Women and Child Development",
      level: "CENTRAL" as const,
      status: "APPROVED" as const,
      eligibilityRules: {
        genders: ["FEMALE"],
        minAge: 19,
        maxIncome: 500000,
      },
      applicableStates: null,
      officialLink: "https://pmmvy.wcd.gov.in/",
    },
    {
      name: "PM Fasal Bima Yojana",
      description:
        "Comprehensive crop insurance scheme covering yield losses due to non-preventable natural risks for farmers.",
      ministry: "Ministry of Agriculture and Farmers Welfare",
      level: "CENTRAL" as const,
      status: "APPROVED" as const,
      eligibilityRules: {
        occupations: ["FARMER"],
      },
      applicableStates: null,
      officialLink: "https://pmfby.gov.in/",
    },
    {
      name: "PM Kaushal Vikas Yojana",
      description:
        "Skill training initiative for youth to improve employability through industry-relevant skill training.",
      ministry: "Ministry of Skill Development and Entrepreneurship",
      level: "CENTRAL" as const,
      status: "APPROVED" as const,
      eligibilityRules: {
        minAge: 15,
        maxAge: 45,
        occupations: ["STUDENT", "UNEMPLOYED"],
      },
      applicableStates: null,
      officialLink: "https://www.pmkvyofficial.org/",
    },
  ];

  for (const scheme of centralSchemes) {
    try {
      const existing = await prisma.scheme.findFirst({
        where: { name: scheme.name },
      });
      
      if (!existing) {
        await prisma.scheme.create({ data: scheme });
        console.log(`  ✓ ${scheme.name}`);
        createdCount++;
      } else {
        console.log(`  ⊙ ${scheme.name} (already exists)`);
      }
    } catch (error) {
      console.error(`  ✗ Failed to create ${scheme.name}:`, error);
    }
  }

  // ─── State Schemes ─────────────────────────────────────
  console.log("\n📋 Adding State schemes...");
  
  const stateSchemes = [
    {
      name: "Kalia Yojana",
      description:
        "Financial assistance to small and marginal farmers, landless agricultural households, and vulnerable agricultural households in Odisha.",
      ministry: "Department of Agriculture, Odisha",
      level: "STATE" as const,
      status: "APPROVED" as const,
      eligibilityRules: {
        occupations: ["FARMER"],
        maxIncome: 200000,
        categories: ["GENERAL", "OBC", "SC", "ST"],
      },
      applicableStates: ["ODISHA"],
      officialLink: "https://kalia.odisha.gov.in/",
    },
    {
      name: "Mukhyamantri Ladli Behna Yojana",
      description:
        "Monthly financial assistance of Rs 1,250 to women aged 23-60 years from economically weaker families in Madhya Pradesh.",
      ministry: "Department of Women and Child Development, Madhya Pradesh",
      level: "STATE" as const,
      status: "APPROVED" as const,
      eligibilityRules: {
        genders: ["FEMALE"],
        minAge: 23,
        maxAge: 60,
        maxIncome: 250000,
      },
      applicableStates: ["MADHYA_PRADESH"],
      officialLink: "https://ladlibahna.mp.gov.in/",
    },
    {
      name: "YSR Rythu Bharosa",
      description:
        "Input assistance of Rs 13,500 per year to all farmer families in Andhra Pradesh for crop investment support.",
      ministry: "Department of Agriculture, Andhra Pradesh",
      level: "STATE" as const,
      status: "APPROVED" as const,
      eligibilityRules: {
        occupations: ["FARMER"],
        categories: ["GENERAL", "OBC", "SC", "ST", "EWS"],
      },
      applicableStates: ["ANDHRA_PRADESH"],
      officialLink: "https://ysrrythubharosa.ap.gov.in/",
    },
    {
      name: "Amma Two Wheeler Scheme",
      description:
        "Financial assistance of Rs 25,000 for purchase of two-wheeler or moped to working women in Tamil Nadu.",
      ministry: "Department of Social Welfare, Tamil Nadu",
      level: "STATE" as const,
      status: "APPROVED" as const,
      eligibilityRules: {
        genders: ["FEMALE"],
        minAge: 18,
        maxIncome: 250000,
        occupations: ["SALARIED", "SELF_EMPLOYED"],
      },
      applicableStates: ["TAMIL_NADU"],
      officialLink: "https://www.tn.gov.in/",
    },
    {
      name: "Delhi Mukhyamantri Tirth Yatra Yojana",
      description:
        "Free pilgrimage tour to senior citizens (60+ years) to various religious places across India from Delhi.",
      ministry: "Department of Welfare, Delhi",
      level: "STATE" as const,
      status: "APPROVED" as const,
      eligibilityRules: {
        minAge: 60,
      },
      applicableStates: ["DELHI"],
      officialLink: "https://delhi.gov.in/",
    },
    {
      name: "Maharashtra Shetakari Sanman Yojana",
      description:
        "Annual financial assistance of Rs 6,000 to eligible farmers in Maharashtra for agricultural inputs.",
      ministry: "Department of Agriculture, Maharashtra",
      level: "STATE" as const,
      status: "APPROVED" as const,
      eligibilityRules: {
        occupations: ["FARMER"],
        maxIncome: 600000,
      },
      applicableStates: ["MAHARASHTRA"],
      officialLink: "https://mahakisanportal.in/",
    },
    {
      name: "Rythu Bandhu Scheme",
      description:
        "Investment support of Rs 10,000 per acre per year to all farmers in Telangana for two crop seasons.",
      ministry: "Department of Agriculture, Telangana",
      level: "STATE" as const,
      status: "APPROVED" as const,
      eligibilityRules: {
        occupations: ["FARMER"],
      },
      applicableStates: ["TELANGANA"],
      officialLink: "https://rythubandhu.telangana.gov.in/",
    },
    {
      name: "West Bengal Krishak Bandhu Scheme",
      description:
        "Financial assistance of Rs 5,000 per year to small and marginal farmers for cultivation support.",
      ministry: "Department of Agriculture, West Bengal",
      level: "STATE" as const,
      status: "APPROVED" as const,
      eligibilityRules: {
        occupations: ["FARMER"],
        maxIncome: 500000,
      },
      applicableStates: ["WEST_BENGAL"],
      officialLink: "https://krishakbandhu.net/",
    },
    {
      name: "Rajasthan Mukhyamantri Yuva Sambal Yojana",
      description:
        "Unemployment allowance of Rs 3,500 per month to educated unemployed youth in Rajasthan for up to 2 years.",
      ministry: "Department of Employment, Rajasthan",
      level: "STATE" as const,
      status: "APPROVED" as const,
      eligibilityRules: {
        minAge: 21,
        maxAge: 30,
        occupations: ["UNEMPLOYED"],
      },
      applicableStates: ["RAJASTHAN"],
      officialLink: "https://employment.livelihoods.rajasthan.gov.in/",
    },
    {
      name: "Karnataka Anna Bhagya Scheme",
      description:
        "Free food grains of 10 kg per person per month to all Below Poverty Line (BPL) and Antyodaya Anna Yojana (AAY) families.",
      ministry: "Department of Food and Civil Supplies, Karnataka",
      level: "STATE" as const,
      status: "APPROVED" as const,
      eligibilityRules: {
        bplOnly: true,
      },
      applicableStates: ["KARNATAKA"],
      officialLink: "https://ahara.kar.nic.in/",
    },
    {
      name: "Gujarat Vahli Dikri Yojana",
      description:
        "Financial assistance of Rs 1.1 lakh for education and marriage expenses of girl child from economically weaker families.",
      ministry: "Department of Women and Child Development, Gujarat",
      level: "STATE" as const,
      status: "APPROVED" as const,
      eligibilityRules: {
        genders: ["FEMALE"],
        maxAge: 18,
        maxIncome: 200000,
      },
      applicableStates: ["GUJARAT"],
      officialLink: "https://gujarat.gov.in/",
    },
    {
      name: "Punjab Shagun Scheme",
      description:
        "Financial assistance of Rs 21,000 for marriage of SC/ST girls and Rs 11,000 for purchase of household items.",
      ministry: "Department of Social Justice, Punjab",
      level: "STATE" as const,
      status: "APPROVED" as const,
      eligibilityRules: {
        genders: ["FEMALE"],
        categories: ["SC", "ST"],
        minAge: 18,
      },
      applicableStates: ["PUNJAB"],
      officialLink: "https://punjab.gov.in/",
    },
    {
      name: "Haryana Kaushal Rozgar Nigam",
      description:
        "Skill development and employment generation scheme providing training and job opportunities to youth.",
      ministry: "Department of Skill Development and Industrial Training, Haryana",
      level: "STATE" as const,
      status: "APPROVED" as const,
      eligibilityRules: {
        minAge: 18,
        maxAge: 35,
        occupations: ["STUDENT", "UNEMPLOYED"],
      },
      applicableStates: ["HARYANA"],
      officialLink: "https://hrex.gov.in/",
    },
    {
      name: "Kerala Pension for Widows",
      description:
        "Monthly pension of Rs 1,600 to widows from economically weaker sections in Kerala.",
      ministry: "Department of Social Justice, Kerala",
      level: "STATE" as const,
      status: "APPROVED" as const,
      eligibilityRules: {
        genders: ["FEMALE"],
        minAge: 18,
        maxIncome: 100000,
      },
      applicableStates: ["KERALA"],
      officialLink: "https://socialsecuritymission.gov.in/",
    },
    {
      name: "Uttar Pradesh Free Laptop Scheme",
      description:
        "Distribution of free laptops or tablets to meritorious students in 10th and 12th standard from government schools.",
      ministry: "Department of Information Technology, Uttar Pradesh",
      level: "STATE" as const,
      status: "APPROVED" as const,
      eligibilityRules: {
        occupations: ["STUDENT"],
        maxIncome: 200000,
      },
      applicableStates: ["UTTAR_PRADESH"],
      officialLink: "https://freeaptop.up.nic.in/",
    },
  ];

  for (const scheme of stateSchemes) {
    try {
      const existing = await prisma.scheme.findFirst({
        where: { name: scheme.name },
      });
      
      if (!existing) {
        await prisma.scheme.create({ data: scheme });
        console.log(`  ✓ ${scheme.name}`);
        createdCount++;
      } else {
        console.log(`  ⊙ ${scheme.name} (already exists)`);
      }
    } catch (error) {
      console.error(`  ✗ Failed to create ${scheme.name}:`, error);
    }
  }

  console.log(`\n✅ Scheme seeding completed!`);
  console.log(`   📊 Created: ${createdCount} new schemes`);
  console.log(`   📊 Total schemes in database: ${await prisma.scheme.count()}\n`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
