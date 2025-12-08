import { jsPDF } from "jspdf";
import { MasterProfile } from "../types";

export const downloadCvPdf = (profile: MasterProfile, targetJobTitle: string) => {
  const doc = new jsPDF();
  let y = 20;
  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - margin * 2;

  // Helper to check page break
  const checkPageBreak = (heightNeeded: number) => {
      if (y + heightNeeded > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          y = margin;
      }
  }

  // Header
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(profile.fullName, margin, y);
  y += 10;

  doc.setFontSize(14);
  doc.setTextColor(100, 100, 255); // Indigo-ish
  doc.text(targetJobTitle, margin, y);
  y += 10;

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  
  const contactLines = [];
  contactLines.push(`${profile.email} | ${profile.phone}`);
  contactLines.push(profile.location);
  if(profile.linkedin) contactLines.push(profile.linkedin);
  if(profile.portfolio) contactLines.push(profile.portfolio);

  contactLines.forEach(line => {
      doc.text(line, margin, y);
      y += 5;
  });
  y += 5;

  // Summary
  checkPageBreak(30);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setFillColor(240, 240, 250);
  doc.rect(margin, y - 4, contentWidth, 8, 'F');
  doc.text("PROFIL", margin + 2, y + 1);
  y += 10;
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  const splitBio = doc.splitTextToSize(profile.bio, contentWidth);
  doc.text(splitBio, margin, y);
  y += splitBio.length * 5 + 10;

  // Skills
  checkPageBreak(20);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setFillColor(240, 240, 250);
  doc.rect(margin, y - 4, contentWidth, 8, 'F');
  doc.text("COMPÉTENCES", margin + 2, y + 1);
  y += 10;
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const splitSkills = doc.splitTextToSize(profile.skills, contentWidth);
  doc.text(splitSkills, margin, y);
  y += splitSkills.length * 5 + 10;

  // Experience
  checkPageBreak(20);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setFillColor(240, 240, 250);
  doc.rect(margin, y - 4, contentWidth, 8, 'F');
  doc.text("EXPÉRIENCE PROFESSIONNELLE", margin + 2, y + 1);
  y += 12;

  profile.experiences.forEach(exp => {
      checkPageBreak(30);
      
      // Role & Date
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(70, 70, 200);
      doc.text(exp.role, margin, y);
      
      const dateText = `${exp.startDate} - ${exp.isCurrent ? 'Présent' : exp.endDate}`;
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      const dateWidth = doc.getTextWidth(dateText);
      doc.text(dateText, pageWidth - margin - dateWidth, y);
      
      y += 5;
      
      // Company
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(exp.company, margin, y);
      y += 6;

      // Description
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      const desc = doc.splitTextToSize(exp.description, contentWidth);
      doc.text(desc, margin, y);
      y += desc.length * 5 + 10;
  });

  // Projects
  if (profile.projects.length > 0) {
      checkPageBreak(20);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.setFillColor(240, 240, 250);
      doc.rect(margin, y - 4, contentWidth, 8, 'F');
      doc.text("PROJETS", margin + 2, y + 1);
      y += 12;
      
      profile.projects.forEach(proj => {
          checkPageBreak(30);
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.text(proj.name, margin, y);
          y += 5;
          
          if (proj.technologies) {
            doc.setFontSize(9);
            doc.setTextColor(80, 80, 200);
            doc.text(proj.technologies, margin, y);
            y += 5;
          }

          doc.setTextColor(50,50,50);
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          const desc = doc.splitTextToSize(proj.description, contentWidth);
          doc.text(desc, margin, y);
          y += desc.length * 5 + 8;
      });
  }

  // Education
  if (profile.education.length > 0) {
      checkPageBreak(20);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.setFillColor(240, 240, 250);
      doc.rect(margin, y - 4, contentWidth, 8, 'F');
      doc.text("FORMATION", margin + 2, y + 1);
      y += 12;
      
      profile.education.forEach(edu => {
          checkPageBreak(20);
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.text(edu.school, margin, y);
          
          const dateText = `${edu.startDate} - ${edu.endDate}`;
          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(100, 100, 100);
          const dateWidth = doc.getTextWidth(dateText);
          doc.text(dateText, pageWidth - margin - dateWidth, y);
          
          y += 5;
          doc.setTextColor(50,50,50);
          doc.setFontSize(10);
          doc.text(edu.degree, margin, y);
          y += 10;
      });
  }

  doc.save(`CV_${profile.fullName.replace(/\s+/g, '_')}.pdf`);
};

export const downloadLetterPdf = (profile: MasterProfile, company: string, jobTitle: string, content: string) => {
    const doc = new jsPDF();
    const margin = 20;
    let y = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - margin * 2;

    // Header
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(profile.fullName, margin, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.text(`${profile.email} | ${profile.phone}`, margin, y);
    y += 5;
    doc.text(profile.location, margin, y);
    y += 20;

    // Date
    const date = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    doc.text(`Le ${date}`, pageWidth - margin - 50, y);
    y += 20;

    // Recipient
    doc.setFont("helvetica", "bold");
    doc.text(`À l'attention du recruteur`, margin, y);
    y += 5;
    doc.text(company, margin, y);
    y += 15;

    // Subject
    doc.setFontSize(11);
    doc.text(`Objet : Candidature pour le poste de ${jobTitle}`, margin, y);
    y += 15;

    // Body
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    
    const cleanContent = content.replace(/\*\*/g, '').replace(/#/g, '');
    const paragraphs = cleanContent.split('\n');

    paragraphs.forEach(p => {
        if(p.trim()) {
            const splitText = doc.splitTextToSize(p, contentWidth);
            if (y + splitText.length * 5 > doc.internal.pageSize.getHeight() - margin) {
                doc.addPage();
                y = margin;
            }
            doc.text(splitText, margin, y);
            y += splitText.length * 5 + 5;
        }
    });

    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text(profile.fullName, margin, y);

    doc.save(`Lettre_Motivation_${company.replace(/\s+/g, '_')}.pdf`);
}