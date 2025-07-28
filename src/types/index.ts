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
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  displayName?: string;
}

export interface OnboardingQuestionData {
  questionId: string;
  answer: string | string[] | number;
  isOptional: boolean;
  skipped?: boolean;
}

// Context types
export interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
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
}

export type ErrorCode = 
  | 'auth/user-not-found'
  | 'auth/wrong-password'
  | 'auth/email-already-in-use'
  | 'auth/weak-password'
  | 'auth/invalid-email'
  | 'firestore/permission-denied'
  | 'firestore/unavailable'
  | 'network/no-connection'
  | 'subscription/expired'
  | 'subscription/invalid'
  | 'unknown';