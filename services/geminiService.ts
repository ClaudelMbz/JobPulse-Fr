import { GoogleGenAI, Type } from "@google/genai";
import { JobSearchResult } from "../types";

// Initialize Gemini Client
// We assume process.env.API_KEY is available as per instructions.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const STRATEGY_MODEL = "gemini-2.5-flash";
const SEARCH_MODEL = "gemini-2.5-flash"; 

/**
 * Searches for jobs using Google Search Grounding.
 * This effectively implements "Method 3" (AI Agents).
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
        company: "Source Web", // Generic since search result might not isolate company name perfectly
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
 * Chat with the "Career Strategist" persona.
 */
export const chatWithStrategist = async (history: {role: string, parts: {text: string}[]}[], message: string) => {
  try {
    const chat = ai.chats.create({
      model: STRATEGY_MODEL,
      history: history,
      config: {
        systemInstruction: `Tu es un expert mondial en recrutement technique et stratégie de recherche d'emploi, spécialisé sur le marché français. 
        Ton but est d'aider l'utilisateur à construire un système "massif" pour trouver des alternances, stages et jobs étudiants.
        Tu es pragmatique, direct, et tu préfères les solutions techniques modernes (Automation, AI Agents) aux méthodes traditionnelles.
        Tu analyses les méthodes (Scraping vs API vs AI) avec lucidité.
        `,
      },
    });

    const result = await chat.sendMessage({ message });
    return result.text;
  } catch (error) {
    console.error("Error in chat:", error);
    throw error;
  }
};