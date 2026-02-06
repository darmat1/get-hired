import { Resume } from "@/types/resume";
import { useTranslation } from "@/lib/translations";

interface Props {
  data: Partial<Resume>;
}

export function ModernPreview({ data }: Props) {
  const { t } = useTranslation();
  const { personalInfo, workExperience, education, skills } = data;

  if (!personalInfo) return null;

  return (
    <div className="flex h-full min-h-[800px] w-full bg-white shadow-sm overflow-hidden font-sans">
      {/* SIDEBAR (Left - 35%) */}
      <div className="w-[35%] bg-[#2e3a4e] text-white p-6 flex flex-col shrink-0">
        {/* Avatar */}
        <div className="flex justify-center mt-4 mb-8">
          {personalInfo.avatarUrl ? (
            <img
              src={personalInfo.avatarUrl}
              alt={`${personalInfo.firstName} ${personalInfo.lastName}`}
              className="w-24 h-24 rounded-full object-cover border-none"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-500 flex items-center justify-center text-2xl font-bold">
              {personalInfo.firstName?.[0]}
              {personalInfo.lastName?.[0]}
            </div>
          )}
        </div>

        {/* Contact */}
        <div className="mb-8">
          <h3 className="text-sm font-bold uppercase border-b border-gray-500 pb-2 mb-4">
            Contact
          </h3>

          <div className="mb-3">
            <div className="text-[10px] font-bold text-gray-200 uppercase">
              Phone
            </div>
            <div className="text-[10px] text-gray-300">
              {personalInfo.phone}
            </div>
          </div>
          <div className="mb-3">
            <div className="text-[10px] font-bold text-gray-200 uppercase">
              Email
            </div>
            <div className="text-[10px] text-gray-300 break-words">
              {personalInfo.email}
            </div>
          </div>
          <div className="mb-3">
            <div className="text-[10px] font-bold text-gray-200 uppercase">
              Address
            </div>
            <div className="text-[10px] text-gray-300">
              {personalInfo.location}
            </div>
          </div>
          {personalInfo.website && (
            <div className="mb-3">
              <div className="text-[10px] font-bold text-gray-200 uppercase">
                Website
              </div>
              <div className="text-[10px] text-gray-300 break-words">
                {personalInfo.website}
              </div>
            </div>
          )}
        </div>

        {/* Education */}
        {education && education.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-bold uppercase border-b border-gray-500 pb-2 mb-4">
              Education
            </h3>
            <div className="space-y-4">
              {education.map((edu) => (
                <div key={edu.id}>
                  <div className="text-[10px] font-bold text-white mb-0.5">
                    {edu.startDate?.split("-")[0]}
                  </div>
                  <div className="text-[11px] font-bold text-white leading-tight mb-0.5">
                    {edu.degree}
                  </div>
                  <div className="text-[10px] text-gray-300 italic">
                    {edu.institution}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills (Expertise) */}
        {skills && skills.length > 0 && (
          <div>
            <h3 className="text-sm font-bold uppercase border-b border-gray-500 pb-2 mb-4">
              Expertise
            </h3>
            <ul className="space-y-1.5">
              {skills.map((skill) => (
                <li
                  key={skill.id}
                  className="flex items-center text-[10px] text-gray-300"
                >
                  <span className="w-1 h-1 bg-white rounded-full mr-2"></span>
                  {skill.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* MAIN CONTENT (Right - 65%) */}
      <div className="w-[65%] p-8 pt-12 flex flex-col">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2e3a4e] uppercase tracking-wide leading-tight mb-2">
            {personalInfo.firstName} <br /> {personalInfo.lastName}
          </h1>
          {/* Placeholder for Job Title if we had one */}
          {/* <p className="text-xs uppercase tracking-[0.2em] text-gray-500 font-medium">Marketing Manager</p> */}
        </div>

        {personalInfo.summary && (
          <div className="mb-8">
            <p className="text-[10px] leading-relaxed text-gray-600 text-justify">
              {personalInfo.summary}
            </p>
          </div>
        )}

        {workExperience && workExperience.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-[#2e3a4e] capitalize mb-6">
              Experience
            </h2>

            <div className="space-y-0 relative">
              {/* Draw continuous line if needed, but doing it per item is easier in flex */}
              {workExperience.map((exp, idx) => (
                <div key={exp.id} className="flex gap-4 mb-6 relative">
                  {/* Timeline Line (Absolute to cover full height) */}
                  {idx !== workExperience.length - 1 && (
                    <div className="absolute left-[3.5px] top-2 bottom-[-24px] w-[1px] bg-slate-200"></div>
                  )}

                  {/* Dot */}
                  <div className="shrink-0 mt-1.5 z-10">
                    <div className="w-2 h-2 rounded-full border-2 border-[#2e3a4e] bg-white"></div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-1">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-[10px] font-bold text-[#2e3a4e]">
                        {exp.startDate?.split("-")[0]} -{" "}
                        {exp.current ? "Present" : exp.endDate?.split("-")[0]}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-500 italic mb-1">
                      {exp.company} | {exp.location}
                    </div>
                    <h3 className="text-xs font-bold text-gray-800 mb-2 uppercase">
                      {exp.title}
                    </h3>

                    {exp.description && (
                      <div className="text-[10px] text-gray-600 leading-relaxed">
                        {(Array.isArray(exp.description)
                          ? exp.description
                          : typeof exp.description === "string"
                            ? (exp.description as string).split("\n")
                            : []
                        )
                          .filter(Boolean)
                          .map((d, i) => (
                            <div key={i} className="mb-1">
                              {d}
                            </div>
                          ))}
                      </div>
                    )}
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
