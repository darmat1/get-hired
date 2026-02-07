import { Resume } from "@/types/resume";
import { useTranslation } from "@/lib/translations";
import { useState } from "react";
import { Settings2, Palette, Eye, EyeOff, Linkedin, Send } from "lucide-react";

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
  // const { t } = useTranslation(); // Unused
  const { personalInfo, workExperience, education, skills, customization } =
    data;

  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  // Default values
  const sidebarColor = customization?.sidebarColor || "#2e3a4e";
  const showAvatar = customization?.showAvatar !== false; // Default true
  const showPhone = customization?.showPhone !== false;
  const showEmail = customization?.showEmail !== false;
  const showAddress = customization?.showAddress !== false;
  const showLinkedin = customization?.showLinkedin !== false;
  const showTelegram = customization?.showTelegram !== false;

  if (!personalInfo) return null;

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
        {isEditing && isSidebarHovered && (
          <div className="absolute top-2 left-2 right-2 bg-black/60 backdrop-blur-sm rounded-lg p-3 z-50 border border-white/10 shadow-xl animate-in fade-in duration-200">
            <div className="text-xs font-bold text-white/80 mb-2 flex items-center gap-2">
              <Settings2 size={12} /> Sidebar Options
            </div>

            {/* Color Picker */}
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
                  "#4b5563", // Grays/Blues
                  "#1a365d",
                  "#2c5282", // Blues
                  "#276749",
                  "#22543d", // Greens
                  "#742a2a",
                  "#9b2c2c", // Reds
                  "#553c9a",
                  "#44337a", // Purples
                ].map((color) => (
                  <button
                    key={color}
                    className={`w-4 h-4 rounded-full border border-white/30 transition-transform hover:scale-110 ${
                      sidebarColor === color ? "ring-2 ring-white" : ""
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => updateCustomization("sidebarColor", color)}
                  />
                ))}
              </div>
            </div>

            {/* Toggles */}
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

        {/* Avatar */}
        {showAvatar && (
          <div className="flex justify-center mt-4 mb-8">
            {personalInfo.avatarUrl ? (
              <img
                src={personalInfo.avatarUrl}
                alt={`${personalInfo.firstName} ${personalInfo.lastName}`}
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

          {showEmail && (
            <div className="mb-3">
              <div className="text-[10px] font-bold text-white/60 uppercase">
                Email
              </div>
              <div className="text-[10px] text-white/90 break-words">
                {personalInfo.email}
              </div>
            </div>
          )}

          {showPhone && (
            <div className="mb-3">
              <div className="text-[10px] font-bold text-white/60 uppercase">
                Phone
              </div>
              <div className="text-[10px] text-white/90">
                {personalInfo.phone}
              </div>
            </div>
          )}

          {showTelegram && personalInfo.telegram && (
            <div className="mb-3">
              <div className="text-[10px] font-bold text-white/60 uppercase flex items-center gap-1">
                <Send size={10} /> Telegram
              </div>
              <div className="text-[10px] text-white/90 break-words">
                {personalInfo.telegram}
              </div>
            </div>
          )}

          {showLinkedin && personalInfo.linkedin && (
            <div className="mb-3">
              <div className="text-[10px] font-bold text-white/60 uppercase flex items-center gap-1">
                <Linkedin size={10} /> LinkedIn
              </div>
              <div className="text-[10px] text-white/90 break-words">
                {personalInfo.linkedin.replace(/^https?:\/\//, "")}
              </div>
            </div>
          )}

          {personalInfo.website && (
            <div className="mb-3">
              <div className="text-[10px] font-bold text-white/60 uppercase">
                Website
              </div>
              <div className="text-[10px] text-white/90 break-words">
                {personalInfo.website}
              </div>
            </div>
          )}

          {showAddress && (
            <div className="mb-3">
              <div className="text-[10px] font-bold text-white/60 uppercase">
                Address
              </div>
              <div className="text-[10px] text-white/90">
                {personalInfo.location}
              </div>
            </div>
          )}
        </div>

        {/* Education */}
        {education && education.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-bold uppercase border-b border-white/20 pb-2 mb-4 text-white/90">
              Education
            </h3>
            <div className="space-y-4">
              {education.map((edu) => (
                <div key={edu.id}>
                  <div className="text-[10px] font-bold text-white/95 mb-0.5">
                    {edu.startDate?.split("-")[0]}
                    {edu.endDate || edu.current
                      ? ` - ${
                          edu.current ? "Present" : edu.endDate?.split("-")[0]
                        }`
                      : ""}
                  </div>
                  <div className="text-[11px] font-bold text-white/90 leading-tight mb-0.5">
                    {edu.degree}
                  </div>
                  {edu.field && (
                    <div className="text-[10px] text-white/80 font-medium mb-0.5">
                      {edu.field}
                    </div>
                  )}
                  <div className="text-[10px] text-white/70 italic">
                    {edu.institution}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills & Languages */}
        {skills && skills.length > 0 && (
          <div className="space-y-6">
            {/* Technical Skills */}
            {skills.some((s) => s.category === "technical") && (
              <div>
                <h3 className="text-sm font-bold uppercase border-b border-white/20 pb-2 mb-4 text-white/90">
                  Technical Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skills
                    .filter((s) => s.category === "technical")
                    .map((skill) => (
                      <span
                        key={skill.id}
                        className="text-[10px] bg-white/10 px-2 py-1 rounded text-white/90"
                      >
                        {skill.name}
                      </span>
                    ))}
                </div>
              </div>
            )}

            {/* Soft Skills */}
            {skills.some((s) => s.category === "soft") && (
              <div>
                <h3 className="text-sm font-bold uppercase border-b border-white/20 pb-2 mb-4 text-white/90">
                  Soft Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skills
                    .filter((s) => s.category === "soft")
                    .map((skill) => (
                      <span
                        key={skill.id}
                        className="text-[10px] bg-white/10 px-2 py-1 rounded text-white/90"
                      >
                        {skill.name}
                      </span>
                    ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {skills.some((s) => s.category === "language") && (
              <div>
                <h3 className="text-sm font-bold uppercase border-b border-white/20 pb-2 mb-4 text-white/90">
                  Languages
                </h3>
                <div className="space-y-3">
                  {skills
                    .filter((s) => s.category === "language")
                    .map((skill) => {
                      // Calculate dots (1-5) based on level
                      const levelMap: Record<string, number> = {
                        beginner: 1,
                        elementary: 2,
                        intermediate: 3,
                        advanced: 4,
                        expert: 5,
                      };
                      const dots = levelMap[skill.level || "intermediate"] || 3;

                      return (
                        <div key={skill.id}>
                          <div className="flex justify-between items-end mb-1">
                            <span className="text-[10px] font-bold text-white/90">
                              {skill.name}
                            </span>
                            <span className="text-[9px] text-white/60 capitalize">
                              {skill.level}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <div
                                key={i}
                                className={`h-1.5 flex-1 rounded-full ${
                                  i <= dots ? "bg-white/80" : "bg-white/20"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MAIN CONTENT (Right - 65%) */}
      <div className="w-[65%] p-8 pt-12 flex flex-col">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-3xl font-bold uppercase tracking-wide leading-tight mb-2 transition-colors duration-300"
            style={{ color: sidebarColor }}
          >
            {personalInfo.firstName} <br /> {personalInfo.lastName}
          </h1>
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
            <h2
              className="text-xl font-bold capitalize mb-6 transition-colors duration-300"
              style={{ color: sidebarColor }}
            >
              Experience
            </h2>

            <div className="space-y-0 relative">
              {workExperience.map((exp, idx) => (
                <div key={exp.id} className="flex gap-4 mb-6 relative">
                  {/* Timeline Line */}
                  {idx !== workExperience.length - 1 && (
                    <div className="absolute left-[3.5px] top-2 bottom-[-24px] w-[1px] bg-slate-200"></div>
                  )}

                  {/* Dot */}
                  <div className="shrink-0 mt-1.5 z-10">
                    <div
                      className="w-2 h-2 rounded-full border-2 bg-white transition-colors duration-300"
                      style={{ borderColor: sidebarColor }}
                    ></div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-1">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span
                        className="text-[10px] font-bold transition-colors duration-300"
                        style={{ color: sidebarColor }}
                      >
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
