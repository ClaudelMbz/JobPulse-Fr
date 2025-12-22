import { jsPDF } from "jspdf";
import { MasterProfile } from "../types";

// --- HARVARD STYLE CONSTANTS ---
const MARGIN = 14; 
const FONT_BODY = "helvetica";
const FONT_HEAD = "helvetica";
const BASE_FONT_SIZE = 10; 

// --- HELPER: CLEAN MARKDOWN ---
const cleanText = (text: any): string => {
  if (text === null || text === undefined) return "";
  const str = String(text);
  return str
    .replace(/\*\*/g, '')   
    .replace(/__/g, '')     
    .replace(/^#+\s/gm, '') 
    .trim();
};

// --- HELPER: FORMATTING ---
const formatPhone = (phone: string): string => {
  if (!phone) return "";
  const p = phone.replace(/\s/g, '');
  if (p.startsWith('0')) {
    return '+33 ' + p.substring(1);
  }
  return p;
};

export const downloadCvPdf = (profile: MasterProfile, targetJobTitle: string) => {
  const doc = new jsPDF();
  let y = MARGIN; 
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - MARGIN * 2;

  // --- HELPER FUNCTIONS ---
  const checkPageBreak = (heightNeeded: number) => {
      if (y + heightNeeded > doc.internal.pageSize.getHeight() - MARGIN) {
          doc.addPage();
          y = MARGIN;
      }
  };

  const drawLine = () => {
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.4);
    doc.line(MARGIN, y + 1, pageWidth - MARGIN, y + 1);
    y += 7; 
  };

  const drawSectionTitle = (title: string) => {
    checkPageBreak(12);
    y += 3;
    doc.setFont(FONT_HEAD, "bold");
    doc.setFontSize(BASE_FONT_SIZE + 1);
    doc.text(title.toUpperCase(), MARGIN, y);
    drawLine();
  };

  const drawItemHeader = (leftBold: string, rightRegular: string, leftItalic?: string, rightRegular2?: string) => {
    checkPageBreak(9);
    doc.setFontSize(BASE_FONT_SIZE);
    
    doc.setFont(FONT_BODY, "bold");
    doc.text(cleanText(leftBold), MARGIN, y);
    
    if (rightRegular) {
      doc.setFont(FONT_BODY, "normal");
      const dateWidth = doc.getTextWidth(cleanText(rightRegular));
      doc.text(cleanText(rightRegular), pageWidth - MARGIN - dateWidth, y);
    }
    y += 4.5;

    if (leftItalic) {
      doc.setFont(FONT_BODY, "italic");
      doc.text(cleanText(leftItalic), MARGIN, y);
      
      if (rightRegular2) {
        doc.setFont(FONT_BODY, "normal");
        const dateWidth = doc.getTextWidth(cleanText(rightRegular2));
        doc.text(cleanText(rightRegular2), pageWidth - MARGIN - dateWidth, y);
      }
      y += 4.5;
    }
  };

  const drawLeftAlignedBlock = (text: string) => {
     doc.setFont(FONT_BODY, "normal");
     doc.setFontSize(BASE_FONT_SIZE);
     const rawContent = cleanText(text);
     const textLines = doc.splitTextToSize(rawContent, contentWidth);
     const heightNeeded = (textLines.length * 4.5) + 2; 
     checkPageBreak(heightNeeded);
     doc.text(textLines, MARGIN, y);
     y += heightNeeded + 2;
  };

  const drawSkillRow = (label: string, content: any) => {
    const safeContent = content ? String(content) : "";
    if (safeContent.trim().length === 0) return;

    checkPageBreak(8);
    doc.setFontSize(BASE_FONT_SIZE);
    doc.setFont(FONT_BODY, "bold");
    doc.text(label, MARGIN, y);
    const labelWidth = doc.getTextWidth(label);
    
    doc.setFont(FONT_BODY, "normal");
    let cleanContent = cleanText(safeContent).replace(/\n/g, ', ').replace(/\s+,/g, ','); 
    const textLines = doc.splitTextToSize(cleanContent, contentWidth - labelWidth);
    doc.text(textLines, MARGIN + labelWidth, y);
    y += textLines.length * 4.5;
  };

  // --- HEADER ---
  const startY = y + 10;
  doc.setFont(FONT_HEAD, "bold");
  doc.setFontSize(22);
  const fullNameStr = cleanText(profile.fullName).toUpperCase();
  doc.text(fullNameStr, MARGIN, startY);

  doc.setFont(FONT_HEAD, "bold");
  doc.setFontSize(11);
  const subTitle = `Recherche Alternance ${cleanText(targetJobTitle)}`;
  doc.text(subTitle, MARGIN, startY + 8);

  const rightColX = pageWidth - MARGIN - 85; 
  const valueColOffset = 28; 
  let contactY = y + 5;
  const rowHeight = 4.5;

  const drawContactRow = (label: string, displayText: string, url?: string) => {
    if (!displayText) return;
    doc.setFontSize(BASE_FONT_SIZE); 
    doc.setFont(FONT_BODY, "bold");
    doc.text(label, rightColX, contactY);
    doc.setFont(FONT_BODY, "normal");
    doc.text(displayText, rightColX + valueColOffset, contactY);
    if (url) {
      const textWidth = doc.getTextWidth(displayText);
      doc.link(rightColX + valueColOffset, contactY - 3, textWidth, 4, { url: url });
    }
    contactY += rowHeight;
  };

  drawContactRow("Email:", profile.email);
  drawContactRow("LinkedIn:", "Claudel Mubenzem", profile.linkedin);
  drawContactRow("GitHub/Link:", "ClaudelMbz", profile.portfolio);
  drawContactRow("Mobile:", formatPhone(profile.phone));

  y = Math.max(startY + 15, contactY + 5);

  // 2. PROFIL
  if (profile.bio) {
     drawSectionTitle("PROFIL");
     doc.setFont(FONT_BODY, "normal");
     doc.setFontSize(BASE_FONT_SIZE);
     const bioText = cleanText(profile.bio);
     const bioLines = doc.splitTextToSize(bioText, contentWidth);
     const displayLines = bioLines.slice(0, 10); 
     const blockText = displayLines.join(' ');
     doc.text(blockText, MARGIN, y, { maxWidth: contentWidth, align: "justify" });
     y += (displayLines.length * 4.5) + 5;
  }

  // 3. FORMATION (Dates alignées sur une seule ligne)
  if (profile.education.length > 0) {
      drawSectionTitle("FORMATION");
      profile.education.forEach(edu => {
          // On construit la plage de dates pour qu'elle s'affiche sur la droite de la ligne du diplôme
          const dateRange = edu.startDate && edu.endDate 
            ? `${edu.startDate} – ${edu.endDate}` 
            : (edu.endDate || edu.startDate || "");

          drawItemHeader(
            edu.school, 
            "", // On laisse le haut droit vide pour l'école
            edu.degree, 
            dateRange // On met la plage de dates à droite de l'intitulé du diplôme (ligne 2)
          );
          y += 1; 
      });
  }

  // 4. EXPÉRIENCE PROFESSIONNELLE
  if (profile.experiences.length > 0) {
      drawSectionTitle("EXPÉRIENCE PROFESSIONNELLE");
      profile.experiences.forEach(exp => {
          const dateRange = `${exp.startDate} – ${exp.isCurrent ? "Présent" : exp.endDate}`;
          drawItemHeader(
            exp.company, 
            exp.location || "", 
            exp.role, 
            dateRange
          );
          if (exp.description) drawLeftAlignedBlock(exp.description);
      });
  }

  // 5. PROJETS & RÉALISATIONS
  if (profile.projects.length > 0) {
      drawSectionTitle("PROJETS & RÉALISATIONS");
      profile.projects.forEach(proj => {
          doc.setFont(FONT_BODY, "bold");
          doc.setFontSize(BASE_FONT_SIZE);
          checkPageBreak(8);
          doc.text(cleanText(proj.name), MARGIN, y);
          if (proj.technologies) {
             doc.setFont(FONT_BODY, "italic");
             const techText = `[${cleanText(proj.technologies)}]`;
             const techWidth = doc.getTextWidth(techText);
             doc.text(techText, pageWidth - MARGIN - techWidth, y);
          }
          y += 4.5;
          if (proj.description) drawLeftAlignedBlock(proj.description);
      });
  }

  // 6. COMPÉTENCES & INTÉRÊTS
  drawSectionTitle("COMPÉTENCES & INTÉRÊTS");
  drawSkillRow("Technique : ", profile.skills);
  drawSkillRow("Langue : ", profile.languages);
  drawSkillRow("Intérêts : ", profile.interests);

  // 7. CERTIFICATIONS
  if (Array.isArray(profile.certifications) && profile.certifications.length > 0) {
    drawSectionTitle("CERTIFICATIONS");
    profile.certifications.forEach(cert => {
      drawItemHeader(cert.name, cert.date || "", cert.issuer || "", "");
      if (cert.description) {
        doc.setFont(FONT_BODY, "normal");
        doc.setFontSize(BASE_FONT_SIZE - 1);
        const descLines = doc.splitTextToSize(cleanText(cert.description), contentWidth);
        doc.text(descLines, MARGIN, y);
        y += (descLines.length * 4) + 2;
      }
    });
  }

  doc.save(`CV_${cleanText(profile.fullName).replace(/\s+/g, '_')}_Elite.pdf`);
};

