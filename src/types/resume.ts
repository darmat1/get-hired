export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  linkedin?: string;
  telegram?: string;
  avatarUrl?: string;
  summary: string;
}

export interface WorkExperience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string[];
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
  level: "beginner" | "elementary" | "intermediate" | "advanced" | "expert";
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
    showTelegram?: boolean;
  };
  language: string;
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
