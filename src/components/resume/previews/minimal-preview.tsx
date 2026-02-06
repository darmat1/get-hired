import { Resume } from "@/types/resume";
import { useTranslation } from "@/lib/translations";

interface Props {
  data: Partial<Resume>;
}

export function MinimalPreview({ data }: Props) {
  const { t } = useTranslation();
  const { personalInfo, workExperience, education, skills } = data;

  if (!personalInfo) return null;

  return (
    <div className="font-sans text-black space-y-8 p-2">
      <div className="flex items-center gap-6 mb-8">
        {personalInfo.avatarUrl && (
          <img
            src={personalInfo.avatarUrl}
            alt={`${personalInfo.firstName} ${personalInfo.lastName}`}
            className="w-16 h-16 rounded-md object-cover grayscale" // Grayscale for minimal feel
          />
        )}
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-widest mb-2">
            {personalInfo.firstName} {personalInfo.lastName}
          </h1>
          <div className="text-[10px] text-gray-600 flex gap-3 uppercase tracking-wider">
            <span>{personalInfo.email}</span>
            <span>•</span>
            <span>{personalInfo.phone}</span>
            <span>•</span>
            <span>{personalInfo.location}</span>
          </div>
        </div>
      </div>

      {personalInfo.summary && (
        <div className="mb-6">
          <p className="text-xs text-gray-800 leading-relaxed text-justify">
            {personalInfo.summary}
          </p>
        </div>
      )}

      {workExperience && workExperience.length > 0 && (
        <div>
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 text-gray-900">
            Work Experience
          </h2>
          <div className="space-y-6">
            {workExperience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-xs font-bold text-black uppercase">
                    {exp.title}
                  </h3>
                  <span className="text-[10px] text-gray-500">
                    {exp.startDate} — {exp.current ? "Present" : exp.endDate}
                  </span>
                </div>
                <div className="text-[10px] text-gray-600 mb-2 uppercase tracking-wide">
                  {exp.company} • {exp.location}
                </div>

                {exp.description && (
                  <ul className="text-[10px] text-gray-700 space-y-1 list-none">
                    {(Array.isArray(exp.description)
                      ? exp.description
                      : typeof exp.description === "string"
                        ? (exp.description as string).split("\n")
                        : []
                    )
                      .filter(Boolean)
                      .map((desc, idx) => (
                        <li key={idx} className="pl-0">
                          - {desc}
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
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 text-gray-900 mt-6">
            Education
          </h2>
          <div className="space-y-4">
            {education.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-xs font-bold text-black uppercase">
                    {edu.institution}
                  </h3>
                  <span className="text-[10px] text-gray-500">
                    {edu.startDate} — {edu.current ? "Present" : edu.endDate}
                  </span>
                </div>
                <div className="text-[10px] text-gray-600 uppercase tracking-wide">
                  {edu.degree}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {skills && skills.length > 0 && (
        <div>
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 text-gray-900 mt-6">
            Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill.id}
                className="text-[10px] bg-black text-white px-2 py-1"
              >
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
