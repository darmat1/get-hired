export type MatchLabel = "Poor" | "Fair" | "Good" | "Great" | "Excellent";
export type SuggestionPriority = "high" | "medium" | "low";
export type ResumeSection = "summary" | "experience" | "skills" | "education";

export interface JobMatchSuggestion {
  section: ResumeSection;
  priority: SuggestionPriority;
  suggestion: string;
  example?: string;
}

export interface JobMatch {
  matchScore: number;
  matchLabel: MatchLabel;
  summary: string;
  presentKeywords: string[];
  missingKeywords: string[];
  suggestions: JobMatchSuggestion[];
}
