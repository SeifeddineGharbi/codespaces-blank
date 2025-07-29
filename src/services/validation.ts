/**
 * Comprehensive Data Validation Functions for Productivity Morning Routine App
 * 
 * This module provides robust validation for all Firestore data structures
 * including user profiles, daily progress, tasks, and the 4 core MVP habits.
 * 
 * @version 1.0.0
 * @author Backend Agent - Productivity Morning Routine
 */

import { Timestamp } from 'firebase/firestore';
import { 
  FirestoreUserProfile, 
  FirestoreDailyProgress, 
  FirestoreTaskCompletion,
  FirestoreOnboardingResponses,
  FirestoreRoutineTask
} from '../types';
import { SCORING_CONFIG, MVP_TASKS } from '../constants';

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

// Field validation result interface
export interface FieldValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Core Field Validators
 */
export const fieldValidators = {
  /**
   * Validate email address format
   */
  email: (email: any): FieldValidationResult => {
    if (typeof email !== 'string') {
      return { isValid: false, error: 'Email must be a string' };
    }
    
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    const isValid = emailRegex.test(email) && email.length <= 254;
    
    return {
      isValid,
      error: isValid ? undefined : 'Invalid email format'
    };
  },

  /**
   * Validate time format (HH:mm)
   */
  timeFormat: (time: any): FieldValidationResult => {
    if (typeof time !== 'string') {
      return { isValid: false, error: 'Time must be a string' };
    }
    
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    const isValid = timeRegex.test(time);
    
    return {
      isValid,
      error: isValid ? undefined : 'Invalid time format (expected HH:mm)'
    };
  },

  /**
   * Validate date format (YYYY-MM-DD)
   */
  dateFormat: (date: any): FieldValidationResult => {
    if (typeof date !== 'string') {
      return { isValid: false, error: 'Date must be a string' };
    }
    
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return { isValid: false, error: 'Invalid date format (expected YYYY-MM-DD)' };
    }
    
    // Validate actual date
    const parsedDate = new Date(date);
    const isValid = parsedDate.toISOString().split('T')[0] === date;
    
    return {
      isValid,
      error: isValid ? undefined : 'Invalid date value'
    };
  },

  /**
   * Validate user ID format
   */
  userId: (userId: any): FieldValidationResult => {
    if (typeof userId !== 'string') {
      return { isValid: false, error: 'User ID must be a string' };
    }
    
    const isValid = userId.length > 0 && userId.length <= 128;
    
    return {
      isValid,
      error: isValid ? undefined : 'Invalid user ID format'
    };
  },

  /**
   * Validate timezone string
   */
  timezone: (timezone: any): FieldValidationResult => {
    if (typeof timezone !== 'string') {
      return { isValid: false, error: 'Timezone must be a string' };
    }
    
    try {
      // Test if timezone is valid by creating a date
      Intl.DateTimeFormat(undefined, { timeZone: timezone });
      return { isValid: true };
    } catch {
      return { isValid: false, error: 'Invalid timezone format' };
    }
  },

  /**
   * Validate locale string
   */
  locale: (locale: any): FieldValidationResult => {
    if (typeof locale !== 'string') {
      return { isValid: false, error: 'Locale must be a string' };
    }
    
    const localeRegex = /^[a-z]{2}(-[A-Z]{2})?$/;
    const isValid = localeRegex.test(locale);
    
    return {
      isValid,
      error: isValid ? undefined : 'Invalid locale format (expected: en-US, fr, etc.)'
    };
  },

  /**
   * Validate percentage (0-100)
   */
  percentage: (value: any): FieldValidationResult => {
    if (typeof value !== 'number') {
      return { isValid: false, error: 'Percentage must be a number' };
    }
    
    const isValid = value >= 0 && value <= 100 && !isNaN(value);
    
    return {
      isValid,
      error: isValid ? undefined : 'Percentage must be between 0 and 100'
    };
  },

  /**
   * Validate duration in minutes
   */
  duration: (value: any): FieldValidationResult => {
    if (typeof value !== 'number') {
      return { isValid: false, error: 'Duration must be a number' };
    }
    
    const isValid = value >= 0 && value <= 1440 && !isNaN(value); // Max 24 hours
    
    return {
      isValid,
      error: isValid ? undefined : 'Duration must be between 0 and 1440 minutes'
    };
  },

  /**
   * Validate Firestore timestamp
   */
  timestamp: (value: any): FieldValidationResult => {
    // Handle serverTimestamp() sentinel values during creation
    // These have a specific structure with _methodName property (Firebase v9+)
    if (value && typeof value === 'object' && (
        value._methodName === 'serverTimestamp' || 
        value.methodName === 'serverTimestamp' || 
        value.constructor?.name?.includes('FieldValue') ||
        value.constructor?.name?.includes('ServerTimestamp') ||
        (typeof value.toDate !== 'function' && value.toString?.().includes('ServerTimestamp')))) {
      return { isValid: true };
    }
    
    // Handle regular Timestamp instances
    if (value instanceof Timestamp) {
      return { isValid: true };
    }
    
    // Handle null/undefined for optional timestamps
    if (value === null || value === undefined) {
      return { isValid: true };
    }
    
    return { isValid: false, error: 'Value must be a Firestore Timestamp' };
  },

  /**
   * Validate task status
   */
  taskStatus: (status: any): FieldValidationResult => {
    const validStatuses = ['not_started', 'in_progress', 'completed', 'skipped'];
    
    if (typeof status !== 'string') {
      return { isValid: false, error: 'Task status must be a string' };
    }
    
    const isValid = validStatuses.includes(status);
    
    return {
      isValid,
      error: isValid ? undefined : `Task status must be one of: ${validStatuses.join(', ')}`
    };
  },

  /**
   * Validate MVP task ID
   */
  mvpTaskId: (taskId: any): FieldValidationResult => {
    if (typeof taskId !== 'string') {
      return { isValid: false, error: 'Task ID must be a string' };
    }
    
    const validTaskIds = MVP_TASKS.map(task => task.id);
    const isValid = validTaskIds.includes(taskId);
    
    return {
      isValid,
      error: isValid ? undefined : `Task ID must be one of: ${validTaskIds.join(', ')}`
    };
  },

  /**
   * Validate rating (1-5 or 1-10)
   */
  rating: (value: any, max: number = 5): FieldValidationResult => {
    if (typeof value !== 'number') {
      return { isValid: false, error: 'Rating must be a number' };
    }
    
    const isValid = value >= 1 && value <= max && Number.isInteger(value);
    
    return {
      isValid,
      error: isValid ? undefined : `Rating must be an integer between 1 and ${max}`
    };
  }
};

