import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
  Svg,
  Path,
} from "@react-pdf/renderer";
import { Resume } from "@/types/resume";
import { FormattedText } from "@/lib/pdf-utils";
import { getTranslation } from "@/lib/translations-data";
import { formatResumeDate } from "@/lib/format-resume-date";

interface TemplateProps {
  resume: Resume;
}

export function ModularTemplate({ resume }: TemplateProps) {
  const { personalInfo, workExperience, education, skills, certificates, customization } =
    resume;

  const accentColor = customization?.sidebarColor || "#b45309";
  const showAvatar = customization?.showAvatar !== false;
  const lang = resume.language || "en";

  const styles = StyleSheet.create({
    page: {
      fontFamily: "Helvetica",
      fontSize: 9.5,
      padding: 28,
      lineHeight: 1.45,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
    },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: 8,
      objectFit: "cover",
      marginRight: 16,
    },
    name: {
      fontSize: 20,
      fontFamily: "Helvetica-Bold",
      color: "#1f2937",
      marginBottom: 2,
    },
    targetPosition: {
      fontSize: 10,
      color: accentColor,
      marginBottom: 6,
    },
    contactWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
    },
    contactItem: {
      flexDirection: "row",
      alignItems: "center",
      marginRight: 12,
      marginBottom: 2,
    },
    contactText: {
      fontSize: 8.5,
      color: "#4b5563",
    },
    linkText: {
      fontSize: 8.5,
      color: accentColor,
      marginRight: 12,
      marginBottom: 2,
    },
    block: {
      marginBottom: 16,
    },
    blockHeader: {
      borderTop: `3px solid ${accentColor}`,
      paddingTop: 5,
      marginBottom: 9,
    },
    blockTitle: {
      fontSize: 11,
      fontFamily: "Helvetica-Bold",
      color: "#1f2937",
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    summaryText: {
      fontSize: 9.5,
      color: "#374151",
      textAlign: "justify",
    },
    entry: {
      marginBottom: 10,
    },
    entryHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 2,
    },
    entryTitle: {
      fontSize: 10.5,
      fontFamily: "Helvetica-Bold",
      color: "#1f2937",
    },
    entryCompany: {
      fontSize: 9.5,
      color: "#4b5563",
    },
    entryMeta: {
      fontSize: 8.5,
      color: "#6b7280",
      textAlign: "right",
    },
    bulletRow: {
      flexDirection: "row",
      marginBottom: 2,
    },
    bulletText: {
      fontSize: 9,
      lineHeight: 1.4,
      color: "#374151",
    },
    skillsWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    skillChip: {
      fontSize: 8.5,
      color: "#1f2937",
      backgroundColor: "#f3f4f6",
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderRadius: 3,
      marginRight: 5,
      marginBottom: 5,
    },
    languageRow: {
      flexDirection: "row",
      alignItems: "center",
      marginRight: 16,
      marginBottom: 5,
    },
    languageText: {
      fontSize: 9,
      color: "#374151",
    },
    languageLevel: {
      fontSize: 8,
      color: accentColor,
      marginLeft: 4,
    },
    certRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 7,
    },
    certName: {
      fontSize: 9.5,
      fontFamily: "Helvetica-Bold",
      color: "#1f2937",
    },
    certIssuer: {
      fontSize: 8.5,
      color: "#4b5563",
    },
    certLink: {
      fontSize: 8,
      color: accentColor,
    },
    certDate: {
      fontSize: 8.5,
      color: "#6b7280",
    },
  });

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

  const technicalAndSoftSkills = skills.filter(
    (s) => s.category === "technical" || s.category === "soft",
  );
  const languageSkills = skills.filter((s) => s.category === "language");

  const contactItems = [
    personalInfo.email ? { type: "email", value: personalInfo.email } : null,
    personalInfo.phone ? { type: "phone", value: personalInfo.phone } : null,
    personalInfo.location ? { type: "location", value: personalInfo.location } : null,
    personalInfo.telegram ? { type: "telegram", value: personalInfo.telegram } : null,
  ].filter(Boolean) as { type: string; value: string }[];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.headerRow}>
          {showAvatar && personalInfo.avatarUrl && (
            <Image src={personalInfo.avatarUrl} style={styles.avatar} />
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>
              {personalInfo.firstName} {personalInfo.lastName}
            </Text>
            {resume.targetPosition && (
              <Text style={styles.targetPosition}>{resume.targetPosition}</Text>
            )}
            <View style={styles.contactWrap}>
              {contactItems.map((item, i) => (
                <View key={i} style={styles.contactItem}>
                  {item.type === "email" && (
                    <Svg viewBox="0 0 24 24" width="9" height="9" style={{ marginRight: 4 }}>
                      <Path
                        fill="#333"
                        d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
                      />
                    </Svg>
                  )}
                  {item.type === "phone" && (
                    <Svg viewBox="0 0 24 24" width="9" height="9" style={{ marginRight: 4 }}>
                      <Path
                        fill="#333"
                        d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
                      />
                    </Svg>
                  )}
                  {item.type === "location" && (
                    <Svg viewBox="0 0 24 24" width="9" height="9" style={{ marginRight: 4 }}>
                      <Path
                        fill="#333"
                        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                      />
                    </Svg>
                  )}
                  {item.type === "telegram" && (
                    <Svg viewBox="0 0 24 24" width="9" height="9" style={{ marginRight: 4 }}>
                      <Path
                        fillRule="evenodd"
                        d="M23.1117 4.49449C23.4296 2.94472 21.9074 1.65683 20.4317 2.227L2.3425 9.21601C0.694517 9.85273 0.621087 12.1572 2.22518 12.8975L6.1645 14.7157L8.03849 21.2746C8.13583 21.6153 8.40618 21.8791 8.74917 21.968C9.09216 22.0568 9.45658 21.9576 9.70712 21.707L12.5938 18.8203L16.6375 21.8531C17.8113 22.7334 19.5019 22.0922 19.7967 20.6549L23.1117 4.49449ZM3.0633 11.0816L21.1525 4.0926L17.8375 20.2531L13.1 16.6999C12.7019 16.4013 12.1448 16.4409 11.7929 16.7928L10.5565 18.0292L10.928 15.9861L18.2071 8.70703C18.5614 8.35278 18.5988 7.79106 18.2947 7.39293C17.9906 6.99479 17.4389 6.88312 17.0039 7.13168L6.95124 12.876L3.0633 11.0816ZM8.17695 14.4791L8.78333 16.6015L9.01614 15.321C9.05253 15.1209 9.14908 14.9366 9.29291 14.7928L11.5128 12.573L8.17695 14.4791Z"
                        fill="#0F0F0F"
                      />
                    </Svg>
                  )}
                  <Text style={styles.contactText}>{item.value}</Text>
                </View>
              ))}
              {personalInfo.linkedin && (
                <Text style={styles.linkText}>{personalInfo.linkedin}</Text>
              )}
              {personalInfo.github && (
                <Text style={styles.linkText}>{personalInfo.github}</Text>
              )}
              {personalInfo.website && (
                <Text style={styles.linkText}>{personalInfo.website}</Text>
              )}
            </View>
          </View>
        </View>

        {/* SUMMARY */}
        {personalInfo.summary && (
          <View style={styles.block}>
            <View style={styles.blockHeader}>
              <Text style={styles.blockTitle}>
                {getTranslation("form.summary", lang)}
              </Text>
            </View>
            <FormattedText html={personalInfo.summary} style={styles.summaryText} />
          </View>
        )}

        {/* WORK EXPERIENCE */}
        {workExperience.length > 0 && (
          <View style={styles.block}>
            <View style={styles.blockHeader}>
              <Text style={styles.blockTitle}>
                {getTranslation("form.work_experience", lang)}
              </Text>
            </View>
            {workExperience.map((exp, index) => (
              <View key={exp.id || index} style={styles.entry} wrap={false}>
                <View style={styles.entryHeader}>
                  <View>
                    <FormattedText html={exp.title} style={styles.entryTitle} />
                    <FormattedText
                      html={`${exp.company}${exp.employmentType ? ` • ${getTranslation(`work.employment_types.${exp.employmentType}`, lang)}` : ""}`}
                      style={styles.entryCompany}
                    />
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.entryMeta}>
                      {formatResumeDate(exp.startDate)} —{" "}
                      {exp.current ? "Present" : formatResumeDate(exp.endDate)}
                    </Text>
                    <Text style={styles.entryMeta}>{exp.location}</Text>
                  </View>
                </View>
                {exp.mainDescription && (
                  <FormattedText
                    html={exp.mainDescription}
                    style={[styles.bulletText, { marginBottom: 4 }]}
                  />
                )}
                {exp.description.map((desc, idx) => {
                  const isEmpty =
                    !desc || desc.replace(/<[^>]*>?/gm, "").trim() === "";
                  return (
                    <View key={idx} style={styles.bulletRow}>
                      {!isEmpty && (
                        <Text style={[styles.bulletText, { marginRight: 4 }]}>-</Text>
                      )}
                      <FormattedText html={desc || " "} style={styles.bulletText} />
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        )}

        {/* EDUCATION */}
        {education.length > 0 && (
          <View style={styles.block}>
            <View style={styles.blockHeader}>
              <Text style={styles.blockTitle}>
                {getTranslation("form.education", lang)}
              </Text>
            </View>
            {education.map((edu, index) => (
              <View key={edu.id || index} style={styles.entry} wrap={false}>
                <View style={styles.entryHeader}>
                  <View>
                    <FormattedText html={edu.institution} style={styles.entryTitle} />
                    <FormattedText
                      html={`${edu.degree}${edu.field ? ` — ${edu.field}` : ""}`}
                      style={styles.entryCompany}
                    />
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.entryMeta}>
                      {formatResumeDate(edu.startDate)} —{" "}
                      {edu.current ? "Present" : formatResumeDate(edu.endDate)}
                    </Text>
                    {edu.gpa && <Text style={styles.entryMeta}>GPA: {edu.gpa}</Text>}
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* SKILLS + LANGUAGES */}
        {skills.length > 0 && (
          <>
            {technicalAndSoftSkills.length > 0 && (
              <View style={styles.block}>
                <View style={styles.blockHeader}>
                  <Text style={styles.blockTitle}>
                    {getTranslation("form.skills", lang)}
                  </Text>
                </View>
                <View style={styles.skillsWrap}>
                  {technicalAndSoftSkills.map((skill, idx) => (
                    <FormattedText key={idx} html={skill.name} style={styles.skillChip} />
                  ))}
                </View>
              </View>
            )}

            {languageSkills.length > 0 && (
              <View style={styles.block}>
                <View style={styles.blockHeader}>
                  <Text style={styles.blockTitle}>
                    {getTranslation("skills.languages", lang)}
                  </Text>
                </View>
                <View style={styles.skillsWrap}>
                  {languageSkills.map((skill, idx) => (
                    <View key={idx} style={styles.languageRow}>
                      <FormattedText html={skill.name} style={styles.languageText} />
                      <Text style={styles.languageLevel}>
                        ({getLevelLabel(skill.level)})
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </>
        )}

        {/* CERTIFICATES */}
        {certificates.length > 0 && (
          <View style={styles.block}>
            <View style={styles.blockHeader}>
              <Text style={styles.blockTitle}>
                {getTranslation("form.certificates", lang)}
              </Text>
            </View>
            {certificates.map((cert, index) => (
              <View key={cert.id || index} style={styles.certRow} wrap={false}>
                <View>
                  <FormattedText html={cert.name} style={styles.certName} />
                  <Text style={styles.certIssuer}>{cert.issuer}</Text>
                  {cert.url && <Text style={styles.certLink}>{cert.url}</Text>}
                </View>
                <Text style={styles.certDate}>{formatResumeDate(cert.date)}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
