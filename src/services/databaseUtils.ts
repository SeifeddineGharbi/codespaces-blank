/**
 * Comprehensive Database Utilities and Helper Functions
 * 
 * This module provides utility functions for common database operations,
 * data transformations, date handling, and optimization utilities.
 * 
 * @version 1.0.0
 * @author Backend Agent - Productivity Morning Routine
 */

import { Timestamp } from 'firebase/firestore';
import { 
  FirestoreUserProfile, 
  FirestoreDailyProgress, 
  FirestoreTaskCompletion,
  UserProfile,
  DailyProgress,
  TaskCompletion
} from '../types';
import { SCORING_CONFIG, MVP_TASKS } from '../constants';

/**
 * Data Transformation Utilities
 */
export class DataTransformUtils {
  /**
   * Convert Firestore Timestamp to JavaScript Date
   */
  static timestampToDate(timestamp: Timestamp | null | undefined): Date | null {
    if (!timestamp) return null;
    return timestamp.toDate();
  }

  /**
   * Convert JavaScript Date to Firestore Timestamp
   */
  static dateToTimestamp(date: Date | null | undefined): Timestamp | null {
    if (!date) return null;
    return Timestamp.fromDate(date);
  }

  /**
   * Convert Firestore user profile to app user profile
   */
  static firestoreToAppUserProfile(firestoreProfile: FirestoreUserProfile): UserProfile {
    return {
      userId: firestoreProfile.userId,
      profile: {
        email: firestoreProfile.profile.email,
        displayName: firestoreProfile.profile.displayName,
        photoURL: firestoreProfile.profile.photoURL,
        timeZone: firestoreProfile.profile.timeZone,
        locale: firestoreProfile.profile.locale,
      },
      onboarding: {
        isCompleted: firestoreProfile.onboarding.isCompleted,
        completedAt: this.timestampToDate(firestoreProfile.onboarding.completedAt),
        responses: firestoreProfile.onboarding.responses,
      },
      routine: {
        wakeTime: firestoreProfile.routine.wakeTime,
        routineDuration: firestoreProfile.routine.routineDuration,
        selectedTasks: firestoreProfile.routine.selectedTasks.map(task => ({
          taskId: task.taskId,
          duration: task.duration,
          order: task.order,
          isEnabled: task.isEnabled,
        })),
      },
      settings: firestoreProfile.settings,
      subscription: {
        status: firestoreProfile.subscription.status,
        plan: firestoreProfile.subscription.plan,
        expiresAt: this.timestampToDate(firestoreProfile.subscription.expiresAt),
        isTrialUser: firestoreProfile.subscription.isTrialUser,
        hasUsedTrial: firestoreProfile.subscription.hasUsedTrial,
      },
      stats: {
        totalCompletions: firestoreProfile.stats.totalCompletions,
        currentStreak: firestoreProfile.stats.currentStreak,
        longestStreak: firestoreProfile.stats.longestStreak,
        averageCompletionScore: firestoreProfile.stats.averageCompletionScore,
        totalDaysActive: firestoreProfile.stats.totalDaysActive,
        joinDate: this.timestampToDate(firestoreProfile.stats.joinDate) || new Date(),
        lastActive: this.timestampToDate(firestoreProfile.stats.lastActive) || new Date(),
        achievements: firestoreProfile.stats.achievements,
      },
      metadata: {
        createdAt: this.timestampToDate(firestoreProfile.metadata.createdAt) || new Date(),
        lastUpdated: this.timestampToDate(firestoreProfile.metadata.lastUpdated) || new Date(),
        version: firestoreProfile.metadata.version,
      },
    };
  }

