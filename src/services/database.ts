/**
 * Comprehensive Database Operations for Productivity Morning Routine App
 * 
 * This module provides enhanced CRUD operations for all Firestore collections
 * with proper validation, error handling, and support for the 4 core MVP habits.
 * 
 * @version 1.0.0
 * @author Backend Agent - Productivity Morning Routine
 */

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs,
  setDoc, 
  addDoc,
  updateDoc,
  deleteDoc,
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  writeBatch,
  runTransaction,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData,
  FirestoreError
} from 'firebase/firestore';

import { 
  FirestoreUserProfile, 
  FirestoreDailyProgress, 
  FirestoreTaskCompletion,
  FirestoreOnboardingResponses,
  MVP_TASKS
} from '@/src/types';
import { COLLECTIONS, SCORING_CONFIG } from '@/src/constants';
import { db } from '@/src/services/firebase';
import { 
  validateUserProfile, 
  validateDailyProgress, 
  validateOnboardingResponses,
  ValidationResult 
} from '@/src/services/validation';
import { calculateDailyScore, scoringUtils } from '@/src/services/scoring';

// Database operation interfaces
export interface DatabaseResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export interface BatchOperation {
  type: 'create' | 'update' | 'delete';
  collection: string;
  docId: string;
  data?: any;
}

export interface PaginationOptions {
  limit?: number;
  startAfter?: QueryDocumentSnapshot<DocumentData>;
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface QueryOptions extends PaginationOptions {
  where?: {
    field: string;
    operator: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'in' | 'not-in' | 'array-contains' | 'array-contains-any';
    value: any;
  }[];
}

/**
 * Enhanced User Profile Operations
 */
export class UserProfileService {
  private static instance: UserProfileService;
  
  public static getInstance(): UserProfileService {
    if (!UserProfileService.instance) {
      UserProfileService.instance = new UserProfileService();
    }
    return UserProfileService.instance;
  }

  /**
   * Create a new user profile with validation
   */
  async createUserProfile(userId: string, profileData: Partial<FirestoreUserProfile>): Promise<DatabaseResult<FirestoreUserProfile>> {
    try {
      if (!db) {
        return { success: false, error: 'Database not initialized', code: 'db/not-initialized' };
      }

      // Create complete profile with defaults
      const completeProfile: FirestoreUserProfile = {
        userId,
        profile: {
          email: profileData.profile?.email || '',
          displayName: profileData.profile?.displayName,
          photoURL: profileData.profile?.photoURL,
          timeZone: profileData.profile?.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
          locale: profileData.profile?.locale || 'en-US',
        },
        onboarding: {
          isCompleted: false,
          responses: {} as FirestoreOnboardingResponses,
          ...profileData.onboarding
        },
        routine: {
          wakeTime: '07:00',
          routineDuration: 30,
          selectedTasks: MVP_TASKS.map((task, index) => ({
            taskId: task.id,
            duration: 5,
            order: index + 1,
            isEnabled: true
          })),
          ...profileData.routine
        },
        settings: {
          notifications: {
            morningReminder: true,
            reminderTime: '05:45',
            motivationalQuotes: true,
            weeklyProgress: true,
            streakMilestones: true,
          },
          privacy: {
            analyticsOptIn: true,
            crashReportingOptIn: true,
          },
          ...profileData.settings
        },
        subscription: {
          status: 'none',
          isTrialUser: false,
          hasUsedTrial: false,
          ...profileData.subscription
        },
        stats: {
          totalCompletions: 0,
          currentStreak: 0,
          longestStreak: 0,
          averageCompletionScore: 0,
          totalDaysActive: 0,
          joinDate: serverTimestamp() as Timestamp,
          lastActive: serverTimestamp() as Timestamp,
          achievements: [],
          ...profileData.stats
        },
        metadata: {
          createdAt: serverTimestamp() as Timestamp,
          lastUpdated: serverTimestamp() as Timestamp,
          version: 1,
          deviceInfo: profileData.metadata?.deviceInfo,
        }
      };

      // Validate the complete profile
      const validation = validateUserProfile(completeProfile);
      if (!validation.isValid) {
        return { 
          success: false, 
          error: `Validation failed: ${validation.errors.join(', ')}`, 
          code: 'validation/failed' 
        };
      }

      // Create the document
      const userRef = doc(db, COLLECTIONS.users, userId);
      await setDoc(userRef, completeProfile);

      console.log('✅ User profile created successfully:', userId);
      return { success: true, data: completeProfile };

    } catch (error) {
      console.error('❌ Error creating user profile:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        code: (error as FirestoreError)?.code || 'unknown'
      };
    }
  }

