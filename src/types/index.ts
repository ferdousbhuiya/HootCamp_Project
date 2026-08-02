export interface User {
  id: string;
  email: string;
  full_name?: string;
  phone_number?: string;
  avatar_url?: string;
  created_at: string;
}

export interface Resume {
  id: string;
  user_id: string;
  file_name: string;
  file_url: string;
  parsed_content?: string;
  created_at: string;
}

export interface Skill {
  id: string;
  user_id: string;
  name: string;
  category: string;
  confidence: number;
  source: 'resume' | 'transcript' | 'certificate' | 'manual';
  verification_source: 'manual' | 'resume' | 'certificate' | 'ongoing_course';
  certificate_id?: string;
  ongoing_course_id?: string;
  is_verified: boolean;
}

export interface UserProfile {
  id: string;
  user_id: string;
  skills: Skill[];
  resume_id?: string;
  updated_at: string;
}

export interface Match {
  id: string;
  user_id: string;
  title: string;
  description: string;
  match_score: number;
  matched_skills: string[];
  explanation: string;
  missing_skills?: string[];
  next_steps?: string[];
  type: 'job' | 'learning_path' | 'credential';
  created_at: string;
}

export interface AIProvider {
  name: 'openai' | 'lmstudio';
  isAvailable: boolean;
}

export interface Certificate {
  id: string;
  user_id: string;
  title: string;
  issuer?: string;
  issue_date?: string;
  expiry_date?: string;
  credential_id?: string;
  verification_url?: string;
  verification_status: 'pending' | 'verified' | 'failed' | 'not_available';
  file_name: string;
  file_type: string;
  storage_path?: string;
  extracted_text?: string;
  created_at: string;
}

export interface OngoingCourse {
  id: string;
  user_id: string;
  course_name: string;
  provider?: string;
  platform?: string;
  start_date?: string;
  expected_completion_date?: string;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
  url?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface JobRole {
  id: string;
  title: string;
  description?: string;
  required_skills?: string[];
  salary_range?: string;
  demand_level?: 'low' | 'medium' | 'high';
  entry_difficulty?: 'entry' | 'intermediate' | 'advanced';
  created_at: string;
}

export interface GapAnalysis {
  match_score: number;
  coverage: number;
  have_skills: string[];
  missing_skills: string[];
  summary: string;
  recommendations: string[];
}

export interface CareerGoal {
  id: string;
  user_id: string;
  role_title: string;
  desired_role_id?: string;
  gap_analysis?: GapAnalysis;
  is_active?: boolean;
  baseline?: GoalBaseline | null;
  created_at: string;
  updated_at: string;
}

export interface GoalBaseline {
  skills: string[];
  portfolio_score: number;
  match_score: number;
  courses: string[];
  captured_at: string;
}

export interface GoalProgress {
  role_title: string;
  coverage: number;
  match_score_now: number;
  match_score_change: number;
  skills_acquired: string[];
  goal_skills_acquired: string[];
  courses_completed: string[];
  roadmap_phases_completed: number;
  roadmap_total_phases: number;
  portfolio_score_now: number;
  baseline: GoalBaseline;
}

export interface PortfolioFeedback {
  strengths: string[];
  weaknesses: string[];
  missing_keywords: string[];
  suggestions: { title: string; description: string }[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface RoleComparison {
  role: JobRole;
  gap: GapAnalysis;
  courses: CourseRecommendation[];
  cached: boolean;
}

export interface RoadmapCourse {
  title: string;
  platform?: string;
  url?: string;
  cost?: string;
}

export interface RoadmapPhase {
  phase: number;
  months: string;
  title: string;
  summary: string;
  milestones: string[];
  courses: RoadmapCourse[];
  skills_to_build: string[];
}

export interface Roadmap {
  id: string;
  user_id: string;
  role_title: string;
  desired_role_id?: string;
  phases: RoadmapPhase[];
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  title: string;
  platform?: string;
  url?: string;
  cost?: string;
  skills?: string[];
  level?: 'beginner' | 'intermediate' | 'advanced';
  created_at: string;
}

export type CourseRecommendation = Course & { covered_skills: string[] };
