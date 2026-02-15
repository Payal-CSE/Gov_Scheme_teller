"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, ArrowRight, ArrowLeft } from "lucide-react";

const INDIAN_STATES = [
  { value: "ANDHRA_PRADESH", label: "Andhra Pradesh" },
  { value: "ARUNACHAL_PRADESH", label: "Arunachal Pradesh" },
  { value: "ASSAM", label: "Assam" },
  { value: "BIHAR", label: "Bihar" },
  { value: "CHHATTISGARH", label: "Chhattisgarh" },
  { value: "GOA", label: "Goa" },
  { value: "GUJARAT", label: "Gujarat" },
  { value: "HARYANA", label: "Haryana" },
  { value: "HIMACHAL_PRADESH", label: "Himachal Pradesh" },
  { value: "JHARKHAND", label: "Jharkhand" },
  { value: "KARNATAKA", label: "Karnataka" },
  { value: "KERALA", label: "Kerala" },
  { value: "MADHYA_PRADESH", label: "Madhya Pradesh" },
  { value: "MAHARASHTRA", label: "Maharashtra" },
  { value: "MANIPUR", label: "Manipur" },
  { value: "MEGHALAYA", label: "Meghalaya" },
  { value: "MIZORAM", label: "Mizoram" },
  { value: "NAGALAND", label: "Nagaland" },
  { value: "ODISHA", label: "Odisha" },
  { value: "PUNJAB", label: "Punjab" },
  { value: "RAJASTHAN", label: "Rajasthan" },
  { value: "SIKKIM", label: "Sikkim" },
  { value: "TAMIL_NADU", label: "Tamil Nadu" },
  { value: "TELANGANA", label: "Telangana" },
  { value: "TRIPURA", label: "Tripura" },
  { value: "UTTAR_PRADESH", label: "Uttar Pradesh" },
  { value: "UTTARAKHAND", label: "Uttarakhand" },
  { value: "WEST_BENGAL", label: "West Bengal" },
  { value: "ANDAMAN_NICOBAR", label: "Andaman & Nicobar Islands" },
  { value: "CHANDIGARH", label: "Chandigarh" },
  { value: "DADRA_NAGAR_HAVELI_DAMAN_DIU", label: "Dadra & Nagar Haveli and Daman & Diu" },
  { value: "DELHI", label: "Delhi" },
  { value: "JAMMU_KASHMIR", label: "Jammu & Kashmir" },
  { value: "LADAKH", label: "Ladakh" },
  { value: "LAKSHADWEEP", label: "Lakshadweep" },
  { value: "PUDUCHERRY", label: "Puducherry" },
];

const CATEGORIES = [
  { value: "GENERAL", label: "General" },
  { value: "OBC", label: "OBC" },
  { value: "SC", label: "SC" },
  { value: "ST", label: "ST" },
  { value: "EWS", label: "EWS" },
];

const OCCUPATIONS = [
  { value: "SALARIED", label: "Salaried" },
  { value: "SELF_EMPLOYED", label: "Self Employed" },
  { value: "FARMER", label: "Farmer" },
  { value: "STUDENT", label: "Student" },
  { value: "UNEMPLOYED", label: "Unemployed" },
  { value: "RETIRED", label: "Retired" },
  { value: "OTHER", label: "Other" },
];

const STEPS = [
  { id: 1, title: "Personal Details" },
  { id: 2, title: "Location" },
  { id: 3, title: "Economic Details" },
  { id: 4, title: "Additional Info" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Guard: redirect if already onboarded
  useEffect(() => {
    if (session?.user?.onboardingCompleted) {
      router.replace("/dashboard");
    }
  }, [session, router]);

  const [form, setForm] = useState({
    dateOfBirth: "",
    gender: "",
    category: "",
    state: "",
    district: "",
    isRural: "",
    annualIncome: "",
    occupation: "",
    isBPL: false,
    isDisabled: false,
    isMinority: false,
  });

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function nextStep() {
    setStep((prev) => Math.min(prev + 1, 4));
  }

  function prevStep() {
    setStep((prev) => Math.max(prev - 1, 1));
  }

  async function handleSubmit() {
    setError("");
    setLoading(true);

    try {
      const payload = {
        ...form,
        annualIncome: form.annualIncome ? parseFloat(form.annualIncome) : null,
        isRural: form.isRural === "true" ? true : form.isRural === "false" ? false : null,
      };

      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      // Update the JWT session so middleware knows onboarding is done
      await update({ onboardingCompleted: true });

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const selectClasses =
    "w-full rounded-md border border-border bg-background py-2 px-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-ring";
  const inputClasses = selectClasses;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground">
            Complete Your Profile
          </h1>
          <p className="mt-1 text-muted-foreground">
            Help us find the right schemes for you.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {STEPS.map((s) => (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  step >= s.id
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {s.id}
              </div>
              {s.id < STEPS.length && (
                <div
                  className={`h-0.5 w-8 ${
                    step > s.id ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="rounded-lg border border-border bg-card p-8">
          {/* Step 1: Personal Details */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-card-foreground">
                Personal Details
              </h2>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => updateField("dateOfBirth", e.target.value)}
                  className={inputClasses}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Gender
                </label>
                <select
                  value={form.gender}
                  onChange={(e) => updateField("gender", e.target.value)}
                  className={selectClasses}
                >
                  <option value="">Select gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => updateField("category", e.target.value)}
                  className={selectClasses}
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-card-foreground">
                Location
              </h2>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  State / Union Territory
                </label>
                <select
                  value={form.state}
                  onChange={(e) => updateField("state", e.target.value)}
                  className={selectClasses}
                >
                  <option value="">Select state</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  District
                </label>
                <input
                  type="text"
                  value={form.district}
                  onChange={(e) => updateField("district", e.target.value)}
                  placeholder="Enter your district"
                  className={inputClasses}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Area Type
                </label>
                <select
                  value={form.isRural}
                  onChange={(e) => updateField("isRural", e.target.value)}
                  className={selectClasses}
                >
                  <option value="">Select area type</option>
                  <option value="true">Rural</option>
                  <option value="false">Urban</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 3: Economic Details */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-card-foreground">
                Economic Details
              </h2>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Annual Household Income (INR)
                </label>
                <input
                  type="number"
                  value={form.annualIncome}
                  onChange={(e) => updateField("annualIncome", e.target.value)}
                  placeholder="e.g., 250000"
                  className={inputClasses}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Occupation
                </label>
                <select
                  value={form.occupation}
                  onChange={(e) => updateField("occupation", e.target.value)}
                  className={selectClasses}
                >
                  <option value="">Select occupation</option>
                  {OCCUPATIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 4: Additional Info */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-card-foreground">
                Additional Information
              </h2>

              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={form.isBPL}
                    onChange={(e) => updateField("isBPL", e.target.checked)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
                  />
                  <span className="text-sm text-foreground">
                    Below Poverty Line (BPL) card holder
                  </span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={form.isDisabled}
                    onChange={(e) =>
                      updateField("isDisabled", e.target.checked)
                    }
                    className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
                  />
                  <span className="text-sm text-foreground">
                    Person with disability
                  </span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={form.isMinority}
                    onChange={(e) =>
                      updateField("isMinority", e.target.checked)
                    }
                    className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
                  />
                  <span className="text-sm text-foreground">
                    Belongs to a minority community
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                {loading ? "Saving..." : "Complete Setup"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