  /**
   * Get user profile with caching support
   */
  async getUserProfile(userId: string): Promise<DatabaseResult<FirestoreUserProfile>> {
    try {
      if (!db) {
        return { success: false, error: 'Database not initialized', code: 'db/not-initialized' };
      }

      const userRef = doc(db, COLLECTIONS.users, userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return { success: false, error: 'User profile not found', code: 'profile/not-found' };
      }

      const profileData = userDoc.data() as FirestoreUserProfile;
      
      // Validate retrieved data
      const validation = validateUserProfile(profileData);
      if (!validation.isValid) {
        console.warn('⚠️ Retrieved user profile has validation issues:', validation.errors);
      }

      console.log('✅ User profile retrieved successfully:', userId);
      return { success: true, data: profileData };

    } catch (error) {
      console.error('❌ Error retrieving user profile:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        code: (error as FirestoreError)?.code || 'unknown'
      };
    }
  }

  /**
   * Update user profile with partial data
   */
  async updateUserProfile(userId: string, updates: Partial<FirestoreUserProfile>): Promise<DatabaseResult<FirestoreUserProfile>> {
    try {
      if (!db) {
        return { success: false, error: 'Database not initialized', code: 'db/not-initialized' };
      }

      const userRef = doc(db, COLLECTIONS.users, userId);
      
      // Use transaction to ensure data consistency
      const result = await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        
        if (!userDoc.exists()) {
          throw new Error('User profile not found');
        }

        const currentData = userDoc.data() as FirestoreUserProfile;
        
        // Merge updates with current data
        const updatedData: FirestoreUserProfile = {
          ...currentData,
          ...updates,
          metadata: {
            ...currentData.metadata,
            ...updates.metadata,
            lastUpdated: serverTimestamp() as Timestamp,
            version: (currentData.metadata.version || 1) + 1
          }
        };

        // Validate updated data
        const validation = validateUserProfile(updatedData);
        if (!validation.isValid) {
          throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }

        transaction.update(userRef, updatedData);
        return updatedData;
      });

      console.log('✅ User profile updated successfully:', userId);
      return { success: true, data: result };

    } catch (error) {
      console.error('❌ Error updating user profile:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        code: (error as FirestoreError)?.code || 'unknown'
      };
    }
  }

  /**
   * Complete onboarding process
   */
  async completeOnboarding(userId: string, responses: FirestoreOnboardingResponses): Promise<DatabaseResult<FirestoreUserProfile>> {
    try {
      // Validate onboarding responses
      const validation = validateOnboardingResponses(responses);
      if (!validation.isValid) {
        return { 
          success: false, 
          error: `Onboarding validation failed: ${validation.errors.join(', ')}`, 
          code: 'validation/onboarding-failed' 
        };
      }

      const updates: Partial<FirestoreUserProfile> = {
        onboarding: {
          isCompleted: true,
          completedAt: serverTimestamp() as Timestamp,
          responses
        },
        routine: {
          wakeTime: responses.currentWakeTime,
          workStartTime: responses.workStartTime,
          routineDuration: 30, // Default 30 minutes
          selectedTasks: MVP_TASKS.map((task, index) => ({
            taskId: task.id,
            duration: 5, // Default 5 minutes per task
            order: index + 1,
            isEnabled: true
          }))
        }
      };

      return await this.updateUserProfile(userId, updates);

    } catch (error) {
      console.error('❌ Error completing onboarding:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'onboarding/completion-failed'
      };
    }
  }

  /**
   * Update subscription status
   */
  async updateSubscription(userId: string, subscriptionData: Partial<FirestoreUserProfile['subscription']>): Promise<DatabaseResult<boolean>> {
    try {
      const updates: Partial<FirestoreUserProfile> = {
        subscription: subscriptionData
      };

      const result = await this.updateUserProfile(userId, updates);
      return { 
        success: result.success, 
        data: result.success, 
        error: result.error, 
        code: result.code 
      };

    } catch (error) {
      console.error('❌ Error updating subscription:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'subscription/update-failed'
      };
    }
  }

  /**
   * Listen to user profile changes
   */
  listenToUserProfile(userId: string, callback: (profile: FirestoreUserProfile | null, error?: string) => void): () => void {
    if (!db) {
      callback(null, 'Database not initialized');
      return () => {};
    }

    const userRef = doc(db, COLLECTIONS.users, userId);
    
    return onSnapshot(
      userRef,
      (doc) => {
        if (doc.exists()) {
          const profileData = doc.data() as FirestoreUserProfile;
          callback(profileData);
        } else {
          callback(null, 'User profile not found');
        }
      },
      (error) => {
        console.error('❌ Error listening to user profile:', error);
        callback(null, error.message);
      }
    );
  }
}

