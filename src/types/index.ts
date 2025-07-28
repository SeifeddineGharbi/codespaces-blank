// Type definitions for Productivity Morning Routine App

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

export interface UserProfile {
  userId: string;
  profile: {
    email: string;
    displayName?: string;
    photoURL?: string;
    timeZone: string;
    locale: string;
  };
  onboarding: {
    isCompleted: boolean;
    completedAt?: Date;
    responses: OnboardingResponses;
  };
  routine: {
    wakeTime: string; // "06:00" format
    routineDuration: number; // minutes
    selectedTasks: RoutineTask[];
  };
  settings: {
    notifications: {
      morningReminder: boolean;
      reminderTime: string; // "05:45" format
    };
    privacy: {
      analyticsOptIn: boolean;
      crashReportingOptIn: boolean;
    };
  };
  subscription: {
    status: 'active' | 'cancelled' | 'expired' | 'trial' | 'none';
    plan?: 'weekly' | 'annual';
    expiresAt?: Date;
    isTrialUser: boolean;
    hasUsedTrial: boolean;
  };
  stats: {
    totalCompletions: number;
    currentStreak: number;
    longestStreak: number;
    averageCompletionScore: number;
    totalDaysActive: number;
    joinDate: Date;
    lastActive: Date;
    achievements: string[];
  };
  metadata: {
    createdAt: Date;
    lastUpdated: Date;
    version: number;
  };
}

export interface OnboardingResponses {
  currentWakeTime: string;
  idealWakeTime: string;
  motivations: string[];
  challenges: string[];
  experience: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
}

export interface RoutineTask {
  taskId: string;
  duration: number; // minutes
  order: number;
  isEnabled: boolean;
}

export interface DailyProgress {
  userId: string;
  date: string; // YYYY-MM-DD format
  session: {
    startTime: Date;
    endTime?: Date;
    duration?: number; // actual duration in minutes
    isCompleted: boolean;
    completionPercentage: number; // 0-100
  };
  tasks: TaskCompletion[];
  metrics: {
    wakeTime?: string; // "06:15" format - actual wake time
    energyLevel?: number; // 1-10 scale
    moodRating?: number; // 1-10 scale
    difficultyRating?: number; // 1-10 scale
    motivationLevel?: number; // 1-10 scale
  };
  reflection: {
    dailyReflection?: string;
    improvements?: string;
    challenges?: string;
    wins?: string;
  };
  achievements: {
    newAchievements: string[];
    milestones: Milestone[];
  };
  streaks: {
    currentStreak: number;
    isStreakDay: boolean;
    longestStreak: number;
    lastCompletionDate?: string;
  };
  metadata: {
    createdAt: Date;
    lastUpdated: Date;
    dataSource: 'app' | 'sync' | 'manual';
  };
}

export interface TaskCompletion {
  taskId: string;
  name: string;
  category: string;
  plannedDuration: number; // minutes
  actualDuration?: number; // minutes
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped';
  startTime?: Date;
  endTime?: Date;
  notes?: string;
  rating?: number; // 1-5 satisfaction rating
}

export interface Milestone {
  type: 'streak' | 'completion' | 'consistency';
  value: number;
  achievedAt: Date;
}

// Task definitions for the MVP (4 core habits)
export interface Task {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
  category: 'hydration' | 'digital_wellness' | 'health' | 'productivity';
  order: number;
}

export const MVP_TASKS: Task[] = [
  {
    id: 'drink_water',
    name: 'Drink Water',
    description: 'Consume water immediately upon waking',
    emoji: '💧',
    color: '#007AFF', // Blue - iOS system blue
    category: 'hydration',
    order: 1,
  },
  {
    id: 'no_phone_usage',
    name: 'No Phone Usage',
    description: 'Avoid phone usage before getting out of bed',
    emoji: '⛔',
    color: '#FF3B30', // Red - iOS system red
    category: 'digital_wellness',
    order: 2,
  },
  {
    id: 'sunlight_exposure',
    name: 'Sunlight Exposure',
    description: 'Get 5-10 minutes of direct sunlight',
    emoji: '☀️',
    color: '#FFCC00', // Yellow - bright sunshine
    category: 'health',
    order: 3,
  },
  {
    id: 'elephant_task',
    name: 'Elephant Task',
    description: 'Identify THE most important task of the day',
    emoji: '🐘',
    color: '#34C759', // Green - iOS system green
    category: 'productivity',
    order: 4,
  },
];

