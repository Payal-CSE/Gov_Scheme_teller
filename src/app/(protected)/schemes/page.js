"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Filter, Star, ExternalLink, Bookmark, Loader2, ChevronLeft, ChevronRight, X, RefreshCcw } from "lucide-react";
import Link from "next/link";

const LEVELS = ["CENTRAL", "STATE"];
const STATES = [
  "ANDHRA_PRADESH","ARUNACHAL_PRADESH","ASSAM","BIHAR","CHHATTISGARH","GOA","GUJARAT",
  "HARYANA","HIMACHAL_PRADESH","JHARKHAND","KARNATAKA","KERALA","MADHYA_PRADESH",
  "MAHARASHTRA","MANIPUR","MEGHALAYA","MIZORAM","NAGALAND","ODISHA","PUNJAB",
  "RAJASTHAN","SIKKIM","TAMIL_NADU","TELANGANA","TRIPURA","UTTAR_PRADESH",
  "UTTARAKHAND","WEST_BENGAL","ANDAMAN_NICOBAR","CHANDIGARH",
  "DADRA_NAGAR_HAVELI_DAMAN_DIU","DELHI","JAMMU_KASHMIR","LADAKH",
  "LAKSHADWEEP","PUDUCHERRY",
];

function formatState(s) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function SchemesPage() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("");
  const [state, setState] = useState("");
  const [ministry, setMinistry] = useState("");
  const [ministries, setMinistries] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState({});

  // Eligible schemes tab
  const [activeTab, setActiveTab] = useState("all"); // "all" | "eligible"
  const [eligibleSchemes, setEligibleSchemes] = useState([]);
  const [eligibleLoading, setEligibleLoading] = useState(false);
  const [eligibleCount, setEligibleCount] = useState(null);

  const fetchSchemes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (search) params.set("search", search);
      if (level) params.set("level", level);
      if (state) params.set("state", state);
      if (ministry) params.set("ministry", ministry);

      const res = await fetch(`/api/schemes?${params}`);
      const data = await res.json();
      setSchemes(data.schemes || []);
      setPagination(data.pagination || {});
      setMinistries(data.ministries || []);
    } catch {
      console.error("Failed to fetch schemes");
    }
    setLoading(false);
  }, [page, search, level, state, ministry]);

  const fetchEligible = async () => {
    setEligibleLoading(true);
    try {
      const res = await fetch("/api/eligibility");
      const data = await res.json();
      setEligibleSchemes(data.matchedSchemes || []);
      setEligibleCount(data.matchedCount ?? 0);
    } catch {
      console.error("Failed to fetch eligibility");
    }
    setEligibleLoading(false);
  };

  useEffect(() => {
    fetchSchemes();
  }, [fetchSchemes]);

  useEffect(() => {
    if (activeTab === "eligible" && eligibleSchemes.length === 0) {
      fetchEligible();
    }
  }, [activeTab]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    // fetchSchemes() is triggered by useEffect when page changes
  };

  const clearFilters = () => {
    setSearch("");
    setLevel("");
    setState("");
    setMinistry("");
    setPage(1);
  };

  const toggleBookmark = async (schemeId, isBookmarked) => {
    setBookmarkLoading((prev) => ({ ...prev, [schemeId]: true }));
    try {
      if (isBookmarked) {
        await fetch(`/api/bookmarks/${schemeId}`, { method: "DELETE" });
      } else {
        await fetch("/api/bookmarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ schemeId }),
        });
      }

      if (activeTab === "all") {
        setSchemes((prev) =>
          prev.map((s) =>
            s.id === schemeId ? { ...s, isBookmarked: !isBookmarked } : s
          )
        );
      } else {
        setEligibleSchemes((prev) =>
          prev.map((s) =>
            s.id === schemeId ? { ...s, isBookmarked: !isBookmarked } : s
          )
        );
      }
    } catch {
      console.error("Failed to toggle bookmark");
    }
    setBookmarkLoading((prev) => ({ ...prev, [schemeId]: false }));
  };

  const activeFilters = [level, state, ministry].filter(Boolean).length;
  const displaySchemes = activeTab === "all" ? schemes : eligibleSchemes;
  const isLoading = activeTab === "all" ? loading : eligibleLoading;

  return (
    <div className="min-h-screen bg-[var(--background)] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--foreground)]">
            Browse Government Schemes
          </h1>
          <p className="text-[var(--foreground)]/60 mt-2">
            Discover schemes you&apos;re eligible for based on your profile
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-[var(--foreground)]/5 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "all"
                ? "bg-[var(--background)] text-[var(--foreground)] shadow-sm"
                : "text-[var(--foreground)]/60 hover:text-[var(--foreground)]"
            }`}
          >
            All Schemes
          </button>
          <button
            onClick={() => setActiveTab("eligible")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === "eligible"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-[var(--foreground)]/60 hover:text-[var(--foreground)]"
            }`}
          >
            <Star className="w-4 h-4" />
            Eligible for You
            {eligibleCount !== null && (
              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-xs">
                {eligibleCount}
              </span>
            )}
          </button>
        </div>

        {/* Search + Filters (only in "all" tab) */}
        {activeTab === "all" && (
          <div className="mb-6 space-y-4">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground)]/40" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search schemes by name, description, or ministry..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--foreground)]/10 bg-[var(--background)] text-[var(--foreground)] focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${
                  showFilters || activeFilters > 0
                    ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                    : "border-[var(--foreground)]/10 text-[var(--foreground)]/60 hover:bg-[var(--foreground)]/5"
                }`}
              >
                <Filter className="w-5 h-5" />
                Filters
                {activeFilters > 0 && (
                  <span className="bg-indigo-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {activeFilters}
                  </span>
                )}
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
              >
                Search
              </button>
            </form>

            {showFilters && (
              <div className="flex flex-wrap gap-3 p-4 bg-[var(--foreground)]/5 rounded-xl">
                <select
                  value={level}
                  onChange={(e) => {
                    setLevel(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-2 rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] text-[var(--foreground)] text-sm"
                >
                  <option value="">All Levels</option>
                  {LEVELS.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>

                <select
                  value={state}
                  onChange={(e) => {
                    setState(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-2 rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] text-[var(--foreground)] text-sm"
                >
                  <option value="">All States</option>
                  {STATES.map((s) => (
                    <option key={s} value={s}>{formatState(s)}</option>
                  ))}
                </select>

                <select
                  value={ministry}
                  onChange={(e) => {
                    setMinistry(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-2 rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] text-[var(--foreground)] text-sm"
                >
                  <option value="">All Ministries</option>
                  {ministries.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>

                {activeFilters > 0 && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Clear All
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Refresh for eligible tab */}
        {activeTab === "eligible" && (
          <div className="mb-4 flex justify-end">
            <button
              onClick={fetchEligible}
              disabled={eligibleLoading}
              className="flex items-center gap-2 px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <RefreshCcw className={`w-4 h-4 ${eligibleLoading ? "animate-spin" : ""}`} />
              Refresh Eligibility
            </button>
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : displaySchemes.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">
              {activeTab === "eligible" ? "🎯" : "📋"}
            </div>
            <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
              {activeTab === "eligible"
                ? "No eligible schemes found"
                : "No schemes found"}
            </h3>
            <p className="text-[var(--foreground)]/60">
              {activeTab === "eligible"
                ? "Update your profile to find more matching schemes"
                : "Try adjusting your search or filters"}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displaySchemes.map((scheme) => (
                <SchemeCard
                  key={scheme.id}
                  scheme={scheme}
                  onToggleBookmark={toggleBookmark}
                  bookmarkLoading={bookmarkLoading[scheme.id]}
                />
              ))}
            </div>

            {/* Pagination (only for "all" tab) */}
            {activeTab === "all" && pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg border border-[var(--foreground)]/10 text-[var(--foreground)]/60 hover:bg-[var(--foreground)]/5 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <span className="text-sm text-[var(--foreground)]/60">
                  Page {page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg border border-[var(--foreground)]/10 text-[var(--foreground)]/60 hover:bg-[var(--foreground)]/5 disabled:opacity-40 transition-colors"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function SchemeCard({ scheme, onToggleBookmark, bookmarkLoading }) {
  const rules = scheme.eligibilityRules || {};
  const tags = [];

  if (rules.genders?.length)
    tags.push(rules.genders.join(", "));
  if (rules.categories?.length)
    tags.push(rules.categories.join(", "));
  if (rules.maxIncome)
    tags.push(`Income ≤ ₹${(rules.maxIncome / 100000).toFixed(1)}L`);
  if (rules.bplOnly) tags.push("BPL Only");
  if (rules.minAge || rules.maxAge)
    tags.push(`Age ${rules.minAge || 0}–${rules.maxAge || "∞"}`);

  return (
    <div className="bg-[var(--background)] border border-[var(--foreground)]/10 rounded-2xl p-5 hover:shadow-lg transition-shadow flex flex-col">
      <div className="flex items-start justify-between gap-2 mb-3">
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full ${
            scheme.level === "CENTRAL"
              ? "bg-blue-100 text-blue-800"
              : "bg-amber-100 text-amber-800"
          }`}
        >
          {scheme.level}
        </span>
        <button
          onClick={() => onToggleBookmark(scheme.id, scheme.isBookmarked)}
          disabled={bookmarkLoading}
          className="p-1.5 rounded-lg hover:bg-[var(--foreground)]/5 transition-colors"
          title={scheme.isBookmarked ? "Remove bookmark" : "Bookmark scheme"}
        >
          {bookmarkLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-[var(--foreground)]/40" />
          ) : (
            <Bookmark
              className={`w-5 h-5 ${
                scheme.isBookmarked
                  ? "fill-indigo-600 text-indigo-600"
                  : "text-[var(--foreground)]/40"
              }`}
            />
          )}
        </button>
      </div>

      <Link
        href={`/schemes/${scheme.id}`}
        className="text-lg font-semibold text-[var(--foreground)] hover:text-indigo-600 transition-colors mb-2"
      >
        {scheme.name}
      </Link>

      <p className="text-sm text-[var(--foreground)]/60 mb-3 line-clamp-2 flex-1">
        {scheme.description}
      </p>

      <div className="text-xs text-[var(--foreground)]/50 mb-3">
        {scheme.ministry}
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {tags.slice(0, 4).map((tag, i) => (
            <span
              key={i}
              className="text-xs bg-[var(--foreground)]/5 text-[var(--foreground)]/60 px-2 py-0.5 rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 mt-auto pt-3 border-t border-[var(--foreground)]/5">
        <Link
          href={`/schemes/${scheme.id}`}
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          View Details →
        </Link>
        {scheme.officialLink && (
          <a
            href={scheme.officialLink}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto p-1.5 rounded-lg hover:bg-[var(--foreground)]/5 transition-colors"
            title="Official website"
          >
            <ExternalLink className="w-4 h-4 text-[var(--foreground)]/40" />
          </a>
        )}
      </div>
    </div>
  );
}
