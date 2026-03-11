"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useSession,
  linkSocial,
  unlinkAccount,
  signOut,
} from "@/lib/auth-client";
import {
  User,
  AlertCircle,
  CheckCircle,
  Loader,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { LinkedinIcon } from "@/components/ui/icons/linkedin";
import { useTranslation } from "@/lib/translations";

export function ProfileForm() {
  const { data: session } = useSession();
  const router = useRouter();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    newName: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNameChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!formData.newName) {
      setMessage({ type: "error", text: t("profile.error.enter_name") });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/account/update-name", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newName: formData.newName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error updating name");
      }

      setMessage({ type: "success", text: t("profile.success.name_updated") });
      setFormData((prev) => ({
        ...prev,
        newName: "",
      }));
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Error updating name",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!formData.currentPassword || !formData.newPassword) {
      setMessage({
        type: "error",
        text: t("profile.error.fill_fields"),
      });
      setLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({
        type: "error",
        text: t("profile.error.passwords_mismatch"),
      });
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 8) {
      setMessage({
        type: "error",
        text: t("profile.error.password_too_short"),
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/account/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || t("profile.error.password_change_failed"),
        );
      }

      setMessage({
        type: "success",
        text: t("profile.success.password_changed"),
      });
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : t("profile.error.password_change_failed"),
      });
    } finally {
      setLoading(false);
    }
  };

  const [hasLinkedIn, setHasLinkedIn] = useState<boolean | null>(null);

  useEffect(() => {
    checkLinkedInStatus();
  }, []);

  const checkLinkedInStatus = async () => {
    try {
      const response = await fetch("/api/resumes/linkedin-status");
      const data = await response.json();
      setHasLinkedIn(data.hasLinkedIn);
    } catch (error) {
      console.error("Error checking LinkedIn status:", error);
    }
  };

  const handleLinkLinkedIn = async () => {
    try {
      setLoading(true);
      await linkSocial({
        provider: "linkedin",
        callbackURL: window.location.href,
      });
    } catch (error) {
      console.error("LinkedIn link error:", error);
      setMessage({ type: "error", text: t("message.error") });
    } finally {
      setLoading(false);
    }
  };

  const handleUnlinkLinkedIn = async () => {
    try {
      setLoading(true);
      const result = await unlinkAccount({
        providerId: "linkedin",
      });

      if (result.error) {
        throw new Error(result.error.message || "Error unlinking account");
      }

      setMessage({ type: "success", text: t("profile.success.name_updated") });
      await checkLinkedInStatus();
    } catch (error) {
      console.error("LinkedIn unlink error:", error);
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : t("message.error"),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/account/delete", {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || t("profile.delete_error"));
      }

      setMessage({ type: "success", text: t("profile.delete_success") });
      // Clear session on the client side to remove cookies and reset state
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/");
          },
        },
      });
    } catch (error) {
      console.error("Account delete error:", error);
      setMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : t("profile.delete_error"),
      });
      setShowDeleteConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          {t("profile.social_connections")}
        </h3>
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-full ${hasLinkedIn ? "bg-slate-100 dark:bg-slate-900/30 text-slate-600" : "bg-slate-100 dark:bg-slate-700 text-slate-400"}`}
            >
              <LinkedinIcon className="h-5 w-5 fill-current" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                LinkedIn
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {hasLinkedIn
                  ? t("profile.linkedin_connected")
                  : t("profile.linkedin_not_connected")}
              </p>
            </div>
          </div>
          {hasLinkedIn ? (
            <button
              onClick={handleUnlinkLinkedIn}
              disabled={loading}
              className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
            >
              {t("profile.unlink_linkedin")}
            </button>
          ) : (
            <button
              onClick={handleLinkLinkedIn}
              disabled={loading}
              className="text-sm font-medium text-slate-600 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors"
            >
              {t("profile.link_linkedin")}
            </button>
          )}
        </div>
      </div>
      {message && (
        <div
          className={`flex items-center gap-3 p-4 rounded-lg border ${
            message.type === "success"
              ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
              : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          )}
          <span
            className={
              message.type === "success"
                ? "text-green-800 dark:text-green-200"
                : "text-red-800 dark:text-red-200"
            }
          >
            {message.text}
          </span>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
          {t("profile.current_name")}
        </h3>
        <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
          <User className="h-5 w-5 text-slate-400" />
          <span className="text-slate-700 dark:text-slate-300">
            {session?.user?.name || session?.user?.email}
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          {t("profile.change_name")}
        </h3>
        <form onSubmit={handleNameChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t("profile.new_name")}
            </label>
            <input
              type="text"
              name="newName"
              value={formData.newName}
              onChange={handleInputChange}
              placeholder="John Smith"
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2.5 bg-slate-600 hover:bg-slate-700 disabled:bg-slate-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {loading && <Loader className="h-4 w-4 animate-spin" />}
            {t("profile.update_name")}
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          {t("profile.change_password")}
        </h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t("profile.current_password")}
            </label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleInputChange}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t("profile.new_password")}
            </label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t("profile.confirm_password")}
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2.5 bg-slate-600 hover:bg-slate-700 disabled:bg-slate-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {loading && <Loader className="h-4 w-4 animate-spin" />}
            {t("profile.update_password")}
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-900/50 p-6">
        <h3 className="text-lg font-semibold text-red-900 dark:text-red-400 mb-2 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          {t("profile.danger_zone")}
        </h3>
        <p className="text-sm text-red-700 dark:text-red-300 mb-6">
          {t("profile.delete_account_desc")}
        </p>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          disabled={loading}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          {t("profile.delete_account")}
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {t("profile.delete_confirm_title")}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 font-medium">
              {t("profile.delete_confirm_desc")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-medium transition-colors"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {loading && <Loader className="h-4 w-4 animate-spin" />}
                {t("common.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
