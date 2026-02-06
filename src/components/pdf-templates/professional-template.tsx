import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { Resume } from "@/types/resume";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Times-Roman",
    fontSize: 10,
    padding: 40,
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 20,
    borderBottom: "1pt solid #000",
    paddingBottom: 15,
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
    marginBottom: 5,
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
    marginTop: 15,
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
    marginLeft: 15,
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
              <Text style={styles.contactInfo}>
                {personalInfo.email} | {personalInfo.phone}
              </Text>
              <Text style={styles.contactInfo}>{personalInfo.location}</Text>
              {personalInfo.website && (
                <Text style={[styles.contactInfo, { color: "#000" }]}>
                  {personalInfo.website}
                </Text>
              )}
            </View>
          </View>
        </View>

        {personalInfo.summary && (
          <View>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={{ textAlign: "justify", marginBottom: 5 }}>
              {personalInfo.summary}
            </Text>
          </View>
        )}

        {workExperience.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Experience</Text>
            {workExperience.map((exp, index) => (
              <View key={index} style={{ marginBottom: 10 }}>
                <View style={styles.jobHeader}>
                  <View>
                    <Text style={styles.jobTitle}>{exp.title}</Text>
                    <Text style={styles.company}>{exp.company}</Text>
                  </View>
                  <View>
                    <Text style={styles.dateLocation}>
                      {exp.startDate} — {exp.current ? "Present" : exp.endDate}
                    </Text>
                    <Text style={styles.dateLocation}>{exp.location}</Text>
                  </View>
                </View>
                {exp.description.map((desc, idx) => (
                  <Text key={idx} style={styles.bulletPoint}>
                    • {desc}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {education.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Education</Text>
            {education.map((edu, index) => (
              <View key={index} style={{ marginBottom: 8 }}>
                <View style={styles.jobHeader}>
                  <View>
                    <Text style={styles.jobTitle}>{edu.institution}</Text>
                    <Text style={styles.company}>
                      {edu.degree} {edu.field && `— ${edu.field}`}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.dateLocation}>
                      {edu.startDate} — {edu.current ? "Present" : edu.endDate}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {skills.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsContainer}>
              {skills.map((skill, index) => (
                <Text key={index} style={styles.skillText}>
                  • {skill.name}
                </Text>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
}
