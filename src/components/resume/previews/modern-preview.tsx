import { Resume, WorkExperience, Education, Skill } from "@/types/resume";
import { useTranslation } from "@/lib/translations";
import { useState, useEffect, useRef } from "react";
import {
  Settings2,
  Palette,
  Eye,
  EyeOff,
  Linkedin,
  Send,
  GripVertical,
  Plus,
  Trash2,
  Pencil,
  X,
  Bold,
  Italic,
  Type,
  Sparkles,
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ProfileImportModal } from "../profile-import-modal";

interface EditableTextProps {
  value: string;
  onChange: (val: string) => void;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
  style?: React.CSSProperties;
  allowFormatting?: boolean;
}

const TextFormatToolbar = ({
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

const EditableText = ({
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
            "text-gray-300 italic min-w-[50px] after:content-[attr(data-placeholder)]",
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

interface Props {
  data: Partial<Resume>;
  onChange?: (data: Partial<Resume>) => void;
  isEditing?: boolean;
}

interface SidebarToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon?: any;
}

const SidebarToggle = ({
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

export function ModernPreview({ data, onChange, isEditing }: Props) {
  const { t } = useTranslation();
  const { personalInfo, workExperience, education, skills, customization } =
    data;

  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importType, setImportType] = useState<"experience" | "skills">(
    "experience",
  );

  // Default values
  const sidebarColor = customization?.sidebarColor || "#2e3a4e";
  const showAvatar = customization?.showAvatar !== false;
  const showPhone = customization?.showPhone !== false;
  const showEmail = customization?.showEmail !== false;
  const showAddress = customization?.showAddress !== false;
  const showLinkedin = customization?.showLinkedin !== false;
  const showTelegram = customization?.showTelegram !== false;

  if (!personalInfo) return null;

  const updateSection = (section: keyof Resume, value: any) => {
    if (!onChange) return;
    onChange({
      ...data,
      [section]: value,
    });
  };

  const updatePersonalInfo = (
    field: keyof typeof personalInfo,
    value: string,
  ) => {
    if (!onChange) return;
    onChange({
      ...data,
      personalInfo: {
        ...personalInfo,
        [field]: value,
      },
    });
  };

  const updateCustomization = (key: string, value: any) => {
    if (!onChange) return;
    onChange({
      ...data,
      customization: {
        ...customization,
        [key]: value,
      },
    });
  };

  const onDragEnd = (result: any) => {
    if (!result.destination || !onChange) return;
    const items = Array.from(workExperience || []);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    updateSection("workExperience", items);
  };

  const addExperience = () => {
    const newExp: WorkExperience = {
      id: Math.random().toString(36).substring(2, 9),
      title: "Job Title",
      company: "Company Name",
      location: "Location",
      startDate: "2024",
      endDate: "Present",
      current: true,
      description: ["Job responsibility point"],
    };
    updateSection("workExperience", [...(workExperience || []), newExp]);
  };

  const removeExperience = (id: string) => {
    updateSection(
      "workExperience",
      (workExperience || []).filter((e) => e.id !== id),
    );
  };

  const addEducation = () => {
    const newEdu: Education = {
      id: Math.random().toString(36).substring(2, 9),
      institution: "Institution",
      degree: "Degree",
      field: "Field of Study",
      startDate: "2020",
      endDate: "2024",
      current: false,
    };
    updateSection("education", [...(education || []), newEdu]);
  };

  const removeEducation = (id: string) => {
    updateSection(
      "education",
      (education || []).filter((e) => e.id !== id),
    );
  };

  const addSkill = (category: "technical" | "soft" | "language") => {
    const newSkill: Skill = {
      id: Math.random().toString(36).substring(2, 9),
      name: "New Skill",
      category,
      level: category === "language" ? "intermediate" : "expert",
    };
    updateSection("skills", [...(skills || []), newSkill]);
  };

  const removeSkill = (id: string) => {
    updateSection(
      "skills",
      (skills || []).filter((s) => s.id !== id),
    );
  };

  const handleImport = (selectedItems: any[]) => {
    if (importType === "experience") {
      const itemsWithNewIds = selectedItems.map((item) => ({
        ...item,
        id: Math.random().toString(36).substring(2, 9),
      }));
      updateSection("workExperience", [
        ...(workExperience || []),
        ...itemsWithNewIds,
      ]);
    } else {
      // Merge skills by name to avoid duplicates
      const existingNames = new Set(
        (skills || []).map((s) => s.name.toLowerCase()),
      );
      const newSkills = selectedItems
        .filter((s) => !existingNames.has(s.name.toLowerCase()))
        .map((s) => ({
          ...s,
          id: Math.random().toString(36).substring(2, 9),
        }));
      if (newSkills.length > 0) {
        updateSection("skills", [...(skills || []), ...newSkills]);
      }
    }
  };

  return (
    <div className="flex h-full min-h-[800px] w-full bg-white shadow-sm overflow-hidden font-sans relative group/preview">
      {/* SIDEBAR (Left - 35%) */}
      <div
        className="w-[35%] text-white p-6 flex flex-col shrink-0 relative transition-colors duration-300"
        style={{ backgroundColor: sidebarColor }}
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
      >
        {/* CUSTOMIZATION OVERLAY */}
        {isEditing && isSettingsOpen && (
          <div className="absolute top-2 left-2 right-2 bg-slate-900 shadow-2xl rounded-xl border border-white/10 p-4 z-50 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <Settings2 size={14} className="text-blue-400" /> Sidebar
                Options
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-1 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <div className="mb-3">
              <div className="text-[10px] text-white/60 mb-1 flex items-center gap-1">
                <Palette size={10} /> Color
              </div>
              <div className="flex gap-1 flex-wrap">
                {[
                  "#2e3a4e",
                  "#1e293b",
                  "#0f172a",
                  "#374151",
                  "#4b5563",
                  "#1a365d",
                  "#2c5282",
                  "#276749",
                  "#22543d",
                  "#742a2a",
                  "#9b2c2c",
                  "#553c9a",
                  "#44337a",
                ].map((color) => (
                  <button
                    key={color}
                    className={cn(
                      "w-4 h-4 rounded-full border border-white/30 transition-transform hover:scale-110",
                      sidebarColor === color && "ring-2 ring-white",
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => updateCustomization("sidebarColor", color)}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-0.5">
              <SidebarToggle
                label="Avatar"
                checked={showAvatar}
                onChange={(v) => updateCustomization("showAvatar", v)}
              />
              <SidebarToggle
                label="Phone"
                checked={showPhone}
                onChange={(v) => updateCustomization("showPhone", v)}
              />
              <SidebarToggle
                label="Email"
                checked={showEmail}
                onChange={(v) => updateCustomization("showEmail", v)}
              />
              <SidebarToggle
                label="Address"
                checked={showAddress}
                onChange={(v) => updateCustomization("showAddress", v)}
              />
              <SidebarToggle
                label="LinkedIn"
                icon={Linkedin}
                checked={showLinkedin}
                onChange={(v) => updateCustomization("showLinkedin", v)}
              />
              <SidebarToggle
                label="Telegram"
                icon={Send}
                checked={showTelegram}
                onChange={(v) => updateCustomization("showTelegram", v)}
              />
            </div>
          </div>
        )}

        {/* Settings Trigger */}
        {isEditing && isSidebarHovered && !isSettingsOpen && (
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full shadow-lg backdrop-blur-sm transition-all duration-200 animate-in zoom-in group/settings-btn"
            title="Sidebar Options"
          >
            <Settings2
              size={14}
              className="group-hover/settings-btn:rotate-90 transition-transform duration-500"
            />
          </button>
        )}

        {/* Avatar */}
        {showAvatar && (
          <div className="flex justify-center mt-4 mb-8">
            {personalInfo.avatarUrl ? (
              <img
                src={personalInfo.avatarUrl}
                alt=""
                className="w-24 h-24 rounded-full object-cover border-4 border-white/20"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold text-white/50 border-4 border-white/10">
                {personalInfo.firstName?.[0]}
                {personalInfo.lastName?.[0]}
              </div>
            )}
          </div>
        )}

        {/* Contact */}
        <div className="mb-8">
          <h3 className="text-sm font-bold uppercase border-b border-white/20 pb-2 mb-4 text-white/90">
            Contact
          </h3>
          <div className="space-y-3">
            {showEmail && (
              <div>
                <div className="text-[10px] font-bold text-white/60 uppercase">
                  Email
                </div>
                <EditableText
                  value={personalInfo.email || ""}
                  onChange={(v) => updatePersonalInfo("email", v)}
                  className="text-[10px] text-white/90 break-words"
                  placeholder="Email"
                />
              </div>
            )}
            {showPhone && (
              <div>
                <div className="text-[10px] font-bold text-white/60 uppercase">
                  Phone
                </div>
                <EditableText
                  value={personalInfo.phone || ""}
                  onChange={(v) => updatePersonalInfo("phone", v)}
                  className="text-[10px] text-white/90"
                  placeholder="Phone"
                />
              </div>
            )}
            {showLinkedin && (
              <div>
                <div className="text-[10px] font-bold text-white/60 uppercase">
                  LinkedIn
                </div>
                <EditableText
                  value={personalInfo.linkedin || ""}
                  onChange={(v) => updatePersonalInfo("linkedin", v)}
                  className="text-[10px] text-white/90 break-words"
                  placeholder="LinkedIn URL"
                />
              </div>
            )}
            {showTelegram && (
              <div>
                <div className="text-[10px] font-bold text-white/60 uppercase">
                  Telegram
                </div>
                <EditableText
                  value={personalInfo.telegram || ""}
                  onChange={(v) => updatePersonalInfo("telegram", v)}
                  className="text-[10px] text-white/90"
                  placeholder="Telegram"
                />
              </div>
            )}
            {showAddress && (
              <div>
                <div className="text-[10px] font-bold text-white/60 uppercase">
                  Location
                </div>
                <EditableText
                  value={personalInfo.location || ""}
                  onChange={(v) => updatePersonalInfo("location", v)}
                  className="text-[10px] text-white/90"
                  placeholder="Location"
                />
              </div>
            )}
          </div>
        </div>

        {/* Education */}
        <div className="mb-8">
          <div className="flex justify-between items-center border-b border-white/20 pb-2 mb-4">
            <h3 className="text-sm font-bold uppercase text-white/90">
              Education
            </h3>
            {isEditing && (
              <button
                onClick={addEducation}
                className="text-[9px] text-white/50 hover:text-white flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors hover:bg-white/10"
              >
                <Plus size={10} /> Add
              </button>
            )}
          </div>
          <div className="space-y-4">
            {(education || []).map((edu, idx) => (
              <div key={edu.id} className="relative group/edu">
                {isEditing && (
                  <button
                    onClick={() => removeEducation(edu.id)}
                    className="absolute -right-2 top-0 opacity-0 group-hover/edu:opacity-100 text-white/40 hover:text-red-300 transition-opacity p-1"
                    title="Delete education"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
                <div className="text-[10px] font-bold text-white/95 mb-0.5 flex gap-1">
                  <EditableText
                    value={edu.startDate || ""}
                    onChange={(v) => {
                      const newEdu = [...(education || [])];
                      newEdu[idx] = { ...newEdu[idx], startDate: v };
                      updateSection("education", newEdu);
                    }}
                    placeholder="Start"
                  />
                  <span>-</span>
                  <EditableText
                    value={edu.current ? "Present" : edu.endDate || ""}
                    onChange={(v) => {
                      const newEdu = [...(education || [])];
                      if (v.toLowerCase() === "present")
                        newEdu[idx] = {
                          ...newEdu[idx],
                          current: true,
                          endDate: "",
                        };
                      else
                        newEdu[idx] = {
                          ...newEdu[idx],
                          current: false,
                          endDate: v,
                        };
                      updateSection("education", newEdu);
                    }}
                    placeholder="End"
                  />
                </div>
                <EditableText
                  value={edu.degree || ""}
                  onChange={(v) => {
                    const newEdu = [...(education || [])];
                    newEdu[idx] = { ...newEdu[idx], degree: v };
                    updateSection("education", newEdu);
                  }}
                  className="text-[11px] font-bold text-white/90 block"
                  placeholder="Degree"
                />
                <EditableText
                  value={edu.institution || ""}
                  onChange={(v) => {
                    const newEdu = [...(education || [])];
                    newEdu[idx] = { ...newEdu[idx], institution: v };
                    updateSection("education", newEdu);
                  }}
                  className="text-[10px] text-white/70 italic block"
                  placeholder="Institution"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Skills & Languages */}
        <div className="space-y-6">
          {(["technical", "soft", "language"] as const).map((cat) => (
            <div key={cat}>
              <div className="flex justify-between items-center border-b border-white/20 pb-2 mb-4">
                <h3 className="text-sm font-bold uppercase text-white/90">
                  {cat === "technical"
                    ? "Technical Skills"
                    : cat === "soft"
                      ? "Soft Skills"
                      : "Languages"}
                </h3>
                {isEditing && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setImportType("skills");
                        setIsImportModalOpen(true);
                      }}
                      className="text-[9px] text-blue-500 hover:text-blue-600 flex items-center gap-1.5 px-1.5 py-0.5 rounded transition-all hover:bg-white/10"
                    >
                      <Sparkles size={10} /> {t("profile.btn_import")}
                    </button>
                    <button
                      onClick={() => addSkill(cat)}
                      className="text-[9px] text-white/50 hover:text-white flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors hover:bg-white/10"
                    >
                      <Plus size={10} /> Add
                    </button>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {(skills || [])
                  .filter((s) => s.category === cat)
                  .map((skill) => (
                    <div key={skill.id} className="relative group/skill">
                      <EditableText
                        value={skill.name || ""}
                        onChange={(v) => {
                          const newSkills = [...(skills || [])];
                          const sIdx = newSkills.findIndex(
                            (s) => s.id === skill.id,
                          );
                          newSkills[sIdx] = { ...newSkills[sIdx], name: v };
                          updateSection("skills", newSkills);
                        }}
                        className="text-[10px] bg-white/10 px-2 py-1 rounded text-white/90"
                      />
                      {isEditing && (
                        <button
                          onClick={() => removeSkill(skill.id)}
                          className="absolute -top-1.5 -right-1.5 opacity-0 group-hover/skill:opacity-100 bg-red-500 shadow-sm rounded-full p-0.5 text-white hover:bg-red-600 transition-all scale-75 hover:scale-100"
                        >
                          <X size={8} />
                        </button>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="w-[65%] p-8 pt-12 flex flex-col">
        <div className="mb-8">
          <div className="text-3xl font-bold uppercase tracking-wide leading-tight mb-2 flex flex-col gap-1">
            <EditableText
              value={personalInfo.firstName || ""}
              onChange={(v) => updatePersonalInfo("firstName", v)}
              style={{ color: sidebarColor }}
            />
            <EditableText
              value={personalInfo.lastName || ""}
              onChange={(v) => updatePersonalInfo("lastName", v)}
              style={{ color: sidebarColor }}
            />
          </div>
          <EditableText
            value={personalInfo.summary || ""}
            onChange={(v) => updatePersonalInfo("summary", v)}
            className="text-[12px] leading-relaxed text-gray-600 text-justify mt-4 block"
            multiline
            placeholder="Professional Summary..."
            allowFormatting={true}
          />
        </div>

        {workExperience && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2
                className="text-xl font-bold capitalize"
                style={{ color: sidebarColor }}
              >
                Experience
              </h2>
              {isEditing && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setImportType("experience");
                      setIsImportModalOpen(true);
                    }}
                    className="text-[10px] text-blue-600/70 hover:text-blue-600 flex items-center gap-1.5 px-2 py-1 rounded-md transition-all hover:bg-blue-50 border border-transparent hover:border-blue-100"
                  >
                    <Sparkles size={14} /> {t("profile.btn_import")}
                  </button>
                  <button
                    onClick={addExperience}
                    className="text-[10px] text-blue-600/70 hover:text-blue-600 flex items-center gap-1.5 px-2 py-1 rounded-md transition-all hover:bg-blue-50 border border-transparent hover:border-blue-100"
                  >
                    <Plus size={14} /> Add Experience
                  </button>
                </div>
              )}
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="experience">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-0 relative"
                  >
                    {workExperience.map((exp, idx) => (
                      <Draggable
                        key={exp.id}
                        draggableId={exp.id}
                        index={idx}
                        isDragDisabled={!isEditing}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={cn(
                              "flex gap-4 mb-6 relative group/item",
                              snapshot.isDragging &&
                                "bg-white shadow-xl z-50 rounded-lg scale-105",
                            )}
                          >
                            {isEditing && (
                              <div className="absolute -right-2 -top-2 flex gap-1 opacity-0 group-hover/item:opacity-100 transition-all duration-200 z-50">
                                <div
                                  {...provided.dragHandleProps}
                                  className="p-1.5 bg-white shadow-md border border-gray-100 rounded-md cursor-grab text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                                  title="Drag to reorder"
                                >
                                  <GripVertical size={14} />
                                </div>
                                <button
                                  onClick={() => removeExperience(exp.id)}
                                  className="p-1.5 bg-white shadow-md border border-gray-100 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50"
                                  title="Delete experience"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            )}
                            <div className="shrink-0 mt-1.5 z-10">
                              <div
                                className="w-2 h-2 rounded-full border-2 bg-white"
                                style={{ borderColor: sidebarColor }}
                              ></div>
                            </div>
                            <div className="flex-1 pb-1">
                              <div
                                className="flex items-baseline gap-1 text-[10px] font-bold"
                                style={{ color: sidebarColor }}
                              >
                                <EditableText
                                  value={exp.startDate || ""}
                                  onChange={(v) => {
                                    const newExp = [...(workExperience || [])];
                                    newExp[idx] = {
                                      ...newExp[idx],
                                      startDate: v,
                                    };
                                    updateSection("workExperience", newExp);
                                  }}
                                  placeholder="Start"
                                />
                                <span>-</span>
                                <EditableText
                                  value={
                                    exp.current ? "Present" : exp.endDate || ""
                                  }
                                  onChange={(v) => {
                                    const newExp = [...(workExperience || [])];
                                    if (v.toLowerCase() === "present")
                                      newExp[idx] = {
                                        ...newExp[idx],
                                        current: true,
                                        endDate: "",
                                      };
                                    else
                                      newExp[idx] = {
                                        ...newExp[idx],
                                        current: false,
                                        endDate: v,
                                      };
                                    updateSection("workExperience", newExp);
                                  }}
                                  placeholder="End"
                                />
                              </div>
                              <div className="text-[10px] text-gray-500 italic mb-1 flex gap-1">
                                <EditableText
                                  value={exp.company || ""}
                                  onChange={(v) => {
                                    const newExp = [...(workExperience || [])];
                                    newExp[idx] = {
                                      ...newExp[idx],
                                      company: v,
                                    };
                                    updateSection("workExperience", newExp);
                                  }}
                                  placeholder="Company"
                                />
                                <span>|</span>
                                <EditableText
                                  value={exp.location || ""}
                                  onChange={(v) => {
                                    const newExp = [...(workExperience || [])];
                                    newExp[idx] = {
                                      ...newExp[idx],
                                      location: v,
                                    };
                                    updateSection("workExperience", newExp);
                                  }}
                                  placeholder="Location"
                                />
                              </div>
                              <EditableText
                                value={exp.title || ""}
                                onChange={(v) => {
                                  const newExp = [...(workExperience || [])];
                                  newExp[idx] = { ...newExp[idx], title: v };
                                  updateSection("workExperience", newExp);
                                }}
                                className="text-xs font-bold text-gray-800 uppercase block mb-2"
                                placeholder="Title"
                              />
                              <div className="text-[12px] text-gray-600 space-y-1">
                                {(
                                  (Array.isArray(exp.description)
                                    ? exp.description
                                    : [exp.description]
                                  ).filter(Boolean) as string[]
                                ).map((d, dIdx) => (
                                  <div
                                    key={dIdx}
                                    className="flex gap-1 group/desc"
                                  >
                                    <span className="shrink-0">•</span>
                                    <EditableText
                                      value={d}
                                      onChange={(v) => {
                                        const newExp = [
                                          ...(workExperience || []),
                                        ];
                                        const newDesc = [
                                          ...(newExp[idx]
                                            .description as string[]),
                                        ];
                                        newDesc[dIdx] = v;
                                        newExp[idx] = {
                                          ...newExp[idx],
                                          description: newDesc,
                                        };
                                        updateSection("workExperience", newExp);
                                      }}
                                      className="flex-1"
                                      multiline
                                      allowFormatting={true}
                                    />
                                    {isEditing && (
                                      <button
                                        onClick={() => {
                                          const newExp = [
                                            ...(workExperience || []),
                                          ];
                                          const newDesc = (
                                            newExp[idx].description as string[]
                                          ).filter((_, i) => i !== dIdx);
                                          newExp[idx] = {
                                            ...newExp[idx],
                                            description: newDesc,
                                          };
                                          updateSection(
                                            "workExperience",
                                            newExp,
                                          );
                                        }}
                                        className="opacity-0 group-hover/desc:opacity-100 text-red-300 hover:text-red-500"
                                      >
                                        <Trash2 size={10} />
                                      </button>
                                    )}
                                  </div>
                                ))}
                                {isEditing && (
                                  <button
                                    onClick={() => {
                                      const newExp = [
                                        ...(workExperience || []),
                                      ];
                                      const newDesc = [
                                        ...((newExp[idx]
                                          .description as string[]) || []),
                                        "",
                                      ];
                                      newExp[idx] = {
                                        ...newExp[idx],
                                        description: newDesc,
                                      };
                                      updateSection("workExperience", newExp);
                                    }}
                                    className="text-[9px] text-blue-500/70 hover:text-blue-600 flex items-center gap-1 mt-1 transition-colors"
                                  >
                                    <Plus size={8} /> Add Point
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        )}
      </div>

      <ProfileImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
        type={importType}
      />
    </div>
  );
}
