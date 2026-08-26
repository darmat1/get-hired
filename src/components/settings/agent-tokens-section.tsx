"use client";

import { useState, useEffect } from "react";
import {
  Bot,
  Loader,
  Trash2,
  CheckCircle,
  AlertCircle,
  Copy,
  Check,
  Plus,
} from "lucide-react";
import { useTranslation } from "@/lib/translations";
import { Modal } from "@/components/ui/modal";
import { ALL_AGENT_SCOPES, type AgentScope } from "@/lib/agent-scopes";

interface AgentTokenRecord {
  id: string;
  name: string;
  tokenPrefix: string;
  scopes: string[];
  lastUsedAt: string | null;
  expiresAt: string | null;
  revokedAt: string | null;
  createdAt: string;
}

const SCOPE_KEY: Record<AgentScope, string> = {
  "profile:read": "profile_read",
  "profile:write": "profile_write",
  "resumes:read": "resumes_read",
  "resumes:write": "resumes_write",
  "cover_letters:read": "cover_letters_read",
  "cover_letters:write": "cover_letters_write",
  "ai:generate": "ai_generate",
};

const EXPIRY_OPTIONS: { value: "" | "30" | "90" | "365"; labelKey: string }[] = [
  { value: "", labelKey: "agent_tokens.expiry_never" },
  { value: "30", labelKey: "agent_tokens.expiry_30d" },
  { value: "90", labelKey: "agent_tokens.expiry_90d" },
  { value: "365", labelKey: "agent_tokens.expiry_1y" },
];

function tokenStatus(t: AgentTokenRecord): "active" | "revoked" | "expired" {
  if (t.revokedAt) return "revoked";
  if (t.expiresAt && new Date(t.expiresAt) < new Date()) return "expired";
  return "active";
}

