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
import { FormattedText } from "@/lib/pdf-utils";

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
    backgroundColor: "#fff",
    paddingTop: "30pt",
    paddingBottom: "30pt",
  },
  sidebar: {
    position: "absolute",
    left: 0,
    top: "30pt",
    bottom: "30pt",
    width: "30%",
    backgroundColor: "#f3f4f6",
    padding: "0 20pt",
  },
  main: {
    marginLeft: "30%",
    width: "70%",
    padding: "0 20pt",
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
        {/* Persistent Sidebar Background */}
        <View
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: "30%",
            backgroundColor: "#f3f4f6",
          }}
          fixed
        />

        {/* Sidebar */}
        <View style={[styles.sidebar, { backgroundColor: "transparent" }]}>
          {personalInfo.summary && (
            <FormattedText
              html={personalInfo.summary}
              style={{ fontSize: 9, color: "#666", marginBottom: 15 }}
            />
          )}
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
              <FormattedText
                html={personalInfo.summary}
                style={{ fontSize: 9, lineHeight: 1.4, textAlign: "justify" }}
              />
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
                    <View key={i} style={{ flexDirection: "row" }}>
                      <Text style={styles.bullet}>• </Text>
                      <FormattedText html={d} style={styles.bullet} />
                    </View>
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
