import { jsPDF } from "jspdf";
import { MasterProfile } from "../types";

// --- HARVARD STYLE CONSTANTS ---
// OPTIMIZED FOR 1 PAGE: Margins 14mm, font size 10pt
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

export const downloadCvPdf = (profile: MasterProfile, targetJobTitle: string) => {
  const doc = new jsPDF();
  let y = MARGIN; // Start higher
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
    doc.setLineWidth(0.5);
    doc.line(MARGIN, y + 1, pageWidth - MARGIN, y + 1);
    y += 7; // Increased space after line (was 4) to separate title from content
  };

  const drawSectionTitle = (title: string) => {
    checkPageBreak(12);
    y += 3;
    doc.setFont(FONT_HEAD, "bold");
    doc.setFontSize(BASE_FONT_SIZE + 1); // Slightly larger than body
    doc.text(title.toUpperCase(), MARGIN, y);
    drawLine();
  };

  const drawItemHeader = (leftBold: string, rightRegular: string, leftItalic?: string, rightRegular2?: string) => {
    checkPageBreak(9);
    doc.setFontSize(BASE_FONT_SIZE);
    
    // Line 1: Organization + Location
    doc.setFont(FONT_BODY, "bold");
    doc.text(cleanText(leftBold), MARGIN, y);
    
    if (rightRegular) {
      doc.setFont(FONT_BODY, "normal");
      const dateWidth = doc.getTextWidth(cleanText(rightRegular));
      doc.text(cleanText(rightRegular), pageWidth - MARGIN - dateWidth, y);
    }
    y += 4.5; // Adjusted for font size 10

    // Line 2: Role + Date (Optional)
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

  // Standard Justified Block
  const drawJustifiedBlock = (text: string) => {
     doc.setFont(FONT_BODY, "normal");
     doc.setFontSize(BASE_FONT_SIZE);
     
     const rawContent = cleanText(text);
     
     const dims = doc.getTextDimensions(rawContent, { maxWidth: contentWidth });
     const heightNeeded = dims.h + 2;
     
     checkPageBreak(heightNeeded);
     
     doc.text(rawContent, MARGIN, y, { maxWidth: contentWidth, align: "justify" });
     
     y += heightNeeded + 2; 
  };

  // Left Aligned Block (For Projects & Experiences)
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
    // SECURITY: Draw even if empty to show where data should be, but content is guaranteed by service now
    const safeContent = content ? String(content) : "";
    if (safeContent.trim().length === 0) return;

    checkPageBreak(8);
    doc.setFontSize(BASE_FONT_SIZE);
    
    doc.setFont(FONT_BODY, "bold");
    doc.text(label, MARGIN, y);
    const labelWidth = doc.getTextWidth(label);
    
    doc.setFont(FONT_BODY, "normal");
    
    let contentStr = safeContent;
    // Replace newlines with commas
    let cleanContent = cleanText(contentStr).replace(/\n/g, ', ').replace(/\s+,/g, ','); 
    
    const textLines = doc.splitTextToSize(cleanContent, contentWidth - labelWidth);
    doc.text(textLines, MARGIN + labelWidth, y);
    y += textLines.length * 4.5; // Adjusted spacing
  };

  // --- DOCUMENT CONTENT ---

  // 1. HEADER
  doc.setFont(FONT_HEAD, "bold");
  doc.setFontSize(15); 
  const nameStr = cleanText(profile.fullName).toUpperCase();
  const nameWidth = doc.getTextWidth(nameStr);
  doc.text(nameStr, (pageWidth - nameWidth) / 2, y);
  y += 6;

  // 1.5 DYNAMIC HEADLINE
  doc.setFont(FONT_HEAD, "bold");
  doc.setFontSize(11);
  const headline = `ÉLÈVE INGÉNIEUR, RECHERCHE ALTERNANCE ${cleanText(targetJobTitle).toUpperCase()}`;
  const headlineWidth = doc.getTextWidth(headline);
  doc.text(headline, (pageWidth - headlineWidth) / 2, y);
  y += 6;

  doc.setFont(FONT_BODY, "normal");
  doc.setFontSize(BASE_FONT_SIZE);
  
  // Contact Info
  const contactParts = [];
  if (profile.location) contactParts.push(cleanText(profile.location));
  if (profile.email) contactParts.push(cleanText(profile.email));
  if (profile.phone) contactParts.push(cleanText(profile.phone));
  
  const contactLine1 = contactParts.join(" • ");
  const c1Width = doc.getTextWidth(contactLine1);
  doc.text(contactLine1, (pageWidth - c1Width) / 2, y);
  y += 5;

  const linkParts = [];
  if (profile.linkedin) linkParts.push(cleanText(profile.linkedin).replace(/^https?:\/\//, ''));
  if (profile.portfolio) linkParts.push(cleanText(profile.portfolio).replace(/^https?:\/\//, ''));
  
  if (linkParts.length > 0) {
      const contactLine2 = linkParts.join(" • ");
      const c2Width = doc.getTextWidth(contactLine2);
      doc.text(contactLine2, (pageWidth - c2Width) / 2, y);
      y += 5;
  }
  y += 5; 

  // 2. PROFIL
  if (profile.bio) {
     drawSectionTitle("PROFIL");
     drawJustifiedBlock(profile.bio); 
  }

  // 3. FORMATION (Compact)
  if (profile.education.length > 0) {
      drawSectionTitle("FORMATION");
      profile.education.forEach(edu => {
          drawItemHeader(
              edu.school, 
              edu.endDate ? `Diplômé: ${edu.endDate}` : "", 
              edu.degree, 
              edu.startDate 
          );
          y += 1; 
      });
  }

  // 4. EXPÉRIENCE PROFESSIONNELLE
  if (profile.experiences.length > 0) {
      drawSectionTitle("EXPÉRIENCE PROFESSIONNELLE");
      profile.experiences.forEach(exp => {
          drawItemHeader(
              exp.company,
              exp.location || "", 
              exp.role,
              `${exp.startDate} – ${exp.isCurrent ? "Présent" : exp.endDate}`
          );
          if (exp.description) {
              // CHANGED: Use Left Aligned Block instead of Justified
              drawLeftAlignedBlock(exp.description);
          }
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
          
          if (proj.description) {
              drawLeftAlignedBlock(proj.description); // Left aligned
          }
      });
  }

  // 6. COMPÉTENCES & INTÉRÊTS
  drawSectionTitle("COMPÉTENCES & INTÉRÊTS");
  
  drawSkillRow("Technique : ", profile.skills);
  drawSkillRow("Langue : ", profile.languages);
  drawSkillRow("Intérêts : ", profile.interests);

  doc.save(`CV_${cleanText(profile.fullName).replace(/\s+/g, '_')}_Harvard.pdf`);
};

export const downloadLetterPdf = (profile: MasterProfile, company: string, jobTitle: string, content: string) => {
    const doc = new jsPDF();
    const margin = 20;
    let y = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - margin * 2;

    let finalBody = cleanText(content);
    
    // Extract Subject
    let finalSubject = `Objet : Candidature pour le poste de ${cleanText(jobTitle)}`;
    const subjectRegex = /^(Objet\s?:.*)$/m;
    const match = finalBody.match(subjectRegex);
    
    if (match) {
        finalSubject = cleanText(match[1]);
        finalBody = finalBody.replace(match[0], '').trim();
    }

    // Cleanup Subject - REMOVE "Candidature Spontanée" aggressive filtering
    // Remove "Objet :" prefix temporarily
    let subjectContent = finalSubject.replace(/^Objet\s*:\s*/i, '');
    
    // Remove "Candidature Spontanée" and separators (– - —) or "pour le poste de"
    subjectContent = subjectContent.replace(/^Candidature\s+Spontanée\s*(?:[-–—]|pour\s+le\s+poste\s+de)?\s*/i, '');
    
    // Clean trailing name
    subjectContent = subjectContent.replace(/[-–—]\s*Claudel\s+Mubenzem$/i, '');
    
    // Clean trailing separators
    subjectContent = subjectContent.replace(/[-–—]\s*$/g, '').trim();

    // Reassemble
    finalSubject = `Objet : ${subjectContent}`;


    // REMOVED HARDCODED SIGNATURE BLOCK AS REQUESTED

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
    } else {
        y += 10; 
    }

    doc.setFont("helvetica", "bold");
    doc.text(finalSubject, margin, y);
    y += 15;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    
    // Clean up content footer (Emails, Phones, URLs at the end)
    const lines = finalBody.split('\n');
    const cleanLines = [];
    
    // We rebuild the lines, but we stop if we hit what looks like a contact block at the end
    // Strategy: Reverse scan to drop contact info
    let dropMode = true;
    for (let i = lines.length - 1; i >= 0; i--) {
       const line = lines[i].trim();
       if (dropMode) {
          // If line is empty, ignore
          if (!line) continue;
          
          // If line looks like contact info, drop it
          const isContact = /(@|www\.|https?:|\+?\d[\d\s\-\.]{8,})/.test(line);
          const isName = line.toLowerCase().includes(profile.fullName.toLowerCase());
          const isCordialement = /Cordialement|Bien à vous|Sincèrement/i.test(line);

          if (isContact) {
             continue; // Drop contact info
          } 
          
          // If we hit the name or Cordialement, we keep it and stop dropping
          if (isName || isCordialement) {
             dropMode = false;
             cleanLines.unshift(lines[i]); // Keep this line
          } else {
             // If it's just a short word or end of sentence, maybe keep it?
             // But usually signature blocks are distinct.
             // Let's assume if we haven't found name/cordialement yet, and it's short, it might be part of signature.
             // Safe bet: if it's not contact info, keep it, but maybe we already dropped contacts.
             cleanLines.unshift(lines[i]);
             dropMode = false; // Switch off drop mode just in case we are cutting content
          }
       } else {
          cleanLines.unshift(lines[i]);
       }
    }
    
    cleanLines.forEach(p => {
        if(p.trim()) {
            const dims = doc.getTextDimensions(p, { maxWidth: contentWidth });
            const pHeight = dims.h + 2; 

            if (y + pHeight > doc.internal.pageSize.getHeight() - margin) {
                doc.addPage();
                y = margin;
            }
            
            doc.text(p.trim(), margin, y, { maxWidth: contentWidth, align: "justify" });
            y += pHeight + 3; 
        }
    });

    doc.save(`Lettre_${cleanText(profile.fullName).split(' ')[0]}.pdf`);
};