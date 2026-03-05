"use client";

import { Resume, WorkExperience, Education, Skill } from "@/types/resume";
import { useState, useEffect, useRef } from "react";
import { Bold, Italic, Type, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── EditableText ────────────────────────────────────────────────
export interface EditableTextProps {
  value: string;
  onChange: (val: string) => void;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
  style?: React.CSSProperties;
  allowFormatting?: boolean;
}

export const TextFormatToolbar = ({
  position,
  onFormat,
  activeStates,
  hasSelection,
}: {
  position: { top: number; left: number };
  onFormat: (type: "bold" | "italic" | "clear") => void;
  activeStates: { bold: boolean; italic: boolean };
  hasSelection: boolean;
}) => {
  return (
    <div
      className="absolute z-50 flex items-center gap-1 p-1 bg-white rounded-lg shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-75"
      style={{
        top: position.top,
        left: position.left,
        transform: "translateY(-100%) translateY(-8px)",
      }}
    >
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          if (hasSelection) onFormat("bold");
        }}
        disabled={!hasSelection}
        className={cn(
          "p-2 rounded transition-colors",
          !hasSelection
            ? "text-slate-400 cursor-not-allowed"
            : activeStates.bold
              ? "bg-blue-50 text-blue-600"
              : "hover:bg-slate-100 text-slate-600",
        )}
        title="Bold (Cmd+B)"
      >
        <Bold size={16} />
      </button>
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          if (hasSelection) onFormat("italic");
        }}
        disabled={!hasSelection}
        className={cn(
          "p-2 rounded transition-colors",
          !hasSelection
            ? "text-slate-400 cursor-not-allowed"
            : activeStates.italic
              ? "bg-blue-50 text-blue-600"
              : "hover:bg-slate-100 text-slate-600",
        )}
        title="Italic (Cmd+I)"
      >
        <Italic size={16} />
      </button>
      <div className="w-px h-5 bg-slate-100 mx-1" />
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          if (hasSelection) onFormat("clear");
        }}
        disabled={!hasSelection}
        className={cn(
          "p-2 rounded transition-colors",
          !hasSelection
            ? "text-slate-400 cursor-not-allowed"
            : "hover:bg-slate-100 text-slate-600",
        )}
        title="Clear Formatting"
      >
        <Type size={16} />
      </button>
    </div>
  );
};

export const EditableText = ({
  value,
  onChange,
  className,
  placeholder,
  style,
  multiline = false,
  allowFormatting = false,
}: EditableTextProps) => {
  const [toolbarPos, setToolbarPos] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [activeStates, setActiveStates] = useState({
    bold: false,
    italic: false,
  });
  const [hasSelection, setHasSelection] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const editableRef = useRef<HTMLDivElement>(null);
  const isFocused = useRef(false);
  const [localValue, setLocalValue] = useState(value || "");

  // Sync initial and external value updates
  useEffect(() => {
    if (editableRef.current && !isFocused.current) {
      if (editableRef.current.innerHTML !== (value || "")) {
        editableRef.current.innerHTML = value || "";
        setLocalValue(value || "");
      }
    }
  }, [value]);

  const updateToolbarState = () => {
    if (!allowFormatting) return;
    setActiveStates({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
    });

    const selection = window.getSelection();
    setHasSelection(!!selection && selection.toString().trim().length > 0);
  };

  const handleFocus = (e: React.FocusEvent<HTMLDivElement>) => {
    isFocused.current = true;
    if (!allowFormatting) return;
    setToolbarPos({
      top: 0,
      left: 0,
    });
    updateToolbarState();
  };

  const handleSelect = () => {
    updateToolbarState();
  };

  const handleFormat = (type: "bold" | "italic" | "clear") => {
    if (type === "clear") {
      document.execCommand("removeFormat", false);
    } else {
      document.execCommand(type, false);
    }
    updateToolbarState();
    // After formatting, update the value
    const element = containerRef.current?.querySelector("[contenteditable]");
    const newVal = (element as HTMLDivElement)?.innerHTML || "";
    setLocalValue(newVal);
    if (newVal !== value) {
      onChange(newVal);
    }
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (toolbarPos) updateToolbarState();
    };
    document.addEventListener("mouseup", handleGlobalMouseUp);
    return () => document.removeEventListener("mouseup", handleGlobalMouseUp);
  }, [toolbarPos]);

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    isFocused.current = false;
    const newVal = e.currentTarget.innerHTML || "";
    if (newVal !== value) {
      onChange(newVal);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!multiline && e.key === "Enter") {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  return (
    <div ref={containerRef} className="relative inline-block w-full">
      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => {
          handleBlur(e);
          setToolbarPos(null);
        }}
        onKeyDown={handleKeyDown}
        onInput={(e) => setLocalValue(e.currentTarget.innerHTML)}
        onFocus={handleFocus}
        onSelect={handleSelect}
        ref={editableRef}
        style={style}
        className={cn(
          "outline-none transition-all duration-200 rounded px-1 -mx-1 hover:bg-slate-100/50 focus:bg-white focus:text-black focus:shadow-sm focus:ring-1 focus:ring-blue-400 min-w-[10px] inline-block",
          className,
          !localValue &&
            !toolbarPos &&
            "text-slate-300 italic min-w-[50px] after:content-[attr(data-placeholder)]",
        )}
        data-placeholder={placeholder}
      />
      {toolbarPos && (
        <TextFormatToolbar
          position={toolbarPos}
          onFormat={handleFormat}
          activeStates={activeStates}
          hasSelection={hasSelection}
        />
      )}
    </div>
  );
};

// ─── Sidebar Toggle ────────────────────────────────────────────────
export interface SidebarToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon?: any;
}

export const SidebarToggle = ({
  label,
  checked,
  onChange,
  icon: Icon,
}: SidebarToggleProps) => (
  <div className="flex items-center justify-between py-1 px-2 hover:bg-white/10 rounded cursor-pointer group">
    <div className="flex items-center gap-2 text-xs text-white/90">
      {Icon && <Icon size={12} />}
      <span>{label}</span>
    </div>
    <button
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className="text-white/70 hover:text-white"
    >
      {checked ? <Eye size={12} /> : <EyeOff size={12} />}
    </button>
  </div>
);

// ─── Shared Props ────────────────────────────────────────────────
export interface PreviewProps {
  data: Partial<Resume>;
  onChange?: (data: Partial<Resume>) => void;
  isEditing?: boolean;
}

// ─── Helper functions ────────────────────────────────────────────

export function createExperience(): WorkExperience {
  return {
    id: Math.random().toString(36).substring(2, 9),
    title: "Job Title",
    company: "Company Name",
    location: "Location",
    startDate: "2024",
    endDate: "Present",
    current: true,
    description: ["Job responsibility point"],
  };
}

export function createEducation(): Education {
  return {
    id: Math.random().toString(36).substring(2, 9),
    institution: "Institution",
    degree: "Degree",
    field: "Field of Study",
    startDate: "2020",
    endDate: "2024",
    current: false,
  };
}

export function createSkill(
  category: "technical" | "soft" | "language",
): Skill {
  return {
    id: Math.random().toString(36).substring(2, 9),
    name: "New Skill",
    category,
    level: category === "language" ? "intermediate" : "expert",
  };
}
