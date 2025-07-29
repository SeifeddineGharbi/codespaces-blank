// Utility functions for Productivity Morning Routine App

import { format, startOfWeek, endOfWeek, addDays, parseISO } from 'date-fns';
import { MOTIVATIONAL_MESSAGES, SCORING_CONFIG } from '../constants';
import { processFirebaseError } from './errorHandling';

// Date utilities
export const dateUtils = {
  // Format date for display (e.g., "Monday, March 14")
  formatDisplayDate: (date: Date): string => {
    return format(date, 'EEEE, MMMM d');
  },

  // Format date for Firestore document ID (YYYY-MM-DD)
  formatDateId: (date: Date): string => {
    return format(date, 'yyyy-MM-dd');
  },

  // Get today's date as formatted ID
  getTodayId: (): string => {
    return dateUtils.formatDateId(new Date());
  },

  // Parse date ID back to Date object
  parseDateId: (dateId: string): Date => {
    return parseISO(dateId);
  },

  // Get start of current week (Monday)
  getWeekStart: (date?: Date): Date => {
    return startOfWeek(date || new Date(), { weekStartsOn: 1 });
  },

  // Get end of current week (Sunday)
  getWeekEnd: (date?: Date): Date => {
    return endOfWeek(date || new Date(), { weekStartsOn: 1 });
  },

  // Get array of dates for the current week
  getWeekDates: (date?: Date): Date[] => {
    const start = dateUtils.getWeekStart(date);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  },

  // Check if date is today
  isToday: (date: Date): boolean => {
    const today = new Date();
    return dateUtils.formatDateId(date) === dateUtils.formatDateId(today);
  },

  // Check if date is in the past
  isPast: (date: Date): boolean => {
    const today = new Date();
    return date < today && !dateUtils.isToday(date);
  },

  // Check if it's a weekday (Monday-Friday)
  isWeekday: (date: Date): boolean => {
    const day = date.getDay();
    return day >= 1 && day <= 5; // Monday = 1, Friday = 5
  },
};

// Scoring utilities
export const scoringUtils = {
  // Calculate completion percentage based on completed tasks
  calculateScore: (completedTasks: string[]): number => {
    if (completedTasks.length === 0) return 0;
    
    const totalPossibleScore = Object.values(SCORING_CONFIG.taskWeights).reduce(
      (sum: number, weight: number) => sum + weight,
      0
    );
    
    const earnedScore = completedTasks.reduce((sum: number, taskId: string) => {
      const weight = SCORING_CONFIG.taskWeights[taskId] || 0;
      return sum + weight;
    }, 0);
    
    return Math.round((earnedScore / totalPossibleScore) * 100);
  },

  // Get motivational message based on score
  getMotivationalMessage: (score: number): string => {
    let messageCategory;
    
    if (score >= 90) {
      messageCategory = MOTIVATIONAL_MESSAGES.excellent;
    } else if (score >= 75) {
      messageCategory = MOTIVATIONAL_MESSAGES.strong;
    } else if (score >= 50) {
      messageCategory = MOTIVATIONAL_MESSAGES.solid;
    } else if (score >= 25) {
      messageCategory = MOTIVATIONAL_MESSAGES.building;
    } else {
      messageCategory = MOTIVATIONAL_MESSAGES.champion;
    }
    
    const messages = messageCategory.messages;
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
  },

  // Check if score qualifies for streak
  isStreakWorthy: (score: number): boolean => {
    return score >= 75; // 75% minimum for streak
  },

  // Check if it's a perfect day
  isPerfectDay: (score: number): boolean => {
    return score === 100;
  },
};

