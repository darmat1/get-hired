export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  linkedin?: string;
  github?: string;
  telegram?: string;
  avatarUrl?: string;
  summary: string;
}

export interface WorkExperienceAnalysis {
  score: number;
  scoreLabel: string;
  summary: string;
  contentHash: string;
  analyzedAt: string;
  red?: Array<{ field: string; issue: string; recommendation: string }>;
  yellow?: Array<{ field: string; issue: string; recommendation: string }>;
  green?: Array<{ field: string; strength: string }>;
}

export interface WorkExperience {
  id: string;
  title: string;
  company: string;
  location: string;
  employmentType?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  mainDescription?: string;
  description: string[];
  analysis?: WorkExperienceAnalysis;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  gpa?: string;
}

export interface Skill {
  id: string;
  name: string;
  category: "technical" | "soft" | "language";
  level:
    | "beginner"
    | "elementary"
    | "pre-intermediate"
    | "intermediate"
    | "upper-intermediate"
    | "advanced"
    | "fluent"
    | "proficient"
    | "expert"
    | "native";
}

export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url?: string;
}

export interface Resume {
  id: string;
  personalInfo: PersonalInfo;
  workExperience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  certificates: Certificate[];
  template: string;
  customization?: {
    sidebarColor?: string;
    showAvatar?: boolean;
    showPhone?: boolean;
    showEmail?: boolean;
    showAddress?: boolean;
    showLinkedin?: boolean;
    showGithub?: boolean;
    showWebsite?: boolean;
    showTelegram?: boolean;
  };
  language: string;
  targetPosition?: string;
  targetCompany?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LinkedInProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  headline: string;
  summary: string;
  location: string;
  experience: {
    title: string;
    company: string;
    location?: string;
    startDate: string;
    endDate?: string;
    description: string;
  }[];
  education: {
    institution: string;
    degree: string;
    field?: string;
    startDate: string;
    endDate?: string;
  }[];
  skills: string[];
}