/**
 * Enhanced Daily Progress Operations
 */
export class DailyProgressService {
  private static instance: DailyProgressService;
  
  public static getInstance(): DailyProgressService {
    if (!DailyProgressService.instance) {
      DailyProgressService.instance = new DailyProgressService();
    }
    return DailyProgressService.instance;
  }

  /**
   * Create or update daily progress
   */
  async createOrUpdateDailyProgress(userId: string, date: string, progressData: Partial<FirestoreDailyProgress>): Promise<DatabaseResult<FirestoreDailyProgress>> {
    try {
      if (!db) {
        return { success: false, error: 'Database not initialized', code: 'db/not-initialized' };
      }

      // Ensure we have the required task completions
      const defaultTasks: FirestoreTaskCompletion[] = MVP_TASKS.map(task => ({
        taskId: task.id,
        name: task.name,
        category: task.category,
        plannedDuration: 5,
        status: 'not_started' as const,
        ...progressData.tasks?.find(t => t.taskId === task.id)
      }));

      const completeProgress: FirestoreDailyProgress = {
        userId,
        date,
        session: {
          startTime: serverTimestamp() as Timestamp,
          isCompleted: false,
          completionPercentage: 0,
          ...progressData.session
        },
        tasks: defaultTasks,
        metrics: progressData.metrics || {},
        reflection: progressData.reflection || {},
        achievements: progressData.achievements || {
          newAchievements: [],
          milestones: []
        },
        streaks: progressData.streaks || {
          currentStreak: 0,
          isStreakDay: false,
          longestStreak: 0
        },
        metadata: {
          createdAt: serverTimestamp() as Timestamp,
          lastUpdated: serverTimestamp() as Timestamp,
          dataSource: 'app',
          ...progressData.metadata
        }
      };

      // Calculate completion percentage and update session
      const dailyScore = calculateDailyScore(completeProgress.tasks);
      completeProgress.session.completionPercentage = dailyScore.percentage;
      completeProgress.session.isCompleted = dailyScore.percentage >= SCORING_CONFIG.passingScore;

      // Validate the progress data
      const validation = validateDailyProgress(completeProgress);
      if (!validation.isValid) {
        return { 
          success: false, 
          error: `Validation failed: ${validation.errors.join(', ')}`, 
          code: 'validation/failed' 
        };
      }

      // Save to Firestore
      const progressRef = doc(db, COLLECTIONS.userProgress, userId, 'daily_entries', date);
      await setDoc(progressRef, completeProgress, { merge: true });

      console.log('✅ Daily progress created/updated successfully:', userId, date);
      return { success: true, data: completeProgress };

    } catch (error) {
      console.error('❌ Error creating/updating daily progress:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        code: (error as FirestoreError)?.code || 'unknown'
      };
    }
  }

  /**
   * Get daily progress for a specific date
   */
  async getDailyProgress(userId: string, date: string): Promise<DatabaseResult<FirestoreDailyProgress>> {
    try {
      if (!db) {
        return { success: false, error: 'Database not initialized', code: 'db/not-initialized' };
      }

      const progressRef = doc(db, COLLECTIONS.userProgress, userId, 'daily_entries', date);
      const progressDoc = await getDoc(progressRef);

      if (!progressDoc.exists()) {
        // Create default progress for the date
        const defaultProgress = await this.createOrUpdateDailyProgress(userId, date, {});
        return defaultProgress;
      }

      const progressData = progressDoc.data() as FirestoreDailyProgress;
      
      // Validate retrieved data
      const validation = validateDailyProgress(progressData);
      if (!validation.isValid) {
        console.warn('⚠️ Retrieved daily progress has validation issues:', validation.errors);
      }

      console.log('✅ Daily progress retrieved successfully:', userId, date);
      return { success: true, data: progressData };

    } catch (error) {
      console.error('❌ Error retrieving daily progress:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        code: (error as FirestoreError)?.code || 'unknown'
      };
    }
  }

