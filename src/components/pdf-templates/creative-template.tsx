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

Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf",
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf",
      fontWeight: 700,
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    fontSize: 9,
    flexDirection: "row",
    backgroundColor: "#fff",
  },
  sidebar: {
    width: "30%",
    backgroundColor: "#f3f4f6",
    padding: 20,
    height: "100%",
  },
  main: {
    width: "70%",
    padding: 20,
    paddingTop: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
    alignSelf: "center",
  },
  name: {
    fontSize: 22,
    marginTop: 0,
    marginBottom: 5,
    color: "#111827",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  sidebarSection: {
    marginBottom: 20,
  },
  sidebarTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#4b5563",
    textTransform: "uppercase",
    marginBottom: 8,
    borderBottom: "1pt solid #d1d5db",
    paddingBottom: 2,
  },
  contactItem: {
    fontSize: 9,
    color: "#374151",
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2563eb",
    textTransform: "uppercase",
    marginBottom: 10,
    marginTop: 10,
    borderBottom: "1pt solid #e5e7eb",
    paddingBottom: 4,
  },
  jobBlock: {
    marginBottom: 12,
  },
  jobTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#111827",
  },
  jobMeta: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 4,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  bullet: {
    fontSize: 9,
    marginLeft: 8,
    marginBottom: 2,
    color: "#374151",
  },
  skillBadge: {
    backgroundColor: "#e5e7eb",
    padding: "3 6",
    borderRadius: 4,
    marginBottom: 4,
    marginRight: 4,
    fontSize: 8,
    color: "#1f2937",
    alignSelf: "flex-start",
  },
  skillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
});

interface TemplateProps {
  resume: Resume;
}

export function CreativeTemplate({ resume }: TemplateProps) {
  const { personalInfo, workExperience, education, skills } = resume;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          {personalInfo.avatarUrl && (
            <Image src={personalInfo.avatarUrl} style={styles.avatar} />
          )}

          <View style={styles.sidebarSection}>
            <Text style={styles.sidebarTitle}>Contact</Text>
            <Text style={styles.contactItem}>{personalInfo.email}</Text>
            <Text style={styles.contactItem}>{personalInfo.phone}</Text>
            <Text style={styles.contactItem}>{personalInfo.location}</Text>
            {personalInfo.website && (
              <Text style={styles.contactItem}>{personalInfo.website}</Text>
            )}
          </View>

          {skills.length > 0 && (
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarTitle}>Skills</Text>
              <View style={styles.skillsWrap}>
                {skills.map((skill, index) => (
                  <View key={index} style={styles.skillBadge}>
                    <Text>{skill.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Add Certificates here if needed */}
        </View>

        {/* Main Content */}
        <View style={styles.main}>
          <Text style={styles.name}>
            {personalInfo.firstName} {personalInfo.lastName}
          </Text>
          <Text style={{ fontSize: 10, color: "#4b5563", marginBottom: 20 }}>
            {/* Could put title here if we had it, using summary for now */}
            Frontend Developer
          </Text>

          {personalInfo.summary && (
            <View style={{ marginBottom: 15 }}>
              <Text
                style={{ fontSize: 9, lineHeight: 1.4, textAlign: "justify" }}
              >
                {personalInfo.summary}
              </Text>
            </View>
          )}

          {workExperience.length > 0 && (
            <View>
              <Text style={styles.sectionTitle}>Experience</Text>
              {workExperience.map((exp, index) => (
                <View key={index} style={styles.jobBlock}>
                  <Text style={styles.jobTitle}>{exp.title}</Text>
                  <View style={styles.jobMeta}>
                    <Text style={{ fontStyle: "italic" }}>{exp.company}</Text>
                    <Text>
                      {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                    </Text>
                  </View>
                  {exp.description.map((d, i) => (
                    <Text key={i} style={styles.bullet}>
                      • {d}
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
                  <Text style={styles.jobTitle}>{edu.institution}</Text>
                  <View style={styles.jobMeta}>
                    <Text>{edu.degree}</Text>
                    <Text>
                      {edu.startDate} - {edu.current ? "Present" : edu.endDate}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
}
