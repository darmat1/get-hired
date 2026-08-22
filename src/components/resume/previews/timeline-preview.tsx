"use client";

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

export function TimelinePreview({ data, onChange, isEditing }: Props) {
  const { t } = useTranslation();
  const {
    personalInfo,
    workExperience,
    education,
    skills,
    certificates,
    customization,
  } = data;

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
    "technical" | "soft" | "language" | undefined
  >(undefined);
  const [isImportingPersonalInfo, setIsImportingPersonalInfo] =
    useState(false);

  // Default values
  const accentColor = customization?.sidebarColor || "#0f766e";
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
    const lang = data.language || "en";
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

  const technicalAndSoftSkills = (skills || []).filter(
    (s) => s.category === "technical" || s.category === "soft",
  );
  const languageSkills = (skills || []).filter((s) => s.category === "language");

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
      customization: { ...customization, [key]: value },
    });
  };

  const onDragEnd = (result: any) => {
    if (!result.destination || !onChange) return;
    const items = Array.from(workExperience || []);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    updateSection("workExperience", items);
  };

  const addSkill = (category: "technical" | "soft" | "language") => {
    updateSection("skills", [...(skills || []), createSkill(category)]);
  };

  const removeSkill = (id: string) => {
    updateSection("skills", (skills || []).filter((s) => s.id !== id));
  };

  const addEducation = () => {
    updateSection("education", [...(education || []), createEducation()]);
  };

  const removeEducation = (id: string) => {
    updateSection("education", (education || []).filter((e) => e.id !== id));
  };

  const addCertificate = () => {
    updateSection("certificates", [
      ...(certificates || []),
      createCertificate(),
    ]);
  };

  const removeCertificate = (id: string) => {
    updateSection(
      "certificates",
      (certificates || []).filter((c) => c.id !== id),
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
          onChange({
            ...data,
            personalInfo: { ...personalInfo, ...profile.personalInfo },
          });
        }
      }
    } catch (error) {
      console.error("Failed to import personal info:", error);
    } finally {
      setIsImportingPersonalInfo(false);
    }
  };

  return (
    <div className="flex h-full min-h-[800px] w-full bg-white shadow-sm overflow-hidden font-sans relative group/preview">
      {/* SIDEBAR (Left ~33%, light) */}
      <div
        className="w-[33%] bg-[#f5f6f8] text-slate-800 p-6 flex flex-col shrink-0 relative"
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
      >
        {isEditing && isSettingsOpen && (
          <div
            ref={settingsRef}
            className="absolute top-2 left-2 right-2 bg-slate-900 shadow-2xl rounded-xl border border-white/10 p-4 z-50 animate-in fade-in zoom-in duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <Settings2 size={14} className="text-blue-400" /> Template
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
                <Palette size={10} /> Accent Color
              </div>
              <div className="flex gap-1 flex-wrap">
                {[
                  "#0f766e",
                  "#0e7490",
                  "#2563eb",
                  "#1e40af",
                  "#059669",
                  "#065f46",
                  "#dc2626",
                  "#991b1b",
                  "#7c3aed",
                  "#5b21b6",
                  "#d97706",
                  "#111827",
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

        {isEditing && isSidebarHovered && !isSettingsOpen && (
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="absolute top-2 right-2 p-2 bg-slate-900/10 hover:bg-slate-900/20 text-slate-900 rounded-full shadow-sm backdrop-blur-sm transition-all duration-200 animate-in zoom-in group/settings-btn z-40"
            title="Template Options"
          >
            <Settings2
              size={14}
              className="group-hover/settings-btn:rotate-90 transition-transform duration-500"
            />
          </button>
        )}

        {/* Avatar */}
        {showAvatar && personalInfo.avatarUrl && (
          <div className="flex justify-center mt-2 mb-4">
            <img
              src={personalInfo.avatarUrl}
              alt=""
              className="w-[76px] h-[76px] rounded-full object-cover"
            />
          </div>
        )}

        {/* Name & Position */}
        <div className="text-center mb-6">
          <div className="text-[16px] font-bold text-slate-900 leading-tight flex flex-wrap justify-center gap-1">
            <EditableText
              value={personalInfo.firstName || ""}
              onChange={(v) => updatePersonalInfo("firstName", v)}
              placeholder="First Name"
              className="text-center"
            />
            <EditableText
              value={personalInfo.lastName || ""}
              onChange={(v) => updatePersonalInfo("lastName", v)}
              placeholder="Last Name"
              className="text-center"
            />
          </div>
          {(data as any).targetPosition && (
            <div
              className="text-[10px] mt-1"
              style={{ color: accentColor }}
            >
              {(data as any).targetPosition}
            </div>
          )}
        </div>

        {/* Contact */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3
              className="text-[10px] font-bold uppercase tracking-wide"
              style={{ color: accentColor }}
            >
              {getTranslation("form.personal_info", data.language || "en")}
            </h3>
            {isEditing && (
              <button
                onClick={importPersonalInfo}
                disabled={isImportingPersonalInfo}
                className="text-[9px] text-slate-400 hover:text-slate-700 flex items-center gap-1 px-1 py-0.5 rounded transition-all hover:bg-slate-200"
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
          <div
            className="h-px mb-2"
            style={{ backgroundColor: "#d9dce1" }}
          />
          <div className="space-y-1.5">
            {showEmail && (
              <EditableText
                value={personalInfo.email || ""}
                onChange={(v) => updatePersonalInfo("email", v)}
                className="text-[9.5px] text-slate-600 break-words block"
                placeholder="Email"
              />
            )}
            {showPhone && (
              <EditableText
                value={personalInfo.phone || ""}
                onChange={(v) => updatePersonalInfo("phone", v)}
                className="text-[9.5px] text-slate-600 block"
                placeholder="Phone"
              />
            )}
            {showAddress && (
              <EditableText
                value={personalInfo.location || ""}
                onChange={(v) => updatePersonalInfo("location", v)}
                className="text-[9.5px] text-slate-600 block"
                placeholder="Location"
              />
            )}
            {showTelegram && (
              <EditableText
                value={personalInfo.telegram || ""}
                onChange={(v) => updatePersonalInfo("telegram", v)}
                className="text-[9.5px] text-slate-600 block"
                placeholder="Telegram"
              />
            )}
            {showLinkedin && (
              <EditableText
                value={personalInfo.linkedin || ""}
                onChange={(v) => updatePersonalInfo("linkedin", v)}
                className="text-[9.5px] break-words block"
                style={{ color: accentColor }}
                placeholder="LinkedIn URL"
              />
            )}
            {showGithub && (
              <EditableText
                value={personalInfo.github || ""}
                onChange={(v) => updatePersonalInfo("github", v)}
                className="text-[9.5px] break-words block"
                style={{ color: accentColor }}
                placeholder="GitHub URL"
              />
            )}
            {showWebsite && (
              <EditableText
                value={personalInfo.website || ""}
                onChange={(v) => updatePersonalInfo("website", v)}
                className="text-[9.5px] break-words block"
                style={{ color: accentColor }}
                placeholder="Website URL"
              />
            )}
          </div>
        </div>

        {/* Skills (technical + soft combined) */}
        {(isEditing || technicalAndSoftSkills.length > 0) && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3
                className="text-[10px] font-bold uppercase tracking-wide"
                style={{ color: accentColor }}
              >
                {getTranslation("form.skills", data.language || "en")}
              </h3>
              {isEditing && (
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setImportType("skills");
                      setImportSkillsCategory(undefined);
                      setIsImportModalOpen(true);
                    }}
                    className="text-[9px] text-slate-400 hover:text-slate-700 flex items-center gap-1 px-1 py-0.5 rounded transition-all hover:bg-slate-200"
                  >
                    <Import size={10} />
                  </button>
                  <button
                    onClick={() => addSkill("technical")}
                    className="text-[9px] text-slate-400 hover:text-slate-700 flex items-center gap-1 px-1 py-0.5 rounded transition-colors hover:bg-slate-200"
                  >
                    <Plus size={10} /> Add
                  </button>
                </div>
              )}
            </div>
            <div
              className="h-px mb-2"
              style={{ backgroundColor: "#d9dce1" }}
            />
            <div className="flex flex-wrap gap-1.5">
              {technicalAndSoftSkills.map((skill) => (
                <div key={skill.id} className="relative group/skill">
                  <EditableText
                    value={skill.name || ""}
                    onChange={(v) => {
                      const newSkills = [...(skills || [])];
                      const sIdx = newSkills.findIndex((s) => s.id === skill.id);
                      newSkills[sIdx] = { ...newSkills[sIdx], name: v };
                      updateSection("skills", newSkills);
                    }}
                    className="text-[9.5px] bg-[#e9ebef] px-2 py-1 rounded text-slate-700"
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
        )}

        {/* Languages */}
        {(isEditing || languageSkills.length > 0) && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3
                className="text-[10px] font-bold uppercase tracking-wide"
                style={{ color: accentColor }}
              >
                {getTranslation("skills.languages", data.language || "en")}
              </h3>
              {isEditing && (
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setImportType("skills");
                      setImportSkillsCategory("language");
                      setIsImportModalOpen(true);
                    }}
                    className="text-[9px] text-slate-400 hover:text-slate-700 flex items-center gap-1 px-1 py-0.5 rounded transition-all hover:bg-slate-200"
                  >
                    <Import size={10} />
                  </button>
                  <button
                    onClick={() => addSkill("language")}
                    className="text-[9px] text-slate-400 hover:text-slate-700 flex items-center gap-1 px-1 py-0.5 rounded transition-colors hover:bg-slate-200"
                  >
                    <Plus size={10} /> Add
                  </button>
                </div>
              )}
            </div>
            <div
              className="h-px mb-2"
              style={{ backgroundColor: "#d9dce1" }}
            />
            <div className="space-y-1.5">
              {languageSkills.map((skill) => (
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
                    className="text-[9.5px] text-slate-700"
                  />
                  <span className="text-[9px] text-slate-400 shrink-0 ml-2">
                    {getLevelLabel(skill.level)}
                  </span>
                  {isEditing && (
                    <button
                      onClick={() => removeSkill(skill.id)}
                      className="absolute -top-1.5 -right-4 opacity-0 group-hover/skill:opacity-100 bg-red-500 shadow-sm rounded-full p-0.5 text-white hover:bg-red-600 transition-all scale-75 hover:scale-100"
                    >
                      <X size={8} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MAIN CONTENT (Right ~67%) */}
      <div className="w-[67%] p-8 flex flex-col">
        {/* Summary */}
        <div className="mb-6">
          <h2
            className="text-[13px] font-bold mb-2"
            style={{ color: "#1f2937" }}
          >
            {getTranslation("form.summary", data.language || "en")}
          </h2>
          <EditableText
            value={personalInfo.summary || ""}
            onChange={(v) => updatePersonalInfo("summary", v)}
            className="text-[10.5px] leading-relaxed text-slate-600 text-justify block"
            multiline
            placeholder="Professional Summary..."
            allowFormatting={true}
          />
        </div>

        {/* Work Experience - vertical timeline */}
        {workExperience && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[13px] font-bold" style={{ color: "#1f2937" }}>
                {getTranslation("form.work_experience", data.language || "en")}
              </h2>
              {isEditing && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setImportType("experience");
                      setImportSkillsCategory(undefined);
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
                  <div {...provided.droppableProps} ref={provided.innerRef}>
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
                              "flex gap-3 relative group/item",
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

                            {/* Timeline column: dot + connecting line */}
                            <div className="shrink-0 w-4 flex flex-col items-center relative">
                              <div
                                className="w-[7px] h-[7px] rounded-full mt-1.5 z-10"
                                style={{ backgroundColor: accentColor }}
                              />
                              {idx < workExperience.length - 1 && (
                                <div
                                  className="absolute top-3 bottom-[-14px] w-[1.5px] opacity-30"
                                  style={{ backgroundColor: accentColor }}
                                />
                              )}
                            </div>

                            <div className="flex-1 pb-4">
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
                              <div className="text-slate-500 text-[10px] italic flex gap-1 mb-1">
                                <EditableText
                                  value={exp.company || ""}
                                  onChange={(v) => {
                                    const newExp = [...(workExperience || [])];
                                    newExp[idx] = { ...newExp[idx], company: v };
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
                                        className="bg-transparent border-none p-0 m-0 outline-none text-[10px] text-slate-500 italic hover:text-slate-700 transition-colors cursor-pointer appearance-none"
                                      >
                                        <option value="">
                                          {getTranslation(
                                            "work.employment_type",
                                            data.language || "en",
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
                                              data.language || "en",
                                            )}
                                          </option>
                                        ))}
                                      </select>
                                    ) : (
                                      <span>
                                        {getTranslation(
                                          `work.employment_types.${exp.employmentType}`,
                                          data.language || "en",
                                        )}
                                      </span>
                                    )}
                                  </>
                                )}
                              </div>
                              <div
                                className="text-[9.5px] mb-1.5 flex gap-1"
                                style={{ color: accentColor }}
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
                                {exp.location && <span>&nbsp;|&nbsp;</span>}
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
                              <div className="space-y-0.5">
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
                                    <span className="shrink-0">-</span>
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
                                        updateSection(
                                          "workExperience",
                                          newExp,
                                        );
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
                                    className="text-[9px] text-slate-400 hover:text-slate-600 flex items-center gap-1 mt-1 transition-colors"
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

        {/* Education */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-[13px] font-bold" style={{ color: "#1f2937" }}>
              {getTranslation("form.education", data.language || "en")}
            </h2>
            {isEditing && (
              <button
                onClick={addEducation}
                className="text-[9px] text-slate-500 hover:text-slate-800 flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors hover:bg-slate-100"
              >
                <Plus size={10} /> Add
              </button>
            )}
          </div>
          <div className="space-y-2.5">
            {(education || []).map((edu, idx) => (
              <div key={edu.id} className="relative group/edu">
                {isEditing && (
                  <button
                    onClick={() => removeEducation(edu.id)}
                    className="absolute -right-2 top-0 opacity-0 group-hover/edu:opacity-100 text-slate-300 hover:text-red-500 transition-opacity p-1"
                    title="Delete education"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
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
                <div className="text-slate-500 text-[10px] italic flex gap-1 flex-wrap">
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
                <div
                  className="text-[9.5px] flex gap-1"
                  style={{ color: accentColor }}
                >
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
              </div>
            ))}
          </div>
        </div>

        {/* Certificates */}
        {(isEditing || (certificates || []).length > 0) && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-[13px] font-bold" style={{ color: "#1f2937" }}>
                {getTranslation("form.certificates", data.language || "en")}
              </h2>
              {isEditing && (
                <button
                  onClick={addCertificate}
                  className="text-[9px] text-slate-500 hover:text-slate-800 flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors hover:bg-slate-100"
                >
                  <Plus size={10} /> Add
                </button>
              )}
            </div>
            <div className="space-y-2.5">
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
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <EditableText
                        value={cert.name || ""}
                        onChange={(v) => {
                          const newCerts = [...(certificates || [])];
                          newCerts[idx] = { ...newCerts[idx], name: v };
                          updateSection("certificates", newCerts);
                        }}
                        className="font-bold text-slate-900 text-[11px]"
                        placeholder="Certificate Name"
                      />
                      <EditableText
                        value={cert.issuer || ""}
                        onChange={(v) => {
                          const newCerts = [...(certificates || [])];
                          newCerts[idx] = { ...newCerts[idx], issuer: v };
                          updateSection("certificates", newCerts);
                        }}
                        className="text-slate-500 text-[10px] italic block"
                        placeholder="Issuing Organization"
                      />
                      {(isEditing || cert.url) && (
                        <EditableText
                          value={cert.url || ""}
                          onChange={(v) => {
                            const newCerts = [...(certificates || [])];
                            newCerts[idx] = { ...newCerts[idx], url: v };
                            updateSection("certificates", newCerts);
                          }}
                          className="text-[9.5px] block"
                          style={{ color: accentColor }}
                          placeholder="Credential URL"
                        />
                      )}
                    </div>
                    <EditableText
                      value={cert.date || ""}
                      onChange={(v) => {
                        const newCerts = [...(certificates || [])];
                        newCerts[idx] = { ...newCerts[idx], date: v };
                        updateSection("certificates", newCerts);
                      }}
                      className="text-[9.5px] text-slate-500 shrink-0 text-right"
                      placeholder="Date"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ProfileImportModal
        isOpen={isImportModalOpen}
        onClose={() => {
          setIsImportModalOpen(false);
          setImportSkillsCategory(undefined);
        }}
        onImport={handleImport}
        type={importType}
        skillsCategory={importSkillsCategory}
      />
    </div>
  );
}