export function AgentTokensSection() {
  const { t } = useTranslation();
  const [tokens, setTokens] = useState<AgentTokenRecord[]>([]);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState<Set<string>>(new Set());
  const [expiresInDays, setExpiresInDays] = useState<"" | "30" | "90" | "365">("");

  const [revokeTarget, setRevokeTarget] = useState<AgentTokenRecord | null>(null);
  const [revoking, setRevoking] = useState(false);

  const [revealedToken, setRevealedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [snippetTab, setSnippetTab] = useState<"mcp" | "rest">("mcp");
  const [snippetCopied, setSnippetCopied] = useState(false);

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    setFetching(true);
    setFetchError(false);
    try {
      const res = await fetch("/api/account/agent-tokens");
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      setTokens(data.tokens || []);
    } catch {
      setFetchError(true);
    } finally {
      setFetching(false);
    }
  };

  const toggleScope = (scope: string) => {
    setScopes((prev) => {
      const next = new Set(prev);
      if (next.has(scope)) next.delete(scope);
      else next.add(scope);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setScopes((prev) =>
      prev.size === ALL_AGENT_SCOPES.length ? new Set() : new Set(ALL_AGENT_SCOPES),
    );
  };

  const openCreate = () => {
    setName("");
    setScopes(new Set());
    setExpiresInDays("");
    setError(null);
    setShowCreate(true);
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    if (scopes.size === 0) {
      setError(t("agent_tokens.scopes_required"));
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/account/agent-tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          scopes: Array.from(scopes),
          expiresInDays: expiresInDays ? Number(expiresInDays) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("message.error"));
        return;
      }
      setShowCreate(false);
      setRevealedToken(data.token);
    } catch {
      setError(t("message.error"));
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    const id = revokeTarget.id;
    setRevoking(true);
    try {
      const res = await fetch(`/api/account/agent-tokens/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setTokens((prev) =>
          prev.map((tok) =>
            tok.id === id ? { ...tok, revokedAt: new Date().toISOString() } : tok,
          ),
        );
      }
    } finally {
      setRevoking(false);
      setRevokeTarget(null);
    }
  };

  const handleCopy = async () => {
    if (!revealedToken) return;
    await navigator.clipboard.writeText(revealedToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const dismissReveal = () => {
    setRevealedToken(null);
    setCopied(false);
    setSnippetTab("mcp");
    setSnippetCopied(false);
    fetchTokens();
  };

  const getOrigin = () =>
    typeof window !== "undefined" ? window.location.origin : "https://gethired.work";

  const buildMcpSnippet = () =>
    JSON.stringify(
      {
        mcpServers: {
          "get-hired": {
            url: `${getOrigin()}/api/agent/mcp`,
            headers: { Authorization: `Bearer ${revealedToken}` },
          },
        },
      },
      null,
      2,
    );

  const buildCurlSnippet = () =>
    `curl ${getOrigin()}/api/agent/v1/profile \\\n  -H "Authorization: Bearer ${revealedToken}"`;

  const handleCopySnippet = async () => {
    const text = snippetTab === "mcp" ? buildMcpSnippet() : buildCurlSnippet();
    await navigator.clipboard.writeText(text);
    setSnippetCopied(true);
    setTimeout(() => setSnippetCopied(false), 2000);
  };

  const formatDate = (value: string | null) => {
    if (!value) return t("agent_tokens.never_used");
    return new Date(value).toLocaleDateString();
  };

  const statusBadge = (status: "active" | "revoked" | "expired") => {
    const styles: Record<string, string> = {
      active:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      revoked: "bg-warm-200 text-warm-600 dark:bg-warm-700 dark:text-warm-400",
      expired:
        "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    };
    const labels: Record<string, string> = {
      active: t("agent_tokens.status_active"),
      revoked: t("agent_tokens.status_revoked"),
      expired: t("agent_tokens.status_expired"),
    };
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${styles[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-warm-800 rounded-lg border border-warm-200 dark:border-warm-700 p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-warm-100 dark:bg-warm-900/30 rounded-lg text-warm-600">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-warm-900 dark:text-white">
              {t("agent_tokens.title")}
            </h3>
            <p className="text-sm text-warm-500 dark:text-warm-400">
              {t("agent_tokens.subtitle")}
            </p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="text-xs px-3 py-2 bg-warm-600 text-white rounded-md font-medium hover:bg-warm-700 transition-colors shadow-sm flex items-center gap-1.5 flex-shrink-0"
        >
          <Plus className="h-3.5 w-3.5" />
          {t("agent_tokens.create_button")}
        </button>
      </div>

      {fetchError && (
        <div className="p-4 rounded-lg flex items-center gap-3 mb-6 bg-red-50 border border-red-200">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <span className="text-sm text-red-800">{t("agent_tokens.fetch_error")}</span>
        </div>
      )}

      {fetching ? (
        <div className="flex justify-center py-8">
          <Loader className="h-5 w-5 animate-spin text-warm-400" />
        </div>
      ) : tokens.length === 0 ? (
        <p className="text-sm text-warm-500 dark:text-warm-400 py-4">
          {t("agent_tokens.empty")}
        </p>
      ) : (
        <div className="space-y-3">
          {tokens.map((tok) => {
            const status = tokenStatus(tok);
            const isActive = status === "active";
            return (
              <div
                key={tok.id}
                className={`p-4 rounded-lg border transition-all ${
                  isActive
                    ? "bg-warm-50 dark:bg-warm-700/50 border-warm-200 dark:border-warm-600"
                    : "bg-warm-50/50 dark:bg-warm-900/20 border-warm-200 dark:border-warm-800 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-warm-900 dark:text-white">
                      {tok.name}
                    </span>
                    {statusBadge(status)}
                    <span className="font-mono text-xs text-warm-400">
                      {tok.tokenPrefix}••••••••
                    </span>
                  </div>
                  {isActive && (
                    <button
                      onClick={() => setRevokeTarget(tok)}
                      className="p-1.5 text-warm-400 hover:text-red-600 transition-colors flex-shrink-0"
                      title={t("agent_tokens.revoke")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {tok.scopes.map((scope) => (
                    <span
                      key={scope}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-warm-100 text-warm-600 dark:bg-warm-900/40 dark:text-warm-400"
                    >
                      {scope}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-warm-500 dark:text-warm-400">
                  <span>
                    {t("agent_tokens.last_used")}: {formatDate(tok.lastUsedAt)}
                  </span>
                  <span>
                    {t("agent_tokens.created")}: {formatDate(tok.createdAt)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create token modal */}
      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title={t("agent_tokens.form_title")}
        maxWidth="lg"
        footer={
          <>
            <button
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 bg-warm-100 hover:bg-warm-200 text-warm-700 dark:bg-warm-700 dark:hover:bg-warm-600 dark:text-warm-200 rounded-md transition-colors"
            >
              {t("common.cancel")}
            </button>
            <button
              onClick={handleCreate}
              disabled={creating || !name.trim() || scopes.size === 0}
              className="px-4 py-2 bg-warm-600 hover:bg-warm-700 disabled:opacity-50 text-white rounded-md transition-colors flex items-center justify-center gap-2"
            >
              {creating && <Loader className="h-4 w-4 animate-spin" />}
              {t("agent_tokens.create_submit")}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg flex items-center gap-2 bg-red-50 border border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
              <span className="text-sm text-red-800">{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-warm-700 dark:text-warm-300 mb-2">
              {t("agent_tokens.name_label")}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("agent_tokens.name_placeholder")}
              className="w-full px-4 py-2 border border-warm-300 dark:border-warm-600 rounded-lg bg-white dark:bg-warm-700 text-warm-900 dark:text-white placeholder-warm-500 dark:placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-warm-500 focus:border-transparent"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-warm-700 dark:text-warm-300">
                {t("agent_tokens.scopes_label")}
              </label>
              <button
                type="button"
                onClick={toggleSelectAll}
                className="text-xs text-warm-600 dark:text-warm-400 hover:underline"
              >
                {t("agent_tokens.select_all")}
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {ALL_AGENT_SCOPES.map((scope) => {
                const key = SCOPE_KEY[scope];
                return (
                  <label
                    key={scope}
                    className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-warm-50 dark:hover:bg-warm-700/50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={scopes.has(scope)}
                      onChange={() => toggleScope(scope)}
                      className="mt-0.5 h-4 w-4 rounded border-warm-300 text-warm-600 focus:ring-warm-500"
                    />
                    <span>
                      <span className="block text-sm font-medium text-warm-900 dark:text-white">
                        {t(`agent_tokens.scope.${key}`)}
                      </span>
                      <span className="block text-xs text-warm-500 dark:text-warm-400">
                        {t(`agent_tokens.scope.${key}_desc`)}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-700 dark:text-warm-300 mb-2">
              {t("agent_tokens.expiry_label")}
            </label>
            <select
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(e.target.value as typeof expiresInDays)}
              className="w-full px-4 py-2 border border-warm-300 dark:border-warm-600 rounded-lg bg-white dark:bg-warm-700 text-warm-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-warm-500 focus:border-transparent"
            >
              {EXPIRY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {t(opt.labelKey)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Modal>

      {/* Revoke confirmation modal */}
      <Modal
        isOpen={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        title={t("agent_tokens.revoke_confirm_title")}
        maxWidth="sm"
        footer={
          <>
            <button
              onClick={() => setRevokeTarget(null)}
              className="px-4 py-2 bg-warm-100 hover:bg-warm-200 text-warm-700 dark:bg-warm-700 dark:hover:bg-warm-600 dark:text-warm-200 rounded-md transition-colors"
            >
              {t("common.cancel")}
            </button>
            <button
              onClick={handleRevoke}
              disabled={revoking}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-md transition-colors flex items-center justify-center gap-2"
            >
              {revoking ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              {t("agent_tokens.revoke")}
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-2 text-warm-600 dark:text-warm-400">
          <p>
            {t("agent_tokens.revoke_confirm_desc")} <strong>{revokeTarget?.name}</strong>
          </p>
        </div>
      </Modal>

      {/* Reveal token modal */}
      <Modal
        isOpen={!!revealedToken}
        onClose={dismissReveal}
        title={t("agent_tokens.reveal_title")}
        maxWidth="xl"
        footer={
          <button
            onClick={dismissReveal}
            className="px-4 py-2 bg-warm-600 hover:bg-warm-700 text-white rounded-md transition-colors"
          >
            {t("agent_tokens.done_button")}
          </button>
        }
      >
        <div className="space-y-4">
          <div className="p-3 rounded-lg flex items-start gap-2 bg-amber-50 border border-amber-200 dark:bg-amber-900/10 dark:border-amber-900/50">
            <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-amber-800 dark:text-amber-400">
              {t("agent_tokens.reveal_warning")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2.5 bg-warm-100 dark:bg-warm-900 rounded-lg text-sm font-mono text-warm-900 dark:text-white break-all">
              {revealedToken}
            </code>
            <button
              onClick={handleCopy}
              className="p-2.5 rounded-lg bg-warm-100 dark:bg-warm-900 hover:bg-warm-200 dark:hover:bg-warm-700 transition-colors flex-shrink-0"
              title={t("agent_tokens.copy")}
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4 text-warm-500" />
              )}
            </button>
          </div>
          {copied && (
            <p className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              {t("agent_tokens.copied")}
            </p>
          )}

          <div className="pt-2 border-t border-warm-200 dark:border-warm-700">
            <p className="text-sm font-medium text-warm-900 dark:text-white mb-1">
              {t("agent_tokens.connect_title")}
            </p>
            <p className="text-xs text-warm-500 dark:text-warm-400 mb-3">
              {t("agent_tokens.connect_desc")}
            </p>

            <div className="flex gap-1 mb-2">
              <button
                onClick={() => setSnippetTab("mcp")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  snippetTab === "mcp"
                    ? "bg-warm-900 text-white dark:bg-warm-100 dark:text-warm-900"
                    : "bg-warm-100 dark:bg-warm-800 text-warm-600 dark:text-warm-400"
                }`}
              >
                {t("agent_tokens.tab_mcp")}
              </button>
              <button
                onClick={() => setSnippetTab("rest")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  snippetTab === "rest"
                    ? "bg-warm-900 text-white dark:bg-warm-100 dark:text-warm-900"
                    : "bg-warm-100 dark:bg-warm-800 text-warm-600 dark:text-warm-400"
                }`}
              >
                {t("agent_tokens.tab_rest")}
              </button>
            </div>

            <p className="text-xs text-warm-500 dark:text-warm-400 mb-2">
              {snippetTab === "mcp"
                ? t("agent_tokens.mcp_hint")
                : t("agent_tokens.rest_hint")}
            </p>

            <div className="relative">
              <pre className="px-3 py-2.5 pr-10 bg-warm-100 dark:bg-warm-900 rounded-lg text-xs font-mono text-warm-900 dark:text-white overflow-x-auto whitespace-pre-wrap break-all">
                {snippetTab === "mcp" ? buildMcpSnippet() : buildCurlSnippet()}
              </pre>
              <button
                onClick={handleCopySnippet}
                className="absolute top-2 right-2 p-1.5 rounded-md bg-warm-200 dark:bg-warm-700 hover:bg-warm-300 dark:hover:bg-warm-600 transition-colors"
                title={t("agent_tokens.copy")}
              >
                {snippetCopied ? (
                  <Check className="h-3.5 w-3.5 text-green-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-warm-500" />
                )}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
