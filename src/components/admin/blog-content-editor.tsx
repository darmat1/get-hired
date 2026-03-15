"use client";

import React, { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import { Loader2, Maximize2, Minimize2, Wand2 } from "lucide-react";

interface BlogContentEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  language?: string;
}

export function BlogContentEditor({
  value,
  onChange,
  language = "html",
}: BlogContentEditorProps) {
  const [theme, setTheme] = useState<"vs-dark" | "light">("vs-dark");
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // Sync with app theme
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "vs-dark" : "light");

    // Optional: Observe theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          const isDark = document.documentElement.classList.contains("dark");
          setTheme(isDark ? "vs-dark" : "light");
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const handleFormat = (editor: any) => {
    editor.getAction("editor.action.formatDocument").run();
  };

  return (
    <div
      className={`relative group transition-all duration-300 ${
        isFullscreen
          ? "fixed inset-0 z-[100] bg-white dark:bg-slate-900 p-4"
          : "w-full border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm hover:border-slate-300 dark:hover:border-slate-700"
      }`}
    >
      <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span className="ml-2 text-xs font-mono text-slate-500 uppercase tracking-wider">
            {language} Editor
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition"
            title={isFullscreen ? "Minimize" : "Maximize"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      <div className={isFullscreen ? "h-[calc(100vh-80px)]" : "h-[500px]"}>
        <Editor
          height="100%"
          language={language}
          theme={theme}
          value={value}
          onChange={(val) => onChange(val || "")}
          onMount={(editor) => {
            // Add custom keybind for formatting if needed, though Alt+Shift+F works by default
          }}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            roundedSelection: true,
            scrollBeyondLastLine: false,
            readOnly: false,
            automaticLayout: true,
            padding: { top: 16, bottom: 16 },
            wordWrap: "on",
            formatOnPaste: true,
            formatOnType: true,
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: "on",
            tabSize: 2,
            scrollbar: {
              vertical: "visible",
              horizontal: "visible",
              useShadows: false,
              verticalScrollbarSize: 10,
              horizontalScrollbarSize: 10,
            },
          }}
          loading={
            <div className="flex items-center justify-center h-full bg-slate-50 dark:bg-slate-900">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          }
        />
      </div>

      {!isFullscreen && (
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 shadow-lg">
            <kbd className="text-[10px] font-sans text-slate-400 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
              Alt
            </kbd>
            <span className="text-slate-400">+</span>
            <kbd className="text-[10px] font-sans text-slate-400 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
              Shift
            </kbd>
            <span className="text-slate-400">+</span>
            <kbd className="text-[10px] font-sans text-slate-400 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
              F
            </kbd>
            <span className="text-xs text-slate-500 font-medium ml-1">
              to Format
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