// Time utilities
export const timeUtils = {
  // Format time string (e.g., "06:30")
  formatTime: (hours: number, minutes: number): string => {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  },

  // Parse time string to hours and minutes
  parseTime: (timeString: string): { hours: number; minutes: number } => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return { hours, minutes };
  },

  // Add minutes to time string
  addMinutes: (timeString: string, minutesToAdd: number): string => {
    const { hours, minutes } = timeUtils.parseTime(timeString);
    const totalMinutes = hours * 60 + minutes + minutesToAdd;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMinutes = totalMinutes % 60;
    return timeUtils.formatTime(newHours, newMinutes);
  },

  // Calculate notification time (90 minutes after wake time)
  getNotificationTime: (wakeTime: string): string => {
    return timeUtils.addMinutes(wakeTime, 90);
  },

  // Check if time1 is before time2
  isBefore: (time1: string, time2: string): boolean => {
    const { hours: h1, minutes: m1 } = timeUtils.parseTime(time1);
    const { hours: h2, minutes: m2 } = timeUtils.parseTime(time2);
    return h1 * 60 + m1 < h2 * 60 + m2;
  },

  // Validate that work time is after wake time
  validateWorkTime: (wakeTime: string, workTime: string): boolean => {
    return timeUtils.isBefore(wakeTime, workTime);
  },
};

// Validation utilities
export const validationUtils = {
  // Validate email format
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    return emailRegex.test(email);
  },

  // Validate password strength
  isValidPassword: (password: string): boolean => {
    // At least 8 characters, one uppercase, one lowercase, one number, one special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    return password.length >= 8 && passwordRegex.test(password);
  },

  // Validate display name
  isValidDisplayName: (name: string): boolean => {
    return name.trim().length >= 2 && name.trim().length <= 50;
  },

  // Get password strength score (1-5)
  getPasswordStrength: (password: string): number => {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;
    
    return Math.min(score, 5);
  },
};

// Storage utilities
export const storageUtils = {
  // Keys for AsyncStorage
  keys: {
    userToken: '@user_token',
    userProfile: '@user_profile',
    onboardingCompleted: '@onboarding_completed',
    firstLaunch: '@first_launch',
    notificationPermission: '@notification_permission',
  },
};

// Error handling utilities
export const errorUtils = {
  // Get user-friendly error message using centralized error processing
  getErrorMessage: (error: any): string => {
    if (typeof error === 'string') return error;
    
    // Use centralized Firebase error processing for consistent user-friendly messages
    const processedError = processFirebaseError(error, 'utils-error-handler');
    return processedError.message;
  },

  // Log error for debugging
  logError: (error: any, context?: string) => {
    if (__DEV__) {
      console.error(`[${context || 'Error'}]:`, error);
    }
    // In production, you might want to send this to a crash reporting service
  },
};

// Analytics utilities
export const analyticsUtils = {
  // Calculate streak from progress history
  calculateStreak: (progressHistory: Array<{ date: string; score: number }>): number => {
    if (!progressHistory.length) return 0;
    
    // Sort by date descending
    const sortedHistory = progressHistory
      .filter(p => scoringUtils.isStreakWorthy(p.score))
      .sort((a, b) => b.date.localeCompare(a.date));
    
    if (!sortedHistory.length) return 0;
    
    let streak = 0;
    const today = dateUtils.getTodayId();
    
    for (let i = 0; i < sortedHistory.length; i++) {
      const entry = sortedHistory[i];
      const expectedDate = i === 0 ? today : dateUtils.formatDateId(
        addDays(dateUtils.parseDateId(sortedHistory[i - 1].date), -1)
      );
      
      if (entry.date === expectedDate) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  },

  // Calculate completion rate for a period
  calculateCompletionRate: (progressHistory: Array<{ score: number }>): number => {
    if (!progressHistory.length) return 0;
    
    const completedDays = progressHistory.filter(p => p.score >= 75).length;
    return Math.round((completedDays / progressHistory.length) * 100);
  },

  // Get perfect days count
  getPerfectDaysCount: (progressHistory: Array<{ score: number }>): number => {
    return progressHistory.filter(p => scoringUtils.isPerfectDay(p.score)).length;
  },
};

// Export all utilities
export default {
  dateUtils,
  scoringUtils,
  timeUtils,
  validationUtils,
  storageUtils,
  errorUtils,
  analyticsUtils,
};