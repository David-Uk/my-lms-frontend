// User Roles
export type UserRole = 'superadmin' | 'admin' | 'tutor' | 'learner';
export type UserStatus = 'active' | 'inactive' | 'suspended';

// User
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  phoneNumber: string | null;
  profilePicture: string | null;
  bio: string | null;
  lastLoginAt: string | null;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// JWT Payload
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  exp: number;
  iat: number;
}

// Auth
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface SignupRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  bio?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  phoneNumber?: string;
  bio?: string;
  profilePicture?: string;
  role?: UserRole;
  status?: UserStatus;
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Course
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Course {
  id: string;
  creatorId: string;
  title: string;
  description: string | null;
  difficultyLevel: DifficultyLevel;
  contents: CourseContent[];
  courseTutors: CourseTutor[];
  cohorts: Cohort[];
  enrolledCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseRequest {
  title: string;
  description?: string;
  difficultyLevel: DifficultyLevel;
}

export interface UpdateCourseRequest {
  title?: string;
  description?: string;
  difficultyLevel?: DifficultyLevel;
}

export interface CourseFilters extends PaginationParams {
  search?: string;
  difficultyLevel?: DifficultyLevel;
}

// Course Content
export type ContentType = 'section' | 'lesson' | 'assessment';

export interface CourseContent {
  id: string;
  courseId: string;
  topic: string;
  contentType: ContentType;
  sequenceOrder: number;
  parentId: string | null;
  children: CourseContent[];
  lesson: Lesson | null;
  assessment: Assessment | null;
  createdAt: string;
}

export interface CreateContentRequest {
  topic: string;
  contentType: ContentType;
  sequenceOrder?: number;
  parentId?: string | null;
}

export interface UpdateContentRequest {
  topic?: string;
  sequenceOrder?: number;
  parentId?: string | null;
}

// Lesson
export interface Lesson {
  id: string;
  contentId: string;
  title: string;
  content: string | null;
  videoUrl: string | null;
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  lessonId: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

// Assessment
export type AssessmentType = 'quiz' | 'assignment' | 'group_assignment' | 'code_challenge' | 'kahoot_quiz';

export interface Assessment {
  id: string;
  contentId: string;
  type: AssessmentType;
  title: string;
  instructions: string | null;
  quiz: Quiz | null;
  codeChallenge: CodeChallenge | null;
}

export interface CreateAssessmentRequest {
  type: AssessmentType;
  title: string;
  instructions?: string;
}

// Quiz
export interface Quiz {
  id: string;
  assessmentId: string;
  timeAllocated: number;
  passMark: number;
  isGroup: boolean;
  groupPin: string | null;
  questions: QuizQuestion[];
}

export interface CreateQuizRequest {
  timeAllocated: number;
  passMark: number;
  isGroup?: boolean;
}

// Quiz Question
export type QuestionType =
  | 'single_option'
  | 'multiple_option'
  | 'true_false'
  | 'image_matching'
  | 'fill_in_the_blank'
  | 'short_answer';

export interface QuizQuestion {
  id: string;
  quizId: string;
  type: QuestionType;
  question: string;
  options: any;
  correctAnswer: any;
  marks: number;
  timeLimit: number | null;
}

export interface CreateQuestionRequest {
  type: QuestionType;
  question: string;
  options: any;
  correctAnswer: any;
  marks: number;
  timeLimit?: number | null;
}

// Code Challenge
export interface CodeChallenge {
  id: string;
  assessmentId: string;
  language: string;
  problemStatement: string;
  boilerplateCode: string | null;
  testCases: TestCase[];
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface CreateCodeChallengeRequest {
  language: string;
  problemStatement: string;
  boilerplateCode?: string;
  testCases: TestCase[];
}

export interface CodeSubmissionRequest {
  code: string;
}

export interface CodeSubmissionResponse {
  results: TestCaseResult[];
  score: number;
  passedCount: number;
  totalCount: number;
}

export interface TestCaseResult {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  isHidden: boolean;
}

// Course Tutor
export interface CourseTutor {
  id: string;
  courseId: string;
  tutorId: string;
  tutor: User;
  assignedAt: string;
}

export interface AssignTutorRequest {
  tutorId: string;
}

export interface BulkAssignTutorsRequest {
  tutorIds: string[];
}

// Cohort
export interface Cohort {
  id: string;
  courseId: string;
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  enrollments: Enrollment[];
  createdAt: string;
  updatedAt: string;
}

// Enrollment
export interface Enrollment {
  id: string;
  cohortId: string;
  learnerId: string;
  learner: User;
  enrolledAt: string;
  status: 'active' | 'completed' | 'dropped';
}

export interface EnrollLearnerRequest {
  learnerId: string;
  cohortId: string;
}

export interface BulkEnrollRequest {
  learnerIds: string[];
  cohortId: string;
}

// Quiz Session
export type SessionStatus = 'waiting' | 'active' | 'completed';

export interface QuizSession {
  id: string;
  quizId: string;
  cohortId: string;
  pin: string;
  status: SessionStatus;
  createdAt: string;
  startedAt: string | null;
  endedAt: string | null;
}

export interface CreateSessionRequest {
  quizId: string;
  cohortId: string;
}

export interface UpdateSessionStatusRequest {
  status: SessionStatus;
}

export interface SessionLeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  points: number;
  correctAnswers: number;
}

export interface SubmitAnswerRequest {
  questionId: string;
  answer: any;
  responseTimeMs: number;
}

// AI Features
export interface TranscriptionResponse {
  transcription: string;
}

export interface QuizGenerationRequest {
  topic: string;
}

export interface FlashcardGenerationRequest {
  topic: string;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface FlashcardGenerationResponse {
  flashcards: Flashcard[];
}

export interface PerformanceAnalysisResponse {
  summary: string;
  insights: string[];
  recommendations: string[];
  rawData: Record<string, unknown>;
}

// Slide Deck
export type SlideType = 'title' | 'agenda' | 'section' | 'content' | 'image' | 'comparison' | 'timeline' | 'chart' | 'table' | 'summary' | 'cta';
export type ElementType = 'text' | 'image' | 'shape' | 'icon' | 'chart' | 'table';
export type FontWeight = 'normal' | 'medium' | 'bold';
export type TextAlignment = 'left' | 'center' | 'right';
export type BackgroundType = 'solid' | 'gradient' | 'image';
export type SlideSize = '16:9' | '4:3';

export interface SlideTheme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
}

export interface SlideSettings {
  slide_size: string;
  export_formats: string[];
  editable: boolean;
}

export interface SlideElementStyle {
  font_family: string;
  font_size: number;
  font_weight: FontWeight;
  color: string;
  alignment: TextAlignment;
}

export interface SlideElement {
  id: string;
  type: ElementType;
  position: { x: number; y: number };
  size: { width: number; height: number };
  content: string | object | unknown[];
  style: SlideElementStyle;
  editable: boolean;
}

export interface ImageSuggestion {
  description: string;
  preferred_source: 'uploaded' | 'generated' | 'stock';
  placement: string;
}

export interface Slide {
  id: string;
  slide_number: number;
  type: SlideType;
  title: string;
  layout: string;
  background: { type: BackgroundType; value: string };
  elements: SlideElement[];
  speaker_notes: string;
  image_suggestions: ImageSuggestion[];
}

export interface SlideDeck {
  id: string;
  courseId: string;
  createdBy: string;
  title: string;
  topic: string | null;
  templateId: string;
  theme: SlideTheme;
  settings: SlideSettings;
  slides: Slide[];
  createdAt: string;
  updatedAt: string;
}

export interface SlideDeckListItem {
  id: string;
  courseId: string;
  title: string;
  topic: string | null;
  templateId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GenerateSlideDeckRequest {
  topic: string;
  audience?: string;
  tone?: string;
  numberOfSlides?: number;
  templateId?: string;
  stylePreferences?: string;
  brandColors?: string;
  fontPreferences?: string;
  language?: string;
  additionalInstructions?: string;
}

export interface CreateSlideDeckRequest {
  title: string;
  topic?: string;
  templateId?: string;
  theme?: Partial<SlideTheme>;
  settings?: Partial<SlideSettings>;
  slides?: Slide[];
}

export interface UpdateSlideDeckRequest {
  title?: string;
  topic?: string;
  templateId?: string;
  theme?: Partial<SlideTheme>;
  settings?: Partial<SlideSettings>;
  slides?: Slide[];
}

export interface UpdateSlideRequest {
  data: Partial<Slide>;
}

export interface AddSlideRequest {
  slide: Partial<Slide>;
}

export interface ReorderSlidesRequest {
  slideIds: string[];
}

// API Error
export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}

export class ApiRequestError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(status: number, message: string, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.errors = errors;
  }
}
