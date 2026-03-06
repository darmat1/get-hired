export interface ResumeScoreIssue {
  field: string;
  issue: string;
  recommendation?: string;
  strength?: string;
}

export interface ResumeScore {
  score: number;
  scoreLabel: "Weak" | "Fair" | "Good" | "Strong" | "Excellent";
  summary: string;
  red: ResumeScoreIssue[];
  yellow: ResumeScoreIssue[];
  green: ResumeScoreIssue[];
}

export interface CompanyScoreIssue {
  field: string;
  issue: string;
  recommendation: string;
}

export interface CompanyScore {
  score: number;
  scoreLabel: "Weak" | "Fair" | "Good" | "Strong" | "Excellent";
  summary: string;
  red: CompanyScoreIssue[];
  yellow: CompanyScoreIssue[];
  green: { field: string; strength: string }[];
}

export interface FieldHighlight {
  field: string;
  severity: "red" | "yellow" | "green";
  message: string;
}
