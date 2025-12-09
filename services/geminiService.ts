import { GoogleGenAI, Type } from "@google/genai";
import { JobSearchResult, MasterProfile, ApplicationPackage } from "../types";

// Initialize Gemini Client
// We assume process.env.API_KEY is available as per instructions.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const STRATEGY_MODEL = "gemini-2.5-flash";
const SEARCH_MODEL = "gemini-2.5-flash"; 
const GENERATION_MODEL = "gemini-2.5-flash"; // Using Flash for speed/cost efficiency for text gen

/**
 * Searches for jobs using Google Search Grounding.
 */
export const searchJobsWithGemini = async (
  query: string, 
  location: string = "France"
): Promise<{ text: string; links: JobSearchResult[] }> => {
  try {
    const fullQuery = `Trouve des offres récentes pour: ${query} à ${location}. 
    Concentre-toi sur les sites d'emploi, LinkedIn, Welcome to the Jungle, et les sites carrières. 
    Liste les offres spécifiques.`;

    const response = await ai.models.generateContent({
      model: SEARCH_MODEL,
      contents: fullQuery,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "Aucun résultat textuel trouvé.";
    
    // Extract grounding chunks to get clean links
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const links: JobSearchResult[] = chunks
      .filter((c: any) => c.web && c.web.uri && c.web.title)
      .map((c: any) => ({
        title: c.web.title,
        url: c.web.uri,
        company: "Source Web", 
        location: location,
        snippet: "Lien trouvé via Google Search Grounding",
        source: new URL(c.web.uri).hostname
      }));

    return { text, links };

  } catch (error) {
    console.error("Error searching jobs:", error);
    throw error;
  }
};

/**
 * STEP 3: The Brain.
 * Generates a tailored application package (CV content + Cover Letter) based on the Master Profile and the Job.
 * NOW SUPPORTS FULL DESCRIPTION INJECTION.
 */
export const generateApplicationPackage = async (
  profile: MasterProfile,
  job: JobSearchResult,
  fullDescription?: string
): Promise<ApplicationPackage> => {
  try {
    const hasFullDescription = !!fullDescription && fullDescription.length > 50;
    
    const prompt = `
      CONTEXTE:
      Tu es un expert en recrutement et ATS (Applicant Tracking Systems).
      Ton objectif est d'adapter le "Master Profile" d'un candidat pour qu'il corresponde parfaitement à l'offre d'emploi cible.

      INPUT DONNÉES:
      1. OFFRE D'EMPLOI:
      Titre: ${job.title}
      Entreprise: ${job.company}
      
      ${hasFullDescription 
        ? `DESCRIPTION COMPLÈTE (SOURCE FIABLE FOURNIE PAR L'UTILISATEUR) :\n${fullDescription}\n\nINSTRUCTION IMPORTANTE: Utilise EXCLUSIVEMENT cette description pour l'analyse des compétences. Sois très précis sur les outils et technos demandés.` 
        : `Snippet/Résumé (Moins précis): ${job.snippet}\n(Note: Comme nous n'avons que le snippet, déduis les compétences standards pour ce type de poste).`
      }

      2. MASTER PROFILE CANDIDAT (JSON):
      ${JSON.stringify(profile)}

      TA MISSION:
      1. Analyse le "Gap" (Compétences manquantes).
      
      2. **RÉÉCRITURE DU PROFIL (Bio/Résumé)** :
         - TEXTE DE BASE : Utilise le contenu du champ 'bio' du Master Profile.
         - **CONTRAINTE ABSOLUE DE LONGUEUR : Résume ce texte pour qu'il tienne en MAXIMUM 5 à 7 lignes sur le PDF.** Sois extrêmement concis et percutant. Coupe les phrases superflues.
         - OBLIGATOIRE : La phrase suivante doit apparaître (tu peux l'adapter légèrement pour la fluidité mais les infos doivent y être) : "Rythme d'alternance : 3 mois / 3 mois la première année et 6 mois / 6 mois la deuxième."
         - TON : Direct, professionnel, orienté résultats.

      3. Sélectionne et reformule les expériences pour mettre en avant ce qui compte pour CE poste.
      
      4. **Compétences Techniques (Skills):**
         - CRUCIAL : Dans le champ 'skills', mets UNIQUEMENT les compétences TECHNIQUES (Langages de programmation, Outils, Logiciels).
         - Ne mets PAS les Langues parlées ni les Soft Skills ici.
         - FILTRE pour ne garder que les 8-12 compétences techniques les plus pertinentes pour CETTE offre.
         - Si une compétence technique clé est demandée dans l'offre mais absente du profil, AJOUTE-LA.

      5. **Langues et Intérêts :** Ne les modifie pas, nous utiliserons celles du profil original sauf si elles sont vides.
      
      6. Rédige une Lettre de Motivation percutante (Ton: Professionnel, Structure: Hook -> Value -> Call to Action).

      FORMAT DE RÉPONSE ATTENDU (JSON uniquement):
      {
        "matchScore": number (0-100),
        "missingSkills": string[],
        "optimizedProfile": { ...structure identique au Master Profile... },
        "coverLetter": "Texte complet de la lettre en Markdown",
        "analysis": "Brève explication de la stratégie adoptée (2 phrases)"
      }
    `;

    const response = await ai.models.generateContent({
      model: GENERATION_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    let resultText = response.text;
    if (!resultText) throw new Error("No response from AI");

    // CLEANUP: Remove Markdown code blocks if present (e.g. ```json ... ```)
    resultText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();

    const data = JSON.parse(resultText) as ApplicationPackage;
    
    // Ensure the structure is valid, fallback if needed
    if (!data.optimizedProfile) data.optimizedProfile = profile;
    
    // SAFETY: Data Normalization
    // 1. Skills: Ensure it's a string, not an array
    if (data.optimizedProfile) {
        if (Array.isArray(data.optimizedProfile.skills)) {
            data.optimizedProfile.skills = (data.optimizedProfile.skills as any).join(', ');
        }
        
        // 2. Fallback for Languages: If AI drops them, put original ones back
        if (!data.optimizedProfile.languages || String(data.optimizedProfile.languages).length < 3) {
            data.optimizedProfile.languages = profile.languages;
        }

        // 3. Fallback for Interests: If AI drops them, put original ones back
        if (!data.optimizedProfile.interests || String(data.optimizedProfile.interests).length < 3) {
            data.optimizedProfile.interests = profile.interests;
        }
        
        // 4. Preserve Availability: AI usually doesn't return this field as it focuses on rewrites, so copy from master
        if (!data.optimizedProfile.availability) {
            data.optimizedProfile.availability = profile.availability;
        }
    }
    
    return data;

  } catch (error) {
    console.error("Error generating application:", error);
    throw error;
  }
};