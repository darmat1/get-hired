import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer'
import { Resume } from '@/types/resume'

Font.register({
  family: 'Roboto',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf',
})

Font.register({
  family: 'Roboto-Bold',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Bold.ttf',
})

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Roboto',
    fontSize: 10,
    padding: 40,
    lineHeight: 1.4,
  },
  header: {
    marginBottom: 20,
    borderBottom: '2pt solid #3b82f6',
    paddingBottom: 10,
  },
  name: {
    fontFamily: 'Roboto-Bold',
    fontSize: 24,
    marginBottom: 5,
  },
  contactInfo: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: 'Roboto-Bold',
    fontSize: 14,
    marginBottom: 10,
    marginTop: 15,
    color: '#1f2937',
  },
  jobTitle: {
    fontFamily: 'Roboto-Bold',
    fontSize: 11,
  },
  company: {
    fontSize: 10,
    fontStyle: 'italic',
  },
  dateLocation: {
    fontSize: 9,
    color: '#6b7280',
    textAlign: 'right',
  },
  bulletPoint: {
    marginBottom: 3,
  },
  skillsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  skill: {
    backgroundColor: '#f3f4f6',
    padding: '4 8',
    borderRadius: 3,
    fontSize: 9,
  },
})

interface ModernTemplateProps {
  resume: Resume
}

export function ModernTemplate({ resume }: ModernTemplateProps) {
  const { personalInfo, workExperience, education, skills } = resume

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>
            {personalInfo.firstName} {personalInfo.lastName}
          </Text>
          <Text style={styles.contactInfo}>
            {personalInfo.email} • {personalInfo.phone} • {personalInfo.location}
          </Text>
          {personalInfo.website && (
            <Text style={styles.contactInfo}>{personalInfo.website}</Text>
          )}
        </View>

        {personalInfo.summary && (
          <>
            <Text style={styles.sectionTitle}>О себе</Text>
            <Text>{personalInfo.summary}</Text>
          </>
        )}

        {workExperience.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Опыт работы</Text>
            {workExperience.map((exp) => (
              <View key={exp.id} style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View style={{ flex: 2 }}>
                    <Text style={styles.jobTitle}>{exp.title}</Text>
                    <Text style={styles.company}>{exp.company}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.dateLocation}>
                      {exp.startDate} - {exp.current ? 'Настоящее время' : exp.endDate}
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
          </>
        )}

        {education.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Образование</Text>
            {education.map((edu) => (
              <View key={edu.id} style={{ marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View style={{ flex: 2 }}>
                    <Text style={styles.jobTitle}>{edu.institution}</Text>
                    <Text style={styles.company}>
                      {edu.degree} {edu.field && `- ${edu.field}`}
                    </Text>
                    {edu.gpa && <Text>GPA: {edu.gpa}</Text>}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.dateLocation}>
                      {edu.startDate} - {edu.current ? 'Настоящее время' : edu.endDate}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}

        {skills.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Навыки</Text>
            <View style={styles.skillsContainer}>
              {skills.map((skill) => (
                <Text key={skill.id} style={styles.skill}>
                  {skill.name}
                </Text>
              ))}
            </View>
          </>
        )}
      </Page>
    </Document>
  )
}

export function ProfessionalTemplate({ resume }: ModernTemplateProps) {
  const professionalStyles = StyleSheet.create({
    ...styles,
    page: {
      ...styles.page,
      fontFamily: 'Roboto',
      fontSize: 11,
      padding: 50,
    },
    header: {
      ...styles.header,
      borderBottom: '1pt solid #000',
      paddingBottom: 8,
    },
    name: {
      ...styles.name,
      fontSize: 20,
      color: '#000',
    },
    sectionTitle: {
      ...styles.sectionTitle,
      fontSize: 12,
      borderTop: '1pt solid #e5e7eb',
      paddingTop: 8,
      marginTop: 20,
    },
  })

  return <ModernTemplate resume={resume} />
}