export enum AppView {
  STRATEGY = 'STRATEGY',
  SEARCH = 'SEARCH',
  CHAT = 'CHAT',
  PROFILE = 'PROFILE',
  SCRAPER = 'SCRAPER'
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
  location?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  startDate: string; // YYYY-MM
  endDate: string; // YYYY-MM
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  description?: string;
}

export interface MasterProfile {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  portfolio: string;
  bio: string;
  availability: string;
  skills: string;
  languages: string;
  interests: string;
  certifications: Certification[];
  experiences: Experience[];
  projects: Project[];
  education: Education[];
}

// --- GENERATED APPLICATION PACKAGE (STEP 3) ---

export interface ApplicationPackage {
  matchScore: number;
  missingSkills: string[];
  optimizedProfile: MasterProfile;
  coverLetter: string;
  analysis: string;
}