  /**
   * Update task completion status
   */
  async updateTaskCompletion(userId: string, date: string, taskId: string, updates: Partial<FirestoreTaskCompletion>): Promise<DatabaseResult<FirestoreDailyProgress>> {
    try {
      if (!db) {
        return { success: false, error: 'Database not initialized', code: 'db/not-initialized' };
      }

      const progressRef = doc(db, COLLECTIONS.userProgress, userId, 'daily_entries', date);
      
      const result = await runTransaction(db, async (transaction) => {
        const progressDoc = await transaction.get(progressRef);
        
        let progressData: FirestoreDailyProgress;
        
        if (!progressDoc.exists()) {
          // Create new progress if it doesn't exist
          const createResult = await this.createOrUpdateDailyProgress(userId, date, {});
          if (!createResult.success || !createResult.data) {
            throw new Error('Failed to create daily progress');
          }
          progressData = createResult.data;
        } else {
          progressData = progressDoc.data() as FirestoreDailyProgress;
        }

        // Find and update the task
        const taskIndex = progressData.tasks.findIndex(task => task.taskId === taskId);
        if (taskIndex === -1) {
          throw new Error(`Task ${taskId} not found`);
        }

        // Update the task
        progressData.tasks[taskIndex] = {
          ...progressData.tasks[taskIndex],
          ...updates,
          ...(updates.status === 'completed' && !updates.endTime ? { endTime: serverTimestamp() as Timestamp } : {}),
          ...(updates.status === 'in_progress' && !updates.startTime ? { startTime: serverTimestamp() as Timestamp } : {})
        };

        // Recalculate completion percentage
        const dailyScore = calculateDailyScore(progressData.tasks);
        progressData.session.completionPercentage = dailyScore.percentage;
        progressData.session.isCompleted = dailyScore.percentage >= SCORING_CONFIG.passingScore;
        
        // Update session end time if all tasks are completed
        if (progressData.tasks.every(task => task.status === 'completed' || task.status === 'skipped')) {
          progressData.session.endTime = serverTimestamp() as Timestamp;
        }

        // Update metadata
        progressData.metadata.lastUpdated = serverTimestamp() as Timestamp;

        transaction.set(progressRef, progressData, { merge: true });
        return progressData;
      });

      console.log('✅ Task completion updated successfully:', userId, date, taskId);
      return { success: true, data: result };

    } catch (error) {
      console.error('❌ Error updating task completion:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        code: (error as FirestoreError)?.code || 'unknown'
      };
    }
  }

  /**
   * Get progress history for a date range
   */
  async getProgressHistory(userId: string, startDate: string, endDate: string, options?: PaginationOptions): Promise<DatabaseResult<FirestoreDailyProgress[]>> {
    try {
      if (!db) {
        return { success: false, error: 'Database not initialized', code: 'db/not-initialized' };
      }

      const progressCollection = collection(db, COLLECTIONS.userProgress, userId, 'daily_entries');
      let q = query(
        progressCollection,
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', options?.orderDirection || 'desc')
      );

      if (options?.limit) {
        q = query(q, limit(options.limit));
      }

      if (options?.startAfter) {
        q = query(q, startAfter(options.startAfter));
      }

      const progressSnapshot = await getDocs(q);
      const progressData = progressSnapshot.docs.map(doc => doc.data() as FirestoreDailyProgress);

      console.log('✅ Progress history retrieved successfully:', userId, progressData.length, 'entries');
      return { success: true, data: progressData };

    } catch (error) {
      console.error('❌ Error retrieving progress history:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        code: (error as FirestoreError)?.code || 'unknown'
      };
    }
  }

