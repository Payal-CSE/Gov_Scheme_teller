"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bookmark,
  Loader2,
  ExternalLink,
  Trash2,
  BookmarkX,
} from "lucide-react";

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removeLoading, setRemoveLoading] = useState({});

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/bookmarks");
      const data = await res.json();
      setBookmarks(data.bookmarks || []);
    } catch {
      console.error("Failed to fetch bookmarks");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const removeBookmark = async (bookmarkId, schemeId) => {
    setRemoveLoading((prev) => ({ ...prev, [bookmarkId]: true }));
    try {
      await fetch(`/api/bookmarks/${schemeId}`, { method: "DELETE" });
      setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
    } catch {
      console.error("Failed to remove bookmark");
    }
    setRemoveLoading((prev) => ({ ...prev, [bookmarkId]: false }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bookmark className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-[var(--foreground)]">
              Saved Schemes
            </h1>
          </div>
          <p className="text-[var(--foreground)]/60">
            {bookmarks.length > 0
              ? `You have ${bookmarks.length} saved scheme${bookmarks.length !== 1 ? "s" : ""}`
              : "You haven't saved any schemes yet"}
          </p>
        </div>

        {bookmarks.length === 0 ? (
          <div className="text-center py-24">
            <BookmarkX className="w-16 h-16 mx-auto text-[var(--foreground)]/20 mb-4" />
            <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
              No bookmarks yet
            </h3>
            <p className="text-[var(--foreground)]/60 mb-6">
              Browse schemes and bookmark the ones you&apos;re interested in
            </p>
            <Link
              href="/schemes"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
            >
              Browse Schemes
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookmarks.map((bookmark) => {
              const scheme = bookmark.scheme;
              const rules = scheme.eligibilityRules || {};

              return (
                <div
                  key={bookmark.id}
                  className="bg-[var(--background)] border border-[var(--foreground)]/10 rounded-2xl p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            scheme.level === "CENTRAL"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {scheme.level}
                        </span>
                        <span className="text-xs text-[var(--foreground)]/40">
                          {scheme.ministry}
                        </span>
                      </div>

                      <Link
                        href={`/schemes/${scheme.id}`}
                        className="text-lg font-semibold text-[var(--foreground)] hover:text-indigo-600 transition-colors"
                      >
                        {scheme.name}
                      </Link>

                      <p className="text-sm text-[var(--foreground)]/60 mt-1 line-clamp-2">
                        {scheme.description}
                      </p>

                      <p className="text-xs text-[var(--foreground)]/40 mt-2">
                        Saved on{" "}
                        {new Date(bookmark.createdAt).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 md:flex-col md:items-end">
                      <Link
                        href={`/schemes/${scheme.id}`}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors"
                      >
                        View Details
                      </Link>

                      <div className="flex gap-2">
                        {scheme.officialLink && (
                          <a
                            href={scheme.officialLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg hover:bg-[var(--foreground)]/5 transition-colors"
                            title="Official website"
                          >
                            <ExternalLink className="w-4 h-4 text-[var(--foreground)]/40" />
                          </a>
                        )}

                        <button
                          onClick={() =>
                            removeBookmark(bookmark.id, bookmark.schemeId)
                          }
                          disabled={removeLoading[bookmark.id]}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                          title="Remove bookmark"
                        >
                          {removeLoading[bookmark.id] ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
