import { useState, useRef, useEffect } from "react";
import {
  GripVertical,
  Plus,
  Trash2,
  Import,
  Settings2,
  Palette,
  X,
  Github,
  Globe,
  Send,
} from "lucide-react";
import { LinkedinIcon } from "@/components/ui/icons/linkedin";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";
import { ProfileImportModal } from "../profile-import-modal";
import {
  EditableText,
  SidebarToggle,
  PreviewProps as Props,
  createExperience,
  createEducation,
  createSkill,
  createCertificate,
} from "./shared-preview-utils";
import { Resume } from "@/types/resume";
import { useTranslation } from "@/lib/translations";
import { getTranslation } from "@/lib/translations-data";

const hexToRgba = (hex: string, alpha: number) => {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const num = parseInt(full, 16);
  if (isNaN(num)) return `rgba(15, 23, 42, ${alpha})`;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export function BoxedPreview({ data, onChange, isEditing }: Props) {
  const { t } = useTranslation();
  const { personalInfo, workExperience, education, skills, certificates, customization } =
    data;
  const lang = data.language || "en";
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(event.target as Node)
      ) {
        setIsSettingsOpen(false);
      }
    }
    if (isSettingsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSettingsOpen]);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importType, setImportType] = useState<"experience" | "skills">(
    "experience",
  );
  const [importSkillsCategory, setImportSkillsCategory] = useState<
    "technical" | "soft" | "language" | null
  >(null);
  const [isImportingPersonalInfo, setIsImportingPersonalInfo] = useState(false);

  // Default values
  const accentColor = customization?.sidebarColor || "#2e3a4e";
  const showAvatar = customization?.showAvatar !== false;
  const showPhone = customization?.showPhone !== false;
  const showEmail = customization?.showEmail !== false;
  const showAddress = customization?.showAddress !== false;
  const showLinkedin = customization?.showLinkedin !== false;
  const showGithub = customization?.showGithub !== false;
  const showWebsite = customization?.showWebsite !== false;
  const showTelegram = customization?.showTelegram !== false;

  const getLevelLabel = (level?: string) => {
    if (!level) return "";
    const variants = [
      level,
      level.toLowerCase(),
      level.toUpperCase(),
      level
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
    ];
    for (const v of variants) {
      const key = `skill.level.${v}`;
      const translated = getTranslation(key, lang);
      if (translated !== key) return translated;
    }
    return level;
  };

  if (!personalInfo) return null;

  const updateSection = (section: keyof Resume, value: any) => {
    if (!onChange) return;
    onChange({ ...data, [section]: value });
  };

  const updatePersonalInfo = (
    field: keyof typeof personalInfo,
    value: string,
  ) => {
    if (!onChange) return;
    onChange({ ...data, personalInfo: { ...personalInfo, [field]: value } });
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

  const addCertificate = () =>
    updateSection("certificates", [
      ...(certificates || []),
      createCertificate(),
    ]);
  const removeCertificate = (id: string) =>
    updateSection(
      "certificates",
      (certificates || []).filter((c) => c.id !== id),
    );
  const updateCertificateField = (idx: number, field: string, value: string) => {
    const newCerts = [...(certificates || [])];
    newCerts[idx] = { ...newCerts[idx], [field]: value };
    updateSection("certificates", newCerts);
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
    } else if (importType === "skills") {
      const existingNames = new Set(
        (skills || []).map((s) => s.name.toLowerCase()),
      );
      const newSkills = selectedItems
        .filter((s) => !existingNames.has(s.name.toLowerCase()))
        .map((s) => ({ ...s, id: Math.random().toString(36).substring(2, 9) }));
      if (newSkills.length > 0) {
        updateSection("skills", [...(skills || []), ...newSkills]);
      }
    }
  };

  const importPersonalInfo = async () => {
    setIsImportingPersonalInfo(true);
    try {
      const response = await fetch("/api/profile/experience");
      if (response.ok) {
        const profile = await response.json();
        if (profile.personalInfo && onChange) {
          onChange({ ...data, personalInfo: { ...personalInfo, ...profile.personalInfo } });
        }
      }
    } catch (error) {
      console.error("Failed to import personal info:", error);
    } finally {
      setIsImportingPersonalInfo(false);
    }
  };

  const technicalAndSoft = (skills || []).filter(
    (s) => s.category === "technical" || s.category === "soft",
  );
  const languages = (skills || []).filter((s) => s.category === "language");

  return (
    <div className="flex h-full min-h-[1056px] w-full bg-white shadow-sm overflow-hidden font-sans relative group/preview">
      {/* SIDEBAR (Left - 32%, light accent tint) */}
      <div
        className="w-[32%] p-6 flex flex-col shrink-0 relative transition-colors duration-300"
        style={{ backgroundColor: hexToRgba(accentColor, 0.06) }}
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
      >
        {/* Settings Dropdown */}
        {isEditing && isSettingsOpen && (
          <div
            ref={settingsRef}
            className="absolute top-2 left-2 right-2 bg-slate-900 shadow-2xl rounded-xl border border-white/10 p-4 z-50 animate-in fade-in zoom-in duration-300"
          >
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
                  "#27272a",
                  "#111827",
                  "#374151",
                  "#172554",
                  "#1e3a8a",
                  "#312e81",
                  "#064e3b",
                  "#065f46",
                  "#14532d",
                  "#7f1d1d",
                  "#581c87",
                  "#701a75",
                  "#92400e",
                ].map((color) => (
                  <button
                    key={color}
                    className={cn(
                      "w-4 h-4 rounded-full border border-white/30 transition-transform hover:scale-110",
                      accentColor === color && "ring-2 ring-white",
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
                icon={LinkedinIcon}
                checked={showLinkedin}
                onChange={(v) => updateCustomization("showLinkedin", v)}
              />
              <SidebarToggle
                label="GitHub"
                icon={Github}
                checked={showGithub}
                onChange={(v) => updateCustomization("showGithub", v)}
              />
              <SidebarToggle
                label="Website"
                icon={Globe}
                checked={showWebsite}
                onChange={(v) => updateCustomization("showWebsite", v)}
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
            className="absolute top-4 right-4 p-2 bg-slate-900/10 hover:bg-slate-900/20 text-slate-900 rounded-full shadow-sm backdrop-blur-sm transition-all duration-200 animate-in zoom-in group/settings-btn z-40"
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
          <div className="flex justify-center mt-2 mb-6">
            {personalInfo.avatarUrl ? (
              <img
                src={personalInfo.avatarUrl}
                alt=""
                className="w-20 h-20 rounded-full object-cover border-4 border-white"
              />
            ) : (
              <div
                className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-xl font-bold border-4 border-white"
                style={{ color: accentColor }}
              >
                {personalInfo.firstName?.[0]}
                {personalInfo.lastName?.[0]}
              </div>
            )}
          </div>
        )}

        {/* Contact - bordered rounded box, distinct from skills/languages below */}
        <div
          className="rounded-lg border p-4 mb-6 bg-white/50"
          style={{ borderColor: accentColor }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3
              className="text-[11px] font-bold uppercase"
              style={{ color: accentColor }}
            >
              {getTranslation("form.personal_info", lang) ===
              "form.personal_info"
                ? "Contact"
                : getTranslation("form.personal_info", lang)}
            </h3>
            {isEditing && (
              <button
                onClick={importPersonalInfo}
                disabled={isImportingPersonalInfo}
                className="text-[9px] text-slate-400 hover:text-slate-700 flex items-center gap-1.5 px-1.5 py-0.5 rounded transition-all hover:bg-slate-100"
                title="Import from Profile"
              >
                {isImportingPersonalInfo ? (
                  <div className="w-2.5 h-2.5 border border-t-slate-500 border-slate-300 rounded-full animate-spin" />
                ) : (
                  <Import size={10} />
                )}
              </button>
            )}
          </div>
          <div className="space-y-2.5">
            {showEmail && (
              <div>
                <div className="text-[9px] font-bold text-slate-500 uppercase">
                  Email
                </div>
                <EditableText
                  value={personalInfo.email || ""}
                  onChange={(v) => updatePersonalInfo("email", v)}
                  className="text-[10px] text-slate-800 break-words"
                  placeholder="Email"
                />
              </div>
            )}
            {showPhone && (
              <div>
                <div className="text-[9px] font-bold text-slate-500 uppercase">
                  Phone
                </div>
                <EditableText
                  value={personalInfo.phone || ""}
                  onChange={(v) => updatePersonalInfo("phone", v)}
                  className="text-[10px] text-slate-800"
                  placeholder="Phone"
                />
              </div>
            )}
            {showAddress && (
              <div>
                <div className="text-[9px] font-bold text-slate-500 uppercase">
                  Location
                </div>
                <EditableText
                  value={personalInfo.location || ""}
                  onChange={(v) => updatePersonalInfo("location", v)}
                  className="text-[10px] text-slate-800"
                  placeholder="Location"
                />
              </div>
            )}
            {showTelegram && (
              <div>
                <div className="text-[9px] font-bold text-slate-500 uppercase">
                  Telegram
                </div>
                <EditableText
                  value={personalInfo.telegram || ""}
                  onChange={(v) => updatePersonalInfo("telegram", v)}
                  className="text-[10px] text-slate-800"
                  placeholder="Telegram"
                />
              </div>
            )}
            {showLinkedin && (
              <div>
                <div className="text-[9px] font-bold text-slate-500 uppercase">
                  LinkedIn
                </div>
                <EditableText
                  value={personalInfo.linkedin || ""}
                  onChange={(v) => updatePersonalInfo("linkedin", v)}
                  className="text-[10px] break-words"
                  style={{ color: accentColor }}
                  placeholder="LinkedIn URL"
                />
              </div>
            )}
            {showGithub && (
              <div>
                <div className="text-[9px] font-bold text-slate-500 uppercase">
                  GitHub
                </div>
                <EditableText
                  value={personalInfo.github || ""}
                  onChange={(v) => updatePersonalInfo("github", v)}
                  className="text-[10px] break-words"
                  style={{ color: accentColor }}
                  placeholder="GitHub URL"
                />
              </div>
            )}
            {showWebsite && (
              <div>
                <div className="text-[9px] font-bold text-slate-500 uppercase">
                  Website
                </div>
                <EditableText
                  value={personalInfo.website || ""}
                  onChange={(v) => updatePersonalInfo("website", v)}
                  className="text-[10px] break-words"
                  style={{ color: accentColor }}
                  placeholder="Website URL"
                />
              </div>
            )}
          </div>
        </div>

        {/* Skills: technical + soft combined */}
        <div className="mb-6">
          <div className="flex justify-between items-center border-b pb-1.5 mb-2.5" style={{ borderColor: hexToRgba(accentColor, 0.3) }}>
            <h3
              className="text-[11px] font-bold uppercase"
              style={{ color: accentColor }}
            >
              {getTranslation("form.skills", lang)}
            </h3>
            {isEditing && (
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    setImportType("skills");
                    setImportSkillsCategory("technical");
                    setIsImportModalOpen(true);
                  }}
                  className="text-[9px] text-slate-400 hover:text-slate-700 flex items-center gap-1 px-1 py-0.5 rounded transition-colors hover:bg-slate-100"
                >
                  <Import size={10} />
                </button>
                <button
                  onClick={() =>
                    updateSection("skills", [
                      ...(skills || []),
                      createSkill("technical"),
                    ])
                  }
                  className="text-[9px] text-slate-400 hover:text-slate-700 flex items-center gap-1 px-1 py-0.5 rounded transition-colors hover:bg-slate-100"
                >
                  <Plus size={10} /> Add
                </button>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {technicalAndSoft.map((skill) => (
              <div key={skill.id} className="relative group/skill">
                <EditableText
                  value={skill.name || ""}
                  onChange={(v) => {
                    const newSkills = [...(skills || [])];
                    const sIdx = newSkills.findIndex((s) => s.id === skill.id);
                    newSkills[sIdx] = { ...newSkills[sIdx], name: v };
                    updateSection("skills", newSkills);
                  }}
                  className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded text-slate-800"
                />
                {isEditing && (
                  <button
                    onClick={() =>
                      updateSection(
                        "skills",
                        (skills || []).filter((s) => s.id !== skill.id),
                      )
                    }
                    className="absolute -top-1.5 -right-1.5 opacity-0 group-hover/skill:opacity-100 bg-red-500 shadow-sm rounded-full p-0.5 text-white hover:bg-red-600 transition-all scale-75 hover:scale-100"
                  >
                    <X size={8} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Languages */}
        <div>
          <div className="flex justify-between items-center border-b pb-1.5 mb-2.5" style={{ borderColor: hexToRgba(accentColor, 0.3) }}>
            <h3
              className="text-[11px] font-bold uppercase"
              style={{ color: accentColor }}
            >
              {getTranslation("skills.languages", lang)}
            </h3>
            {isEditing && (
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    setImportType("skills");
                    setImportSkillsCategory("language");
                    setIsImportModalOpen(true);
                  }}
                  className="text-[9px] text-slate-400 hover:text-slate-700 flex items-center gap-1 px-1 py-0.5 rounded transition-colors hover:bg-slate-100"
                >
                  <Import size={10} />
                </button>
                <button
                  onClick={() =>
                    updateSection("skills", [
                      ...(skills || []),
                      createSkill("language"),
                    ])
                  }
                  className="text-[9px] text-slate-400 hover:text-slate-700 flex items-center gap-1 px-1 py-0.5 rounded transition-colors hover:bg-slate-100"
                >
                  <Plus size={10} /> Add
                </button>
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            {languages.map((skill) => (
              <div
                key={skill.id}
                className="relative group/skill flex justify-between items-center"
              >
                <EditableText
                  value={skill.name || ""}
                  onChange={(v) => {
                    const newSkills = [...(skills || [])];
                    const sIdx = newSkills.findIndex((s) => s.id === skill.id);
                    newSkills[sIdx] = { ...newSkills[sIdx], name: v };
                    updateSection("skills", newSkills);
                  }}
                  className="text-[10px] text-slate-800"
                />
                <span className="text-[9px] text-slate-500">
                  {getLevelLabel(skill.level)}
                </span>
                {isEditing && (
                  <button
                    onClick={() =>
                      updateSection(
                        "skills",
                        (skills || []).filter((s) => s.id !== skill.id),
                      )
                    }
                    className="absolute -top-1.5 -right-1.5 opacity-0 group-hover/skill:opacity-100 bg-red-500 shadow-sm rounded-full p-0.5 text-white hover:bg-red-600 transition-all scale-75 hover:scale-100"
                  >
                    <X size={8} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT (Right - 68%) */}
      <div className="w-[68%] p-8 flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <div
            className="text-[24px] font-bold uppercase tracking-wide leading-none mb-1.5 inline-flex flex-nowrap gap-2 whitespace-nowrap"
            style={{ color: "#1f2937" }}
          >
            <EditableText
              value={personalInfo.firstName || ""}
              onChange={(v) => updatePersonalInfo("firstName", v)}
              placeholder="First Name"
            />
            <EditableText
              value={personalInfo.lastName || ""}
              onChange={(v) => updatePersonalInfo("lastName", v)}
              placeholder="Last Name"
            />
          </div>
          {(data as any).targetPosition && (
            <div
              className="text-[12px] font-medium"
              style={{ color: accentColor }}
            >
              {(data as any).targetPosition}
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="mb-5">
          <h2
            className="text-[12px] font-bold uppercase mb-1.5 pb-0.5 border-b border-slate-200"
            style={{ color: "#1f2937" }}
          >
            {getTranslation("form.summary", lang)}
          </h2>
          <EditableText
            value={personalInfo.summary || ""}
            onChange={(v) => updatePersonalInfo("summary", v)}
            className="text-slate-700 text-[10px] leading-relaxed text-justify block"
            multiline
            placeholder="Professional Summary..."
            allowFormatting={true}
          />
        </div>

        {/* Work Experience */}
        {workExperience && (
          <div className="mb-5">
            <div className="flex justify-between items-end mb-2 pb-0.5 border-b border-slate-200">
              <h2
                className="text-[12px] font-bold uppercase"
                style={{ color: "#1f2937" }}
              >
                {getTranslation("form.work_experience", lang)}
              </h2>
              {isEditing && (
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => {
                      setImportType("experience");
                      setImportSkillsCategory(null);
                      setIsImportModalOpen(true);
                    }}
                    className="text-[10px] text-slate-500 hover:text-slate-800 flex items-center gap-1 px-2 py-1 rounded-md transition-all hover:bg-slate-100"
                  >
                    <Import size={14} /> {t("profile.btn_import")}
                  </button>
                  <button
                    onClick={() =>
                      updateSection("workExperience", [
                        ...(workExperience || []),
                        createExperience(),
                      ])
                    }
                    className="text-[10px] text-slate-500 hover:text-slate-800 flex items-center gap-1 px-2 py-1 rounded-md transition-all hover:bg-slate-100"
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
                    className="space-y-2.5"
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
                              "relative group/item",
                              snapshot.isDragging &&
                                "bg-white shadow-xl z-50 rounded-lg scale-105",
                            )}
                          >
                            {isEditing && (
                              <div className="absolute -right-2 -top-2 flex gap-1 opacity-0 group-hover/item:opacity-100 transition-all duration-200 z-50">
                                <div
                                  {...provided.dragHandleProps}
                                  className="p-1.5 bg-white shadow-md border border-slate-200 rounded-md cursor-grab text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                                  title="Drag to reorder"
                                >
                                  <GripVertical size={14} />
                                </div>
                                <button
                                  onClick={() =>
                                    updateSection(
                                      "workExperience",
                                      (workExperience || []).filter(
                                        (e) => e.id !== exp.id,
                                      ),
                                    )
                                  }
                                  className="p-1.5 bg-white shadow-md border border-slate-200 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50"
                                  title="Delete experience"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            )}
                            <div className="flex justify-between items-start mb-0.5">
                              <div className="flex-1 pr-4">
                                <EditableText
                                  value={exp.title || ""}
                                  onChange={(v) => {
                                    const newExp = [...(workExperience || [])];
                                    newExp[idx] = { ...newExp[idx], title: v };
                                    updateSection("workExperience", newExp);
                                  }}
                                  className="font-bold text-slate-900 text-[11px]"
                                  placeholder="Title"
                                />
                                <div className="text-slate-600 text-[10px] italic flex gap-1">
                                  <EditableText
                                    value={exp.company || ""}
                                    onChange={(v) => {
                                      const newExp = [
                                        ...(workExperience || []),
                                      ];
                                      newExp[idx] = {
                                        ...newExp[idx],
                                        company: v,
                                      };
                                      updateSection("workExperience", newExp);
                                    }}
                                    placeholder="Company"
                                  />
                                  {(isEditing || exp.employmentType) && (
                                    <>
                                      <span>•</span>
                                      {isEditing ? (
                                        <select
                                          value={exp.employmentType || ""}
                                          onChange={(e) => {
                                            const newExp = [
                                              ...(workExperience || []),
                                            ];
                                            newExp[idx] = {
                                              ...newExp[idx],
                                              employmentType: e.target.value,
                                            };
                                            updateSection(
                                              "workExperience",
                                              newExp,
                                            );
                                          }}
                                          className="bg-transparent border-none p-0 m-0 outline-none text-[10px] text-slate-600 italic hover:text-slate-800 transition-colors cursor-pointer appearance-none"
                                        >
                                          <option value="">
                                            {getTranslation(
                                              "work.employment_type",
                                              lang,
                                            )}
                                          </option>
                                          {[
                                            "full_time",
                                            "part_time",
                                            "self_employed",
                                            "freelance",
                                            "contract",
                                            "internship",
                                            "apprenticeship",
                                            "seasonal",
                                            "pet_project",
                                          ].map((type) => (
                                            <option key={type} value={type}>
                                              {getTranslation(
                                                `work.employment_types.${type}`,
                                                lang,
                                              )}
                                            </option>
                                          ))}
                                        </select>
                                      ) : (
                                        <span>
                                          {getTranslation(
                                            `work.employment_types.${exp.employmentType}`,
                                            lang,
                                          )}
                                        </span>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="shrink-0 text-right text-[10px] text-slate-600 w-[140px]">
                                <div className="flex gap-1 justify-end items-center">
                                  <div className="flex-1 max-w-[50px]">
                                    <EditableText
                                      value={exp.startDate || ""}
                                      onChange={(v) => {
                                        const newExp = [
                                          ...(workExperience || []),
                                        ];
                                        newExp[idx] = {
                                          ...newExp[idx],
                                          startDate: v,
                                        };
                                        updateSection(
                                          "workExperience",
                                          newExp,
                                        );
                                      }}
                                      placeholder="Start"
                                      className="text-right w-full"
                                    />
                                  </div>
                                  <span className="flex-none">-</span>
                                  <div className="flex-1 max-w-[50px]">
                                    <EditableText
                                      value={
                                        exp.current
                                          ? "Present"
                                          : exp.endDate || ""
                                      }
                                      onChange={(v) => {
                                        const newExp = [
                                          ...(workExperience || []),
                                        ];
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
                                        updateSection(
                                          "workExperience",
                                          newExp,
                                        );
                                      }}
                                      placeholder="End"
                                      className="text-right w-full"
                                    />
                                  </div>
                                </div>
                                <EditableText
                                  value={exp.location || ""}
                                  onChange={(v) => {
                                    const newExp = [
                                      ...(workExperience || []),
                                    ];
                                    newExp[idx] = {
                                      ...newExp[idx],
                                      location: v,
                                    };
                                    updateSection("workExperience", newExp);
                                  }}
                                  placeholder="Location"
                                  className="text-right w-full mt-0.5"
                                />
                              </div>
                            </div>
                            {/* Description bullets */}
                            <div className="mt-0.5 space-y-0.5 ml-2">
                              {(
                                (Array.isArray(exp.description)
                                  ? exp.description
                                  : [exp.description]
                                ).filter(
                                  (d) => d !== undefined && d !== null,
                                ) as string[]
                              ).map((d, dIdx) => (
                                <div
                                  key={dIdx}
                                  className="flex gap-1 group/desc text-slate-700 text-[10px]"
                                >
                                  <span className="shrink-0">•</span>
                                  <EditableText
                                    value={d}
                                    onChange={(v) => {
                                      const newExp = [
                                        ...(workExperience || []),
                                      ];
                                      const newDesc = [
                                        ...(newExp[idx].description as string[]),
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
                                    const newExp = [...(workExperience || [])];
                                    const newDesc = [
                                      ...((newExp[idx].description as string[]) ||
                                        []),
                                      "",
                                    ];
                                    newExp[idx] = {
                                      ...newExp[idx],
                                      description: newDesc,
                                    };
                                    updateSection("workExperience", newExp);
                                  }}
                                  className="text-[9px] text-slate-400 hover:text-slate-600 flex items-center gap-1 mt-1 transition-colors"
                                >
                                  <Plus size={8} /> Add Point
                                </button>
                              )}
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

        {/* Education */}
        <div className="mb-5">
          <div className="flex justify-between items-end mb-2 pb-0.5 border-b border-slate-200">
            <h2
              className="text-[12px] font-bold uppercase"
              style={{ color: "#1f2937" }}
            >
              {getTranslation("form.education", lang)}
            </h2>
            {isEditing && (
              <button
                onClick={() =>
                  updateSection("education", [
                    ...(education || []),
                    createEducation(),
                  ])
                }
                className="text-[9px] text-slate-500 hover:text-slate-800 flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors hover:bg-slate-100 ml-4"
              >
                <Plus size={10} /> Add
              </button>
            )}
          </div>
          <div className="space-y-2">
            {(education || []).map((edu, idx) => (
              <div key={edu.id} className="relative group/edu">
                {isEditing && (
                  <button
                    onClick={() =>
                      updateSection(
                        "education",
                        (education || []).filter((e) => e.id !== edu.id),
                      )
                    }
                    className="absolute -right-2 top-0 opacity-0 group-hover/edu:opacity-100 text-slate-300 hover:text-red-500 transition-opacity p-1"
                    title="Delete education"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
                <div className="flex justify-between items-start">
                  <div className="flex-1 pr-4">
                    <EditableText
                      value={edu.institution || ""}
                      onChange={(v) => {
                        const newEdu = [...(education || [])];
                        newEdu[idx] = { ...newEdu[idx], institution: v };
                        updateSection("education", newEdu);
                      }}
                      className="font-bold text-slate-900 text-[11px]"
                      placeholder="Institution"
                    />
                    <div className="text-slate-600 text-[10px] italic flex gap-1 flex-wrap">
                      <EditableText
                        value={edu.degree || ""}
                        onChange={(v) => {
                          const newEdu = [...(education || [])];
                          newEdu[idx] = { ...newEdu[idx], degree: v };
                          updateSection("education", newEdu);
                        }}
                        placeholder="Degree"
                      />
                      {edu.field && (
                        <>
                          <span>—</span>
                          <EditableText
                            value={edu.field || ""}
                            onChange={(v) => {
                              const newEdu = [...(education || [])];
                              newEdu[idx] = { ...newEdu[idx], field: v };
                              updateSection("education", newEdu);
                            }}
                            placeholder="Field"
                          />
                        </>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 text-right text-[10px] text-slate-600 w-[140px]">
                    <div className="flex gap-1 justify-end items-center mb-0.5">
                      <div className="flex-1 max-w-[50px]">
                        <EditableText
                          value={edu.startDate || ""}
                          onChange={(v) => {
                            const newEdu = [...(education || [])];
                            newEdu[idx] = { ...newEdu[idx], startDate: v };
                            updateSection("education", newEdu);
                          }}
                          placeholder="Start"
                          className="text-right w-full"
                        />
                      </div>
                      <span className="flex-none">-</span>
                      <div className="flex-1 max-w-[50px]">
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
                          className="text-right w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Certificates */}
        <div>
          <div className="flex justify-between items-end mb-2 pb-0.5 border-b border-slate-200">
            <h2
              className="text-[12px] font-bold uppercase"
              style={{ color: "#1f2937" }}
            >
              {getTranslation("form.certificates", lang)}
            </h2>
            {isEditing && (
              <button
                onClick={addCertificate}
                className="text-[9px] text-slate-500 hover:text-slate-800 flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors hover:bg-slate-100 ml-4"
              >
                <Plus size={10} /> Add
              </button>
            )}
          </div>
          <div className="space-y-2">
            {(certificates || []).map((cert, idx) => (
              <div key={cert.id} className="relative group/cert">
                {isEditing && (
                  <button
                    onClick={() => removeCertificate(cert.id)}
                    className="absolute -right-2 top-0 opacity-0 group-hover/cert:opacity-100 text-slate-300 hover:text-red-500 transition-opacity p-1"
                    title="Delete certificate"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
                <div className="flex justify-between items-start">
                  <div className="flex-1 pr-4">
                    <EditableText
                      value={cert.name || ""}
                      onChange={(v) => updateCertificateField(idx, "name", v)}
                      className="font-bold text-slate-900 text-[11px]"
                      placeholder="Certificate Name"
                    />
                    <EditableText
                      value={cert.issuer || ""}
                      onChange={(v) =>
                        updateCertificateField(idx, "issuer", v)
                      }
                      className="text-slate-600 text-[10px] italic"
                      placeholder="Issuing Organization"
                    />
                    {(isEditing || cert.url) && (
                      <EditableText
                        value={cert.url || ""}
                        onChange={(v) =>
                          updateCertificateField(idx, "url", v)
                        }
                        className="text-[9px]"
                        style={{ color: accentColor }}
                        placeholder="Credential URL"
                      />
                    )}
                  </div>
                  <div className="shrink-0 text-right text-[10px] text-slate-600 w-[70px]">
                    <EditableText
                      value={cert.date || ""}
                      onChange={(v) => updateCertificateField(idx, "date", v)}
                      placeholder="Date"
                      className="text-right w-full"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ProfileImportModal
        isOpen={isImportModalOpen}
        onClose={() => {
          setIsImportModalOpen(false);
          setImportSkillsCategory(null);
        }}
        onImport={handleImport}
        type={importType}
        skillsCategory={importSkillsCategory ?? undefined}
      />
    </div>
  );
}
