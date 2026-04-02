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

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    padding: 40,
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 10,
    borderBottom: "1pt solid #aaa",
    paddingBottom: 6,
    alignItems: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  name: {
    fontSize: 24,
    fontFamily: "Times-Bold",
    paddingBottom: 25,
    marginBottom: 2,
    textTransform: "uppercase",
    textAlign: "center",
  },
  contactInfo: {
    fontSize: 9,
    color: "#333",
    marginBottom: 3,
    textAlign: "center",
  },
  sectionTitle: {
    fontFamily: "Times-Bold",
    fontSize: 12,
    marginBottom: 6,
    marginTop: 6,
    textTransform: "uppercase",
    borderBottom: "1pt solid #ccc",
    paddingBottom: 2,
  },
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  jobTitle: {
    fontFamily: "Times-Bold",
    fontSize: 11,
  },
  company: {
    fontSize: 10,
    fontFamily: "Times-Italic",
  },
  dateLocation: {
    fontSize: 9,
    color: "#444",
    textAlign: "right",
  },
  bulletPoint: {
    marginLeft: 5,
    fontSize: 10,
    marginBottom: 2,
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 5,
  },
  skillText: {
    fontSize: 9,
    marginRight: 10,
    marginBottom: 5,
  },
});

interface TemplateProps {
  resume: Resume;
}

