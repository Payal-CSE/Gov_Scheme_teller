"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  User,
  Loader2,
  Save,
  X,
  Pencil,
  RefreshCcw,
  CheckCircle2,
  MapPin,
  Briefcase,
  IndianRupee,
  Calendar,
  Shield,
  Heart,
} from "lucide-react";

const GENDERS = ["MALE", "FEMALE", "OTHER"];
const CATEGORIES = ["GENERAL", "OBC", "SC", "ST", "EWS"];
const OCCUPATIONS = [
  "SALARIED",
  "SELF_EMPLOYED",
  "FARMER",
  "STUDENT",
  "UNEMPLOYED",
  "RETIRED",
  "OTHER",
];
const STATES = [
  "ANDHRA_PRADESH","ARUNACHAL_PRADESH","ASSAM","BIHAR","CHHATTISGARH","GOA","GUJARAT",
  "HARYANA","HIMACHAL_PRADESH","JHARKHAND","KARNATAKA","KERALA","MADHYA_PRADESH",
  "MAHARASHTRA","MANIPUR","MEGHALAYA","MIZORAM","NAGALAND","ODISHA","PUNJAB",
  "RAJASTHAN","SIKKIM","TAMIL_NADU","TELANGANA","TRIPURA","UTTAR_PRADESH",
  "UTTARAKHAND","WEST_BENGAL","ANDAMAN_NICOBAR","CHANDIGARH",
  "DADRA_NAGAR_HAVELI_DAMAN_DIU","DELHI","JAMMU_KASHMIR","LADAKH",
  "LAKSHADWEEP","PUDUCHERRY",
];

