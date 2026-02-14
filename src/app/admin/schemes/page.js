"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Trash2,
  Edit3,
  Plus,
  Loader2,
  ChevronLeft,
  ChevronRight,
  FileText,
  ExternalLink,
  X,
  Check,
} from "lucide-react";

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft", color: "bg-warning/10 text-warning" },
  { value: "APPROVED", label: "Approved", color: "bg-success/10 text-success" },
  { value: "ARCHIVED", label: "Archived", color: "bg-muted text-muted-foreground" },
];

const LEVEL_OPTIONS = [
  { value: "CENTRAL", label: "Central" },
  { value: "STATE", label: "State" },
];

const EMPTY_FORM = {
  name: "",
  description: "",
  ministry: "",
  level: "CENTRAL",
  status: "DRAFT",
  officialLink: "",
  documentLink: "",
  eligibilityRules: "{}",
};

export default function AdminSchemesPage() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingScheme, setEditingScheme] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchSchemes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/admin/schemes?${params}`);
      const data = await res.json();
      setSchemes(data.schemes || []);
      setPagination(data.pagination || null);
    } catch {
      console.error("Failed to fetch schemes");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchSchemes();
  }, [fetchSchemes]);

  function openCreate() {
    setEditingScheme(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setShowModal(true);
  }

  async function openEdit(id) {
    setFormError("");
    try {
      const res = await fetch(`/api/admin/schemes/${id}`);
      const scheme = await res.json();
      setEditingScheme(scheme);
      setForm({
        name: scheme.name || "",
        description: scheme.description || "",
        ministry: scheme.ministry || "",
        level: scheme.level || "CENTRAL",
        status: scheme.status || "DRAFT",
        officialLink: scheme.officialLink || "",
        documentLink: scheme.documentLink || "",
        eligibilityRules: JSON.stringify(scheme.eligibilityRules || {}, null, 2),
      });
      setShowModal(true);
    } catch {
      alert("Failed to load scheme.");
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setFormError("");
    setSaving(true);

    let rules;
    try {
      rules = JSON.parse(form.eligibilityRules);
    } catch {
      setFormError("Eligibility rules must be valid JSON.");
      setSaving(false);
      return;
    }

    const payload = {
      name: form.name,
      description: form.description,
      ministry: form.ministry,
      level: form.level,
      status: form.status,
      officialLink: form.officialLink || null,
      documentLink: form.documentLink || null,
      eligibilityRules: rules,
    };

    try {
      const url = editingScheme
        ? `/api/admin/schemes/${editingScheme.id}`
        : "/api/admin/schemes";
      const method = editingScheme ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowModal(false);
        fetchSchemes();
      } else {
        const data = await res.json();
        setFormError(data.error || "Failed to save scheme.");
      }
    } catch {
      setFormError("Failed to save scheme.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteScheme(id, name) {
    if (!confirm(`Delete scheme "${name}"? This cannot be undone.`)) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/schemes/${id}`, { method: "DELETE" });
      if (res.ok) fetchSchemes();
      else alert("Failed to delete scheme.");
    } catch {
      alert("Failed to delete scheme.");
    } finally {
      setActionLoading(null);
    }
  }

  async function quickStatus(id, newStatus) {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/schemes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchSchemes();
    } catch {
      alert("Failed to update status.");
    } finally {
      setActionLoading(null);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    setPage(1);
    fetchSchemes();
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Scheme Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create, edit, approve, and manage government schemes.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add Scheme
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or ministry..."
              className="w-full rounded-md border border-border bg-background py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground cursor-pointer"
        >
          <option value="">All Status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Ministry</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Level</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Bookmarks</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </td>
              </tr>
            ) : schemes.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  No schemes found. Click &quot;Add Scheme&quot; to create one.
                </td>
              </tr>
            ) : (
              schemes.map((scheme) => {
                const statusInfo = STATUS_OPTIONS.find(
                  (s) => s.value === scheme.status
                );
                return (
                  <tr key={scheme.id} className="hover:bg-muted/30 transition-colors">
                    <td className="max-w-[200px] truncate px-4 py-3 font-medium text-foreground">
                      {scheme.name}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{scheme.ministry}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        {scheme.level}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusInfo?.color}`}
                      >
                        {statusInfo?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {scheme._count?.bookmarks ?? 0}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(scheme.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {scheme.status === "DRAFT" && (
                          <button
                            onClick={() => quickStatus(scheme.id, "APPROVED")}
                            disabled={actionLoading === scheme.id}
                            className="rounded-md p-1.5 text-success hover:bg-success/10 transition-colors cursor-pointer disabled:opacity-50"
                            title="Approve"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        {scheme.status === "APPROVED" && (
                          <button
                            onClick={() => quickStatus(scheme.id, "ARCHIVED")}
                            disabled={actionLoading === scheme.id}
                            className="rounded-md p-1.5 text-warning hover:bg-warning/10 transition-colors cursor-pointer disabled:opacity-50"
                            title="Archive"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                        {scheme.officialLink && (
                          <a
                            href={scheme.officialLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                            title="Official Link"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        <button
                          onClick={() => openEdit(scheme.id)}
                          disabled={actionLoading === scheme.id}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer disabled:opacity-50"
                          title="Edit"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteScheme(scheme.id, scheme.name)}
                          disabled={actionLoading === scheme.id}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} schemes)
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-md border border-border p-2 text-muted-foreground hover:bg-muted transition-colors cursor-pointer disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
              className="rounded-md border border-border p-2 text-muted-foreground hover:bg-muted transition-colors cursor-pointer disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">
                {editingScheme ? "Edit Scheme" : "Add New Scheme"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Scheme Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
                  placeholder="e.g. PM Kisan Samman Nidhi"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Description *
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                  rows={3}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring resize-y"
                  placeholder="Describe the scheme..."
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Ministry *
                  </label>
                  <input
                    type="text"
                    value={form.ministry}
                    onChange={(e) => setForm({ ...form, ministry: e.target.value })}
                    required
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="e.g. Ministry of Agriculture"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Level *
                  </label>
                  <select
                    value={form.level}
                    onChange={(e) => setForm({ ...form, level: e.target.value })}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground cursor-pointer"
                  >
                    {LEVEL_OPTIONS.map((l) => (
                      <option key={l.value} value={l.value}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground cursor-pointer"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Official Link
                  </label>
                  <input
                    type="url"
                    value={form.officialLink}
                    onChange={(e) => setForm({ ...form, officialLink: e.target.value })}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Document Link
                  </label>
                  <input
                    type="url"
                    value={form.documentLink}
                    onChange={(e) => setForm({ ...form, documentLink: e.target.value })}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Eligibility Rules (JSON)
                </label>
                <textarea
                  value={form.eligibilityRules}
                  onChange={(e) =>
                    setForm({ ...form, eligibilityRules: e.target.value })
                  }
                  rows={5}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring resize-y"
                  placeholder='{ "minAge": 18, "maxAge": 60, "categories": ["SC", "ST"] }'
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Fields: minAge, maxAge, genders, categories, maxIncome, occupations, bplOnly, disabilityOnly, minorityOnly, ruralOnly, urbanOnly
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors cursor-pointer disabled:opacity-50"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingScheme ? "Update Scheme" : "Create Scheme"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
