import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
  Image,
  Svg,
  Path,
} from "@react-pdf/renderer";
import { Resume } from "@/types/resume";
import { FormattedText } from "@/lib/pdf-utils";
import { getTranslation } from "@/lib/translations-data";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    padding: 40,
    lineHeight: 1.4,
  },
  header: {
    flexDirection: "row",
    marginBottom: 30,
    alignItems: "center",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 5, // Square-ish
    marginRight: 20,
  },
  name: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 20,
  },
  jobBlock: {
    marginBottom: 15,
  },
  jobTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
  },
  companyMeta: {
    fontSize: 8,
    color: "#555",
    marginBottom: 4,
    marginTop: 1,
  },
  desc: {
    fontSize: 9,
    marginLeft: 0,
  },
  contact: {
    fontSize: 8,
    color: "#555",
    marginTop: 2,
  },
  skillsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  skill: {
    marginRight: 10,
    fontSize: 9,
    backgroundColor: "#000",
    color: "#fff",
    padding: "2 6",
    borderRadius: 0, // Rect
    marginBottom: 5,
  },
});

interface TemplateProps {
  resume: Resume;
}

export function MinimalTemplate({ resume }: TemplateProps) {
  const { personalInfo, workExperience, education, skills } = resume;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {personalInfo.avatarUrl && (
            <Image src={personalInfo.avatarUrl} style={styles.avatar} />
          )}
          <View>
            <Text style={styles.name}>
              {personalInfo.firstName} {personalInfo.lastName}
            </Text>
            {resume.targetPosition && (
              <Text
                style={[
                  styles.contact,
                  { color: "#6b7280", fontStyle: "italic" },
                ]}
              >
                {resume.targetPosition}
              </Text>
            )}
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 6,
                marginTop: 6,
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
                    }}
                  >
                    {item.type === "email" && (
                      <Svg
                        viewBox="0 0 24 24"
                        width="8"
                        height="8"
                        style={{ marginRight: 3, marginBottom: 1 }}
                      >
                        <Path
                          fill="#555"
                          d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
                        />
                      </Svg>
                    )}
                    {item.type === "phone" && (
                      <Svg
                        viewBox="0 0 24 24"
                        width="8"
                        height="8"
                        style={{ marginRight: 3, marginBottom: 1 }}
                      >
                        <Path
                          fill="#555"
                          d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
                        />
                      </Svg>
                    )}
                    {item.type === "location" && (
                      <Svg
                        viewBox="0 0 24 24"
                        width="8"
                        height="8"
                        style={{ marginRight: 3, marginBottom: 1 }}
                      >
                        <Path
                          fill="#555"
                          d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                        />
                      </Svg>
                    )}
                    {item.type === "telegram" && (
                      <Svg
                        viewBox="0 0 24 24"
                        width="8"
                        height="8"
                        style={{ marginRight: 3, marginBottom: 1 }}
                      >
                        <Path
                          fill="#555"
                          d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"
                        />
                      </Svg>
                    )}
                    <Text style={{ fontSize: 8, color: "#555" }}>
                      {item.value}
                    </Text>
                    {i < arr.length - 1 && (
                      <Text
                        style={{ fontSize: 8, color: "#ccc", marginLeft: 6 }}
                      >
                        •
                      </Text>
                    )}
                  </View>
                ))}
            </View>
            {personalInfo.linkedin && (
              <Text
                style={[styles.contact, { color: "#2563eb", marginTop: 2 }]}
              >
                {personalInfo.linkedin}
              </Text>
            )}
            {personalInfo.website && (
              <Text style={[styles.contact, { color: "#2563eb" }]}>
                {personalInfo.website}
              </Text>
            )}
          </View>
        </View>

        {personalInfo.summary && (
          <View style={{ marginBottom: 10 }}>
            <FormattedText
              html={personalInfo.summary}
              style={{ textAlign: "justify" }}
            />
          </View>
        )}

        {workExperience.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>
              {getTranslation("form.work_experience", resume.language || "en")}
            </Text>
            {workExperience.map((exp, index) => (
              <View key={index} style={styles.jobBlock}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={styles.jobTitle}>{exp.title}</Text>
                  <Text style={{ fontSize: 8 }}>
                    {exp.startDate} — {exp.current ? "Present" : exp.endDate}
                  </Text>
                </View>
                <Text style={styles.companyMeta}>
                  {exp.company}
                  {exp.employmentType &&
                    ` • ${getTranslation(`work.employment_types.${exp.employmentType}`, resume.language || "en")}`}
                  {exp.location ? ` • ${exp.location}` : ""}
                </Text>

                {exp.mainDescription && (
                  <View style={{ marginBottom: 3 }}>
                    <FormattedText
                      html={exp.mainDescription}
                      style={styles.desc}
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
                            styles.desc,
                            { marginRight: 4, flexShrink: 0 },
                          ]}
                        >
                          -
                        </Text>
                      )}
                      <FormattedText html={desc || " "} style={styles.desc} />
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
              <View key={index} style={styles.jobBlock}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={styles.jobTitle}>{edu.institution}</Text>
                  <Text style={{ fontSize: 8 }}>
                    {edu.startDate} — {edu.current ? "Present" : edu.endDate}
                  </Text>
                </View>
                <Text style={styles.companyMeta}>{edu.degree}</Text>
              </View>
            ))}
          </View>
        )}

        {skills.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>
              {getTranslation("form.skills", resume.language || "en")}
            </Text>
            <View style={styles.skillsGrid}>
              {skills.map((s, i) => (
                <Text key={i} style={styles.skill}>
                  {s.name}
                </Text>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
}