export const downloadLetterPdf = (profile: MasterProfile, company: string, jobTitle: string, content: string) => {
    const doc = new jsPDF();
    const margin = 20;
    let y = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - margin * 2;
    let finalBody = cleanText(content);
    let finalSubject = `Objet : Candidature pour le poste de ${cleanText(jobTitle)}`;
    const subjectRegex = /^(Objet\s?:.*)$/m;
    const match = finalBody.match(subjectRegex);
    if (match) {
        finalSubject = cleanText(match[1]);
        finalBody = finalBody.replace(match[0], '').trim();
    }
    const date = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Le ${date}`, pageWidth - margin - 40, y, { align: 'right' });
    y += 15;
    doc.setFont("helvetica", "bold");
    doc.text("À l'attention du recruteur", margin, y);
    y += 5;
    if (company && String(company).toLowerCase() !== "source web") {
        doc.text(cleanText(company), margin, y);
        y += 15;
    } else y += 10;
    doc.text(finalSubject, margin, y);
    y += 15;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const lines = finalBody.split('\n');
    lines.forEach(p => {
        if(p.trim()) {
            const dims = doc.getTextDimensions(p, { maxWidth: contentWidth });
            const pHeight = dims.h + 2; 
            if (y + pHeight > doc.internal.pageSize.getHeight() - margin) { doc.addPage(); y = margin; }
            doc.text(p.trim(), margin, y, { maxWidth: contentWidth, align: "justify" });
            y += pHeight + 3; 
        }
    });
    doc.save(`Lettre_${cleanText(profile.fullName).split(' ')[0]}.pdf`);
};