  /**
   * Convert Firestore daily progress to app daily progress
   */
  static firestoreToAppDailyProgress(firestoreProgress: FirestoreDailyProgress): DailyProgress {
    return {
      userId: firestoreProgress.userId,
      date: firestoreProgress.date,
      session: {
        startTime: this.timestampToDate(firestoreProgress.session.startTime) || new Date(),
        endTime: this.timestampToDate(firestoreProgress.session.endTime),
        duration: firestoreProgress.session.duration,
        isCompleted: firestoreProgress.session.isCompleted,
        completionPercentage: firestoreProgress.session.completionPercentage,
      },
      tasks: firestoreProgress.tasks.map(task => ({
        taskId: task.taskId,
        name: task.name,
        category: task.category,
        plannedDuration: task.plannedDuration,
        actualDuration: task.actualDuration,
        status: task.status,
        startTime: this.timestampToDate(task.startTime),
        endTime: this.timestampToDate(task.endTime),
        notes: task.notes,
        rating: task.rating,
      })),
      metrics: firestoreProgress.metrics,
      reflection: firestoreProgress.reflection,
      achievements: {
        newAchievements: firestoreProgress.achievements.newAchievements,
        milestones: firestoreProgress.achievements.milestones.map(milestone => ({
          type: milestone.type,
          value: milestone.value,
          achievedAt: this.timestampToDate(milestone.achievedAt) || new Date(),
        })),
      },
      streaks: firestoreProgress.streaks,
      metadata: {
        createdAt: this.timestampToDate(firestoreProgress.metadata.createdAt) || new Date(),
        lastUpdated: this.timestampToDate(firestoreProgress.metadata.lastUpdated) || new Date(),
        dataSource: firestoreProgress.metadata.dataSource,
      },
    };
  }

  /**
   * Batch convert Firestore daily progress array
   */
  static batchFirestoreToAppDailyProgress(firestoreProgresses: FirestoreDailyProgress[]): DailyProgress[] {
    return firestoreProgresses.map(progress => this.firestoreToAppDailyProgress(progress));
  }

  /**
   * Clean and sanitize user input
   */
  static sanitizeUserInput(input: string): string {
    return input.replace(/[<>]/g, '').trim();
  }

  /**
   * Validate and format time string
   */
  static formatTimeString(time: string): string | null {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    const cleanTime = time.trim();
    
    if (!timeRegex.test(cleanTime)) {
      return null;
    }
    
    const [hours, minutes] = cleanTime.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  }

