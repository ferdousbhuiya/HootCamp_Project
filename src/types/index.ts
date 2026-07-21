export interface User {
  id: string;
  email: string;
  full_name?: string;
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
  name: string;
  category: string;
  confidence: number;
  source: 'resume' | 'transcript' | 'certificate';
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