// Navigation types
export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Onboarding: undefined;
  Paywall: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Analytics: undefined;
  Tasks: undefined;
  Settings: undefined;
};

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type OnboardingStackParamList = {
  Welcome: undefined;
  TaskIntro: undefined;
  Questions: { questionIndex: number };
  PersonalizationAnimation: undefined;
  PlanDisplay: undefined;
};

// Form types
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  displayName?: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  receiveMarketing?: boolean;
}

export interface OnboardingQuestionData {
  questionId: string;
  answer: string | string[] | number;
  isOptional: boolean;
  skipped?: boolean;
}

// Authentication state types
export interface AuthState {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  initializing: boolean;
  isAuthenticated: boolean;
  sessionExpiry?: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegistrationCredentials {
  email: string;
  password: string;
  displayName?: string;
  acceptTerms: boolean;
}

export interface PasswordResetRequest {
  email: string;
}

export interface EmailVerificationStatus {
  verified: boolean;
  sent: boolean;
  resendAvailable: boolean;
  nextResendTime?: Date;
}

export interface AuthValidationResult {
  isValid: boolean;
  errors: {
    email?: string;
    password?: string;
    confirmPassword?: string;
    displayName?: string;
    acceptTerms?: string;
  };
}

export interface PasswordStrengthResult {
  score: number; // 0-4 (0 = very weak, 4 = very strong)
  feedback: string[];
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

// Context types
export interface AuthContextType {
  // State
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  initializing: boolean;
  isAuthenticated: boolean;
  emailVerificationStatus: EmailVerificationStatus;
  
  // Authentication methods
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signUp: (credentials: RegistrationCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  
  // Profile management
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  
  // Email verification
  sendEmailVerification: () => Promise<void>;
  checkEmailVerificationStatus: () => Promise<EmailVerificationStatus>;
  
  // Session management
  refreshSession: () => Promise<void>;
  checkSessionValidity: () => boolean;
  
  // Validation utilities
  validateEmail: (email: string) => AuthValidationResult;
  validatePassword: (password: string) => PasswordStrengthResult;
  validateRegistration: (credentials: RegistrationCredentials) => AuthValidationResult;
}

export interface TaskContextType {
  dailyProgress: DailyProgress | null;
  tasks: Task[];
  loading: boolean;
  submitDay: () => Promise<void>;
  toggleTask: (taskId: string) => Promise<void>;
  getTodayProgress: () => Promise<DailyProgress | null>;
  getProgressHistory: (days: number) => Promise<DailyProgress[]>;
}

// Analytics types
export interface AnalyticsData {
  weeklyData: WeeklyData[];
  currentStreak: number;
  completionRate: number;
  totalDays: number;
  perfectDays: number;
}

export interface WeeklyData {
  date: string; // YYYY-MM-DD
  dayOfWeek: string;
  tasks: {
    [taskId: string]: boolean; // completed or not
  };
  completionPercentage: number;
  isCompleted: boolean;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp?: Date;
  recoverable?: boolean;
}

export interface AuthError extends AppError {
  field?: 'email' | 'password' | 'confirmPassword' | 'displayName';
  retryable?: boolean;
}

export type ErrorCode = 
  | 'auth/user-not-found'
  | 'auth/wrong-password'
  | 'auth/email-already-in-use'
  | 'auth/weak-password'
  | 'auth/invalid-email'
  | 'auth/too-many-requests'
  | 'auth/user-disabled'
  | 'auth/operation-not-allowed'
  | 'auth/email-not-verified'
  | 'auth/requires-recent-login'
  | 'auth/credential-already-in-use'
  | 'firestore/permission-denied'
  | 'firestore/unavailable'
  | 'firestore/unauthenticated'
  | 'network/no-connection'
  | 'network/timeout'
  | 'subscription/expired'
  | 'subscription/invalid'
  | 'validation/invalid-email'
  | 'validation/weak-password'
  | 'validation/passwords-mismatch'
  | 'validation/terms-not-accepted'
  | 'unknown';

// Session management types
export interface SessionInfo {
  userId: string;
  email: string;
  issuedAt: Date;
  expiersAt: Date;
  deviceInfo?: {
    platform: string;
    appVersion: string;
    deviceId?: string;
  };
  persistent: boolean;
}

export interface AuthProviderConfig {
  enableEmailVerification: boolean;
  enablePasswordReset: boolean;
  sessionTimeout: number; // minutes
  maxLoginAttempts: number;
  lockoutDuration: number; // minutes
  enableRememberMe: boolean;
  requireStrongPasswords: boolean;
}