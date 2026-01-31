"""
Shared Python type definitions for SmartLearn AI platform
"""

from typing import Dict, List, Optional, Union, Any
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field


class DifficultyLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class ExplanationDepth(str, Enum):
    BASIC = "basic"
    DETAILED = "detailed"
    COMPREHENSIVE = "comprehensive"


class ExplanationStyle(str, Enum):
    DETAILED = "detailed"
    CONCISE = "concise"
    EXAMPLE_HEAVY = "example-heavy"


class InteractionType(str, Enum):
    CONCEPT_EXPLANATION = "concept_explanation"
    CODE_ANALYSIS = "code_analysis"
    DEBUGGING_HELP = "debugging_help"


class DocumentType(str, Enum):
    TUTORIAL = "tutorial"
    DOCUMENTATION = "documentation"
    EXAMPLE = "example"
    REFERENCE = "reference"


class IssueType(str, Enum):
    ERROR = "error"
    WARNING = "warning"
    SUGGESTION = "suggestion"


class IssueSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class NotificationSettings(BaseModel):
    email_notifications: bool = True
    push_notifications: bool = True
    learning_reminders: bool = True
    progress_updates: bool = True


class UserPreferences(BaseModel):
    explanation_style: ExplanationStyle = ExplanationStyle.DETAILED
    preferred_languages: List[str] = []
    learning_goals: List[str] = []
    notification_settings: NotificationSettings = NotificationSettings()


class SkillLevel(BaseModel):
    topic: str
    level: DifficultyLevel
    confidence: float = Field(ge=0.0, le=1.0)
    last_assessed: datetime


class ExpertiseLevel(BaseModel):
    overall_level: DifficultyLevel
    domain_expertise: Dict[str, float] = {}  # domain -> expertise score (0-1)


class UserFeedback(BaseModel):
    rating: int = Field(ge=1, le=5)
    helpful: bool
    clarity_rating: int = Field(ge=1, le=5)
    accuracy_rating: int = Field(ge=1, le=5)
    comments: Optional[str] = None


class LearningInteraction(BaseModel):
    id: str
    user_id: str
    type: InteractionType
    query: str
    response: str
    context_used: List[str] = []
    feedback: Optional[UserFeedback] = None
    timestamp: datetime
    processing_time: float  # in seconds


class LearningContext(BaseModel):
    skill_levels: Dict[str, SkillLevel] = {}
    learning_history: List[LearningInteraction] = []
    current_focus_areas: List[str] = []
    estimated_expertise: Optional[ExpertiseLevel] = None


class User(BaseModel):
    id: str
    email: str
    username: str
    created_at: datetime
    updated_at: datetime
    preferences: UserPreferences = UserPreferences()
    learning_context: LearningContext = LearningContext()


class Example(BaseModel):
    title: str
    description: str
    code_snippet: Optional[str] = None
    language: Optional[str] = None
    use_case: str


class Analogy(BaseModel):
    concept: str
    analogy: str
    explanation: str


class StepByStep(BaseModel):
    step_number: int
    title: str
    description: str
    code_example: Optional[str] = None


class ConceptExplanation(BaseModel):
    id: str
    concept: str
    content: str
    difficulty_level: DifficultyLevel
    examples: List[Example] = []
    analogies: List[Analogy] = []
    step_by_step: List[StepByStep] = []
    related_concepts: List[str] = []
    sources: List[str] = []


class LineExplanation(BaseModel):
    line_number: int
    code: str
    explanation: str
    concepts: List[str] = []


class Issue(BaseModel):
    type: IssueType
    line_number: Optional[int] = None
    description: str
    solution: str
    severity: IssueSeverity


class CodeExplanation(BaseModel):
    id: str
    code_snippet: str
    language: str
    line_explanations: List[LineExplanation] = []
    overall_summary: str
    best_practices: List[str] = []
    potential_issues: List[Issue] = []
    optimization_suggestions: List[str] = []


class Fix(BaseModel):
    description: str
    code_change: Optional[str] = None
    explanation: str


class DebuggingSuggestion(BaseModel):
    issue_type: str
    description: str
    suggested_fixes: List[Fix] = []
    debugging_steps: List[str] = []
    related_resources: List[str] = []


class DocumentMetadata(BaseModel):
    author: str
    created_date: datetime
    last_updated: datetime
    version: str
    language: Optional[str] = None
    framework: Optional[str] = None


