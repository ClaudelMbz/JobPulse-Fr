import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { MasterProfile } from '../../types';

Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/@canvas-fonts/helvetica@1.0.4/Helvetica.ttf' },
    { src: 'https://cdn.jsdelivr.net/npm/@canvas-fonts/helvetica@1.0.4/Helvetica-Bold.ttf', fontWeight: 'bold' }
  ]
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#333333',
    flexDirection: 'column'
  },
  header: {
    backgroundColor: '#1E293B',
    padding: 20,
    marginHorizontal: -30,
    marginTop: -30,
    marginBottom: 20,
    color: 'white'
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
    textTransform: 'uppercase'
  },
  jobTitle: {
    fontSize: 14,
    color: '#818CF8', // Indigo 400
    marginBottom: 10
  },
  contactRow: {
    flexDirection: 'row',
    gap: 15,
    fontSize: 9,
    color: '#CBD5E1'
  },
  section: {
    marginBottom: 15
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1E293B',
    borderBottom: 1,
    borderColor: '#E2E8F0',
    paddingBottom: 4,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2
  },
  company: {
    fontWeight: 'bold',
    fontSize: 11
  },
  date: {
    color: '#64748B',
    fontSize: 9
  },
  role: {
    color: '#4F46E5', // Indigo 600
    fontWeight: 'bold',
    fontSize: 10,
    marginBottom: 2
  },
  description: {
    fontSize: 9.5,
    lineHeight: 1.4,
    color: '#475569'
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  skillBadge: {
    backgroundColor: '#EEF2FF',
    color: '#4338CA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 9
  },
  bio: {
    fontSize: 10,
    lineHeight: 1.4,
    marginBottom: 10,
    fontStyle: 'italic',
    color: '#475569'
  }
});

interface CvDocumentProps {
  profile: MasterProfile;
  targetJobTitle: string;
}

export const CvDocument: React.FC<CvDocumentProps> = ({ profile, targetJobTitle }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.name}>{profile.fullName}</Text>
          <Text style={styles.jobTitle}>{targetJobTitle}</Text>
          <View style={styles.contactRow}>
            <Text>{profile.email}</Text>
            <Text>|</Text>
            <Text>{profile.phone}</Text>
            <Text>|</Text>
            <Text>{profile.location}</Text>
          </View>
          <View style={[styles.contactRow, { marginTop: 4 }]}>
             <Text>{profile.linkedin}</Text>
          </View>
        </View>

        {/* SUMMARY */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profil</Text>
          <Text style={styles.bio}>{profile.bio}</Text>
        </View>

        {/* SKILLS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compétences Clés</Text>
          <View style={styles.skillsContainer}>
            {profile.skills.split(',').map((skill, i) => (
              skill.trim() ? <Text key={i} style={styles.skillBadge}>{skill.trim()}</Text> : null
            ))}
          </View>
        </View>

        {/* EXPERIENCE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expérience Professionnelle</Text>
          {profile.experiences.map((exp) => (
            <View key={exp.id} style={{ marginBottom: 10 }}>
              <View style={styles.subHeader}>
                <Text style={styles.company}>{exp.company}</Text>
                <Text style={styles.date}>{exp.startDate} - {exp.isCurrent ? 'Présent' : exp.endDate}</Text>
              </View>
              <Text style={styles.role}>{exp.role}</Text>
              <Text style={styles.description}>{exp.description}</Text>
            </View>
          ))}
        </View>

        {/* PROJECTS */}
        {profile.projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projets Significatifs</Text>
            {profile.projects.map((proj) => (
              <View key={proj.id} style={{ marginBottom: 8 }}>
                 <View style={styles.subHeader}>
                    <Text style={{ fontWeight: 'bold' }}>{proj.name}</Text>
                 </View>
                 <Text style={{ fontSize: 9, color: '#6366F1', marginBottom: 2 }}>{proj.technologies}</Text>
                 <Text style={styles.description}>{proj.description}</Text>
              </View>
            ))}
          </View>
        )}

        {/* EDUCATION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Formation</Text>
          {profile.education.map((edu) => (
            <View key={edu.id} style={{ marginBottom: 6 }}>
               <View style={styles.subHeader}>
                  <Text style={{ fontWeight: 'bold' }}>{edu.school}</Text>
                  <Text style={styles.date}>{edu.startDate} - {edu.endDate}</Text>
               </View>
               <Text style={styles.description}>{edu.degree}</Text>
            </View>
          ))}
        </View>

      </Page>
    </Document>
  );
};