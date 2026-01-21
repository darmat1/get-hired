"use client";

import { Resume } from "@/types/resume";
import { useTranslation } from "@/lib/translations";

interface ResumePreviewProps {
  data: Partial<Resume>;
}

export function ResumePreview({ data }: ResumePreviewProps) {
  const { t } = useTranslation();
  const { personalInfo, workExperience, education, skills } = data;

  return (
    <div className="bg-card text-card-foreground rounded-lg border border-border shadow-md p-6 overflow-hidden">
      <h3 className="text-lg font-semibold mb-6 text-foreground/80">
        {t("preview.title")}
      </h3>

      <div className="bg-white text-gray-900 rounded shadow-inner p-8 min-h-[600px] w-full max-w-full overflow-y-auto">
        {personalInfo ? (
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h1 className="text-2xl font-bold text-gray-900">
                {personalInfo.firstName} {personalInfo.lastName}
              </h1>
              <div className="text-gray-500 text-sm mt-1">
                <div>{personalInfo.email}</div>
                <div>{personalInfo.phone}</div>
                <div>{personalInfo.location}</div>
              </div>
            </div>

            {personalInfo.summary && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  {t("form.summary")}
                </h2>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {personalInfo.summary}
                </p>
              </div>
            )}

            {workExperience && workExperience.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  {t("preview.work_experience")}
                </h2>
                <div className="space-y-3">
                  {workExperience.map((exp) => (
                    <div
                      key={exp.id}
                      className="border-l-2 border-gray-200 pl-4"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {exp.title}
                          </h3>
                          <p className="text-gray-700">{exp.company}</p>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <div>{exp.location}</div>
                          <div>
                            {exp.startDate} -{" "}
                            {exp.current
                              ? t("work.current_position")
                              : exp.endDate}
                          </div>
                        </div>
                      </div>
                      {exp.description && (
                        <ul className="mt-2 space-y-1">
                          {(Array.isArray(exp.description)
                            ? exp.description
                            : typeof exp.description === "string"
                              ? (exp.description as string).split("\n")
                              : []
                          )
                            .filter(Boolean)
                            .map((desc, idx) => (
                              <li key={idx} className="text-gray-700 text-sm">
                                • {desc}
                              </li>
                            ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {education && education.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  {t("preview.education")}
                </h2>
                <div className="space-y-3">
                  {education.map((edu) => (
                    <div
                      key={edu.id}
                      className="border-l-2 border-gray-200 pl-4"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {edu.institution}
                          </h3>
                          <p className="text-gray-700">
                            {edu.degree} {edu.field && `- ${edu.field}`}
                          </p>
                          {edu.gpa && (
                            <p className="text-gray-500 text-sm">
                              GPA: {edu.gpa}
                            </p>
                          )}
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <div>
                            {edu.startDate} -{" "}
                            {edu.current
                              ? t("work.current_position")
                              : edu.endDate}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {skills && skills.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  {t("preview.skills")}
                </h2>
                <div className="space-y-2">
                  {["technical", "soft", "language"].map((category) => {
                    const categorySkills = skills.filter(
                      (s) => s.category === category,
                    );
                    if (categorySkills.length === 0) return null;

                    return (
                      <div key={category}>
                        <h4 className="font-medium text-gray-800 capitalize mb-1">
                          {category === "technical"
                            ? t("skills.technical")
                            : category === "soft"
                              ? t("skills.soft")
                              : t("skills.languages")}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {categorySkills.map((skill) => (
                            <span
                              key={skill.id}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                            >
                              {skill.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-12">
            <p>{t("message.no_data")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