  /**
   * Generate unique ID for documents
   */
  static generateDocumentId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

/**
 * Date and Time Utilities
 */
export class DateTimeUtils {
  /**
   * Get today's date in YYYY-MM-DD format
   */
  static getTodayString(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Get date string for a specific date
   */
  static getDateString(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Get date N days ago
   */
  static getDaysAgo(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return this.getDateString(date);
  }

  /**
   * Get date N days from now
   */
  static getDaysFromNow(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return this.getDateString(date);
  }

  /**
   * Get start and end of week for a given date
   */
  static getWeekRange(date: Date): { startDate: string; endDate: string } {
    const startOfWeek = new Date(date);
    const dayOfWeek = startOfWeek.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Monday = 1
    startOfWeek.setDate(startOfWeek.getDate() + diffToMonday);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);

    return {
      startDate: this.getDateString(startOfWeek),
      endDate: this.getDateString(endOfWeek),
    };
  }

  /**
   * Get start and end of month for a given date
   */
  static getMonthRange(date: Date): { startDate: string; endDate: string } {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    return {
      startDate: this.getDateString(startOfMonth),
      endDate: this.getDateString(endOfMonth),
    };
  }

  /**
   * Convert time string to minutes since midnight
   */
  static timeToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Convert minutes since midnight to time string
   */
  static minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  /**
   * Check if a date is today
   */
  static isToday(dateString: string): boolean {
    return dateString === this.getTodayString();
  }

  /**
   * Check if a date is in the past
   */
  static isPast(dateString: string): boolean {
    return dateString < this.getTodayString();
  }

  /**
   * Check if a date is in the future
   */
  static isFuture(dateString: string): boolean {
    return dateString > this.getTodayString();
  }

  /**
   * Get days between two dates
   */
  static getDaysBetween(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Format date for display
   */
  static formatDisplayDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }

  /**
   * Get user's local time based on timezone
   */
  static getUserLocalTime(timeZone: string): string {
    const now = new Date();
    return now.toLocaleTimeString('en-GB', {
      timeZone,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

/**
 * Task and Progress Utilities
 */
export class TaskUtils {
  /**
   * Create default task completions for a date
   */
  static createDefaultTaskCompletions(): FirestoreTaskCompletion[] {
    return MVP_TASKS.map(task => ({
      taskId: task.id,
      name: task.name,
      category: task.category,
      plannedDuration: 5, // Default 5 minutes
      status: 'not_started' as const,
    }));
  }

  /**
   * Get task by ID
   */
  static getTaskById(taskId: string): typeof MVP_TASKS[0] | null {
    return MVP_TASKS.find(task => task.id === taskId) || null;
  }

  /**
   * Get all enabled tasks for a user
   */
  static getEnabledTasks(userProfile: UserProfile): typeof MVP_TASKS {
    const enabledTaskIds = userProfile.routine.selectedTasks
      .filter(task => task.isEnabled)
      .map(task => task.taskId);
    
    return MVP_TASKS.filter(task => enabledTaskIds.includes(task.id));
  }

  /**
   * Calculate task completion percentage
   */
  static calculateTaskCompletionPercentage(tasks: FirestoreTaskCompletion[]): number {
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    return tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
  }

  /**
   * Get next incomplete task
   */
  static getNextIncompleteTask(tasks: FirestoreTaskCompletion[]): FirestoreTaskCompletion | null {
    return tasks.find(task => task.status === 'not_started') || null;
  }

  /**
   * Check if all tasks are completed
   */
  static areAllTasksCompleted(tasks: FirestoreTaskCompletion[]): boolean {
    return tasks.every(task => task.status === 'completed' || task.status === 'skipped');
  }

  /**
   * Get task completion summary
   */
  static getTaskCompletionSummary(tasks: FirestoreTaskCompletion[]): {
    total: number;
    completed: number;
    skipped: number;
    inProgress: number;
    notStarted: number;
  } {
    return {
      total: tasks.length,
      completed: tasks.filter(task => task.status === 'completed').length,
      skipped: tasks.filter(task => task.status === 'skipped').length,
      inProgress: tasks.filter(task => task.status === 'in_progress').length,
      notStarted: tasks.filter(task => task.status === 'not_started').length,
    };
  }

  /**
   * Estimate total routine duration
   */
  static estimateRoutineDuration(tasks: FirestoreTaskCompletion[]): number {
    return tasks.reduce((total, task) => total + task.plannedDuration, 0);
  }

  /**
   * Calculate actual routine duration
   */
  static calculateActualRoutineDuration(tasks: FirestoreTaskCompletion[]): number {
    return tasks.reduce((total, task) => total + (task.actualDuration || 0), 0);
  }

  /**
   * Validate task order
   */
  static validateTaskOrder(tasks: FirestoreTaskCompletion[]): boolean {
    const mvpTaskOrder = ['drink_water', 'no_phone_usage', 'sunlight_exposure', 'elephant_task'];
    const taskOrder = tasks.map(task => task.taskId);
    
    // Check if MVP tasks appear in the correct order (other tasks can be interspersed)
    const mvpIndices = mvpTaskOrder.map(taskId => taskOrder.indexOf(taskId));
    return mvpIndices.every((index, i) => i === 0 || index > mvpIndices[i - 1]);
  }
}

/**
 * Analytics and Statistics Utilities
 */
export class AnalyticsUtils {
  /**
   * Calculate completion rate for a period
   */
  static calculateCompletionRate(progresses: FirestoreDailyProgress[]): number {
    if (progresses.length === 0) return 0;
    
    const completedDays = progresses.filter(progress => progress.session.isCompleted).length;
    return (completedDays / progresses.length) * 100;
  }

  /**
   * Calculate average score for a period
   */
  static calculateAverageScore(progresses: FirestoreDailyProgress[]): number {
    if (progresses.length === 0) return 0;
    
    const totalScore = progresses.reduce((sum, progress) => sum + progress.session.completionPercentage, 0);
    return totalScore / progresses.length;
  }

  /**
   * Find longest streak in progress history
   */
  static findLongestStreak(progresses: FirestoreDailyProgress[]): number {
    if (progresses.length === 0) return 0;
    
    // Sort by date
    const sortedProgresses = [...progresses].sort((a, b) => a.date.localeCompare(b.date));
    
    let longestStreak = 0;
    let currentStreak = 0;
    
    for (const progress of sortedProgresses) {
      if (progress.session.completionPercentage >= SCORING_CONFIG.passingScore) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }
    
    return longestStreak;
  }

  /**
   * Find current streak
   */
  static findCurrentStreak(progresses: FirestoreDailyProgress[]): number {
    if (progresses.length === 0) return 0;
    
    // Sort by date (newest first)
    const sortedProgresses = [...progresses].sort((a, b) => b.date.localeCompare(a.date));
    
    let currentStreak = 0;
    
    for (const progress of sortedProgresses) {
      if (progress.session.completionPercentage >= SCORING_CONFIG.passingScore) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    return currentStreak;
  }

  /**
   * Get task performance breakdown
   */
  static getTaskPerformanceBreakdown(progresses: FirestoreDailyProgress[]): Record<string, { completionRate: number; averageRating: number }> {
    const breakdown: Record<string, { completionRate: number; averageRating: number }> = {};
    
    for (const taskId of Object.keys(SCORING_CONFIG.taskWeights)) {
      const allTaskCompletions = progresses.flatMap(progress => 
        progress.tasks.filter(task => task.taskId === taskId)
      );
      
      const completedTasks = allTaskCompletions.filter(task => task.status === 'completed');
      const completionRate = allTaskCompletions.length > 0 ? 
        (completedTasks.length / allTaskCompletions.length) * 100 : 0;
      
      const ratedTasks = completedTasks.filter(task => task.rating !== undefined);
      const averageRating = ratedTasks.length > 0 ? 
        ratedTasks.reduce((sum, task) => sum + (task.rating || 0), 0) / ratedTasks.length : 0;
      
      breakdown[taskId] = {
        completionRate,
        averageRating,
      };
    }
    
    return breakdown;
  }

  /**
   * Get best performing days
   */
  static getBestPerformingDays(progresses: FirestoreDailyProgress[], limit: number = 5): FirestoreDailyProgress[] {
    return [...progresses]
      .sort((a, b) => b.session.completionPercentage - a.session.completionPercentage)
      .slice(0, limit);
  }

  /**
   * Get improvement opportunities
   */
  static getImprovementOpportunities(progresses: FirestoreDailyProgress[]): string[] {
    const opportunities: string[] = [];
    const taskBreakdown = this.getTaskPerformanceBreakdown(progresses);
    
    // Check for tasks with low completion rates
    for (const [taskId, performance] of Object.entries(taskBreakdown)) {
      if (performance.completionRate < 70) {
        const task = TaskUtils.getTaskById(taskId);
        opportunities.push(`Improve consistency with ${task?.name || taskId} (${performance.completionRate.toFixed(1)}% completion rate)`);
      }
    }
    
    // Check overall completion rate
    const overallRate = this.calculateCompletionRate(progresses);
    if (overallRate < 80) {
      opportunities.push(`Focus on daily consistency (${overallRate.toFixed(1)}% completion rate)`);
    }
    
    // Check for streak building
    const currentStreak = this.findCurrentStreak(progresses);
    if (currentStreak < 7) {
      opportunities.push('Build a longer streak by completing more days consecutively');
    }
    
    return opportunities;
  }
}

/**
 * Caching and Performance Utilities
 */
export class CacheUtils {
  private static cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  /**
   * Set cache entry with TTL
   */
  static set(key: string, data: any, ttlSeconds: number = 300): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000,
    });
  }

  /**
   * Get cache entry if still valid
   */
  static get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  /**
   * Clear expired entries
   */
  static clearExpired(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  static clearAll(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  static getSize(): number {
    return this.cache.size;
  }
}

/**
 * Error Handling Utilities
 */
export class ErrorUtils {
  /**
   * Check if error is a Firestore permission error
   */
  static isPermissionError(error: any): boolean {
    return error?.code === 'permission-denied' || error?.code === 'firestore/permission-denied';
  }

  /**
   * Check if error is a network error
   */
  static isNetworkError(error: any): boolean {
    return error?.code === 'unavailable' || error?.code === 'firestore/unavailable' || 
           error?.message?.includes('network') || error?.message?.includes('connection');
  }

  /**
   * Check if error is retryable
   */
  static isRetryableError(error: any): boolean {
    const retryableCodes = [
      'unavailable',
      'deadline-exceeded',
      'internal',
      'resource-exhausted',
      'aborted',
    ];
    
    return retryableCodes.some(code => error?.code?.includes(code));
  }

  /**
   * Format error for user display
   */
  static formatUserError(error: any): string {
    if (this.isPermissionError(error)) {
      return 'You don\'t have permission to access this data. Please sign in again.';
    }
    
    if (this.isNetworkError(error)) {
      return 'Please check your internet connection and try again.';
    }
    
    return error?.message || 'An unexpected error occurred. Please try again.';
  }

  /**
   * Log error with context
   */
  static logError(error: any, context: string, userId?: string): void {
    console.error(`[${context}] Error${userId ? ` for user ${userId}` : ''}:`, {
      message: error?.message,
      code: error?.code,
      stack: error?.stack,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Export all utilities
 */
export const databaseUtils = {
  transform: DataTransformUtils,
  dateTime: DateTimeUtils,
  task: TaskUtils,
  analytics: AnalyticsUtils,
  cache: CacheUtils,
  error: ErrorUtils,
};

export default databaseUtils;