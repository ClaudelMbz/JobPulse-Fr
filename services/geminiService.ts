import { GoogleGenAI, Type } from "@google/genai";
import { JobSearchResult, MasterProfile, ApplicationPackage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const SEARCH_MODEL = "gemini-3-flash-preview"; 
const GENERATION_MODEL = "gemini-3-pro-preview";

export const searchJobsWithGemini = async (
  query: string, 
  location: string = "France",
  mode: 'standard' | 'deep' = 'standard'
): Promise<{ text: string; links: JobSearchResult[] }> => {
  try {
    let fullQuery = "";
    if (mode === 'deep') {
      fullQuery = `
        Utilise Google Search pour trouver des URLs spécifiques correspondant à cette requête booléenne (Google Dorking).
        REQUÊTE CIBLE : (site:lever.co OR site:greenhouse.io OR site:bamboohr.com OR site:workable.com OR site:smartrecruiters.com OR site:welcometothejungle.com) AND "${query}" AND "${location}"
        INSTRUCTIONS : 1. Cherche des pages récentes. 2. Extrais les liens directs vers ces offres. 3. Résume les tendances.
      `;
    } else {
      fullQuery = `Trouve des offres récentes pour: ${query} à ${location}. Liste les offres spécifiques.`;
    }
    const response = await ai.models.generateContent({
      model: SEARCH_MODEL,
      contents: fullQuery,
      config: { tools: [{ googleSearch: {} }] },
    });
    const text = response.text || "Aucun résultat trouvé.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const links: JobSearchResult[] = chunks
      .filter((c: any) => c.web && c.web.uri && c.web.title)
      .map((c: any) => {
        const url = c.web.uri;
        let source = new URL(url).hostname.replace('www.', '');
        if (url.includes('lever.co')) source = "ATS (Lever)";
        else if (url.includes('greenhouse.io')) source = "ATS (Greenhouse)";
        else if (url.includes('wttj')) source = "Welcome To The Jungle";
        return { title: c.web.title, url, company: "Voir l'offre", location, snippet: mode === 'deep' ? "ATS DIRECT" : "Recherche standard", source };
      });
    return { text, links };
  } catch (error) { console.error("Error searching jobs:", error); throw error; }
};

export const generateApplicationPackage = async (
  profile: MasterProfile,
  job: JobSearchResult,
  fullDescription?: string
): Promise<ApplicationPackage> => {
  try {
    const hasFullDescription = !!fullDescription && fullDescription.length > 50;
    const DEFAULT_LANGUAGES = "Francais ( Natif ), Anglais (Courant)";
    const DEFAULT_INTERESTS = "Sport (Foot, Basket), Lecture, Internet, Méditation, Musique";
    const prompt = `
      CONTEXTE: Expert en recrutement. Adapte le "Master Profile" pour l'offre cible.
      OFFRE: ${job.title} chez ${job.company}. ${hasFullDescription ? `DESC: ${fullDescription}` : `SNIPPET: ${job.snippet}`}
      CANDIDAT: ${JSON.stringify(profile)}
      MISSION:
      1. Analyse le Gap.
      2. Réécriture Bio: 5-7 lignes max. Inclure "Rythme d'alternance : 3 mois / 3 mois la première année et 6 mois / 6 mois la deuxième."
      3. Reformule expériences.
      4. Skills Techniques uniquement dans 'skills'.
      5. Préserve Langues, Intérêts et Certifications (array d'objets).
      6. Lettre de motivation pro.
      FORMAT: JSON { matchScore, missingSkills, optimizedProfile, coverLetter, analysis }
    `;
    const response = await ai.models.generateContent({
      model: GENERATION_MODEL,
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });
    let resultText = response.text;
    if (!resultText) throw new Error("No response");
    resultText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(resultText) as ApplicationPackage;
    if (!data.optimizedProfile) data.optimizedProfile = profile;
    if (data.optimizedProfile) {
        if (Array.isArray(data.optimizedProfile.skills)) data.optimizedProfile.skills = (data.optimizedProfile.skills as any).join(', ');
        data.optimizedProfile.languages = profile.languages || DEFAULT_LANGUAGES;
        data.optimizedProfile.interests = profile.interests || DEFAULT_INTERESTS;
        // Ensure certifications is carried over correctly as an array
        data.optimizedProfile.certifications = Array.isArray(profile.certifications) ? profile.certifications : [];
        if (!data.optimizedProfile.availability) data.optimizedProfile.availability = profile.availability;
    }
    return data;
  } catch (error) { console.error("Error generating application:", error); throw error; }
};