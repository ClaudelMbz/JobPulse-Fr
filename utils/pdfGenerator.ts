import { jsPDF } from "jspdf";
import { MasterProfile } from "../types";

// --- HARVARD STYLE CONSTANTS ---
const MARGIN = 15; // mm
const LINE_HEIGHT_FACTOR = 1.2;
const FONT_BODY = "helvetica";
const FONT_HEAD = "helvetica";

// --- HELPER: CLEAN MARKDOWN ---
const cleanText = (text: any): string => {
  if (text === null || text === undefined) return "";
  // Ensure we are working with a string, even if AI returns number or object
  const str = String(text);
  return str
    .replace(/\*\*/g, '')   // Remove bold markdown
    .replace(/__/g, '')     // Remove italic markdown
    .replace(/^#+\s/gm, '') // Remove headers
    .trim();
};

export const downloadCvPdf = (profile: MasterProfile, targetJobTitle: string) => {
  const doc = new jsPDF();
  let y = 15;
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
    y += 5; // Space after line
  };

  const drawSectionTitle = (title: string) => {
    checkPageBreak(15);
    y += 4;
    doc.setFont(FONT_HEAD, "bold");
    doc.setFontSize(11);
    doc.text(title.toUpperCase(), MARGIN, y);
    drawLine();
  };

  const drawItemHeader = (leftBold: string, rightRegular: string, leftItalic?: string, rightRegular2?: string) => {
    checkPageBreak(10);
    doc.setFontSize(10);
    
    // Line 1: Organization + Location
    doc.setFont(FONT_BODY, "bold");
    doc.text(cleanText(leftBold), MARGIN, y);
    
    if (rightRegular) {
      doc.setFont(FONT_BODY, "normal");
      const dateWidth = doc.getTextWidth(cleanText(rightRegular));
      doc.text(cleanText(rightRegular), pageWidth - MARGIN - dateWidth, y);
    }
    y += 4.5;

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

  const drawBullets = (text: string) => {
     doc.setFont(FONT_BODY, "normal");
     doc.setFontSize(10);
     
     // 1. Clean Markdown first
     let rawContent = cleanText(text);

     // 2. Logic: If text has explicit bullets, try to respect them. 
     // Otherwise, wrap as block.
     
     const width = contentWidth; // Full width for block text
     
     const splitText = doc.splitTextToSize(rawContent, width);
     
     checkPageBreak(splitText.length * 4);
     
     splitText.forEach((line: string) => {
        doc.text(line, MARGIN, y); 
        y += 4;
     });
     y += 2; // Spacing after block
  };

  const drawSkillRow = (label: string, content: any) => {
    if (!content) return;
    // Don't draw if content string is basically empty
    if (String(content).trim().length === 0) return;

    checkPageBreak(10);
    doc.setFontSize(10);
    
    // Label (Bold)
    doc.setFont(FONT_BODY, "bold");
    doc.text(label, MARGIN, y);
    const labelWidth = doc.getTextWidth(label);
    
    // Content (Normal, wrapping)
    doc.setFont(FONT_BODY, "normal");
    
    // SAFETY: Handle array or string
    let contentStr = "";
    if (Array.isArray(content)) {
        contentStr = content.join(', ');
    } else {
        contentStr = String(content);
    }
    
    // Clean and replace newlines with commas
    let cleanContent = cleanText(contentStr).replace(/\n/g, ', ').replace(/\s+,/g, ','); 
    
    const textLines = doc.splitTextToSize(cleanContent, contentWidth - labelWidth);
    doc.text(textLines, MARGIN + labelWidth, y);
    y += textLines.length * 4.5;
  };

  // --- DOCUMENT CONTENT ---

  // 1. HEADER (Centered)
  doc.setFont(FONT_HEAD, "bold");
  doc.setFontSize(14); 
  const nameStr = cleanText(profile.fullName).toUpperCase();
  const nameWidth = doc.getTextWidth(nameStr);
  doc.text(nameStr, (pageWidth - nameWidth) / 2, y);
  y += 6;

  // 1.5 AVAILABILITY (HEADLINE)
  if (profile.availability) {
      doc.setFont(FONT_HEAD, "bold");
      doc.setFontSize(10);
      const availStr = cleanText(profile.availability).toUpperCase();
      const availWidth = doc.getTextWidth(availStr);
      doc.text(availStr, (pageWidth - availWidth) / 2, y);
      y += 5;
  }

  doc.setFont(FONT_BODY, "normal");
  doc.setFontSize(10);
  
  // Contact Info Line 1
  const contactParts = [];
  if (profile.location) contactParts.push(cleanText(profile.location));
  if (profile.email) contactParts.push(cleanText(profile.email));
  if (profile.phone) contactParts.push(cleanText(profile.phone));
  
  const contactLine1 = contactParts.join(" • ");
  const c1Width = doc.getTextWidth(contactLine1);
  doc.text(contactLine1, (pageWidth - c1Width) / 2, y);
  y += 4;

  // Contact Info Line 2 (Links)
  const linkParts = [];
  if (profile.linkedin) linkParts.push(cleanText(profile.linkedin).replace(/^https?:\/\//, ''));
  if (profile.portfolio) linkParts.push(cleanText(profile.portfolio).replace(/^https?:\/\//, ''));
  
  if (linkParts.length > 0) {
      const contactLine2 = linkParts.join(" • ");
      const c2Width = doc.getTextWidth(contactLine2);
      doc.text(contactLine2, (pageWidth - c2Width) / 2, y);
      y += 4;
  }
  y += 5; 

  // 2. SUMMARY (PROFIL) - Now Mandatory
  if (profile.bio) {
     drawSectionTitle("PROFIL");
     // Justify text for bio
     doc.setFont(FONT_BODY, "normal");
     doc.setFontSize(10);
     const bioLines = doc.splitTextToSize(cleanText(profile.bio), contentWidth);
     checkPageBreak(bioLines.length * 4);
     bioLines.forEach((line: string) => {
        doc.text(line, MARGIN, y);
        y += 4;
     });
     y += 2;
  }

  // 3. EDUCATION -> FORMATION
  if (profile.education.length > 0) {
      drawSectionTitle("FORMATION");
      profile.education.forEach(edu => {
          drawItemHeader(
              edu.school, 
              edu.endDate ? `Diplômé: ${edu.endDate}` : "", 
              edu.degree, 
              edu.startDate 
          );
          y += 2; 
      });
  }

  // 4. EXPERIENCE -> EXPÉRIENCE PROFESSIONNELLE
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
              drawBullets(exp.description);
          }
      });
  }

  // 5. PROJECTS -> PROJETS & RÉALISATIONS
  if (profile.projects.length > 0) {
      drawSectionTitle("PROJETS & RÉALISATIONS");
      profile.projects.forEach(proj => {
          doc.setFont(FONT_BODY, "bold");
          doc.setFontSize(10);
          checkPageBreak(10);
          
          doc.text(cleanText(proj.name), MARGIN, y);
          
          if (proj.technologies) {
             doc.setFont(FONT_BODY, "italic");
             const techText = `[${cleanText(proj.technologies)}]`;
             const techWidth = doc.getTextWidth(techText);
             doc.text(techText, pageWidth - MARGIN - techWidth, y);
          }
          y += 4.5;
          
          if (proj.description) {
              drawBullets(proj.description);
          }
      });
  }

  // 6. SKILLS & INTERESTS -> COMPÉTENCES & INTÉRÊTS
  // Check if we have any data to show
  if (profile.skills || profile.languages || profile.interests) {
      drawSectionTitle("COMPÉTENCES & INTÉRÊTS");
      
      // Explicitly separate Technical, Languages, and Interests
      drawSkillRow("Technique : ", profile.skills);
      drawSkillRow("Langue : ", profile.languages);
      drawSkillRow("Intérêts : ", profile.interests);
  }

  doc.save(`CV_${cleanText(profile.fullName).replace(/\s+/g, '_')}_Harvard.pdf`);
};

export const downloadLetterPdf = (profile: MasterProfile, company: string, jobTitle: string, content: string) => {
    const doc = new jsPDF();
    const margin = 20;
    let y = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - margin * 2;

    // --- PRE-PROCESSING CONTENT ---
    let finalBody = cleanText(content);
    
    // 1. Extract Subject if present
    let finalSubject = `Objet : Candidature pour le poste de ${cleanText(jobTitle)}`;
    const subjectRegex = /^(Objet\s?:.*)$/m;
    const match = finalBody.match(subjectRegex);
    
    if (match) {
        finalSubject = cleanText(match[1]);
        finalBody = finalBody.replace(match[0], '').trim();
    }

    // --- CLEANUP SUBJECT ---
    // Remove the user's name if it appears at the end of the subject line
    finalSubject = finalSubject.replace(/[-–—]\s*Claudel\s+Mubenzem$/i, '').trim();
    // Remove "Candidature Spontanée" if it appears (we are applying to specific job)
    finalSubject = finalSubject.replace(/Candidature\s+Spontanée\s*[-–—]?\s*/i, '').trim();
    // Clean up any trailing dashes
    finalSubject = finalSubject.replace(/[-–—]$/, '').trim();


    // 2. Remove Duplicate Signatures (Cordialement...)
    // Looks for closing salutations at the end of the text and removes them to avoid doubling up with the static signature below.
    const closingRegex = /(Cordialement|Bien à vous|Sincères salutations|Salutations distinguées|Respectueusement),?(\s+.*)?$/i;
    finalBody = finalBody.replace(closingRegex, '').trim();

    // --- DATE ---
    const date = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Le ${date}`, pageWidth - margin - 40, y, { align: 'right' });
    y += 15;

    // --- RECIPIENT ---
    doc.setFont("helvetica", "bold");
    doc.text("À l'attention du recruteur", margin, y);
    y += 5;
    
    // Only print company if valid and NOT "Source Web"
    if (company && String(company).toLowerCase() !== "source web") {
        doc.text(cleanText(company), margin, y);
        y += 15;
    } else {
        y += 10; 
    }

    // --- SUBJECT ---
    doc.setFont("helvetica", "bold");
    doc.text(finalSubject, margin, y);
    y += 15;

    // --- BODY (Justified) ---
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    
    const paragraphs = finalBody.split('\n');

    paragraphs.forEach(p => {
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

    // --- SIGNATURE ---
    y += 10;
    if (y + 20 > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
    }
    doc.text("Cordialement,", margin, y);
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text(cleanText(profile.fullName), margin, y);

    doc.save(`Lettre_${cleanText(profile.fullName).split(' ')[0]}.pdf`);
};