/**
 * MVP Task Validators
 * Specific validation for the 4 core habits
 */
export const mvpTaskValidators = {
  /**
   * Validate drink water task completion
   */
  drinkWater: (taskCompletion: FirestoreTaskCompletion): ValidationResult => {
    const errors: string[] = [];
    
    if (taskCompletion.taskId !== 'drink_water') {
      errors.push('Invalid task ID for drink water task');
    }
    
    if (taskCompletion.status === 'completed') {
      // For water task, we might want to ensure it was completed quickly
      if (taskCompletion.actualDuration && taskCompletion.actualDuration > 5) {
        errors.push('Drink water task should typically take less than 5 minutes');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings: []
    };
  },

  /**
   * Validate no phone usage task completion
   */
  noPhoneUsage: (taskCompletion: FirestoreTaskCompletion): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (taskCompletion.taskId !== 'no_phone_usage') {
      errors.push('Invalid task ID for no phone usage task');
    }
    
    if (taskCompletion.status === 'skipped') {
      warnings.push('Phone usage task was skipped - this significantly impacts morning routine effectiveness');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  },

  /**
   * Validate sunlight exposure task completion
   */
  sunlightExposure: (taskCompletion: FirestoreTaskCompletion): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (taskCompletion.taskId !== 'sunlight_exposure') {
      errors.push('Invalid task ID for sunlight exposure task');
    }
    
    if (taskCompletion.status === 'completed') {
      // Sunlight exposure should ideally be 5-10 minutes
      if (taskCompletion.actualDuration && taskCompletion.actualDuration < 3) {
        warnings.push('Sunlight exposure of less than 3 minutes may not be sufficient');
      }
      if (taskCompletion.actualDuration && taskCompletion.actualDuration > 20) {
        warnings.push('Extended sunlight exposure detected - ensure UV protection');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  },

  /**
   * Validate elephant task identification
   */
  elephantTask: (taskCompletion: FirestoreTaskCompletion): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (taskCompletion.taskId !== 'elephant_task') {
      errors.push('Invalid task ID for elephant task');
    }
    
    if (taskCompletion.status === 'completed') {
      // Elephant task should have notes about what the task is
      if (!taskCompletion.notes || taskCompletion.notes.trim().length < 10) {
        warnings.push('Consider adding detailed notes about your identified elephant task');
      }
    }
    
    if (taskCompletion.status === 'skipped') {
      warnings.push('Skipping elephant task identification reduces daily productivity focus');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
};

/**
 * User Profile Validation
 */
export const validateUserProfile = (profile: any): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check required top-level fields
  const requiredFields = ['userId', 'profile', 'onboarding', 'routine', 'settings', 'subscription', 'stats', 'metadata'];
  for (const field of requiredFields) {
    if (!profile || !profile.hasOwnProperty(field)) {
      errors.push(`Missing required field: ${field}`);
    }
  }
  
  if (errors.length > 0) {
    return { isValid: false, errors, warnings };
  }
  
  // Validate userId
  const userIdValidation = fieldValidators.userId(profile.userId);
  if (!userIdValidation.isValid) {
    errors.push(`Invalid userId: ${userIdValidation.error}`);
  }
  
  // Validate profile section
  if (profile.profile) {
    const emailValidation = fieldValidators.email(profile.profile.email);
    if (!emailValidation.isValid) {
      errors.push(`Invalid email: ${emailValidation.error}`);
    }
    
    const timezoneValidation = fieldValidators.timezone(profile.profile.timeZone);
    if (!timezoneValidation.isValid) {
      errors.push(`Invalid timezone: ${timezoneValidation.error}`);
    }
    
    const localeValidation = fieldValidators.locale(profile.profile.locale);
    if (!localeValidation.isValid) {
      errors.push(`Invalid locale: ${localeValidation.error}`);
    }
  }
  
  // Validate onboarding section
  if (profile.onboarding) {
    if (typeof profile.onboarding.isCompleted !== 'boolean') {
      errors.push('Onboarding isCompleted must be a boolean');
    }
    
    if (profile.onboarding.completedAt) {
      const timestampValidation = fieldValidators.timestamp(profile.onboarding.completedAt);
      if (!timestampValidation.isValid) {
        errors.push(`Invalid completedAt timestamp: ${timestampValidation.error}`);
      }
    }
  }
  
  // Validate routine section
  if (profile.routine) {
    const wakeTimeValidation = fieldValidators.timeFormat(profile.routine.wakeTime);
    if (!wakeTimeValidation.isValid) {
      errors.push(`Invalid wake time: ${wakeTimeValidation.error}`);
    }
    
    if (profile.routine.workStartTime) {
      const workStartTimeValidation = fieldValidators.timeFormat(profile.routine.workStartTime);
      if (!workStartTimeValidation.isValid) {
        errors.push(`Invalid work start time: ${workStartTimeValidation.error}`);
      }
      
      // Validate that work start time is after wake time
      if (wakeTimeValidation.isValid && workStartTimeValidation.isValid) {
        const wakeMinutes = timeToMinutes(profile.routine.wakeTime);
        const workMinutes = timeToMinutes(profile.routine.workStartTime);
        
        // Handle edge case where work might be next day (e.g., wake at 11 PM, work at 1 AM)
        if (workMinutes <= wakeMinutes && !(wakeMinutes > 1200 && workMinutes < 360)) {
          errors.push('Work start time must be after wake time');
        }
      }
    }
    
    const durationValidation = fieldValidators.duration(profile.routine.routineDuration);
    if (!durationValidation.isValid) {
      errors.push(`Invalid routine duration: ${durationValidation.error}`);
    }
    
    // Validate selected tasks
    if (Array.isArray(profile.routine.selectedTasks)) {
      profile.routine.selectedTasks.forEach((task: any, index: number) => {
        if (!task.taskId || !task.hasOwnProperty('duration') || !task.hasOwnProperty('order') || !task.hasOwnProperty('isEnabled')) {
          errors.push(`Invalid task at index ${index}: missing required fields`);
        } else {
          const taskIdValidation = fieldValidators.mvpTaskId(task.taskId);
          if (!taskIdValidation.isValid) {
            errors.push(`Invalid task ID at index ${index}: ${taskIdValidation.error}`);
          }
          
          const taskDurationValidation = fieldValidators.duration(task.duration);
          if (!taskDurationValidation.isValid) {
            errors.push(`Invalid task duration at index ${index}: ${taskDurationValidation.error}`);
          }
        }
      });
    }
  }
  
  // Validate subscription section
  if (profile.subscription) {
    const validStatuses = ['active', 'cancelled', 'expired', 'trial', 'none'];
    if (!validStatuses.includes(profile.subscription.status)) {
      errors.push(`Invalid subscription status: ${profile.subscription.status}`);
    }
    
    if (profile.subscription.plan) {
      const validPlans = ['weekly', 'annual'];
      if (!validPlans.includes(profile.subscription.plan)) {
        errors.push(`Invalid subscription plan: ${profile.subscription.plan}`);
      }
    }
  }
  
  // Validate stats section
  if (profile.stats) {
    const numericFields = ['totalCompletions', 'currentStreak', 'longestStreak', 'averageCompletionScore', 'totalDaysActive'];
    numericFields.forEach(field => {
      if (typeof profile.stats[field] !== 'number' || profile.stats[field] < 0) {
        errors.push(`Invalid ${field}: must be a non-negative number`);
      }
    });
    
    if (profile.stats.averageCompletionScore > 100) {
      errors.push('Average completion score cannot exceed 100');
    }
  }
  
  // Validate metadata section
  if (profile.metadata) {
    const timestampFields = ['createdAt', 'lastUpdated'];
    timestampFields.forEach(field => {
      if (profile.metadata[field]) {
        const timestampValidation = fieldValidators.timestamp(profile.metadata[field]);
        if (!timestampValidation.isValid) {
          errors.push(`Invalid ${field} timestamp: ${timestampValidation.error}`);
        }
      }
    });
    
    if (typeof profile.metadata.version !== 'number' || profile.metadata.version < 1) {
      errors.push('Metadata version must be a positive number');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Daily Progress Validation
 */
export const validateDailyProgress = (progress: any): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check required top-level fields
  const requiredFields = ['userId', 'date', 'session', 'tasks', 'metadata'];
  for (const field of requiredFields) {
    if (!progress || !progress.hasOwnProperty(field)) {
      errors.push(`Missing required field: ${field}`);
    }
  }
  
  if (errors.length > 0) {
    return { isValid: false, errors, warnings };
  }
  
  // Validate userId
  const userIdValidation = fieldValidators.userId(progress.userId);
  if (!userIdValidation.isValid) {
    errors.push(`Invalid userId: ${userIdValidation.error}`);
  }
  
  // Validate date
  const dateValidation = fieldValidators.dateFormat(progress.date);
  if (!dateValidation.isValid) {
    errors.push(`Invalid date: ${dateValidation.error}`);
  }
  
  // Validate session
  if (progress.session) {
    if (typeof progress.session.isCompleted !== 'boolean') {
      errors.push('Session isCompleted must be a boolean');
    }
    
    const percentageValidation = fieldValidators.percentage(progress.session.completionPercentage);
    if (!percentageValidation.isValid) {
      errors.push(`Invalid completion percentage: ${percentageValidation.error}`);
    }
    
    if (progress.session.startTime) {
      const startTimeValidation = fieldValidators.timestamp(progress.session.startTime);
      if (!startTimeValidation.isValid) {
        errors.push(`Invalid start time: ${startTimeValidation.error}`);
      }
    }
    
    if (progress.session.endTime) {
      const endTimeValidation = fieldValidators.timestamp(progress.session.endTime);
      if (!endTimeValidation.isValid) {
        errors.push(`Invalid end time: ${endTimeValidation.error}`);
      }
      
      // Validate that end time is after start time
      if (progress.session.startTime && progress.session.endTime.toMillis() <= progress.session.startTime.toMillis()) {
        errors.push('Session end time must be after start time');
      }
    }
    
    if (progress.session.duration !== undefined) {
      const durationValidation = fieldValidators.duration(progress.session.duration);
      if (!durationValidation.isValid) {
        errors.push(`Invalid session duration: ${durationValidation.error}`);
      }
    }
  }
  
  // Validate tasks array
  if (Array.isArray(progress.tasks)) {
    const taskValidations = validateTaskCompletions(progress.tasks);
    errors.push(...taskValidations.errors);
    warnings.push(...(taskValidations.warnings || []));
  } else {
    errors.push('Tasks must be an array');
  }
  
  // Validate metrics if present
  if (progress.metrics) {
    if (progress.metrics.wakeTime) {
      const wakeTimeValidation = fieldValidators.timeFormat(progress.metrics.wakeTime);
      if (!wakeTimeValidation.isValid) {
        errors.push(`Invalid wake time in metrics: ${wakeTimeValidation.error}`);
      }
    }
    
    const ratingFields = ['energyLevel', 'moodRating', 'difficultyRating', 'motivationLevel'];
    ratingFields.forEach(field => {
      if (progress.metrics[field] !== undefined) {
        const ratingValidation = fieldValidators.rating(progress.metrics[field], 10);
        if (!ratingValidation.isValid) {
          errors.push(`Invalid ${field}: ${ratingValidation.error}`);
        }
      }
    });
  }
  
  // Validate streaks if present
  if (progress.streaks) {
    const streakFields = ['currentStreak', 'longestStreak'];
    streakFields.forEach(field => {
      if (typeof progress.streaks[field] !== 'number' || progress.streaks[field] < 0) {
        errors.push(`Invalid ${field}: must be a non-negative number`);
      }
    });
    
    if (typeof progress.streaks.isStreakDay !== 'boolean') {
      errors.push('isStreakDay must be a boolean');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Task Completions Validation
 */
export const validateTaskCompletions = (tasks: any[]): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!Array.isArray(tasks)) {
    return { isValid: false, errors: ['Tasks must be an array'], warnings };
  }
  
  // Check for MVP tasks presence
  const mvpTaskIds = MVP_TASKS.map(task => task.id);
  const presentTaskIds = tasks.map(task => task.taskId).filter(id => mvpTaskIds.includes(id));
  
  if (presentTaskIds.length !== mvpTaskIds.length) {
    const missingTasks = mvpTaskIds.filter(id => !presentTaskIds.includes(id));
    warnings.push(`Missing MVP tasks: ${missingTasks.join(', ')}`);
  }
  
  // Validate each task completion
  tasks.forEach((task, index) => {
    if (!task || typeof task !== 'object') {
      errors.push(`Task at index ${index} must be an object`);
      return;
    }
    
    // Required fields
    const requiredFields = ['taskId', 'name', 'category', 'plannedDuration', 'status'];
    for (const field of requiredFields) {
      if (!task.hasOwnProperty(field)) {
        errors.push(`Task at index ${index} missing required field: ${field}`);
      }
    }
    
    // Validate task ID
    if (task.taskId) {
      const taskIdValidation = fieldValidators.mvpTaskId(task.taskId);
      if (!taskIdValidation.isValid) {
        errors.push(`Task at index ${index} has invalid ID: ${taskIdValidation.error}`);
      } else {
        // Run MVP-specific validation
        const mvpValidation = validateMVPTaskCompletion(task);
        errors.push(...mvpValidation.errors);
        warnings.push(...(mvpValidation.warnings || []));
      }
    }
    
    // Validate status
    if (task.status) {
      const statusValidation = fieldValidators.taskStatus(task.status);
      if (!statusValidation.isValid) {
        errors.push(`Task at index ${index} has invalid status: ${statusValidation.error}`);
      }
    }
    
    // Validate durations
    if (task.plannedDuration !== undefined) {
      const plannedDurationValidation = fieldValidators.duration(task.plannedDuration);
      if (!plannedDurationValidation.isValid) {
        errors.push(`Task at index ${index} has invalid planned duration: ${plannedDurationValidation.error}`);
      }
    }
    
    if (task.actualDuration !== undefined) {
      const actualDurationValidation = fieldValidators.duration(task.actualDuration);
      if (!actualDurationValidation.isValid) {
        errors.push(`Task at index ${index} has invalid actual duration: ${actualDurationValidation.error}`);
      }
    }
    
    // Validate timestamps
    if (task.startTime) {
      const startTimeValidation = fieldValidators.timestamp(task.startTime);
      if (!startTimeValidation.isValid) {
        errors.push(`Task at index ${index} has invalid start time: ${startTimeValidation.error}`);
      }
    }
    
    if (task.endTime) {
      const endTimeValidation = fieldValidators.timestamp(task.endTime);
      if (!endTimeValidation.isValid) {
        errors.push(`Task at index ${index} has invalid end time: ${endTimeValidation.error}`);
      }
      
      // Validate that end time is after start time
      if (task.startTime && task.endTime.toMillis() <= task.startTime.toMillis()) {
        errors.push(`Task at index ${index} end time must be after start time`);
      }
    }
    
    // Validate rating
    if (task.rating !== undefined) {
      const ratingValidation = fieldValidators.rating(task.rating, 5);
      if (!ratingValidation.isValid) {
        errors.push(`Task at index ${index} has invalid rating: ${ratingValidation.error}`);
      }
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * MVP Task Completion Validation
 */
export const validateMVPTaskCompletion = (task: FirestoreTaskCompletion): ValidationResult => {
  switch (task.taskId) {
    case 'drink_water':
      return mvpTaskValidators.drinkWater(task);
    case 'no_phone_usage':
      return mvpTaskValidators.noPhoneUsage(task);
    case 'sunlight_exposure':
      return mvpTaskValidators.sunlightExposure(task);
    case 'elephant_task':
      return mvpTaskValidators.elephantTask(task);
    default:
      return {
        isValid: false,
        errors: [`Unknown MVP task ID: ${task.taskId}`],
        warnings: []
      };
  }
};

/**
 * Onboarding Responses Validation
 */
export const validateOnboardingResponses = (responses: any): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!responses || typeof responses !== 'object') {
    return { isValid: false, errors: ['Onboarding responses must be an object'], warnings };
  }
  
  // Required fields
  const requiredFields = ['currentWakeTime', 'workType', 'workStyle', 'bedTimeHabits', 'energySlumps', 'productivityRating', 'primaryGoal', 'coffeeHabits', 'socialMediaHabits', 'weekendProductivity'];
  
  for (const field of requiredFields) {
    if (!responses.hasOwnProperty(field) || responses[field] === null || responses[field] === undefined) {
      errors.push(`Missing required onboarding response: ${field}`);
    }
  }
  
  // Validate wake time
  if (responses.currentWakeTime) {
    const wakeTimeValidation = fieldValidators.timeFormat(responses.currentWakeTime);
    if (!wakeTimeValidation.isValid) {
      errors.push(`Invalid current wake time: ${wakeTimeValidation.error}`);
    }
  }
  
  // Validate work start time if provided
  if (responses.workStartTime) {
    const workStartTimeValidation = fieldValidators.timeFormat(responses.workStartTime);
    if (!workStartTimeValidation.isValid) {
      errors.push(`Invalid work start time: ${workStartTimeValidation.error}`);
    }
  }
  
  // Validate productivity rating
  if (responses.productivityRating !== undefined) {
    const ratingValidation = fieldValidators.rating(responses.productivityRating, 10);
    if (!ratingValidation.isValid) {
      errors.push(`Invalid productivity rating: ${ratingValidation.error}`);
    }
  }
  
  // Validate arrays
  const arrayFields = ['motivations', 'challenges', 'goals'];
  arrayFields.forEach(field => {
    if (responses[field] && !Array.isArray(responses[field])) {
      errors.push(`${field} must be an array`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Utility Functions
 */

/**
 * Convert time string (HH:mm) to minutes since midnight
 */
function timeToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Validate scoring consistency
 */
export const validateScoring = (tasks: FirestoreTaskCompletion[]): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check that all MVP tasks are present for accurate scoring
  const mvpTaskIds = Object.keys(SCORING_CONFIG.taskWeights);
  const presentTaskIds = tasks.map(task => task.taskId);
  
  const missingTasks = mvpTaskIds.filter(id => !presentTaskIds.includes(id));
  if (missingTasks.length > 0) {
    warnings.push(`Missing tasks for complete scoring: ${missingTasks.join(', ')}`);
  }
  
  // Validate that task weights are properly distributed
  const totalWeight = Object.values(SCORING_CONFIG.taskWeights).reduce((sum, weight) => sum + weight, 0);
  if (totalWeight !== 100) {
    errors.push(`Task weights must sum to 100%, currently: ${totalWeight}%`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Batch validation for multiple documents
 */
export const validateBatch = (documents: { type: string; data: any }[]): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  documents.forEach((doc, index) => {
    let validation: ValidationResult;
    
    switch (doc.type) {
      case 'userProfile':
        validation = validateUserProfile(doc.data);
        break;
      case 'dailyProgress':
        validation = validateDailyProgress(doc.data);
        break;
      case 'onboardingResponses':
        validation = validateOnboardingResponses(doc.data);
        break;
      default:
        validation = { isValid: false, errors: [`Unknown document type: ${doc.type}`], warnings: [] };
    }
    
    if (!validation.isValid) {
      errors.push(`Document ${index} (${doc.type}): ${validation.errors.join(', ')}`);
    }
    
    if (validation.warnings && validation.warnings.length > 0) {
      warnings.push(`Document ${index} (${doc.type}): ${validation.warnings.join(', ')}`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};