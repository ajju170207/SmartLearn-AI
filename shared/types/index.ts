// Shared TypeScript type definitions for SmartLearn AI platform

export interface User {
  id: string;
  email: string;
  username: string;
  created_at: Date;
  updated_at: Date;
  preferences: UserPreferences;
  learning_context: LearningContext;
}

export interface UserPreferences {
  explanation_style: 'detailed' | 'concise' | 'example-heavy';
  preferred_languages: string[];
  learning_goals: string[];
  notification_settings: NotificationSettings;
}

export interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  learning_reminders: boolean;
  progress_updates: boolean;
}

export interface LearningContext {
  skill_levels: Map<string, SkillLevel>;
  learning_history: LearningInteraction[];
  current_focus_areas: string[];
  estimated_expertise: ExpertiseLevel;
}

export interface SkillLevel {
  topic: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  confidence: number; // 0-1 scale
  last_assessed: Date;
}

export interface ExpertiseLevel {
  overall_level: 'beginner' | 'intermediate' | 'advanced';
  domain_expertise: Map<string, number>; // domain -> expertise score (0-1)
}

export interface LearningInteraction {
  id: string;
  user_id: string;
  type: 'concept_explanation' | 'code_analysis' | 'debugging_help';
  query: string;
  response: string;
  context_used: string[];
  feedback: UserFeedback;
  timestamp: Date;
  processing_time: number;
}

export interface UserFeedback {
  rating: number; // 1-5 scale
  helpful: boolean;
  clarity_rating: number;
  accuracy_rating: number;
  comments?: string;
}

export interface ConceptExplanation {
  id: string;
  concept: string;
  content: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  examples: Example[];
  analogies: Analogy[];
  step_by_step: StepByStep[];
  related_concepts: string[];
  sources: string[];
}

export interface Example {
  title: string;
  description: string;
  code_snippet?: string;
  language?: string;
  use_case: string;
}

export interface Analogy {
  concept: string;
  analogy: string;
  explanation: string;
}

export interface StepByStep {
  step_number: number;
  title: string;
  description: string;
  code_example?: string;
}

export interface CodeExplanation {
  id: string;
  code_snippet: string;
  language: string;
  line_explanations: LineExplanation[];
  overall_summary: string;
  best_practices: string[];
  potential_issues: Issue[];
  optimization_suggestions: string[];
}

export interface LineExplanation {
  line_number: number;
  code: string;
  explanation: string;
  concepts: string[];
}

export interface Issue {
  type: 'error' | 'warning' | 'suggestion';
  line_number?: number;
  description: string;
  solution: string;
  severity: 'low' | 'medium' | 'high';
}

export interface DebuggingSuggestion {
  issue_type: string;
  description: string;
  suggested_fixes: Fix[];
  debugging_steps: string[];
  related_resources: string[];
}

export interface Fix {
  description: string;
  code_change?: string;
  explanation: string;
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  document_type: 'tutorial' | 'documentation' | 'example' | 'reference';
  topics: string[];
  difficulty_level: DifficultyLevel;
  source: string;
  embedding_vector: number[];
  metadata: DocumentMetadata;
}

export interface DocumentMetadata {
  author: string;
  created_date: Date;
  last_updated: Date;
  version: string;
  language?: string;
  framework?: string;
}

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type ExplanationDepth = 'basic' | 'detailed' | 'comprehensive';

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface UserRegistration {
  email: string;
  username: string;
  password: string;
  preferences?: Partial<UserPreferences>;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UserContext {
  user_id: string;
  skill_level: SkillLevel;
  preferences: UserPreferences;
  session_context: SessionContext;
}

export interface SessionContext {
  current_topic?: string;
  conversation_history: ConversationMessage[];
  active_learning_goals: string[];
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface SearchFilters {
  topics?: string[];
  difficulty_level?: DifficultyLevel;
  document_type?: string[];
  language?: string;
  date_range?: {
    start: Date;
    end: Date;
  };
}

export interface SearchResult {
  document_id: string;
  title: string;
  content_snippet: string;
  relevance_score: number;
  metadata: DocumentMetadata;
}

export interface LearningPath {
  id: string;
  user_id: string;
  title: string;
  description: string;
  target_skills: string[];
  estimated_duration: number; // in hours
  difficulty_progression: DifficultyLevel[];
  milestones: Milestone[];
  resources: LearningResource[];
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  required_skills: string[];
  completion_criteria: string[];
  estimated_time: number; // in hours
}

export interface LearningResource {
  id: string;
  title: string;
  type: 'article' | 'video' | 'exercise' | 'project';
  url?: string;
  content?: string;
  difficulty_level: DifficultyLevel;
  estimated_time: number; // in minutes
}

export interface AnalyticsData {
  user_id: string;
  session_id: string;
  event_type: string;
  event_data: Record<string, any>;
  timestamp: Date;
}

export interface ProgressMetrics {
  topics_covered: string[];
  time_spent: number; // in minutes
  concepts_learned: number;
  questions_asked: number;
  feedback_given: number;
  skill_improvements: SkillImprovement[];
}

export interface SkillImprovement {
  topic: string;
  previous_level: number;
  current_level: number;
  improvement_date: Date;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
  has_prev: boolean;
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}