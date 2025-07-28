// Constants for Productivity Morning Routine App

export const APP_CONFIG = {
  name: 'Productivity Morning Routine',
  version: '1.0.0',
  description: 'CONQUER your day with THE science-backed morning routine.',
} as const;

// Color scheme following the design specifications
export const COLORS = {
  primary: {
    50: '#FEF9E6',
    100: '#FCEF91',
    500: '#FB9E3A', // Sunrise Orange
    600: '#E6521F', // Dawn Red-Orange
    700: '#EA2F14', // Morning Red
  },
  background: {
    light: '#FEF9E6', // Soft Dawn
    white: '#FFFFFF',
    gray: '#F8F9FA',
  },
  text: {
    primary: '#2D1810', // Dark Brown
    secondary: '#8B5A3C', // Warm Brown
    muted: '#6B7280',
  },
  task: {
    water: '#007AFF', // Blue - iOS system blue
    noPhoneUsage: '#FF3B30', // Red - iOS system red
    sunlight: '#FFCC00', // Yellow - bright sunshine
    elephant: '#34C759', // Green - iOS system green
  },
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
} as const;

// Subscription configuration
export const SUBSCRIPTION_PLANS = {
  weekly: {
    id: 'weekly_premium',
    name: 'Weekly Plan',
    price: 3.99,
    currency: 'USD',
    duration: 'week',
    hasFreeTrial: true,
    trialDays: 7,
    features: [
      'Full access to all morning routine tasks',
      'Detailed analytics and progress tracking',
      'Personalized motivational content',
      'Priority customer support',
    ],
  },
  annual: {
    id: 'annual_premium',
    name: 'Annual Plan',
    price: 24.99,
    currency: 'USD',
    duration: 'year',
    hasFreeTrial: false,
    trialDays: 0,
    features: [
      'Full access to all morning routine tasks',
      'Detailed analytics and progress tracking',
      'Personalized motivational content',
      'Priority customer support',
      'Best value - Save 67%',
    ],
  },
} as const;

// Notification configuration
export const NOTIFICATION_CONFIG = {
  morningReminderDelay: 90, // minutes after wake time
  weekdaysOnly: true,
  defaultMessages: [
    'Ready to CONQUER your day? ✨',
    'Your morning routine is waiting!',
    'Time to build those winning habits!',
    'Let\'s make today AMAZING! 🌟',
    'Your future self will thank you! 💪',
  ],
} as const;

// Scoring configuration
export const SCORING_CONFIG = {
  taskWeights: {
    drink_water: 25, // 25% weight
    no_phone_usage: 25, // 25% weight
    sunlight_exposure: 25, // 25% weight
    elephant_task: 25, // 25% weight
  } as Record<string, number>,
  perfectScore: 100,
  passingScore: 75,
} as const;

// Motivational messages based on score ranges
export const MOTIVATIONAL_MESSAGES = {
  excellent: {
    range: [90, 100],
    messages: [
      'CRUSHING IT! You\'re unstoppable! 🚀',
      'PHENOMENAL performance! Keep dominating! 💪',
      'You\'re a CHAMPION! Absolutely incredible! ⭐',
    ],
  },
  strong: {
    range: [75, 89],
    messages: [
      'STRONG performance! Keep building momentum! 🔥',
      'EXCELLENT work! You\'re on fire! 💯',
      'IMPRESSIVE! You\'re crushing your goals! 🎯',
    ],
  },
  solid: {
    range: [50, 74],
    messages: [
      'SOLID effort! Tomorrow\'s your chance to level up! 📈',
      'GOOD progress! You\'re building something great! 🌱',
      'NICE work! Keep pushing forward! 💫',
    ],
  },
  building: {
    range: [25, 49],
    messages: [
      'PROGRESS over perfection! You\'re building something great! 🏗️',
      'Every step counts! Keep moving forward! 👣',
      'GROWTH mindset! You\'re on the right path! 🌟',
    ],
  },
  champion: {
    range: [0, 24],
    messages: [
      'Every CHAMPION has off days. Ready to bounce back? 🥊',
      'Tomorrow is a NEW opportunity to shine! ✨',
      'REST and RESET. Champions come back stronger! 💪',
    ],
  },
} as const;

