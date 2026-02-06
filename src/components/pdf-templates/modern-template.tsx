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

// Register fonts
Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf",
      fontWeight: 300,
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf",
      fontWeight: 400,
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf",
      fontWeight: 500,
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
    backgroundColor: "#ffffff",
  },
  // Sidebar (Left - 35%)
  sidebar: {
    width: "35%",
    backgroundColor: "#2e3a4e", // Dark Blue/Slate
    padding: 20,
    color: "#ffffff",
    height: "100%",
  },
  avatarContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    objectFit: "cover",
  },
  sidebarSection: {
    marginBottom: 25,
  },
  sidebarTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    textTransform: "capitalize",
    color: "#ffffff",
    borderBottom: "1pt solid #4a5568",
    paddingBottom: 5,
  },
  contactItem: {
    fontSize: 9,
    marginBottom: 6,
    color: "#cbd5e0",
  },
  contactLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 1,
  },
  skillItem: {
    fontSize: 9,
    marginBottom: 4,
    color: "#cbd5e0",
  },
  // Main Content (Right - 65%)
  main: {
    width: "65%",
    padding: 30,
    paddingTop: 50,
    color: "#1f2937",
  },
  headerName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2e3a4e",
    marginBottom: 5,
    textTransform: "capitalize",
  },
  headerTitle: {
    fontSize: 11,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "#4b5563",
    marginBottom: 20,
  },
  summaryText: {
    fontSize: 9,
    lineHeight: 1.5,
    color: "#4b5563",
    marginBottom: 30,
    textAlign: "justify",
  },
  mainSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2e3a4e",
    marginBottom: 15,
    textTransform: "capitalize",
  },
  // Timeline Experience
  experienceIten: {
    flexDirection: "row",
    marginBottom: 15,
  },
  timelineColumn: {
    width: 15,
    alignItems: "center",
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2e3a4e", // Empty circle: transparent
    border: "2pt solid #2e3a4e",
    marginBottom: 0,
    zIndex: 10,
    backgroundColor: "white",
  },
  timelineLine: {
    position: "absolute",
    top: 8,
    bottom: -20,
    width: 1,
    backgroundColor: "#e2e8f0",
    left: 3.5,
  },
  contentColumn: {
    flex: 1,
    paddingLeft: 10,
    paddingBottom: 5,
  },
  dateRange: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#2e3a4e",
    marginBottom: 2,
  },
  expCompany: {
    fontSize: 9,
    color: "#718096",
    marginBottom: 2,
  },
  expTitle: {
    fontSize: 11, // "Job position here"
    fontWeight: "bold",
    color: "#2d3748",
    marginBottom: 4,
  },
  expDesc: {
    fontSize: 9,
    lineHeight: 1.4,
    color: "#4a5568",
  },
  referenceBlock: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
});

interface ModernTemplateProps {
  resume: Resume;
}

export function ModernTemplate({ resume }: ModernTemplateProps) {
  const { personalInfo, workExperience, education, skills } = resume;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* LEFT SIDEBAR */}
        <View style={styles.sidebar}>
          {personalInfo.avatarUrl && (
            <View style={styles.avatarContainer}>
              <Image src={personalInfo.avatarUrl} style={styles.avatar} />
            </View>
          )}

          <View style={styles.sidebarSection}>
            <Text style={styles.sidebarTitle}>Contact</Text>

            <View style={{ marginBottom: 8 }}>
              <Text style={styles.contactLabel}>Phone</Text>
              <Text style={styles.contactItem}>{personalInfo.phone}</Text>
            </View>
            <View style={{ marginBottom: 8 }}>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactItem}>{personalInfo.email}</Text>
            </View>
            <View style={{ marginBottom: 8 }}>
              <Text style={styles.contactLabel}>Address</Text>
              <Text style={styles.contactItem}>{personalInfo.location}</Text>
            </View>
            {personalInfo.website && (
              <View style={{ marginBottom: 8 }}>
                <Text style={styles.contactLabel}>Website</Text>
                <Text style={styles.contactItem}>{personalInfo.website}</Text>
              </View>
            )}
          </View>

          {education.length > 0 && (
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarTitle}>Education</Text>
              {education.map((edu, idx) => (
                <View key={idx} style={{ marginBottom: 10 }}>
                  <Text style={{ fontSize: 9, fontWeight: "bold" }}>
                    {edu.startDate?.split("-")[0] || ""}
                  </Text>
                  <Text
                    style={{ fontSize: 10, fontWeight: "bold", color: "white" }}
                  >
                    {edu.degree}
                  </Text>
                  <Text style={{ fontSize: 9, color: "#cbd5e0" }}>
                    {edu.institution}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {skills.length > 0 && (
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarTitle}>Expertise</Text>
              {skills.map((skill, idx) => (
                <View
                  key={idx}
                  style={{
                    flexDirection: "row",
                    marginBottom: 4,
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      width: 4,
                      height: 4,
                      backgroundColor: "white",
                      borderRadius: 2,
                      marginRight: 8,
                    }}
                  />
                  <Text style={styles.skillItem}>{skill.name}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* RIGHT MAIN CONTENT */}
        <View style={styles.main}>
          <Text style={styles.headerName}>
            {personalInfo.firstName} {personalInfo.lastName}
          </Text>
          {/* We assume the first job title or a hardcoded one if not available in personalInfo. 
              The schema has title in resume? No, checking type... Partial<Resume>. 
              Usually summary or first job title is used. using "Frontend Developer" as placeholder if not found? 
              Actually let's omit title if not stored, but ideally we should have a "Title" field in PersonalInfo.
              For now I'll skip it or hardcode if I can find it.
              Let's assume the user wants the design structure.
          */}
          <Text style={styles.headerTitle}>
            {/* Using summary first sentence or just "Professional" if unknown? 
                Actually, the designs usually have a "Title" field. I don't see one in my `PersonalInfo` type view.
                I will skip it to avoid hallucinating data.
            */}
          </Text>

          {personalInfo.summary && (
            <Text style={styles.summaryText}>{personalInfo.summary}</Text>
          )}

          {workExperience.length > 0 && (
            <View>
              <Text style={styles.mainSectionTitle}>Experience</Text>

              {workExperience.map((exp, index) => (
                <View key={index} style={styles.experienceIten}>
                  {/* Timeline Column */}
                  <View style={styles.timelineColumn}>
                    <View style={styles.timelineDot} />
                    {index !== workExperience.length - 1 && (
                      <View style={styles.timelineLine} />
                    )}
                  </View>

                  {/* Content Column */}
                  <View style={styles.contentColumn}>
                    <Text style={styles.dateRange}>
                      {exp.startDate ? exp.startDate.split("-")[0] : ""} -{" "}
                      {exp.current ? "Present" : exp.endDate?.split("-")[0]}
                    </Text>
                    <Text style={styles.expCompany}>
                      {exp.company} | {exp.location}
                    </Text>
                    <Text style={styles.expTitle}>{exp.title}</Text>

                    {exp.description.map((d, i) => (
                      <Text key={i} style={styles.expDesc}>
                        {d}
                      </Text>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Reference Section - Placeholder if data existed, but we don't have references in our schema. 
               The image shows it, but I cannot invent data. Skipping. 
           */}
        </View>
      </Page>
    </Document>
  );
}
