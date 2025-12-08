import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { MasterProfile } from '../../types';

// Register a standard font if needed, otherwise use Helvetica by default
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/@canvas-fonts/helvetica@1.0.4/Helvetica.ttf' },
    { src: 'https://cdn.jsdelivr.net/npm/@canvas-fonts/helvetica@1.0.4/Helvetica-Bold.ttf', fontWeight: 'bold' }
  ]
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.5,
    color: '#333333'
  },
  header: {
    marginBottom: 30,
    borderBottom: 1,
    borderColor: '#E2E8F0',
    paddingBottom: 20
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4
  },
  contactInfo: {
    fontSize: 10,
    color: '#64748B',
    flexDirection: 'row',
    gap: 10
  },
  recipientBlock: {
    marginTop: 20,
    marginBottom: 40
  },
  recipientName: {
    fontWeight: 'bold',
    marginBottom: 2
  },
  date: {
    textAlign: 'right',
    marginBottom: 20,
    color: '#64748B'
  },
  subject: {
    fontWeight: 'bold',
    marginBottom: 20,
    fontSize: 12
  },
  body: {
    textAlign: 'justify',
    marginBottom: 10
  },
  signature: {
    marginTop: 40,
    fontWeight: 'bold'
  }
});

interface LetterDocumentProps {
  profile: MasterProfile;
  companyName: string;
  jobTitle: string;
  content: string;
}

export const LetterDocument: React.FC<LetterDocumentProps> = ({ profile, companyName, jobTitle, content }) => {
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Clean Markdown bits if present
  const cleanContent = content.replace(/\*\*/g, '').replace(/#/g, '');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Header: Candidate Info */}
        <View style={styles.header}>
          <Text style={styles.name}>{profile.fullName}</Text>
          <View style={styles.contactInfo}>
            <Text>{profile.email}  |  {profile.phone}  |  {profile.location}</Text>
          </View>
          <View style={styles.contactInfo}>
             <Text>{profile.linkedin}</Text>
          </View>
        </View>

        {/* Date */}
        <Text style={styles.date}>Le {currentDate}</Text>

        {/* Recipient */}
        <View style={styles.recipientBlock}>
          <Text style={styles.recipientName}>À l'attention du Responsable du Recrutement</Text>
          <Text>{companyName}</Text>
        </View>

        {/* Subject */}
        <Text style={styles.subject}>Objet : Candidature au poste de {jobTitle}</Text>

        {/* Body */}
        <View>
          {cleanContent.split('\n').map((paragraph, i) => (
             paragraph.trim().length > 0 ? (
               <Text key={i} style={styles.body}>{paragraph}</Text>
             ) : <Text key={i} style={{ height: 10 }}> </Text>
          ))}
        </View>

        {/* Signature */}
        <Text style={styles.signature}>{profile.fullName}</Text>

      </Page>
    </Document>
  );
};