// Onboarding questions configuration
export const ONBOARDING_QUESTIONS = [
  {
    id: 'productivity_challenge',
    question: 'What\'s your current biggest productivity challenge?',
    type: 'multiple_choice',
    required: false, // Can skip this one
    options: [
      'Afternoon energy slumps',
      'Difficulty focusing',
      'Inconsistent routines',
      'Social media distractions',
      'Poor sleep quality',
    ],
  },
  {
    id: 'wake_time',
    question: 'What time do you usually wake up?',
    type: 'time_picker',
    required: true,
    defaultValue: '07:00',
  },
  {
    id: 'work_type',
    question: 'Are you an employee or employer?',
    type: 'single_choice',
    required: true,
    options: ['Employee', 'Employer', 'Student', 'Freelancer'],
  },
  {
    id: 'work_style',
    question: 'Do you work office, remote, or hybrid?',
    type: 'single_choice',
    required: true,
    options: ['Office', 'Remote', 'Hybrid', 'Not applicable'],
  },
  {
    id: 'bed_time_habits',
    question: 'How long do you typically stay in bed after waking?',
    type: 'single_choice',
    required: true,
    options: ['0-5 minutes', '5-15 minutes', '15-30 minutes', '30+ minutes'],
  },
  {
    id: 'energy_slumps',
    question: 'Do you experience afternoon energy slumps?',
    type: 'single_choice',
    required: true,
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
  },
  {
    id: 'productivity_rating',
    question: 'How productive do you usually feel? (Scale 1-10)',
    type: 'scale',
    required: true,
    min: 1,
    max: 10,
    step: 1,
  },
  {
    id: 'primary_goal',
    question: 'What\'s your primary goal with this app?',
    type: 'single_choice',
    required: true,
    options: [
      'Increase daily productivity',
      'Build consistent morning habits',
      'Reduce social media dependency',
      'Improve overall wellness',
      'Better mood throughout the day',
    ],
  },
  {
    id: 'coffee_habits',
    question: 'Do you drink coffee in the morning?',
    type: 'single_choice',
    required: true,
    options: ['Yes, immediately upon waking', 'Yes, after 1-2 hours', 'No, I don\'t drink coffee', 'Sometimes'],
  },
  {
    id: 'social_media_habits',
    question: 'How often do you check social media upon waking?',
    type: 'single_choice',
    required: true,
    options: ['Immediately', 'Within 30 minutes', 'Within 1 hour', 'After getting ready', 'I don\'t use social media'],
  },
  {
    id: 'weekend_productivity',
    question: 'Do you need to be productive on weekends?',
    type: 'single_choice',
    required: true,
    options: ['Yes, always', 'Sometimes', 'No, weekends are for rest', 'It depends'],
  },
] as const;

// Analytics configuration
export const ANALYTICS_CONFIG = {
  weekStartsOn: 1, // Monday = 1, Sunday = 0
  streakMinimumScore: 75, // Minimum score to count towards streak
  perfectDayScore: 100, // Score required for a "perfect day"
  dataRetentionDays: 365, // How long to keep historical data
} as const;

// Firebase collection names
export const COLLECTIONS = {
  users: 'users',
  userProgress: 'user_progress',
  subscriptions: 'subscriptions',
  supportTickets: 'support_tickets',
  appConfig: 'app_config',
  analyticsEvents: 'analytics_events',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  networkGeneral: 'Please check your internet connection and try again.',
  auth: {
    'auth/user-not-found': 'No account found with this email address.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/email-already-in-use': 'An account already exists with this email address.',
    'auth/weak-password': 'Password should be at least 8 characters long.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/operation-not-allowed': 'This operation is not allowed. Please contact support.',
    'auth/email-not-verified': 'Please verify your email address before continuing.',
    'auth/requires-recent-login': 'This operation requires recent authentication. Please log in again.',
    'auth/credential-already-in-use': 'This credential is already associated with another account.',
    'validation/invalid-email': 'Please enter a valid email address.',
    'validation/weak-password': 'Password does not meet security requirements.',
    'validation/passwords-mismatch': 'Passwords do not match.',
    'validation/terms-not-accepted': 'You must accept the Terms of Service to continue.',
    'validation/invalid-credentials': 'Please check your login credentials.',
    'validation/invalid-registration': 'Please check your registration information.',
    'validation/invalid-display-name': 'Please enter a valid name.',
  },
  firestore: {
    'firestore/permission-denied': 'You don\'t have permission to access this data.',
    'firestore/unavailable': 'Service temporarily unavailable. Please try again.',
    'firestore/unauthenticated': 'Please sign in to access this feature.',
  },
  subscription: {
    'subscription/expired': 'Your subscription has expired. Please renew to continue.',
    'subscription/invalid': 'Invalid subscription. Please contact support.',
  },
  network: {
    'network/no-connection': 'Please check your internet connection and try again.',
    'network/timeout': 'Request timed out. Please try again.',
  },
  unknown: 'Something went wrong. Please try again.',
} as const;

// Validation rules
export const VALIDATION_RULES = {
  email: {
    required: 'Email is required',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Please enter a valid email address',
    },
  },
  password: {
    required: 'Password is required',
    minLength: {
      value: 8,
      message: 'Password must be at least 8 characters long',
    },
    pattern: {
      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      message: 'Password must contain uppercase, lowercase, number and special character',
    },
  },
  displayName: {
    required: 'Name is required',
    minLength: {
      value: 2,
      message: 'Name must be at least 2 characters long',
    },
  },
} as const;

// Authentication configuration
export const AUTH_CONFIG = {
  enableEmailVerification: true,
  enablePasswordReset: true,
  sessionTimeout: 24 * 60, // 24 hours in minutes
  maxLoginAttempts: 5,
  lockoutDuration: 15, // minutes
  enableRememberMe: true,
  requireStrongPasswords: !__DEV__, // Only in production
  emailVerificationRequired: false, // Don't block login in MVP
  minPasswordLength: 8,
  maxPasswordLength: 128,
} as const;

// Session management
export const SESSION_CONFIG = {
  storageKey: 'auth_session',
  refreshThreshold: 5 * 60 * 1000, // 5 minutes before expiry
  maxSessionDuration: 30 * 24 * 60 * 60 * 1000, // 30 days
  rememberMeDuration: 90 * 24 * 60 * 60 * 1000, // 90 days
} as const;

// App feature flags
export const FEATURE_FLAGS = {
  enableAnalytics: true,
  enablePushNotifications: true,
  enableSubscriptions: true,
  enableOnboarding: true,
  enableStreakSystem: true,
  enableEmailVerification: AUTH_CONFIG.enableEmailVerification,
  debugMode: __DEV__,
} as const;