export function ProfessionalTemplate({ resume }: TemplateProps) {
  const { personalInfo, workExperience, education, skills } = resume;

  const getLevelLabel = (level?: string) => {
    if (!level) return "";
    const lang = resume.language || "en";

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

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            {personalInfo.avatarUrl && (
              <Image src={personalInfo.avatarUrl} style={styles.avatar} />
            )}
            <View style={{ alignItems: "center" }}>
              <Text style={styles.name}>
                {personalInfo.firstName} {personalInfo.lastName}
              </Text>
              {resume.targetPosition && (
                <Text
                  style={[
                    styles.contactInfo,
                    { color: "#4b5563", fontStyle: "italic" },
                  ]}
                >
                  {resume.targetPosition}
                </Text>
              )}
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 2,
                }}
              >
                {[
                  { value: personalInfo.email, type: "email" },
                  { value: personalInfo.phone, type: "phone" },
                  { value: personalInfo.location, type: "location" },
                  { value: personalInfo.telegram, type: "telegram" },
                ]
                  .filter((c) => !!c.value)
                  .map((item, i, arr) => (
                    <View
                      key={i}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingHorizontal: 4,
                      }}
                    >
                      {item.type === "email" && (
                        <Svg
                          viewBox="0 0 24 24"
                          width="10"
                          height="10"
                          style={{ marginRight: 3, marginBottom: 1 }}
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
                          width="10"
                          height="10"
                          style={{ marginRight: 3, marginBottom: 1 }}
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
                          width="10"
                          height="10"
                          style={{ marginRight: 4, marginBottom: 1 }}
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
                          width="10"
                          height="10"
                          style={{ marginRight: 3, marginBottom: 1 }}
                        >
                          <Path
                            fillRule="evenodd"
                            d="M23.1117 4.49449C23.4296 2.94472 21.9074 1.65683 20.4317 2.227L2.3425 9.21601C0.694517 9.85273 0.621087 12.1572 2.22518 12.8975L6.1645 14.7157L8.03849 21.2746C8.13583 21.6153 8.40618 21.8791 8.74917 21.968C9.09216 22.0568 9.45658 21.9576 9.70712 21.707L12.5938 18.8203L16.6375 21.8531C17.8113 22.7334 19.5019 22.0922 19.7967 20.6549L23.1117 4.49449ZM3.0633 11.0816L21.1525 4.0926L17.8375 20.2531L13.1 16.6999C12.7019 16.4013 12.1448 16.4409 11.7929 16.7928L10.5565 18.0292L10.928 15.9861L18.2071 8.70703C18.5614 8.35278 18.5988 7.79106 18.2947 7.39293C17.9906 6.99479 17.4389 6.88312 17.0039 7.13168L6.95124 12.876L3.0633 11.0816ZM8.17695 14.4791L8.78333 16.6015L9.01614 15.321C9.05253 15.1209 9.14908 14.9366 9.29291 14.7928L11.5128 12.573L8.17695 14.4791Z"
                            fill="#0F0F0F"
                          />
                        </Svg>
                      )}

                      <Text style={{ fontSize: 9, color: "#333" }}>
                        {item.value}
                      </Text>
                      {i < arr.length - 1 && (
                        <Text
                          style={{ fontSize: 9, color: "#ccc", marginLeft: 8 }}
                        >
                          |
                        </Text>
                      )}
                    </View>
                  ))}
              </View>
              {personalInfo.linkedin && (
                <Text
                  style={[
                    styles.contactInfo,
                    { color: "#2563eb", marginTop: 2 },
                  ]}
                >
                  {personalInfo.linkedin}
                </Text>
              )}
              {personalInfo.github && (
                <Text style={[styles.contactInfo, { color: "#2563eb" }]}>
                  {personalInfo.github}
                </Text>
              )}
              {personalInfo.website && (
                <Text style={[styles.contactInfo, { color: "#2563eb" }]}>
                  {personalInfo.website}
                </Text>
              )}
            </View>
          </View>
        </View>

        {personalInfo.summary && (
          <View>
            <Text style={styles.sectionTitle}>
              {getTranslation("form.summary", resume.language || "en")}
            </Text>
            <FormattedText
              html={personalInfo.summary}
              style={{ textAlign: "justify", marginBottom: 5 }}
            />
          </View>
        )}

        {workExperience.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>
              {getTranslation("form.work_experience", resume.language || "en")}
            </Text>
            {workExperience.map((exp, index) => (
              <View key={index} style={{ marginBottom: 10 }} wrap={false}>
                <View style={styles.jobHeader}>
                  <View>
                    <Text style={styles.jobTitle}>{exp.title}</Text>
                    <Text style={styles.company}>
                      {exp.company}
                      {exp.employmentType &&
                        ` • ${getTranslation(`work.employment_types.${exp.employmentType}`, resume.language || "en")}`}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.dateLocation}>
                      {formatResumeDate(exp.startDate)} — {exp.current ? "Present" : formatResumeDate(exp.endDate)}
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
              {getTranslation("form.education", resume.language || "en")}
            </Text>
            {education.map((edu, index) => (
              <View key={index} style={{ marginBottom: 8 }} wrap={false}>
                <View style={styles.jobHeader}>
                  <View>
                    <Text style={styles.jobTitle}>{edu.institution}</Text>
                    <Text style={styles.company}>
                      {edu.degree} {edu.field && `— ${edu.field}`}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.dateLocation}>
                      {formatResumeDate(edu.startDate)} — {edu.current ? "Present" : formatResumeDate(edu.endDate)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {skills.length > 0 && (
          <>
            {/* Technical & Soft Skills */}
            {(skills.some((s) => s.category === "technical") ||
              skills.some((s) => s.category === "soft")) && (
              <View>
                <Text style={styles.sectionTitle}>
                  {getTranslation("form.skills", resume.language || "en")}
                </Text>
                <View style={styles.skillsContainer}>
                  {skills
                    .filter(
                      (s) => s.category === "technical" || s.category === "soft",
                    )
                    .map((skill, index) => (
                      <Text key={index} style={styles.skillText}>
                        • {skill.name}
                      </Text>
                    ))}
                </View>
              </View>
            )}

            {/* Languages */}
            {skills.some((s) => s.category === "language") && (
              <View>
                <Text style={styles.sectionTitle}>
                  {getTranslation("skills.languages", resume.language || "en")}
                </Text>
                <View style={styles.skillsContainer}>
                  {skills
                    .filter((s) => s.category === "language")
                    .map((skill, index) => (
                      <Text key={index} style={styles.skillText}>
                        • {skill.name}
                        {skill.level && ` (${getLevelLabel(skill.level)})`}
                      </Text>
                    ))}
                </View>
              </View>
            )}
          </>
        )}
      </Page>
    </Document>
  );
}
