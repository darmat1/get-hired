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

interface ModernTemplateProps {
  resume: Resume;
}

export function ModernTemplate({ resume }: ModernTemplateProps) {
  const { personalInfo, workExperience, education, skills, customization } =
    resume;

  const sidebarColor = customization?.sidebarColor || "#2e3a4e";
  const showAvatar = customization?.showAvatar !== false;
  const showPhone = customization?.showPhone !== false;
  const showEmail = customization?.showEmail !== false;
  const showAddress = customization?.showAddress !== false;
  const showLinkedin = customization?.showLinkedin !== false;
  const showTelegram = customization?.showTelegram !== false;

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
      backgroundColor: sidebarColor, // Dynamic Color
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
      border: "3pt solid rgba(255,255,255,0.2)",
    },
    sidebarSection: {
      marginBottom: 25,
    },
    sidebarTitle: {
      fontSize: 14,
      fontWeight: "bold",
      textTransform: "capitalize",
      color: "rgba(255, 255, 255, 0.9)",
      marginBottom: 4,
    },
    sidebarSeparator: {
      height: 1,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      marginBottom: 10,
    },
    contactItem: {
      fontSize: 9,
      marginBottom: 6,
      color: "rgba(255,255,255,0.9)",
    },
    contactLabel: {
      fontSize: 10,
      fontWeight: "bold",
      color: "rgba(255,255,255,0.6)",
      marginBottom: 1,
      textTransform: "uppercase",
    },
    skillItem: {
      fontSize: 9,
      marginBottom: 4,
      color: "rgba(255,255,255,0.8)",
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
      color: sidebarColor, // Dynamic Color
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
      color: sidebarColor, // Dynamic Color
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
      backgroundColor: "#ffffff",
      border: `2pt solid ${sidebarColor}`, // Dynamic Color
      marginBottom: 0,
      zIndex: 10,
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
      color: sidebarColor, // Dynamic Color
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
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* LEFT SIDEBAR */}
        <View style={styles.sidebar}>
          {showAvatar && personalInfo.avatarUrl && (
            <View style={styles.avatarContainer}>
              <Image src={personalInfo.avatarUrl} style={styles.avatar} />
            </View>
          )}

          <View style={styles.sidebarSection}>
            <Text style={styles.sidebarTitle}>Contact</Text>
            <View style={styles.sidebarSeparator} />

            {/* Email first */}
            {showEmail && (
              <View style={{ marginBottom: 8 }}>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactItem}>{personalInfo.email}</Text>
              </View>
            )}

            {/* Phone second */}
            {showPhone && (
              <View style={{ marginBottom: 8 }}>
                <Text style={styles.contactLabel}>Phone</Text>
                <Text style={styles.contactItem}>{personalInfo.phone}</Text>
              </View>
            )}

            {/* Telegram third */}
            {showTelegram && personalInfo.telegram && (
              <View style={{ marginBottom: 8 }}>
                <Text style={styles.contactLabel}>Telegram</Text>
                <Text style={styles.contactItem}>{personalInfo.telegram}</Text>
              </View>
            )}

            {/* Socials/Websites fourth */}
            {showLinkedin && personalInfo.linkedin && (
              <View style={{ marginBottom: 8 }}>
                <Text style={styles.contactLabel}>LinkedIn</Text>
                <Text style={styles.contactItem}>
                  {personalInfo.linkedin.replace(/^https?:\/\//, "")}
                </Text>
              </View>
            )}

            {personalInfo.website && (
              <View style={{ marginBottom: 8 }}>
                <Text style={styles.contactLabel}>Website</Text>
                <Text style={styles.contactItem}>{personalInfo.website}</Text>
              </View>
            )}

            {/* Location last */}
            {showAddress && (
              <View style={{ marginBottom: 8 }}>
                <Text style={styles.contactLabel}>Address</Text>
                <Text style={styles.contactItem}>{personalInfo.location}</Text>
              </View>
            )}
          </View>

          {education.length > 0 && (
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarTitle}>Education</Text>
              <View style={styles.sidebarSeparator} />
              {education.map((edu, idx) => (
                <View key={idx} style={{ marginBottom: 10 }}>
                  <Text style={{ fontSize: 9, fontWeight: "bold" }}>
                    {edu.startDate?.split("-")[0] || ""}
                  </Text>
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: "bold",
                      color: "white",
                    }}
                  >
                    {edu.degree}
                  </Text>
                  <Text
                    style={{
                      fontSize: 9,
                      color: "rgba(255,255,255,0.7)",
                      fontStyle: "italic",
                    }}
                  >
                    {edu.institution}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {skills.length > 0 && (
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarTitle}>Expertise</Text>
              <View style={styles.sidebarSeparator} />
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
                      backgroundColor: "rgba(255,255,255,0.6)",
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

          {/* Fallback title if needed */}
          {/* <Text style={styles.headerTitle}>Full Stack Developer</Text> */}

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
        </View>
      </Page>
    </Document>
  );
}
