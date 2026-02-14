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
} from "lucide-react";
import { useTranslation } from "@/lib/translations";
import { AIService, getAvailableAIServices } from "@/lib/ai-services";

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

  console.log("[AIKeysForm] Rendered. Services scope:", services.length);

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

  const handleDelete = async (serviceId: string) => {
    if (!confirm(t("ai_settings.unlink"))) return;

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

  // const handleUpdatePreferences = async (prefs: {
  //   preferredAIProvider?: string | null;
  //   preferredAIModel?: string | null;
  // }) => {
  //   try {
  //     await fetch("/api/account/ai-keys", {
  //       method: "PATCH",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(prefs),
  //     });
  //   } catch (err) {
  //     console.error("[AI] Error updating preference:", err);
  //   }
  // };

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
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("ai_settings.title")}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
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

            return (
              <div
                key={service.id}
                className={`p-4 rounded-lg border transition-all ${
                  isPreferred
                    ? "bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800"
                    : "bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {service.name}
                    </span>
                    {isConnected && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        <CheckCircle className="h-3 w-3" />
                        {t("ai_settings.connected")}
                      </span>
                    )}
                    {isPreferred && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
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
                        className="text-xs px-3 py-1.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-md font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                        title={t("ai_settings.set_active")}
                      >
                        <Zap className="h-3.5 w-3.5" />
                        {t("ai_settings.set_active")}
                      </button>
                    )}
                    {isConnected && (
                      <button
                        onClick={() => handleDelete(service.id)}
                        disabled={loading}
                        className="p-1.5 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                        title={t("ai_settings.unlink")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {!isConnected ? (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t(`ai_service.${service.id}.description`)}
                    </p>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        name={`${service.id}_new_key_${randomSuffix}`}
                        placeholder={`${service.name} API Key`}
                        className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
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
                              : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50"
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
                          className="text-xs px-3 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
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
                      <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                        {t("ai_settings.key_hidden")}
                      </p>
                    </div>

                    {/* {isPreferred && (
                      <div className="mt-2 pt-2 border-t border-blue-100 dark:border-blue-800">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
                          Default Model
                        </label>
                        <div className="flex items-center gap-2">
                          <Settings className="h-4 w-4 text-blue-400" />
                          <input
                            type="text"
                            placeholder="e.g. gpt-4o, claude-3-5-sonnet-20241022"
                            className="flex-1 bg-transparent border-0 border-b border-blue-200 dark:border-blue-700 focus:border-blue-500 text-xs py-1 outline-none text-gray-900 dark:text-white"
                            value={userData.preferredAIModel || ""}
                            onChange={(e) =>
                              setUserData((prev) => ({
                                ...prev,
                                preferredAIModel: e.target.value,
                              }))
                            }
                            onBlur={() =>
                              handleUpdatePreferences({
                                preferredAIModel: userData.preferredAIModel,
                              })
                            }
                          />
                        </div>
                      </div>
                    )} */}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