  /**
   * Submit completed day and update user stats
   */
  async submitCompletedDay(userId: string, date: string, reflection?: Partial<FirestoreDailyProgress['reflection']>): Promise<DatabaseResult<{ dailyScore: number; streakUpdated: boolean }>> {
    try {
      if (!db) {
        return { success: false, error: 'Database not initialized', code: 'db/not-initialized' };
      }

      const userRef = doc(db, COLLECTIONS.users, userId);
      const progressRef = doc(db, COLLECTIONS.userProgress, userId, 'daily_entries', date);

      const result = await runTransaction(db, async (transaction) => {
        // Get current progress and user profile
        const [progressDoc, userDoc] = await Promise.all([
          transaction.get(progressRef),
          transaction.get(userRef)
        ]);

        if (!progressDoc.exists()) {
          throw new Error('Daily progress not found');
        }

        if (!userDoc.exists()) {
          throw new Error('User profile not found');
        }

        const progressData = progressDoc.data() as FirestoreDailyProgress;
        const userData = userDoc.data() as FirestoreUserProfile;

        // Calculate daily score
        const dailyScore = calculateDailyScore(progressData.tasks);

        // Update progress with final data
        progressData.session.isCompleted = true;
        progressData.session.endTime = serverTimestamp() as Timestamp;
        progressData.session.completionPercentage = dailyScore.percentage;
        
        if (reflection) {
          progressData.reflection = { ...progressData.reflection, ...reflection };
        }

        // Update streak information
        const isPassingScore = dailyScore.percentage >= SCORING_CONFIG.passingScore;
        let streakUpdated = false;

        if (isPassingScore) {
          userData.stats.currentStreak += 1;
          userData.stats.longestStreak = Math.max(userData.stats.longestStreak, userData.stats.currentStreak);
          progressData.streaks.currentStreak = userData.stats.currentStreak;
          progressData.streaks.isStreakDay = true;
          progressData.streaks.lastCompletionDate = date;
          streakUpdated = true;
        } else {
          userData.stats.currentStreak = 0;
          progressData.streaks.isStreakDay = false;
        }

        progressData.streaks.longestStreak = userData.stats.longestStreak;

        // Update user stats
        userData.stats.totalCompletions += 1;
        userData.stats.totalDaysActive += 1;
        userData.stats.averageCompletionScore = 
          ((userData.stats.averageCompletionScore * (userData.stats.totalCompletions - 1)) + dailyScore.percentage) / userData.stats.totalCompletions;
        userData.stats.lastActive = serverTimestamp() as Timestamp;
        userData.metadata.lastUpdated = serverTimestamp() as Timestamp;

        // Update both documents
        transaction.set(progressRef, progressData, { merge: true });
        transaction.set(userRef, userData, { merge: true });

        return { dailyScore: dailyScore.percentage, streakUpdated };
      });

      console.log('✅ Day submitted successfully:', userId, date, 'Score:', result.dailyScore);
      return { success: true, data: result };

    } catch (error) {
      console.error('❌ Error submitting completed day:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        code: (error as FirestoreError)?.code || 'unknown'
      };
    }
  }

  /**
   * Listen to today's progress changes
   */
  listenToDailyProgress(userId: string, date: string, callback: (progress: FirestoreDailyProgress | null, error?: string) => void): () => void {
    if (!db) {
      callback(null, 'Database not initialized');
      return () => {};
    }

    const progressRef = doc(db, COLLECTIONS.userProgress, userId, 'daily_entries', date);
    
    return onSnapshot(
      progressRef,
      (doc) => {
        if (doc.exists()) {
          const progressData = doc.data() as FirestoreDailyProgress;
          callback(progressData);
        } else {
          // Create default progress if it doesn't exist
          this.createOrUpdateDailyProgress(userId, date, {})
            .then(result => {
              if (result.success && result.data) {
                callback(result.data);
              } else {
                callback(null, result.error);
              }
            })
            .catch(error => {
              callback(null, error.message);
            });
        }
      },
      (error) => {
        console.error('❌ Error listening to daily progress:', error);
        callback(null, error.message);
      }
    );
  }
}

/**
 * Batch Operations Service
 */
export class BatchOperationsService {
  private static instance: BatchOperationsService;
  
  public static getInstance(): BatchOperationsService {
    if (!BatchOperationsService.instance) {
      BatchOperationsService.instance = new BatchOperationsService();
    }
    return BatchOperationsService.instance;
  }

