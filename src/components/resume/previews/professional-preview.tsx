import { Resume } from "@/types/resume";
import { useTranslation } from "@/lib/translations";
import { getTranslation } from "@/lib/translations-data";
import { useState } from "react";
import { GripVertical, Plus, Trash2, Import } from "lucide-react";
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

export function ProfessionalPreview({ data, onChange, isEditing }: Props) {
  const { t } = useTranslation();
  const { personalInfo, workExperience, education, skills } = data;
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importType, setImportType] = useState<"experience" | "skills">(
    "experience",
  );
  const [importSkillsCategory, setImportSkillsCategory] = useState<
    "technical" | "soft" | "language" | null
  >(null);

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
    } else {
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

  return (
    <div className="font-serif space-y-6 p-8 bg-white h-full min-h-[1056px]">
      {/* Header */}
      <div className="text-center border-b border-slate-900 pb-6 mb-6">
        {personalInfo.avatarUrl && (
          <div className="flex justify-center items-center gap-6 mb-4">
            <img
              src={personalInfo.avatarUrl}
              alt={`${personalInfo.firstName} ${personalInfo.lastName}`}
              className="w-20 h-20 rounded-full object-cover border-4 border-slate-50 shadow-sm"
            />
          </div>
        )}

        <div className="text-2xl font-bold text-slate-900 mb-2 uppercase tracking-wide flex justify-center items-center gap-2">
          <div className="flex-1 text-right">
            <EditableText
              value={personalInfo.firstName || ""}
              onChange={(v) => updatePersonalInfo("firstName", v)}
              placeholder="First Name"
              className="text-right w-full"
            />
          </div>
          <div className="flex-1 text-left">
            <EditableText
              value={personalInfo.lastName || ""}
              onChange={(v) => updatePersonalInfo("lastName", v)}
              placeholder="Last Name"
              className="text-left w-full"
            />
          </div>
        </div>
        {(data as any).targetPosition && (
          <div className="text-sm font-medium text-slate-700 mt-1">
            {(data as any).targetPosition}
          </div>
        )}
        <div className="flex flex-wrap justify-center items-center mt-2 text-slate-700 text-xs px-4">
          <div className="flex-1 text-right min-w-[120px]">
            <EditableText
              value={personalInfo.email || ""}
              onChange={(v) => updatePersonalInfo("email", v)}
              placeholder="Email"
              className="text-right w-full"
            />
          </div>
          <span className="mx-2 text-slate-300">|</span>
          <div className="flex-[0.5] text-center min-w-[100px]">
            <EditableText
              value={personalInfo.phone || ""}
              onChange={(v) => updatePersonalInfo("phone", v)}
              placeholder="Phone"
              className="text-center w-full"
            />
          </div>
          <span className="mx-2 text-slate-300">|</span>
          <div className="flex-1 text-left min-w-[120px]">
            <EditableText
              value={personalInfo.location || ""}
              onChange={(v) => updatePersonalInfo("location", v)}
              placeholder="Location"
              className="text-left w-full"
            />
          </div>
          {(isEditing || personalInfo.telegram) && (
            <>
              <span className="mx-2 text-slate-300">|</span>
              <div className="flex-1 text-left min-w-[120px]">
                <EditableText
                  value={personalInfo.telegram || ""}
                  onChange={(v) => updatePersonalInfo("telegram", v)}
                  placeholder="Telegram"
                  className="text-left w-full text-blue-600"
                />
              </div>
            </>
          )}
        </div>
        {(isEditing || personalInfo.linkedin) && (
          <div className="flex justify-center mt-1">
            <EditableText
              value={personalInfo.linkedin || ""}
              onChange={(v) => updatePersonalInfo("linkedin", v)}
              placeholder="LinkedIn"
              className="text-center text-blue-600 text-xs w-full max-w-[400px]"
            />
          </div>
        )}
      </div>

      {/* Summary */}
      <div>
        <h2 className="text-sm font-bold text-slate-900 mb-2 uppercase border-b border-slate-300 pb-1">
          {getTranslation("form.summary", data.language || "en")}
        </h2>
        <EditableText
          value={personalInfo.summary || ""}
          onChange={(v) => updatePersonalInfo("summary", v)}
          className="text-slate-800 text-xs leading-relaxed text-justify block"
          multiline
          placeholder="Professional Summary..."
          allowFormatting={true}
        />
      </div>

      {/* Work Experience */}
      {workExperience && (
        <div>
          <div className="flex justify-between items-end mb-3 border-b border-slate-300 pb-1">
            <h2 className="text-sm font-bold text-slate-900 uppercase">
              {getTranslation("form.work_experience", data.language || "en")}
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
                  className="space-y-4"
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
                            <div className="flex-1 pr-4">
                              <EditableText
                                value={exp.title || ""}
                                onChange={(v) => {
                                  const newExp = [...(workExperience || [])];
                                  newExp[idx] = { ...newExp[idx], title: v };
                                  updateSection("workExperience", newExp);
                                }}
                                className="font-bold text-slate-900 text-xs"
                                placeholder="Title"
                              />
                              <div className="text-slate-700 text-xs italic flex gap-1">
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
                                {isEditing ? (
                                  <div className="flex items-center gap-1">
                                    <span>•</span>
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
                                        updateSection("workExperience", newExp);
                                      }}
                                      className="bg-transparent border-none p-0 m-0 outline-none text-xs text-slate-500 italic hover:text-slate-800 transition-colors cursor-pointer appearance-none"
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
                              </div>
                            </div>
                            <div className="shrink-0 text-right text-[10px] text-slate-600 w-[140px]">
                              <EditableText
                                value={exp.location || ""}
                                onChange={(v) => {
                                  const newExp = [...(workExperience || [])];
                                  newExp[idx] = { ...newExp[idx], location: v };
                                  updateSection("workExperience", newExp);
                                }}
                                placeholder="Location"
                                className="text-right w-full"
                              />
                              <div className="flex gap-1 justify-end items-center mt-0.5">
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
                                      updateSection("workExperience", newExp);
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
                                      updateSection("workExperience", newExp);
                                    }}
                                    placeholder="End"
                                    className="text-right w-full"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                          {/* Description bullets */}
                          <div className="mt-1 space-y-1 ml-4">
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
                                className="flex gap-1 group/desc text-slate-800 text-xs"
                              >
                                <span className="shrink-0">•</span>
                                <EditableText
                                  value={d}
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
      <div>
        <div className="flex justify-between items-end mb-3 border-b border-slate-300 pb-1">
          <h2 className="text-sm font-bold text-slate-900 uppercase">
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
              className="text-[9px] text-slate-500 hover:text-slate-800 flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors hover:bg-slate-100 ml-4"
            >
              <Plus size={10} /> Add
            </button>
          )}
        </div>
        <div className="space-y-3">
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
                    className="font-bold text-slate-900 text-xs"
                    placeholder="Institution"
                  />
                  <div className="text-slate-700 text-xs italic flex gap-1">
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
                        <span>-</span>
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

      {/* Skills: Technical, Soft, Languages */}
      <div className="space-y-4">
        {(["technical", "soft", "language"] as const).map((cat) => {
          const categorySkills = (skills || []).filter((s) => s.category === cat);
          const showSection = isEditing || categorySkills.length > 0;
          if (!showSection) return null;
          return (
            <div key={cat}>
              <div className="flex justify-between items-end mb-3 border-b border-slate-300 pb-1">
                <h2 className="text-sm font-bold text-slate-900 uppercase">
                  {cat === "technical"
                    ? getTranslation("profile.tab_skills", data.language || "en")
                    : cat === "soft"
                      ? getTranslation("skills.soft", data.language || "en")
                      : getTranslation("skills.languages", data.language || "en")}
                </h2>
                {isEditing && (
                  <div className="flex gap-1 ml-4">
                    <button
                      onClick={() => {
                        setImportType("skills");
                        setImportSkillsCategory(cat);
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
                          createSkill(cat),
                        ])
                      }
                      className="text-[9px] text-slate-500 hover:text-slate-800 flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors hover:bg-slate-100"
                    >
                      <Plus size={10} /> Add
                    </button>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {categorySkills.map((skill) => (
                  <div key={skill.id} className="relative group/skill">
                    <EditableText
                      value={
                        cat === "language"
                          ? `${skill.name}${
                              skill.level ? ` (${getLevelLabel(skill.level)})` : ""
                            }`
                          : skill.name || ""
                      }
                      onChange={(v) => {
                        const newSkills = [...(skills || [])];
                        const sIdx = newSkills.findIndex((s) => s.id === skill.id);

                        if (cat === "language") {
                          // Parse back "Name (Level)" into name only, keep level
                          const match = v.match(/^(.+?)\s*\((.+)\)\s*$/);
                          const nameOnly = match ? match[1] : v;
                          newSkills[sIdx] = {
                            ...newSkills[sIdx],
                            name: nameOnly,
                          };
                        } else {
                          newSkills[sIdx] = { ...newSkills[sIdx], name: v };
                        }

                        updateSection("skills", newSkills);
                      }}
                      className="text-xs text-slate-800"
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
                        <Trash2 size={8} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
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
