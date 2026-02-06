import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";
import { Resume } from "@/types/resume";

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
            <Text style={styles.contact}>
              {personalInfo.email} • {personalInfo.phone}
            </Text>
            <Text style={styles.contact}>{personalInfo.location}</Text>
          </View>
        </View>

        {personalInfo.summary && (
          <View style={{ marginBottom: 10 }}>
            <Text style={{ textAlign: "justify" }}>{personalInfo.summary}</Text>
          </View>
        )}

        {workExperience.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Work Experience</Text>
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
                  {exp.company} • {exp.location}
                </Text>

                {exp.description.map((d, i) => (
                  <Text key={i} style={styles.desc}>
                    - {d}
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
            <Text style={styles.sectionTitle}>Skills</Text>
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
