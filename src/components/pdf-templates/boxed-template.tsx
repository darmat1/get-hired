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

const hexToRgba = (hex: string, alpha: number) => {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const num = parseInt(full, 16);
  if (isNaN(num)) return `rgba(0, 0, 0, ${alpha})`;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export function BoxedTemplate({ resume }: TemplateProps) {
  const {
    personalInfo,
    workExperience,
    education,
    skills,
    certificates,
    customization,
  } = resume;
  const accentColor = customization?.sidebarColor || "#2e3a4e";
  const showAvatar = customization?.showAvatar !== false;
  const lang = resume.language || "en";

  const styles = StyleSheet.create({
    page: {
      fontFamily: "Helvetica",
      fontSize: 9.5,
      lineHeight: 1.5,
    },
    sidebar: {
      width: "32%",
      padding: 16,
      color: "#1f2937",
    },
    main: {
      width: "68%",
      padding: 20,
    },
    avatarWrap: {
      alignItems: "center",
      marginBottom: 14,
    },
    avatar: {
      width: 78,
      height: 78,
      borderRadius: 39,
    },
    contactBox: {
      border: `1px solid ${accentColor}`,
      borderRadius: 6,
      padding: 10,
      marginBottom: 16,
    },
    contactRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 6,
    },
    contactText: {
      fontSize: 8.5,
      color: "#1f2937",
    },
    linkText: {
      fontSize: 8.5,
      color: accentColor,
      marginBottom: 4,
    },
    sidebarTitle: {
      fontSize: 10.5,
      fontFamily: "Helvetica-Bold",
      color: accentColor,
      textTransform: "uppercase",
      marginBottom: 6,
    },
    sidebarSection: {
      marginBottom: 16,
    },
    pill: {
      backgroundColor: hexToRgba(accentColor, 0.12),
      borderRadius: 3,
      paddingVertical: 3,
      paddingHorizontal: 6,
      marginRight: 4,
      marginBottom: 4,
    },
    pillText: {
      fontSize: 8.5,
      color: "#1f2937",
    },
    languageRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    name: {
      fontSize: 24,
      fontFamily: "Helvetica-Bold",
      color: "#1f2937",
    },
    targetPosition: {
      fontSize: 10.5,
      color: accentColor,
      marginTop: 2,
      marginBottom: 14,
    },
    sectionTitle: {
      fontFamily: "Helvetica-Bold",
      fontSize: 11.5,
      textTransform: "uppercase",
      color: "#1f2937",
      borderBottom: `1px solid ${accentColor}`,
      paddingBottom: 3,
      marginTop: 12,
      marginBottom: 8,
    },
    entryHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 2,
    },
    entryTitle: {
      fontFamily: "Helvetica-Bold",
      fontSize: 10.5,
    },
    entrySubtitle: {
      fontSize: 9.5,
      fontFamily: "Helvetica-Oblique",
      color: "#4b5563",
    },
    entryMeta: {
      fontSize: 8.5,
      color: "#6b7280",
      textAlign: "right",
    },
    bulletPoint: {
      marginLeft: 5,
      fontSize: 9.5,
      marginBottom: 2,
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
    { value: personalInfo.email, type: "email" },
    { value: personalInfo.phone, type: "phone" },
    { value: personalInfo.location, type: "location" },
    { value: personalInfo.telegram, type: "telegram" },
  ].filter((c) => !!c.value);

  const technicalAndSoft = skills.filter(
    (s) => s.category === "technical" || s.category === "soft",
  );
  const languages = skills.filter((s) => s.category === "language");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: "32%",
            backgroundColor: hexToRgba(accentColor, 0.06),
          }}
          fixed
        />

        <View style={{ flexDirection: "row" }}>
          {/* SIDEBAR */}
          <View style={styles.sidebar}>
            {showAvatar && personalInfo.avatarUrl && (
              <View style={styles.avatarWrap}>
                <Image src={personalInfo.avatarUrl} style={styles.avatar} />
              </View>
            )}

            <View style={styles.contactBox}>
              {contactItems.map((item, i) => (
                <View key={i} style={styles.contactRow}>
                  {item.type === "email" && (
                    <Svg
                      viewBox="0 0 24 24"
                      width="9"
                      height="9"
                      style={{ marginRight: 5 }}
                    >
                      <Path
                        fill="#333"
                        d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
                      />
                    </Svg>
                  )}
                  {item.type === "phone" && (
                    <Svg
                      viewBox="0 0 24 24"
                      width="9"
                      height="9"
                      style={{ marginRight: 5 }}
                    >
                      <Path
                        fill="#333"
                        d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
                      />
                    </Svg>
                  )}
                  {item.type === "location" && (
                    <Svg
                      viewBox="0 0 24 24"
                      width="9"
                      height="9"
                      style={{ marginRight: 5 }}
                    >
                      <Path
                        fill="#333"
                        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                      />
                    </Svg>
                  )}
                  {item.type === "telegram" && (
                    <Svg
                      viewBox="0 0 24 24"
                      width="9"
                      height="9"
                      style={{ marginRight: 5 }}
                    >
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

            {technicalAndSoft.length > 0 && (
              <View style={styles.sidebarSection}>
                <Text style={styles.sidebarTitle}>
                  {getTranslation("form.skills", lang)}
                </Text>
                <View
                  style={{ flexDirection: "row", flexWrap: "wrap" }}
                >
                  {technicalAndSoft.map((skill, i) => (
                    <View key={i} style={styles.pill}>
                      <FormattedText
                        html={skill.name}
                        style={styles.pillText}
                      />
                    </View>
                  ))}
                </View>
              </View>
            )}

            {languages.length > 0 && (
              <View style={styles.sidebarSection}>
                <Text style={styles.sidebarTitle}>
                  {getTranslation("skills.languages", lang)}
                </Text>
                {languages.map((skill, i) => (
                  <View key={i} style={styles.languageRow}>
                    <FormattedText
                      html={skill.name}
                      style={{ fontSize: 9 }}
                    />
                    <Text style={{ fontSize: 8, color: "#6b7280" }}>
                      {getLevelLabel(skill.level)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* MAIN CONTENT */}
          <View style={styles.main}>
            <Text style={styles.name}>
              {personalInfo.firstName} {personalInfo.lastName}
            </Text>
            {resume.targetPosition && (
              <Text style={styles.targetPosition}>
                {resume.targetPosition}
              </Text>
            )}

            {personalInfo.summary && (
              <View>
                <Text style={styles.sectionTitle}>
                  {getTranslation("form.summary", lang)}
                </Text>
                <FormattedText
                  html={personalInfo.summary}
                  style={{ fontSize: 9.5, textAlign: "justify" }}
                />
              </View>
            )}

            {workExperience.length > 0 && (
              <View>
                <Text style={styles.sectionTitle}>
                  {getTranslation("form.work_experience", lang)}
                </Text>
                {workExperience.map((exp, index) => (
                  <View key={index} style={{ marginBottom: 10 }} wrap={false}>
                    <View style={styles.entryHeader}>
                      <View>
                        <FormattedText
                          style={styles.entryTitle}
                          html={exp.title}
                        />
                        <FormattedText
                          style={styles.entrySubtitle}
                          html={`${exp.company}${
                            exp.employmentType
                              ? ` • ${getTranslation(`work.employment_types.${exp.employmentType}`, lang)}`
                              : ""
                          }`}
                        />
                      </View>
                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={styles.entryMeta}>
                          {formatResumeDate(exp.startDate)} —{" "}
                          {exp.current
                            ? "Present"
                            : formatResumeDate(exp.endDate)}
                        </Text>
                        <Text style={styles.entryMeta}>{exp.location}</Text>
                      </View>
                    </View>
                    {exp.mainDescription && (
                      <FormattedText
                        html={exp.mainDescription}
                        style={[styles.bulletPoint, { marginBottom: 4 }]}
                      />
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
                {education.map((edu, index) => (
                  <View key={index} style={{ marginBottom: 8 }} wrap={false}>
                    <View style={styles.entryHeader}>
                      <View>
                        <FormattedText
                          style={styles.entryTitle}
                          html={edu.institution}
                        />
                        <FormattedText
                          style={styles.entrySubtitle}
                          html={`${edu.degree}${edu.field ? ` — ${edu.field}` : ""}`}
                        />
                        {edu.gpa && (
                          <Text style={{ fontSize: 8.5, color: "#6b7280" }}>
                            GPA: {edu.gpa}
                          </Text>
                        )}
                      </View>
                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={styles.entryMeta}>
                          {formatResumeDate(edu.startDate)} —{" "}
                          {edu.current
                            ? "Present"
                            : formatResumeDate(edu.endDate)}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {certificates.length > 0 && (
              <View>
                <Text style={styles.sectionTitle}>
                  {getTranslation("form.certificates", lang)}
                </Text>
                {certificates.map((cert, index) => (
                  <View key={index} style={{ marginBottom: 6 }} wrap={false}>
                    <View style={styles.entryHeader}>
                      <View>
                        <Text style={styles.entryTitle}>{cert.name}</Text>
                        <Text style={styles.entrySubtitle}>
                          {cert.issuer}
                        </Text>
                        {cert.url && (
                          <Text style={{ fontSize: 8.5, color: accentColor }}>
                            {cert.url}
                          </Text>
                        )}
                      </View>
                      <Text style={styles.entryMeta}>
                        {formatResumeDate(cert.date)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
}
