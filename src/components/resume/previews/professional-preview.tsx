import { Resume } from "@/types/resume";
import { useTranslation } from "@/lib/translations";

interface Props {
  data: Partial<Resume>;
}

export function ProfessionalPreview({ data }: Props) {
  const { t } = useTranslation();
  const { personalInfo, workExperience, education, skills } = data;

  if (!personalInfo) return null;

  return (
    <div className="font-serif space-y-6">
      <div className="text-center border-b border-gray-900 pb-6 mb-6">
        <div className="flex justify-center items-center gap-6 mb-4">
          {personalInfo.avatarUrl && (
            <img
              src={personalInfo.avatarUrl}
              alt={`${personalInfo.firstName} ${personalInfo.lastName}`}
              className="w-20 h-20 rounded-full object-cover border-4 border-gray-50 shadow-sm"
            />
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2 uppercase tracking-wide">
          {personalInfo.firstName} {personalInfo.lastName}
        </h1>
        <div className="flex flex-wrap justify-center gap-x-4 text-gray-700 text-xs">
          <span>{personalInfo.email}</span>
          <span>|</span>
          <span>{personalInfo.phone}</span>
          <span>|</span>
          <span>{personalInfo.location}</span>
        </div>
        {personalInfo.website && (
          <div className="text-center text-xs text-gray-700 mt-1">
            {personalInfo.website}
          </div>
        )}
      </div>

      {personalInfo.summary && (
        <div>
          <h2 className="text-sm font-bold text-gray-900 mb-2 uppercase border-b border-gray-300 pb-1">
            Summary
          </h2>
          <p className="text-gray-800 text-xs leading-relaxed text-justify">
            {personalInfo.summary}
          </p>
        </div>
      )}

      {workExperience && workExperience.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-gray-900 mb-2 uppercase border-b border-gray-300 pb-1">
            Experience
          </h2>
          <div className="space-y-4">
            {workExperience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <div>
                    <h3 className="font-bold text-gray-900 text-xs">
                      {exp.title}
                    </h3>
                    <p className="text-gray-700 text-xs italic">
                      {exp.company}
                    </p>
                  </div>
                  <div className="text-right text-[10px] text-gray-600">
                    <p>{exp.location}</p>
                    <p>
                      {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                    </p>
                  </div>
                </div>
                {exp.description && (
                  <ul className="mt-1 space-y-1 ml-4 list-disc">
                    {(Array.isArray(exp.description)
                      ? exp.description
                      : typeof exp.description === "string"
                        ? (exp.description as string).split("\n")
                        : []
                    )
                      .filter(Boolean)
                      .map((desc, idx) => (
                        <li key={idx} className="text-gray-800 text-xs pl-1">
                          {desc}
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
          <h2 className="text-sm font-bold text-gray-900 mb-2 uppercase border-b border-gray-300 pb-1">
            Education
          </h2>
          <div className="space-y-3">
            {education.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900 text-xs">
                      {edu.institution}
                    </h3>
                    <p className="text-gray-700 text-xs italic">
                      {edu.degree} {edu.field && `- ${edu.field}`}
                    </p>
                  </div>
                  <div className="text-right text-[10px] text-gray-600">
                    {edu.startDate} - {edu.current ? "Present" : edu.endDate}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {skills && skills.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-gray-900 mb-2 uppercase border-b border-gray-300 pb-1">
            Skills
          </h2>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {skills.map((skill) => (
              <span key={skill.id} className="text-xs text-gray-800">
                • {skill.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