class KnowledgeDocument(BaseModel):
    id: str
    title: str
    content: str
    document_type: DocumentType
    topics: List[str] = []
    difficulty_level: DifficultyLevel
    source: str
    embedding_vector: List[float] = []
    metadata: DocumentMetadata


class UserRegistration(BaseModel):
    email: str
    username: str
    password: str
    preferences: Optional[UserPreferences] = None


class LoginCredentials(BaseModel):
    email: str
    password: str


class ConversationMessage(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str
    timestamp: datetime
    metadata: Optional[Dict[str, Any]] = None


class SessionContext(BaseModel):
    current_topic: Optional[str] = None
    conversation_history: List[ConversationMessage] = []
    active_learning_goals: List[str] = []


class UserContext(BaseModel):
    user_id: str
    skill_level: SkillLevel
    preferences: UserPreferences
    session_context: SessionContext = SessionContext()


class SearchFilters(BaseModel):
    topics: Optional[List[str]] = None
    difficulty_level: Optional[DifficultyLevel] = None
    document_type: Optional[List[DocumentType]] = None
    language: Optional[str] = None
    date_range: Optional[Dict[str, datetime]] = None


class SearchResult(BaseModel):
    document_id: str
    title: str
    content_snippet: str
    relevance_score: float = Field(ge=0.0, le=1.0)
    metadata: DocumentMetadata


class LearningResource(BaseModel):
    id: str
    title: str
    type: str  # 'article', 'video', 'exercise', 'project'
    url: Optional[str] = None
    content: Optional[str] = None
    difficulty_level: DifficultyLevel
    estimated_time: int  # in minutes


class Milestone(BaseModel):
    id: str
    title: str
    description: str
    required_skills: List[str] = []
    completion_criteria: List[str] = []
    estimated_time: int  # in hours


class LearningPath(BaseModel):
    id: str
    user_id: str
    title: str
    description: str
    target_skills: List[str] = []
    estimated_duration: int  # in hours
    difficulty_progression: List[DifficultyLevel] = []
    milestones: List[Milestone] = []
    resources: List[LearningResource] = []


class SkillImprovement(BaseModel):
    topic: str
    previous_level: float
    current_level: float
    improvement_date: datetime


class ProgressMetrics(BaseModel):
    topics_covered: List[str] = []
    time_spent: int  # in minutes
    concepts_learned: int = 0
    questions_asked: int = 0
    feedback_given: int = 0
    skill_improvements: List[SkillImprovement] = []


class AnalyticsData(BaseModel):
    user_id: str
    session_id: str
    event_type: str
    event_data: Dict[str, Any] = {}
    timestamp: datetime


class AuthResponse(BaseModel):
    user: User
    access_token: str
    refresh_token: str
    expires_in: int


class ApiResponse(BaseModel):
    success: bool
    data: Optional[Any] = None
    error: Optional[str] = None
    message: Optional[str] = None


class PaginatedResponse(BaseModel):
    data: List[Any]
    total: int
    page: int
    limit: int
    has_next: bool
    has_prev: bool


class ApiError(BaseModel):
    code: str
    message: str
    details: Optional[Dict[str, Any]] = None


class ValidationError(BaseModel):
    field: str
    message: str
    value: Optional[Any] = None


# RAG System Types
class IngestionResult(BaseModel):
    documents_processed: int
    documents_failed: int
    total_chunks: int
    processing_time: float


class GenerationContext(BaseModel):
    query: str
    retrieved_documents: List[SearchResult]
    context_text: str
    relevance_threshold: float = 0.7


# Skill Assessment Types
class SkillAssessment(BaseModel):
    user_id: str
    assessed_skills: Dict[str, SkillLevel]
    confidence_score: float = Field(ge=0.0, le=1.0)
    assessment_date: datetime
    assessment_method: str


class PersonalizedResponse(BaseModel):
    original_response: str
    personalized_content: str
    adaptation_factors: List[str]
    confidence_score: float = Field(ge=0.0, le=1.0)


class WorkflowOptimization(BaseModel):
    current_workflow: str
    optimized_workflow: str
    improvements: List[str]
    estimated_time_savings: int  # in minutes
    difficulty_reduction: float = Field(ge=0.0, le=1.0)