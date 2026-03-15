"use client";

import { useState, useEffect } from "react";
import {
  Key,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader,
  Trash2,
  Zap,
  Settings,
} from "lucide-react";
import { useTranslation } from "@/lib/translations";
import { AIService, getAvailableAIServices } from "@/lib/ai-services";
import { Modal } from "@/components/ui/modal";

export function AIKeysForm() {
  const { t } = useTranslation();
  const [services, setServices] = useState<AIService[]>(
    getAvailableAIServices(),
  );
  const [userData, setUserData] = useState<{
    connectedProviders: string[];
    preferredAIProvider?: string | null;
    preferredAIModel?: string | null;
  }>({ connectedProviders: [] });

  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<
    Record<string, "idle" | "testing" | "success" | "error">
  >({});
  const [inputKeys, setInputKeys] = useState<Record<string, string>>({});

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    serviceId: string | null;
    serviceName: string | null;
  }>({ isOpen: false, serviceId: null, serviceName: null });

  // console.log("[AIKeysForm] Rendered. Services scope:", services.length);

  // Generate stable random suffix for input names to prevent autocomplete after client mount
  const [randomSuffix, setRandomSuffix] = useState("");

  useEffect(() => {
    setRandomSuffix(Math.random().toString(36).substring(7));
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/account/ai-keys");
      const data = await res.json();
      if (data.error) {
        console.error("[AI] API error:", data.error);
        // Still set services to ensure they are visible
        setServices(getAvailableAIServices());
        return;
      }
      setUserData(data);
    } catch (err) {
      console.error("[AI] Error fetching keys:", err);
      setServices(getAvailableAIServices());
    }
  };

  const handleTest = async (serviceId: string) => {
    const key = inputKeys[serviceId];
    if (!key) return;

    setTestResults((prev) => ({ ...prev, [serviceId]: "testing" }));
    try {
      const res = await fetch("/api/account/ai-keys/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: serviceId, apiKey: key }),
      });
      const data = await res.json();
      setTestResults((prev) => ({
        ...prev,
        [serviceId]: data.success ? "success" : "error",
      }));
    } catch {
      setTestResults((prev) => ({ ...prev, [serviceId]: "error" }));
    }
  };

  const handleSave = async (serviceId: string) => {
    const key = inputKeys[serviceId];
    if (!key) return;

    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/account/ai-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: serviceId,
          apiKey: key,
          isPreferred: userData.connectedProviders.length === 0,
        }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: t("ai_settings.key_saved") });
        setInputKeys((prev) => {
          const next = { ...prev };
          delete next[serviceId];
          return next;
        });
        setTestResults((prev) => {
          const next = { ...prev };
          delete next[serviceId];
          return next;
        });
        await fetchData();
      } else {
        const errorData = await res.json();
        setMessage({
          type: "error",
          text: errorData.error || t("message.error"),
        });
      }
    } catch {
      setMessage({ type: "error", text: t("message.error") });
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (serviceId: string, serviceName: string) => {
    setDeleteModal({ isOpen: true, serviceId, serviceName });
  };

  const handleDelete = async () => {
    if (!deleteModal.serviceId) return;
    const serviceId = deleteModal.serviceId;
    setDeleteModal({ isOpen: false, serviceId: null, serviceName: null });

    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/account/ai-keys", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: serviceId }),
      });
      if (res.ok) {
        await fetchData();
      }
    } catch {
      setMessage({ type: "error", text: t("message.error") });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePreferences = async (prefs: {
    preferredAIProvider?: string | null;
    preferredAIModel?: string | null;
  }) => {
    try {
      await fetch("/api/account/ai-keys", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });
    } catch (err) {
      console.error("[AI] Error updating preference:", err);
    }
  };

  const handleSetPreferred = async (serviceId: string) => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/account/ai-keys", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferredAIProvider: serviceId,
          preferredAIModel: userData.preferredAIModel,
        }),
      });
      if (res.ok) {
        await fetchData();
      }
    } catch {
      setMessage({ type: "error", text: t("message.error") });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-slate-100 dark:bg-slate-900/30 rounded-lg text-slate-600">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {t("ai_settings.title")}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t("ai_settings.subtitle")}
            </p>
          </div>
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg flex items-center gap-3 mb-6 ${
              message.type === "success"
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            )}
            <span
              className={`text-sm ${message.type === "success" ? "text-green-800" : "text-red-800"}`}
            >
              {message.text}
            </span>
          </div>
        )}

        <div className="space-y-4">
          {services.map((service) => {
            const isConnected = (userData.connectedProviders || []).includes(
              service.id,
            );
            const isPreferred = userData.preferredAIProvider === service.id;
            const testStatus = testResults[service.id] || "idle";
            const isGroq = service.id === "groq";

            return (
              <div
                key={service.id}
                className={`p-4 rounded-lg border transition-all ${
                  isGroq
                    ? "bg-amber-50/50 dark:bg-amber-900/10 border-amber-300 dark:border-amber-700 shadow-md scale-[1.01]"
                    : isPreferred
                      ? "bg-slate-50/50 dark:bg-slate-900/10 border-slate-200 dark:border-slate-800"
                      : "bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900 dark:text-white">
                      {service.name}
                    </span>
                    {isGroq && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-700">
                        <Zap className="h-3 w-3" />
                        {t("ai_settings.recommended") || "Recommended (Free)"}
                      </span>
                    )}
                    {isConnected && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        <CheckCircle className="h-3 w-3" />
                        {t("ai_settings.connected")}
                      </span>
                    )}
                    {isPreferred && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400">
                        <Zap className="h-3 w-3" />
                        {t("ai_settings.active")}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isConnected && !isPreferred && (
                      <button
                        onClick={() => handleSetPreferred(service.id)}
                        disabled={loading}
                        className="text-xs px-3 py-1.5 bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300 rounded-md font-medium hover:bg-slate-200 dark:hover:bg-slate-900/50 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                        title={t("ai_settings.set_active")}
                      >
                        <Zap className="h-3.5 w-3.5" />
                        {t("ai_settings.set_active")}
                      </button>
                    )}
                    {isConnected && (
                      <button
                        onClick={() => confirmDelete(service.id, service.name)}
                        disabled={loading}
                        className="p-1.5 text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50"
                        title={t("ai_settings.unlink")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {!isConnected ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-4">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {t(`ai_service.${service.id}.description`)}
                      </p>
                      {isGroq && (
                        <a
                          href="https://console.groq.com/keys"
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-slate-600 dark:text-slate-400 hover:underline flex-shrink-0"
                        >
                          {t("ai_settings.get_groq_key") || "Get API Key ↗"}
                        </a>
                      )}
                    </div>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        name={`${service.id}_new_key_${randomSuffix}`}
                        placeholder={`${service.name} API Key`}
                        className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-500 outline-none transition-shadow"
                        value={inputKeys[service.id] || ""}
                        autoComplete="new-password"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck="false"
                        onChange={(e) =>
                          setInputKeys((prev) => ({
                            ...prev,
                            [service.id]: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTest(service.id)}
                        disabled={
                          !inputKeys[service.id] ||
                          testStatus === "testing" ||
                          loading
                        }
                        className={`text-xs px-3 py-2 rounded-md font-medium transition-all ${
                          testStatus === "success"
                            ? "bg-green-100 text-green-800"
                            : testStatus === "error"
                              ? "bg-red-100 text-red-800"
                              : "bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                        }`}
                      >
                        {testStatus === "testing" ? (
                          <Loader className="h-3 w-3 animate-spin mr-1 inline" />
                        ) : null}
                        {testStatus === "success"
                          ? t("ai_settings.test_success")
                          : testStatus === "error"
                            ? t("ai_settings.test_failed")
                            : t("ai_settings.test")}
                      </button>
                      {testStatus === "success" && (
                        <button
                          onClick={() => handleSave(service.id)}
                          disabled={loading}
                          className="text-xs px-3 py-2 bg-slate-600 text-white rounded-md font-medium hover:bg-slate-700 disabled:opacity-50 transition-colors shadow-sm"
                        >
                          {loading ? (
                            <Loader className="h-3 w-3 animate-spin mr-1 inline" />
                          ) : null}
                          {t("common.save")}
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                        {t("ai_settings.key_hidden")}
                      </p>
                    </div>

                    {isPreferred && (
                      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                          {t("ai_settings.default_model") || "Default Model"}
                        </label>
                        <div className="flex items-center gap-2">
                          <Settings className="h-4 w-4 text-slate-400" />
                          {service.id === "gemini" ? (
                            <select
                              className="flex-1 bg-transparent border-0 border-b border-slate-200 dark:border-slate-700 focus:border-slate-500 text-xs py-1 outline-none text-slate-900 dark:text-white"
                              value={
                                userData.preferredAIModel || "gemini-2.5-flash"
                              }
                              onChange={(e) => {
                                const val = e.target.value;
                                setUserData((prev) => ({
                                  ...prev,
                                  preferredAIModel: val,
                                }));
                                handleUpdatePreferences({
                                  preferredAIProvider: service.id,
                                  preferredAIModel: val,
                                });
                              }}
                            >
                              <option value="gemini-3-flash-preview">
                                Gemini 3 Flash (Latest Preview)
                              </option>
                              <option value="gemini-2.5-flash">
                                Gemini 2.5 Flash
                              </option>
                              <option value="gemini-2.5-flash-lite">
                                Gemini 2.5 Flash Lite
                              </option>
                              <option value="gemma-3-27b-it">
                                Gemma 3 27B IT
                              </option>
                            </select>
                          ) : service.id === "groq" ? (
                            <select
                              className="flex-1 bg-transparent border-0 border-b border-slate-200 dark:border-slate-700 focus:border-slate-500 text-xs py-1 outline-none text-slate-900 dark:text-white"
                              value={
                                userData.preferredAIModel || "openai/gpt-oss-120b"
                              }
                              onChange={(e) => {
                                const val = e.target.value;
                                setUserData((prev) => ({
                                  ...prev,
                                  preferredAIModel: val,
                                }));
                                handleUpdatePreferences({
                                  preferredAIProvider: service.id,
                                  preferredAIModel: val,
                                });
                              }}
                            >
                              <option value="openai/gpt-oss-120b">
                                OpenAI GPT OSS 120B
                              </option>
                              <option value="llama-3.3-70b-versatile">
                                Llama 3.3 70B Versatile
                              </option>
                            </select>
                          ) : (
                            <input
                              type="text"
                              placeholder="e.g. gpt-4o, claude-3-5-sonnet-latest"
                              className="flex-1 bg-transparent border-0 border-b border-slate-200 dark:border-slate-700 focus:border-slate-500 text-xs py-1 outline-none text-slate-900 dark:text-white"
                              value={userData.preferredAIModel || ""}
                              onChange={(e) =>
                                setUserData((prev) => ({
                                  ...prev,
                                  preferredAIModel: e.target.value,
                                }))
                              }
                              onBlur={() =>
                                handleUpdatePreferences({
                                  preferredAIProvider: service.id,
                                  preferredAIModel: userData.preferredAIModel,
                                })
                              }
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() =>
          setDeleteModal({ isOpen: false, serviceId: null, serviceName: null })
        }
        title={t("ai_settings.unlink") || "Unlink API Key"}
        footer={
          <>
            <button
              onClick={() =>
                setDeleteModal({
                  isOpen: false,
                  serviceId: null,
                  serviceName: null,
                })
              }
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 rounded-md transition-colors"
            >
              {t("common.cancel") || "Cancel"}
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {t("ai_settings.unlink") || "Unlink"}
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-4 text-slate-600 dark:text-slate-400">
          <p>
            {t("ai_settings.unlink_confirm")} <strong>{deleteModal.serviceName}</strong>?
          </p>
        </div>
      </Modal>
    </div>
  );
}
