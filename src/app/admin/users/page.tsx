"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/ui/loading-screen";
import {
  Trash2,
  Shield,
  ShieldAlert,
  UserX,
  CheckCircle,
  XCircle,
  Loader,
  AlertTriangle,
} from "lucide-react";

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string | null;
  emailVerified: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [expiredTokenCount, setExpiredTokenCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [cleanupLoading, setCleanupLoading] = useState<string | null>(null);
  const [cleanupResult, setCleanupResult] = useState<{
    type: "bots" | "tokens";
    deletedCount: number;
  } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmCleanupBots, setConfirmCleanupBots] = useState(false);
  const [confirmCleanupTokens, setConfirmCleanupTokens] = useState(false);

  const currentRole =
    (session?.user as any)?.role?.toLowerCase() || "user";

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setExpiredTokenCount(data.expiredVerificationCount);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (
      !isPending &&
      (!session || !["superadmin", "admin"].includes(currentRole))
    ) {
      router.push("/");
    } else if (session) {
      fetchUsers();
    }
  }, [session, isPending, router, currentRole, fetchUsers]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (response.ok) {
        setUsers(
          users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
        );
      }
    } catch (error) {
      console.error("Error updating role:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setDeletingId(userId);
    try {
      const response = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        setUsers(users.filter((u) => u.id !== userId));
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const handleCleanup = async (action: "cleanup-bots" | "cleanup-tokens") => {
    setCleanupLoading(action);
    setCleanupResult(null);
    try {
      const response = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        const result = await response.json();
        setCleanupResult({
          type: action === "cleanup-bots" ? "bots" : "tokens",
          deletedCount: result.deletedCount,
        });
        // Refresh user list and stats
        await fetchUsers();
      }
    } catch (error) {
      console.error("Error cleaning up:", error);
    } finally {
      setCleanupLoading(null);
      setConfirmCleanupBots(false);
      setConfirmCleanupTokens(false);
    }
  };

  const handleToggleVerification = async (userId: string, currentStatus: boolean) => {
    setUpdatingId(`verify-${userId}`);
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, emailVerified: !currentStatus }),
      });

      if (response.ok) {
        setUsers(
          users.map((u) =>
            u.id === userId ? { ...u, emailVerified: !currentStatus } : u,
          ),
        );
      }
    } catch (error) {
      console.error("Error toggling verification:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  if (isPending || isLoading)
    return <LoadingScreen message="Loading users..." />;
  if (!session || !["superadmin", "admin"].includes(currentRole)) return null;

  const canManageRole = (targetUser: User) => {
    const targetRole = targetUser.role?.toLowerCase() || "user";
    if (currentRole === "superadmin") return true;
    if (currentRole === "admin") {
      return !["superadmin", "admin"].includes(targetRole);
    }
    return false;
  };

  const getAvailableRoles = (targetUser: User) => {
    const targetRole = targetUser.role?.toLowerCase() || "user";
    if (currentRole === "superadmin")
      return ["user", "publisher", "admin", "superadmin"];
    if (currentRole === "admin") return ["user", "publisher"];
    return [targetRole];
  };

  const totalUsers = users.length;
  const verifiedUsers = users.filter((u) => u.emailVerified).length;
  const unverifiedUsers = totalUsers - verifiedUsers;

  // Count unverified users older than 24h
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const staleUnverified = users.filter(
    (u) => !u.emailVerified && new Date(u.createdAt).getTime() < cutoff,
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-slate-500 dark:text-slate-400">
            View and manage users. Cleanup bot registrations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-200 dark:border-blue-800">
            Your Role: {currentRole}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {totalUsers}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Total Users
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-green-200 dark:border-green-800/50 p-4">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {verifiedUsers}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Verified
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-red-200 dark:border-red-800/50 p-4">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {unverifiedUsers}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Unverified
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-800/50 p-4">
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {staleUnverified}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Bot Users (&gt;24h)
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-purple-200 dark:border-purple-800/50 p-4">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {expiredTokenCount}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Expired Tokens
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bot Cleanup */}
        {staleUnverified > 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex flex-col justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  {staleUnverified} unverified user
                  {staleUnverified !== 1 ? "s" : ""} detected
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Older than 24 hours. Likely bot registrations.
                </p>
              </div>
            </div>
            {!confirmCleanupBots ? (
              <button
                onClick={() => setConfirmCleanupBots(true)}
                className="w-full px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <UserX className="h-4 w-4" />
                Cleanup Bots
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCleanup("cleanup-bots")}
                  disabled={cleanupLoading === "cleanup-bots"}
                  className="flex-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {cleanupLoading === "cleanup-bots" ? (
                    <Loader className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  Delete
                </button>
                <button
                  onClick={() => setConfirmCleanupBots(false)}
                  className="flex-1 px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        {/* Token Cleanup */}
        {expiredTokenCount > 0 && (
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4 flex flex-col justify-between gap-3">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                  {expiredTokenCount} expired verification token
                  {expiredTokenCount !== 1 ? "s" : ""} found
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  Leftovers in the verification table.
                </p>
              </div>
            </div>
            {!confirmCleanupTokens ? (
              <button
                onClick={() => setConfirmCleanupTokens(true)}
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Cleanup Verifications
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCleanup("cleanup-tokens")}
                  disabled={cleanupLoading === "cleanup-tokens"}
                  className="flex-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {cleanupLoading === "cleanup-tokens" ? (
                    <Loader className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  Delete
                </button>
                <button
                  onClick={() => setConfirmCleanupTokens(false)}
                  className="flex-1 px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {cleanupResult && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
          <p className="text-sm text-green-800 dark:text-green-200">
            Cleanup complete: <strong>{cleanupResult.deletedCount}</strong>{" "}
            {cleanupResult.type === "bots" ? "bot user" : "expired verification"}{cleanupResult.deletedCount !== 1 ? "s" : ""} removed.
          </p>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Verified
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {users.map((user) => {
                const isBot =
                  !user.emailVerified &&
                  new Date(user.createdAt).getTime() < cutoff;
                return (
                  <tr
                    key={user.id}
                    className={`hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors ${
                      isBot
                        ? "bg-red-50/30 dark:bg-red-900/10"
                        : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.image ? (
                          <img
                            src={user.image}
                            alt=""
                            className="h-8 w-8 rounded-full border border-slate-200 dark:border-slate-700"
                          />
                        ) : (
                          <div
                            className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                              isBot
                                ? "bg-red-100 dark:bg-red-900/30 text-red-500"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                            }`}
                          >
                            {user.name?.[0] || user.email[0].toUpperCase()}
                          </div>
                        )}
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {user.name || "Unnamed User"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() =>
                          handleToggleVerification(user.id, user.emailVerified)
                        }
                        disabled={
                          updatingId === `verify-${user.id}` ||
                          !canManageRole(user) ||
                          user.id === session?.user?.id
                        }
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                          user.emailVerified
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800/50"
                            : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/50"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                        title={
                          canManageRole(user)
                            ? `Click to ${
                                user.emailVerified ? "unverify" : "verify"
                              } user`
                            : ""
                        }
                      >
                        {updatingId === `verify-${user.id}` ? (
                          <Loader className="h-3 w-3 animate-spin" />
                        ) : user.emailVerified ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {user.emailVerified ? "Yes" : "No"}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role || "user"}
                        onChange={(e) =>
                          handleRoleChange(user.id, e.target.value)
                        }
                        disabled={
                          updatingId === user.id || !canManageRole(user)
                        }
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                      >
                        {getAvailableRoles(user).map((role) => (
                          <option key={role} value={role}>
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}{" "}
                      <span className="text-slate-400 dark:text-slate-500">
                        {new Date(user.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.id !== session?.user?.id && canManageRole(user) && (
                        <>
                          {confirmDeleteId === user.id ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                disabled={deletingId === user.id}
                                className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors disabled:opacity-50 flex items-center gap-1"
                              >
                                {deletingId === user.id ? (
                                  <Loader className="h-3 w-3 animate-spin" />
                                ) : (
                                  "Delete"
                                )}
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-2 py-1 text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded transition-colors"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(user.id)}
                              className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                              title="Delete user"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
