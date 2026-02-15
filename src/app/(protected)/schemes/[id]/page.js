"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Bookmark,
  ExternalLink,
  Loader2,
  Globe,
  FileText,
  Users,
  MapPin,
  IndianRupee,
  Briefcase,
  Heart,
  Shield,
  Calendar,
  CheckCircle2,
  XCircle,
} from "lucide-react";

function formatState(s) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function RuleDisplay({ label, icon: Icon, value, check }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--foreground)]/5">
      <Icon className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <div className="text-sm font-medium text-[var(--foreground)]">
          {label}
        </div>
        <div className="text-sm text-[var(--foreground)]/60">{value}</div>
      </div>
      {check !== undefined && (
        check ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
        ) : (
          <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
        )
      )}
    </div>
  );
}

export default function SchemeDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchScheme() {
      try {
        const res = await fetch(`/api/schemes/${id}`);
        if (!res.ok) throw new Error("Scheme not found");
        const data = await res.json();
        setScheme(data);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    }
    fetchScheme();
  }, [id]);

  const toggleBookmark = async () => {
    if (!scheme) return;
    setBookmarkLoading(true);
    try {
      if (scheme.isBookmarked) {
        await fetch(`/api/bookmarks/${scheme.id}`, { method: "DELETE" });
      } else {
        await fetch("/api/bookmarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ schemeId: scheme.id }),
        });
      }
      setScheme((prev) => ({ ...prev, isBookmarked: !prev.isBookmarked }));
    } catch {
      console.error("Failed to toggle bookmark");
    }
    setBookmarkLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !scheme) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-6xl">😕</div>
        <h2 className="text-xl font-semibold text-[var(--foreground)]">
          Scheme not found
        </h2>
        <Link
          href="/schemes"
          className="text-indigo-600 hover:text-indigo-700 font-medium"
        >
          ← Back to all schemes
        </Link>
      </div>
    );
  }

  const rules = scheme.eligibilityRules || {};

  return (
    <div className="min-h-screen bg-[var(--background)] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[var(--foreground)]/60 hover:text-[var(--foreground)] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Header Card */}
        <div className="bg-[var(--background)] border border-[var(--foreground)]/10 rounded-2xl p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-3">
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    scheme.level === "CENTRAL"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {scheme.level}
                </span>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  {scheme.status}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)] mb-2">
                {scheme.name}
              </h1>
              <p className="text-[var(--foreground)]/50 text-sm">
                Ministry: {scheme.ministry}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={toggleBookmark}
                disabled={bookmarkLoading}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-colors ${
                  scheme.isBookmarked
                    ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                    : "bg-[var(--foreground)]/5 text-[var(--foreground)]/60 hover:bg-[var(--foreground)]/10"
                }`}
              >
                {bookmarkLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Bookmark
                    className={`w-5 h-5 ${
                      scheme.isBookmarked ? "fill-indigo-600" : ""
                    }`}
                  />
                )}
                {scheme.isBookmarked ? "Bookmarked" : "Bookmark"}
              </button>
            </div>
          </div>

          <p className="text-[var(--foreground)]/70 leading-relaxed">
            {scheme.description}
          </p>

          {/* Links */}
          <div className="flex flex-wrap gap-3 mt-5">
            {scheme.officialLink && (
              <a
                href={scheme.officialLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors"
              >
                <Globe className="w-4 h-4" />
                Official Website
              </a>
            )}
            {scheme.documentLink && (
              <a
                href={scheme.documentLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 text-[var(--foreground)] rounded-xl text-sm font-medium transition-colors"
              >
                <FileText className="w-4 h-4" />
                Download Document
              </a>
            )}
          </div>
        </div>

        {/* Eligibility Rules */}
        <div className="bg-[var(--background)] border border-[var(--foreground)]/10 rounded-2xl p-6 md:p-8 mb-6">
          <h2 className="text-xl font-bold text-[var(--foreground)] mb-5">
            Eligibility Criteria
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <RuleDisplay
              label="Age Requirement"
              icon={Calendar}
              value={
                (rules.minAge || rules.maxAge)
                  ? `${rules.minAge || 0} – ${rules.maxAge || "No limit"} years`
                  : null
              }
            />
            <RuleDisplay
              label="Gender"
              icon={Users}
              value={
                rules.genders?.length
                  ? rules.genders.map((g) => g.charAt(0) + g.slice(1).toLowerCase()).join(", ")
                  : null
              }
            />
            <RuleDisplay
              label="Category"
              icon={Shield}
              value={rules.categories?.length ? rules.categories.join(", ") : null}
            />
            <RuleDisplay
              label="Maximum Annual Income"
              icon={IndianRupee}
              value={
                rules.maxIncome
                  ? `₹${rules.maxIncome.toLocaleString("en-IN")}`
                  : null
              }
            />
            <RuleDisplay
              label="Occupation"
              icon={Briefcase}
              value={
                rules.occupations?.length
                  ? rules.occupations
                      .map((o) => o.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()))
                      .join(", ")
                  : null
              }
            />
            <RuleDisplay
              label="BPL Required"
              icon={Heart}
              value={rules.bplOnly ? "Below Poverty Line card holders only" : null}
            />
            <RuleDisplay
              label="Disability"
              icon={Heart}
              value={rules.disabilityOnly ? "Persons with Disabilities only" : null}
            />
            <RuleDisplay
              label="Minority"
              icon={Shield}
              value={rules.minorityOnly ? "Minority community members only" : null}
            />
            <RuleDisplay
              label="Area"
              icon={MapPin}
              value={
                rules.ruralOnly
                  ? "Rural areas only"
                  : rules.urbanOnly
                  ? "Urban areas only"
                  : null
              }
            />
          </div>

          {Object.values(rules).every((v) => !v) && (
            <p className="text-[var(--foreground)]/50 text-sm">
              No specific eligibility criteria listed — open to all.
            </p>
          )}
        </div>

        {/* Applicable States */}
        {scheme.applicableStates?.length > 0 && (
          <div className="bg-[var(--background)] border border-[var(--foreground)]/10 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">
              Applicable States/UTs
            </h2>
            <div className="flex flex-wrap gap-2">
              {scheme.applicableStates.map((s) => (
                <span
                  key={s}
                  className="px-3 py-1.5 bg-[var(--foreground)]/5 text-[var(--foreground)]/70 rounded-lg text-sm"
                >
                  {formatState(s)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
