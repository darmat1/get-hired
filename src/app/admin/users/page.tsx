"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/translations";

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string | null;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const currentRole = (session?.user as any)?.role?.toLowerCase() || "user";

  useEffect(() => {
    if (!isPending && (!session || !["superadmin", "admin"].includes(currentRole))) {
      router.push("/");
    } else if (session) {
      fetchUsers();
    }
  }, [session, isPending, router, currentRole]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

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

  if (isPending || isLoading) return <LoadingScreen message="Loading users..." />;
  if (!session || !["superadmin", "admin"].includes(currentRole)) return null;

  const canManageRole = (targetUser: User) => {
    const targetRole = targetUser.role?.toLowerCase() || "user";
    if (currentRole === "superadmin") return true;
    if (currentRole === "admin") {
      // Admin can't modify Superadmin or other Admins
      return !["superadmin", "admin"].includes(targetRole);
    }
    return false;
  };

  const getAvailableRoles = (targetUser: User) => {
    const targetRole = targetUser.role?.toLowerCase() || "user";
    if (currentRole === "superadmin") return ["user", "publisher", "admin", "superadmin"];
    if (currentRole === "admin") return ["user", "publisher"];
    return [targetRole];
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-slate-500 dark:text-slate-400">
            View and manage application users and their roles.
          </p>
        </div>
        <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-200 dark:border-blue-800">
          Your Role: {currentRole}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt=""
                          className="h-8 w-8 rounded-full border border-slate-200 dark:border-slate-700"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500">
                          {user.name?.[0] || user.email[0].toUpperCase()}
                        </div>
                      )}
                      <span className="font-medium text-slate-900 dark:text-slate-100">{user.name || "Unnamed User"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{user.email}</td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role || "user"}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      disabled={updatingId === user.id || !canManageRole(user)}
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
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
