import { Resume } from "@/types/resume";
import { useTranslation } from "@/lib/translations";
import { getTranslation } from "@/lib/translations-data";
import { useState } from "react";
import { GripVertical, Plus, Trash2, Import, X } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";
import { ProfileImportModal } from "../profile-import-modal";
import {
  EditableText,
  PreviewProps as Props,
  createExperience,
  createEducation,
  createSkill,
} from "./shared-preview-utils";

export function MinimalPreview({ data, onChange, isEditing }: Props) {
  const { t } = useTranslation();
  const { personalInfo, workExperience, education, skills } = data;
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importType, setImportType] = useState<"experience" | "skills">(
    "experience"
  );
  const [isImportingPersonalInfo, setIsImportingPersonalInfo] = useState(false);

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

  const onDragEnd = (result: any) => {
    if (!result.destination || !onChange) return;
    const items = Array.from(workExperience || []);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    updateSection("workExperience", items);
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
            personalInfo: {
              ...personalInfo,
              ...profile.personalInfo,
            },
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
    <div className="font-sans text-black space-y-8 p-8 bg-white h-full min-h-[1056px]">
      {/* Header */}
      <div className="relative flex items-center gap-6 mb-8 group/header">
        {isEditing && (
          <button
            onClick={importPersonalInfo}
            disabled={isImportingPersonalInfo}
            className="absolute top-0 right-0 text-[10px] text-slate-400 hover:text-slate-800 flex items-center gap-1.5 px-2 py-1 rounded-md transition-all hover:bg-slate-100 opacity-0 group-hover/header:opacity-100"
            title="Import from Profile"
          >
            {isImportingPersonalInfo ? (
              <div className="w-3 h-3 border border-t-slate-500 border-slate-200 rounded-full animate-spin" />
            ) : (
              <Import size={12} />
            )}
            Import
          </button>
        )}
        {personalInfo.avatarUrl && (
          <img
            src={personalInfo.avatarUrl}
            alt={`${personalInfo.firstName} ${personalInfo.lastName}`}
            className="w-16 h-16 rounded-md object-cover grayscale"
          />
        )}
        <div>
          <div className="text-3xl font-bold uppercase tracking-widest mb-2 flex gap-2">
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
            <div className="text-sm font-medium text-slate-700 mt-1">
              {(data as any).targetPosition}
            </div>
          )}
          <div className="text-[10px] text-slate-600 flex gap-3 uppercase tracking-wider">
            <EditableText
              value={personalInfo.email || ""}
              onChange={(v) => updatePersonalInfo("email", v)}
              className="text-[10px] text-slate-600"
              placeholder="Email"
            />
            <span>•</span>
            <EditableText
              value={personalInfo.phone || ""}
              onChange={(v) => updatePersonalInfo("phone", v)}
              className="text-[10px] text-slate-600"
              placeholder="Phone"
            />
            <span>•</span>
            <EditableText
              value={personalInfo.location || ""}
              onChange={(v) => updatePersonalInfo("location", v)}
              className="text-[10px] text-slate-600"
              placeholder="Location"
            />
            {(isEditing || personalInfo.telegram) && (
              <>
                <span>•</span>
                <EditableText
                  value={personalInfo.telegram || ""}
                  onChange={(v) => updatePersonalInfo("telegram", v)}
                  className="text-[10px] text-blue-600"
                  placeholder="Telegram"
                />
              </>
            )}
          </div>
          {(isEditing || personalInfo.linkedin) && (
            <div className="mt-1">
              <EditableText
                value={personalInfo.linkedin || ""}
                onChange={(v) => updatePersonalInfo("linkedin", v)}
                className="text-[10px] text-blue-600"
                placeholder="LinkedIn"
              />
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6">
        <EditableText
          value={personalInfo.summary || ""}
          onChange={(v) => updatePersonalInfo("summary", v)}
          className="text-xs text-slate-800 leading-relaxed text-justify block"
          multiline
          placeholder="Professional Summary..."
          allowFormatting={true}
        />
      </div>

      {/* Work Experience */}
      {workExperience && workExperience.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900">
              {getTranslation("form.work_experience", data.language || "en")}
            </h2>
            {isEditing && (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setImportType("experience");
                    setIsImportModalOpen(true);
                  }}
                  className="text-[9px] text-slate-500 hover:text-slate-800 flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors hover:bg-slate-100"
                >
                  <Import size={10} /> {t("profile.btn_import")}
                </button>
                <button
                  onClick={() =>
                    updateSection("workExperience", [
                      ...(workExperience || []),
                      createExperience(),
                    ])
                  }
                  className="text-[9px] text-slate-500 hover:text-slate-800 flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors hover:bg-slate-100"
                >
                  <Plus size={10} /> Add
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
                  className="space-y-6"
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
                          <div className="flex justify-between items-baseline mb-1">
                            <EditableText
                              value={exp.title || ""}
                              onChange={(v) => {
                                const newExp = [...(workExperience || [])];
                                newExp[idx] = { ...newExp[idx], title: v };
                                updateSection("workExperience", newExp);
                              }}
                              className="text-xs font-bold text-black uppercase"
                              placeholder="Title"
                            />
                            <span className="text-[10px] text-slate-500 flex gap-1">
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
                              <span>—</span>
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
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-600 mb-2 uppercase tracking-wide flex gap-1">
                            <EditableText
                              value={exp.company || ""}
                              onChange={(v) => {
                                const newExp = [...(workExperience || [])];
                                newExp[idx] = { ...newExp[idx], company: v };
                                updateSection("workExperience", newExp);
                              }}
                              placeholder="Company"
                            />
                            {isEditing ? (
                              <div className="flex items-center gap-1">
                                <span>•</span>
                                <select
                                  value={exp.employmentType || ""}
                                  onChange={(e) => {
                                    const newExp = [...(workExperience || [])];
                                    newExp[idx] = {
                                      ...newExp[idx],
                                      employmentType: e.target.value,
                                    };
                                    updateSection("workExperience", newExp);
                                  }}
                                  className="bg-transparent border-none p-0 m-0 outline-none text-[10px] text-slate-600 uppercase tracking-wide hover:text-slate-800 transition-colors cursor-pointer appearance-none"
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
                              </div>
                            ) : (
                              exp.employmentType && (
                                <>
                                  <span>•</span>
                                  <span>
                                    {getTranslation(
                                      `work.employment_types.${exp.employmentType}`,
                                      data.language || "en",
                                    )}
                                  </span>
                                </>
                              )
                            )}
                            <span>•</span>
                            <EditableText
                              value={exp.location || ""}
                              onChange={(v) => {
                                const newExp = [...(workExperience || [])];
                                newExp[idx] = { ...newExp[idx], location: v };
                                updateSection("workExperience", newExp);
                              }}
                              placeholder="Location"
                            />
                          </div>

                          {/* Description */}
                          <div className="text-[10px] text-slate-700 space-y-1">
                            {(
                              (Array.isArray(exp.description)
                                ? exp.description
                                : typeof exp.description === "string"
                                  ? (exp.description as string).split("\n")
                                  : []
                              ).filter(
                                (d) => d !== undefined && d !== null,
                              ) as string[]
                            ).map((desc, dIdx) => (
                              <div
                                key={dIdx}
                                className="flex gap-1 group/desc pl-0"
                              >
                                <span className="shrink-0">-</span>
                                <EditableText
                                  value={desc}
                                  onChange={(v) => {
                                    const newExp = [...(workExperience || [])];
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
                                      updateSection("workExperience", newExp);
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
      {education && education.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 mt-6">
              {getTranslation("form.education", data.language || "en")}
            </h2>
            {isEditing && (
              <button
                onClick={() =>
                  updateSection("education", [
                    ...(education || []),
                    createEducation(),
                  ])
                }
                className="text-[9px] text-slate-500 hover:text-slate-800 flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors hover:bg-slate-100"
              >
                <Plus size={10} /> Add
              </button>
            )}
          </div>
          <div className="space-y-4">
            {education.map((edu, idx) => (
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
                <div className="flex justify-between items-baseline mb-1">
                  <EditableText
                    value={edu.institution || ""}
                    onChange={(v) => {
                      const newEdu = [...(education || [])];
                      newEdu[idx] = { ...newEdu[idx], institution: v };
                      updateSection("education", newEdu);
                    }}
                    className="text-xs font-bold text-black uppercase"
                    placeholder="Institution"
                  />
                  <span className="text-[10px] text-slate-500 flex gap-1">
                    <EditableText
                      value={edu.startDate || ""}
                      onChange={(v) => {
                        const newEdu = [...(education || [])];
                        newEdu[idx] = { ...newEdu[idx], startDate: v };
                        updateSection("education", newEdu);
                      }}
                      placeholder="Start"
                    />
                    <span>—</span>
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
                  </span>
                </div>
                <EditableText
                  value={edu.degree || ""}
                  onChange={(v) => {
                    const newEdu = [...(education || [])];
                    newEdu[idx] = { ...newEdu[idx], degree: v };
                    updateSection("education", newEdu);
                  }}
                  className="text-[10px] text-slate-600 uppercase tracking-wide"
                  placeholder="Degree"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 mt-6">
              {getTranslation("profile.tab_skills", data.language || "en")}
            </h2>
            {isEditing && (
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    setImportType("skills");
                    setIsImportModalOpen(true);
                  }}
                  className="text-[9px] text-slate-500 hover:text-slate-800 flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors hover:bg-slate-100"
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
                  className="text-[9px] text-slate-500 hover:text-slate-800 flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors hover:bg-slate-100"
                >
                  <Plus size={10} /> Add
                </button>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <div key={skill.id} className="relative group/skill">
                <EditableText
                  value={skill.name || ""}
                  onChange={(v) => {
                    const newSkills = [...(skills || [])];
                    const sIdx = newSkills.findIndex((s) => s.id === skill.id);
                    newSkills[sIdx] = { ...newSkills[sIdx], name: v };
                    updateSection("skills", newSkills);
                  }}
                  className="text-[10px] bg-black text-white px-2 py-1"
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
      )}

      <ProfileImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
        type={importType}
      />
    </div>
  );
}
