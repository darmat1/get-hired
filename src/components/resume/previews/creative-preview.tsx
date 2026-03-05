import { Resume } from "@/types/resume";
import { useTranslation } from "@/lib/translations";
import { getTranslation } from "@/lib/translations-data";

interface Props {
  data: Partial<Resume>;
}

export function CreativePreview({ data }: Props) {
  const { t } = useTranslation();
  const { personalInfo, workExperience, education, skills } = data;

  if (!personalInfo) return null;

  // Split layout: 30% Sidebar (Left), 70% Main (Right)
  return (
    <div className="flex h-full min-h-[800px]">
      {/* Sidebar */}
      <div className="w-[30%] bg-slate-100 p-4 pt-8 flex flex-col h-full">
        <div className="flex justify-center mb-6">
          {personalInfo.avatarUrl && (
            <img
              src={personalInfo.avatarUrl}
              alt={`${personalInfo.firstName} ${personalInfo.lastName}`}
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
            />
          )}
        </div>

        <div className="mb-6">
          <h3 className="text-xs font-bold text-slate-500 uppercase border-b border-slate-300 pb-1 mb-2">
            {getTranslation("form.personal_info", data.language || "en") ===
            "form.personal_info"
              ? "Contact"
              : getTranslation("form.personal_info", data.language || "en")}
          </h3>
          <div className="text-[10px] text-slate-700 space-y-1 break-words">
            <p>{personalInfo.email}</p>
            <p>{personalInfo.phone}</p>
            <p>{personalInfo.location}</p>
            {personalInfo.website && (
              <p className="text-blue-600 truncate">{personalInfo.website}</p>
            )}
          </div>
        </div>

        {skills && skills.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase border-b border-slate-300 pb-1 mb-2">
              {getTranslation("profile.tab_skills", data.language || "en")}
            </h3>
            <div className="flex flex-wrap gap-1">
              {skills.map((s) => (
                <span
                  key={s.id}
                  className="bg-slate-200 text-slate-800 text-[9px] px-2 py-1 rounded"
                >
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="w-[70%] p-6 pt-8 bg-white">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 uppercase leading-none mb-1">
            {personalInfo.firstName} <br />
            <span className="text-blue-600">{personalInfo.lastName}</span>
          </h1>
          {(data as any).targetPosition && (
            <div className="text-sm font-medium text-slate-700 mt-2">
              {(data as any).targetPosition}
            </div>
          )}
        </div>

        {personalInfo.summary && (
          <div className="mb-6">
            <p className="text-xs text-slate-600 leading-relaxed text-justify">
              {personalInfo.summary}
            </p>
          </div>
        )}

        {workExperience && workExperience.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold text-blue-600 uppercase mb-3 border-b border-slate-100 pb-1">
              {getTranslation("form.work_experience", data.language || "en")}
            </h2>
            <div className="space-y-4">
              {workExperience.map((exp) => (
                <div key={exp.id}>
                  <h3 className="text-xs font-bold text-slate-900">
                    {exp.title}
                  </h3>
                  <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                    <span className="italic">
                      {exp.company}
                      {exp.employmentType &&
                        ` • ${getTranslation(`work.employment_types.${exp.employmentType}`, data.language || "en")}`}
                    </span>
                    <span>
                      {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                    </span>
                  </div>
                  {exp.description && (
                    <ul className="text-[10px] text-slate-600 pl-3 list-disc space-y-0.5">
                      {(Array.isArray(exp.description)
                        ? exp.description
                        : typeof exp.description === "string"
                          ? (exp.description as string).split("\n")
                          : []
                      )
                        .filter((d) => d !== undefined && d !== null)
                        .map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {education && education.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold text-blue-600 uppercase mb-3 border-b border-slate-100 pb-1">
              {getTranslation("form.education", data.language || "en")}
            </h2>
            <div className="space-y-3">
              {education.map((edu) => (
                <div key={edu.id}>
                  <h3 className="text-xs font-bold text-slate-900">
                    {edu.institution}
                  </h3>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>{edu.degree}</span>
                    <span>
                      {edu.startDate} - {edu.current ? "Present" : edu.endDate}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
