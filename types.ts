
export enum AppView {
  STRATEGY = 'STRATEGY',
  SEARCH = 'SEARCH',
  CHAT = 'CHAT',
  PROFILE = 'PROFILE'
}

export interface JobMethod {
  id: string;
  title: string;
  description: string;
  pros: string[];
  cons: string[];
  rating: number; // 1-5
  recommended?: boolean;
}

export interface JobSearchResult {
  title: string;
  company: string;
  location: string;
  url: string;
  snippet: string;
  source: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

// --- MASTER PROFILE STRUCTURE ---

export interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string; // YYYY-MM
  endDate: string; // YYYY-MM or empty if current
  isCurrent: boolean;
  description: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string; // Comma separated string for simplicity in UI
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  startDate: string; // YYYY-MM
  endDate: string; // YYYY-MM
}

export interface MasterProfile {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  portfolio: string;
  bio: string; // The "About me" generic text
  skills: string; // Comma separated for simplicity
  experiences: Experience[];
  projects: Project[];
  education: Education[];
}

// --- GENERATED APPLICATION PACKAGE (STEP 3) ---

export interface ApplicationPackage {
  matchScore: number; // 0-100
  missingSkills: string[];
  optimizedProfile: MasterProfile; // The profile rewritten for the job
  coverLetter: string; // Markdown content
  analysis: string; // Brief explanation of the strategy used
}
