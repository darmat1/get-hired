import { Page, Text, View, Document, StyleSheet, Image } from "@react-pdf/renderer";
import { Resume } from "@/types/resume";
import { FormattedText } from "@/lib/pdf-utils";
import { getTranslation } from "@/lib/translations-data";
import { formatResumeDate } from "@/lib/format-resume-date";

interface TemplateProps {
  resume: Resume;
}

export function DividerTemplate({ resume }: TemplateProps) {
  const { personalInfo, workExperience, education, skills, certificates, customization } =
    resume;
  const accentColor = customization?.sidebarColor || "#000000";
  const showAvatar = customization?.showAvatar !== false;
  const lang = resume.language || "en";

  const styles = StyleSheet.create({
    page: {
      fontFamily: "Helvetica",
      fontSize: 10,
      padding: 30,
      lineHeight: 1.5,
      backgroundColor: "#ffffff",
      color: "#111827",
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    avatar: {
      width: 60,
      height: 60,
      borderRadius: 4,
      marginRight: 14,
    },
    name: {
      fontSize: 18,
      fontFamily: "Helvetica-Bold",
      color: "#111827",
    },
    targetPosition: {
      fontSize: 10,
      color: "#4b5563",
      marginTop: 2,
    },
    contactRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      marginTop: 6,
    },
    contactItem: {
      fontSize: 9,
      color: "#374151",
    },
    dividerChar: {
      fontSize: 9,
      color: "#9ca3af",
      marginHorizontal: 6,
    },
    linkText: {
      fontSize: 9,
      color: accentColor,
      marginTop: 2,
    },
    sectionTitle: {
      fontFamily: "Helvetica-Bold",
      fontSize: 11,
      marginTop: 12,
      marginBottom: 2,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      color: "#111827",
    },
    sectionDivider: {
      height: 1,
      backgroundColor: "#d1d5db",
      marginBottom: 8,
    },
    jobHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 2,
    },
    jobTitle: {
      fontFamily: "Helvetica-Bold",
      fontSize: 10.5,
      color: "#111827",
    },
    company: {
      fontSize: 10,
      color: "#4b5563",
    },
    dateLocation: {
      fontSize: 9,
      color: "#4b5563",
      textAlign: "right",
    },
    bulletPoint: {
      marginLeft: 5,
      fontSize: 10,
      marginBottom: 2,
      color: "#1f2937",
    },
    skillsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 4,
    },
    skillText: {
      fontSize: 9,
      marginRight: 10,
      marginBottom: 4,
      color: "#1f2937",
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

  const contactItems = [
    personalInfo.email,
    personalInfo.phone,
    personalInfo.location,
    personalInfo.telegram,
  ].filter((v): v is string => !!v);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          {showAvatar && personalInfo.avatarUrl && (
            <Image src={personalInfo.avatarUrl} style={styles.avatar} />
          )}
          <View>
            <Text style={styles.name}>
              {personalInfo.firstName} {personalInfo.lastName}
            </Text>
            {resume.targetPosition && (
              <Text style={styles.targetPosition}>{resume.targetPosition}</Text>
            )}
            <View style={styles.contactRow}>
              {contactItems.map((value, i) => (
                <View key={i} style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.contactItem}>{value}</Text>
                  {i < contactItems.length - 1 && (
                    <Text style={styles.dividerChar}>|</Text>
                  )}
                </View>
              ))}
            </View>
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

        {personalInfo.summary && (
          <View>
            <Text style={styles.sectionTitle}>
              {getTranslation("form.summary", lang)}
            </Text>
            <View style={styles.sectionDivider} />
            <FormattedText
              html={personalInfo.summary}
              style={{ textAlign: "justify", marginBottom: 4 }}
            />
          </View>
        )}

        {workExperience.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>
              {getTranslation("form.work_experience", lang)}
            </Text>
            <View style={styles.sectionDivider} />
            {workExperience.map((exp, index) => (
              <View key={index} style={{ marginBottom: 10 }} wrap={false}>
                <View style={styles.jobHeader}>
                  <View>
                    <FormattedText style={styles.jobTitle} html={exp.title} />
                    <FormattedText
                      style={styles.company}
                      html={`${exp.company}${exp.employmentType ? ` • ${getTranslation(`work.employment_types.${exp.employmentType}`, lang)}` : ""}`}
                    />
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.dateLocation}>
                      {formatResumeDate(exp.startDate)} —{" "}
                      {exp.current ? "Present" : formatResumeDate(exp.endDate)}
                    </Text>
                    <Text style={styles.dateLocation}>{exp.location}</Text>
                  </View>
                </View>
                {exp.mainDescription && (
                  <View style={{ marginBottom: 4 }}>
                    <FormattedText
                      html={exp.mainDescription}
                      style={styles.bulletPoint}
                    />
                  </View>
                )}
                {exp.description.map((desc, idx) => {
                  const isEmpty =
                    !desc || desc.replace(/<[^>]*>?/gm, "").trim() === "";
                  return (
                    <View
                      key={idx}
                      style={{ flexDirection: "row", marginBottom: 2 }}
                    >
                      {!isEmpty && (
                        <Text
                          style={[
                            styles.bulletPoint,
                            { marginRight: 4, flexShrink: 0 },
                          ]}
                        >
                          -
                        </Text>
                      )}
                      <FormattedText
                        html={desc || " "}
                        style={styles.bulletPoint}
                      />
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        )}

        {education.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>
              {getTranslation("form.education", lang)}
            </Text>
            <View style={styles.sectionDivider} />
            {education.map((edu, index) => (
              <View key={index} style={{ marginBottom: 8 }} wrap={false}>
                <View style={styles.jobHeader}>
                  <View>
                    <FormattedText
                      style={styles.jobTitle}
                      html={edu.institution}
                    />
                    <FormattedText
                      style={styles.company}
                      html={`${edu.degree}${edu.field ? ` — ${edu.field}` : ""}`}
                    />
                    {edu.gpa && (
                      <Text style={{ fontSize: 9, color: "#4b5563" }}>
                        GPA: {edu.gpa}
                      </Text>
                    )}
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.dateLocation}>
                      {formatResumeDate(edu.startDate)} —{" "}
                      {edu.current ? "Present" : formatResumeDate(edu.endDate)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {skills.length > 0 && (
          <>
            {(skills.some((s) => s.category === "technical") ||
              skills.some((s) => s.category === "soft")) && (
              <View>
                <Text style={styles.sectionTitle}>
                  {getTranslation("form.skills", lang)}
                </Text>
                <View style={styles.sectionDivider} />
                <View style={styles.skillsContainer}>
                  {skills
                    .filter(
                      (s) => s.category === "technical" || s.category === "soft",
                    )
                    .map((skill, index) => (
                      <FormattedText
                        key={index}
                        style={styles.skillText}
                        html={`• ${skill.name}`}
                      />
                    ))}
                </View>
              </View>
            )}

            {skills.some((s) => s.category === "language") && (
              <View>
                <Text style={styles.sectionTitle}>
                  {getTranslation("skills.languages", lang)}
                </Text>
                <View style={styles.sectionDivider} />
                <View style={styles.skillsContainer}>
                  {skills
                    .filter((s) => s.category === "language")
                    .map((skill, index) => (
                      <FormattedText
                        key={index}
                        style={styles.skillText}
                        html={`• ${skill.name}${skill.level ? ` (${getLevelLabel(skill.level)})` : ""}`}
                      />
                    ))}
                </View>
              </View>
            )}
          </>
        )}

        {certificates.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>
              {getTranslation("form.certificates", lang)}
            </Text>
            <View style={styles.sectionDivider} />
            {certificates.map((cert, index) => (
              <View key={index} style={{ marginBottom: 6 }} wrap={false}>
                <View style={styles.jobHeader}>
                  <View>
                    <FormattedText style={styles.jobTitle} html={cert.name} />
                    <Text style={styles.company}>{cert.issuer}</Text>
                    {cert.url && (
                      <Text style={[styles.linkText, { marginTop: 0 }]}>
                        {cert.url}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.dateLocation}>
                    {formatResumeDate(cert.date)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