  /**
   * Execute multiple database operations in a batch
   */
  async executeBatch(operations: BatchOperation[]): Promise<DatabaseResult<boolean>> {
    try {
      if (!db) {
        return { success: false, error: 'Database not initialized', code: 'db/not-initialized' };
      }

      if (operations.length === 0) {
        return { success: true, data: true };
      }

      if (operations.length > 500) {
        return { success: false, error: 'Batch size exceeds Firestore limit of 500 operations', code: 'batch/size-limit' };
      }

      const batch = writeBatch(db);

      for (const operation of operations) {
        const docRef = doc(db, operation.collection, operation.docId);

        switch (operation.type) {
          case 'create':
          case 'update':
            if (!operation.data) {
              throw new Error(`Data required for ${operation.type} operation`);
            }
            batch.set(docRef, operation.data, { merge: operation.type === 'update' });
            break;
          case 'delete':
            batch.delete(docRef);
            break;
          default:
            throw new Error(`Unknown operation type: ${operation.type}`);
        }
      }

      await batch.commit();

      console.log('✅ Batch operations executed successfully:', operations.length, 'operations');
      return { success: true, data: true };

    } catch (error) {
      console.error('❌ Error executing batch operations:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        code: (error as FirestoreError)?.code || 'unknown'
      };
    }
  }

  /**
   * Backup user data
   */
  async backupUserData(userId: string): Promise<DatabaseResult<{ userProfile: FirestoreUserProfile; progressHistory: FirestoreDailyProgress[] }>> {
    try {
      const userService = UserProfileService.getInstance();
      const progressService = DailyProgressService.getInstance();

      // Get user profile
      const profileResult = await userService.getUserProfile(userId);
      if (!profileResult.success || !profileResult.data) {
        return { success: false, error: 'Failed to retrieve user profile', code: 'backup/profile-failed' };
      }

      // Get all progress history
      const now = new Date();
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      
      const progressResult = await progressService.getProgressHistory(
        userId, 
        oneYearAgo.toISOString().split('T')[0],
        now.toISOString().split('T')[0]
      );

      if (!progressResult.success) {
        return { success: false, error: 'Failed to retrieve progress history', code: 'backup/progress-failed' };
      }

      const backupData = {
        userProfile: profileResult.data,
        progressHistory: progressResult.data || []
      };

      console.log('✅ User data backup completed:', userId, backupData.progressHistory.length, 'progress entries');
      return { success: true, data: backupData };

    } catch (error) {
      console.error('❌ Error backing up user data:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'backup/unknown-error'
      };
    }
  }
}

/**
 * Analytics and Reporting Service
 */
export class AnalyticsService {
  private static instance: AnalyticsService;
  
  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Generate user analytics report
   */
  async generateUserAnalytics(userId: string, days: number = 30): Promise<DatabaseResult<any>> {
    try {
      const progressService = DailyProgressService.getInstance();
      
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const progressResult = await progressService.getProgressHistory(userId, startDate, endDate);
      if (!progressResult.success || !progressResult.data) {
        return { success: false, error: 'Failed to retrieve progress data', code: 'analytics/data-failed' };
      }

      const progressData = progressResult.data;
      
      // Calculate analytics using scoring utilities
      const weeklyScore = scoringUtils.calculateWeeklyScore(progressData);
      const streakInfo = scoringUtils.calculateStreakInfo(progressData);
      const completionRate = scoringUtils.calculateCompletionRate(progressData, startDate, endDate);
      const insights = scoringUtils.generateScoreInsights(weeklyScore, streakInfo);

      const analytics = {
        period: { startDate, endDate, days },
        weeklyScore,
        streakInfo,
        completionRate,
        insights,
        rawData: progressData.length <= 10 ? progressData : undefined // Include raw data only for small datasets
      };

      console.log('✅ User analytics generated successfully:', userId, days, 'days');
      return { success: true, data: analytics };

    } catch (error) {
      console.error('❌ Error generating user analytics:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'analytics/generation-failed'
      };
    }
  }
}

// Export service instances
export const userProfileService = UserProfileService.getInstance();
export const dailyProgressService = DailyProgressService.getInstance();
export const batchOperationsService = BatchOperationsService.getInstance();
export const analyticsService = AnalyticsService.getInstance();

// Export default services object
export default {
  userProfile: userProfileService,
  dailyProgress: dailyProgressService,
  batchOperations: batchOperationsService,
  analytics: analyticsService
};