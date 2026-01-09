import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer'
import { Resume } from '@/types/resume'

Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf', fontWeight: 300 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf', fontWeight: 500 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 },
  ],
})

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Roboto',
    fontSize: 10,
    padding: 40,
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 15,
    borderBottom: '2pt solid #3b82f6',
    paddingBottom: 10,
    display: 'flex',
    flexDirection: 'column',
  },
  name: {
    fontSize: 26,
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    lineHeight: 1.2,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  contactInfo: {
    fontSize: 10,
    color: '#6b7280',
    lineHeight: 1.4,
    marginBottom: 4,
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    fontSize: 9,
    color: '#4b5563',
  },
  sectionTitle: {
    fontWeight: 700,
    fontSize: 12,
    marginBottom: 8,
    marginTop: 15,
    color: '#1f2937',
    textTransform: 'uppercase',
    borderBottom: '0.5pt solid #e5e7eb',
    paddingBottom: 2,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  jobTitle: {
    fontWeight: 700,
    fontSize: 11,
  },
  company: {
    fontSize: 10,
    color: '#374151',
    fontWeight: 500,
  },
  dateLocation: {
    fontSize: 9,
    color: '#6b7280',
    textAlign: 'right',
  },
  bulletPoint: {
    marginLeft: 10,
    fontSize: 9,
    marginBottom: 2,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  skillBadge: {
    backgroundColor: '#f3f4f6',
    padding: '3 6',
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  skillText: {
    fontSize: 8,
    color: '#374151',
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
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.name}>
              {personalInfo.firstName} {personalInfo.lastName}
            </Text>
          </View>
          <View style={{ marginBottom: 4 }}>
            <Text style={styles.contactInfo}>
              {personalInfo.email}  |  {personalInfo.phone}  |  {personalInfo.location}
            </Text>
          </View>
          {personalInfo.website && (
            <Text style={[styles.contactInfo, { color: '#3b82f6' }]}>
              {personalInfo.website}
            </Text>
          )}
        </View>

        {/* Summary */}
        {personalInfo.summary && (
          <View>
            <Text style={styles.sectionTitle}>О себе</Text>
            <Text style={{ fontSize: 9, textAlign: 'justify' }}>{personalInfo.summary}</Text>
          </View>
        )}

        {/* Experience */}
        {workExperience.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Опыт работы</Text>
            {workExperience.map((exp, index) => (
              <View key={index} style={{ marginBottom: 10 }}>
                <View style={styles.jobHeader}>
                  <View>
                    <Text style={styles.jobTitle}>{exp.title}</Text>
                    <Text style={styles.company}>{exp.company}</Text>
                  </View>
                  <View>
                    <Text style={styles.dateLocation}>
                      {exp.startDate} — {exp.current ? 'Наст. время' : exp.endDate}
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

        {/* Skills */}
        {skills.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Навыки</Text>
            <View style={styles.skillsContainer}>
              {skills.map((skill, index) => (
                <View key={index} style={styles.skillBadge}>
                  <Text style={styles.skillText}>{skill.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  )
}