function formatEnum(s) {
  if (!s) return "\u2014";
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState(null);
  const [form, setForm] = useState({});
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/profile");
      if (!res.ok) throw new Error("Failed to load profile");
      const data = await res.json();
      setProfile(data);
      setForm({
        name: data.name || "",
        dateOfBirth: data.dateOfBirth
          ? new Date(data.dateOfBirth).toISOString().split("T")[0]
          : "",
        gender: data.gender || "",
        category: data.category || "",
        state: data.state || "",
        district: data.district || "",
        isRural: data.isRural,  // preserve null (unknown) — don't default to false
        annualIncome: data.annualIncome ?? "",
        occupation: data.occupation || "",
        isBPL: data.isBPL || false,
        isDisabled: data.isDisabled || false,
        isMinority: data.isMinority || false,
      });
    } catch {
      setError("Failed to load profile. Please try again.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          annualIncome: form.annualIncome !== "" ? Number(form.annualIncome) : null,
        }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Profile updated & eligibility refreshed!" });
        setEditing(false);
        fetchProfile();
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Update failed." });
      }
    } catch {
      setMessage({ type: "error", text: "Network error." });
    }
    setSaving(false);
  };

  const refreshEligibility = async () => {
    setRefreshing(true);
    setMessage(null);
    try {
      const res = await fetch("/api/eligibility", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setMessage({
          type: "success",
          text: `Eligibility refreshed! ${data.matchedCount} scheme(s) matched.`,
        });
        fetchProfile();
      } else {
        setMessage({ type: "error", text: data.error || "Refresh failed." });
      }
    } catch {
      setMessage({ type: "error", text: "Network error." });
    }
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Could not load profile."}</p>
          <button
            onClick={fetchProfile}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const matchedCount =
    profile.eligibilityVector?.matchedSchemeIds?.length ?? 0;

  return (
    <div className="min-h-screen bg-[var(--background)] p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[var(--foreground)]">
              My Profile
            </h1>
            <p className="text-[var(--foreground)]/60 mt-1">
              Manage your information and eligibility
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={refreshEligibility}
              disabled={refreshing || !profile.onboardingCompleted}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
            >
              <RefreshCcw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh Eligibility
            </button>

            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors"
              >
                <Pencil className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditing(false);
                    setMessage(null);
                  }}
                  className="flex items-center gap-2 px-4 py-2 border border-[var(--foreground)]/10 text-[var(--foreground)]/60 rounded-xl text-sm font-medium hover:bg-[var(--foreground)]/5 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-center gap-2 text-sm ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            ) : (
              <X className="w-5 h-5 flex-shrink-0" />
            )}
            {message.text}
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[var(--background)] border border-[var(--foreground)]/10 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-indigo-600">
              {matchedCount}
            </div>
            <div className="text-xs text-[var(--foreground)]/50">
              Matched Schemes
            </div>
          </div>
          <div className="bg-[var(--background)] border border-[var(--foreground)]/10 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-indigo-600">
              {profile._count?.bookmarks || 0}
            </div>
            <div className="text-xs text-[var(--foreground)]/50">
              Saved Schemes
            </div>
          </div>
          <div className="bg-[var(--background)] border border-[var(--foreground)]/10 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600">
              {profile.onboardingCompleted ? "✓" : "✗"}
            </div>
            <div className="text-xs text-[var(--foreground)]/50">
              Onboarding
            </div>
          </div>
          <div className="bg-[var(--background)] border border-[var(--foreground)]/10 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-[var(--foreground)]">
              {profile.role}
            </div>
            <div className="text-xs text-[var(--foreground)]/50">Role</div>
          </div>
        </div>

        {/* Profile Sections */}
        <div className="space-y-6">
          {/* Account */}
          <Section title="Account" icon={User}>
            <Field label="Email" value={profile.email} />
            <Field
              label="Name"
              value={form.name}
              editing={editing}
              onChange={(v) => setForm({ ...form, name: v })}
            />
            <Field
              label="Member since"
              value={new Date(profile.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            />
          </Section>

          {/* Personal */}
          <Section title="Personal Details" icon={Calendar}>
            <Field
              label="Date of Birth"
              value={form.dateOfBirth}
              editing={editing}
              type="date"
              onChange={(v) => setForm({ ...form, dateOfBirth: v })}
            />
            <Field
              label="Gender"
              value={form.gender}
              editing={editing}
              type="select"
              options={GENDERS}
              onChange={(v) => setForm({ ...form, gender: v })}
            />
            <Field
              label="Category"
              value={form.category}
              editing={editing}
              type="select"
              options={CATEGORIES}
              onChange={(v) => setForm({ ...form, category: v })}
            />
          </Section>

          {/* Location */}
          <Section title="Location" icon={MapPin}>
            <Field
              label="State"
              value={form.state}
              editing={editing}
              type="select"
              options={STATES}
              formatOption={formatEnum}
              onChange={(v) => setForm({ ...form, state: v })}
            />
            <Field
              label="District"
              value={form.district}
              editing={editing}
              onChange={(v) => setForm({ ...form, district: v })}
            />
            <ToggleField
              label="Rural Area"
              value={form.isRural}
              editing={editing}
              onChange={(v) => setForm({ ...form, isRural: v })}
            />
          </Section>

          {/* Economic */}
          <Section title="Economic Details" icon={IndianRupee}>
            <Field
              label="Annual Income (₹)"
              value={form.annualIncome}
              editing={editing}
              type="number"
              onChange={(v) => setForm({ ...form, annualIncome: v })}
            />
            <Field
              label="Income Bracket"
              value={profile.incomeBracket || "Not set"}
            />
            <Field
              label="Occupation"
              value={form.occupation}
              editing={editing}
              type="select"
              options={OCCUPATIONS}
              formatOption={formatEnum}
              onChange={(v) => setForm({ ...form, occupation: v })}
            />
          </Section>

          {/* Flags */}
          <Section title="Additional Information" icon={Shield}>
            <ToggleField
              label="Below Poverty Line (BPL)"
              value={form.isBPL}
              editing={editing}
              onChange={(v) => setForm({ ...form, isBPL: v })}
            />
            <ToggleField
              label="Person with Disability"
              value={form.isDisabled}
              editing={editing}
              onChange={(v) => setForm({ ...form, isDisabled: v })}
            />
            <ToggleField
              label="Minority Community"
              value={form.isMinority}
              editing={editing}
              onChange={(v) => setForm({ ...form, isMinority: v })}
            />
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div className="bg-[var(--background)] border border-[var(--foreground)]/10 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 text-indigo-600" />
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          {title}
        </h2>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  editing,
  type = "text",
  options,
  formatOption,
  onChange,
}) {
  if (!editing || !onChange) {
    const display =
      type === "select" && value && formatOption
        ? formatOption(value)
        : type === "select" && value
        ? formatEnum(value)
        : value || "—";

    return (
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
        <label className="text-sm text-[var(--foreground)]/50 sm:w-40 flex-shrink-0">
          {label}
        </label>
        <span className="text-sm text-[var(--foreground)]">{display}</span>
      </div>
    );
  }

  if (type === "select") {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
        <label className="text-sm text-[var(--foreground)]/50 sm:w-40 flex-shrink-0">
          {label}
        </label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] text-[var(--foreground)] text-sm"
        >
          <option value="">Select...</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {formatOption ? formatOption(o) : formatEnum(o)}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
      <label className="text-sm text-[var(--foreground)]/50 sm:w-40 flex-shrink-0">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 px-3 py-2 rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] text-[var(--foreground)] text-sm"
      />
    </div>
  );
}

function ToggleField({ label, value, editing, onChange }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
      <label className="text-sm text-[var(--foreground)]/50 sm:w-40 flex-shrink-0">
        {label}
      </label>
      {editing ? (
        <button
          type="button"
          onClick={() => onChange(!value)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            value ? "bg-indigo-600" : "bg-[var(--foreground)]/20"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              value ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      ) : (
        <span
          className={`text-sm ${
            value ? "text-emerald-600 font-medium" : "text-[var(--foreground)]/40"
          }`}
        >
          {value ? "Yes" : "No"}
        </span>
      )}
    </div>
  );
}

