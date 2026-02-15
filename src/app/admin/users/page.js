"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  Search,
  Trash2,
  ShieldCheck,
  ShieldOff,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // Dialog state
  const [dialog, setDialog] = useState({ open: false });
  function closeDialog() { setDialog({ open: false }); }

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (search) params.set("search", search);
      if (roleFilter) params.set("role", roleFilter);

      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      setUsers(data.users || []);
      setPagination(data.pagination || null);
    } catch {
      console.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  function deleteUser(id, name) {
    setDialog({
      open: true,
      title: "Delete User",
      message: `Delete user "${name}"? This action cannot be undone.`,
      variant: "danger",
      confirmText: "Delete",
      onConfirm: async () => {
        closeDialog();
        setActionLoading(id);
        try {
          const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
          if (res.ok) fetchUsers();
          else setDialog({ open: true, alertOnly: true, title: "Error", message: "Failed to delete user.", variant: "danger", onConfirm: closeDialog, onCancel: closeDialog });
        } catch {
          setDialog({ open: true, alertOnly: true, title: "Error", message: "Failed to delete user.", variant: "danger", onConfirm: closeDialog, onCancel: closeDialog });
        } finally {
          setActionLoading(null);
        }
      },
      onCancel: closeDialog,
    });
  }

  function toggleRole(id, currentRole) {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    setDialog({
      open: true,
      title: "Change Role",
      message: `Change this user's role to ${newRole}?`,
      variant: "warning",
      confirmText: newRole === "ADMIN" ? "Promote" : "Demote",
      onConfirm: async () => {
        closeDialog();
        setActionLoading(id);
        try {
          const res = await fetch(`/api/admin/users/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role: newRole }),
          });
          if (res.ok) fetchUsers();
          else {
            const data = await res.json();
            setDialog({ open: true, alertOnly: true, title: "Error", message: data.error || "Failed to update role.", variant: "danger", onConfirm: closeDialog, onCancel: closeDialog });
          }
        } catch {
          setDialog({ open: true, alertOnly: true, title: "Error", message: "Failed to update role.", variant: "danger", onConfirm: closeDialog, onCancel: closeDialog });
        } finally {
          setActionLoading(null);
        }
      },
      onCancel: closeDialog,
    });
  }

  function handleSearch(e) {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-6 w-6" />
            User Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View, search, and manage all platform users.
          </p>
        </div>
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
              placeholder="Search by name or email..."
              className="w-full rounded-md border border-border bg-background py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-ring"
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
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground cursor-pointer"
        >
          <option value="">All Roles</option>
          <option value="USER">Users</option>
          <option value="ADMIN">Admins</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Onboarded</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Bookmarks</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Joined</th>
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
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{user.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        user.role === "ADMIN"
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        user.onboardingCompleted
                          ? "bg-success/10 text-success"
                          : "bg-warning/10 text-warning"
                      }`}
                    >
                      {user.onboardingCompleted ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {user._count?.bookmarks ?? 0}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {user.id === currentUserId ? (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          You
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={() => toggleRole(user.id, user.role)}
                            disabled={actionLoading === user.id}
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer disabled:opacity-50"
                            title={user.role === "ADMIN" ? "Demote to User" : "Promote to Admin"}
                          >
                            {user.role === "ADMIN" ? (
                              <ShieldOff className="h-4 w-4" />
                            ) : (
                              <ShieldCheck className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => deleteUser(user.id, user.name)}
                            disabled={actionLoading === user.id}
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer disabled:opacity-50"
                            title="Delete User"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} users)
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

      {/* Confirm / Alert Dialog */}
      <ConfirmDialog
        open={dialog.open}
        title={dialog.title}
        message={dialog.message}
        variant={dialog.variant}
        confirmText={dialog.confirmText}
        cancelText={dialog.cancelText}
        alertOnly={dialog.alertOnly}
        onConfirm={dialog.onConfirm}
        onCancel={dialog.onCancel}
      />
    </div>
  );
}
