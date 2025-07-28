/**
 * Firebase Analytics Service Implementation
 * 
 * This service provides comprehensive analytics tracking for the Productivity Morning Routine app.
 * Currently implemented as Phase 1 placeholders that will be fully activated in Phase 2.
 * 
 * @version 1.0.0
 * @author Backend Agent - Productivity Morning Routine
 */

// Phase 2 imports (commented for Phase 1)
// import analytics from '@react-native-firebase/analytics';

import { FEATURE_FLAGS } from '@/src/constants';
import { dbService } from './firebase';

/**
 * Analytics Event Types for the app
 */
export interface AnalyticsEvent {
  name: string;
  parameters?: { [key: string]: any };
}

/**
 * User Action Events
 */
export const UserActionEvents = {
  // Authentication Events
  SIGN_UP_STARTED: 'sign_up_started',
  SIGN_UP_COMPLETED: 'sign_up_completed',
  SIGN_IN_COMPLETED: 'sign_in_completed',
  SIGN_OUT: 'sign_out',
  
  // Onboarding Events
  ONBOARDING_STARTED: 'onboarding_started',
  ONBOARDING_QUESTION_ANSWERED: 'onboarding_question_answered',
  ONBOARDING_QUESTION_SKIPPED: 'onboarding_question_skipped',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  
  // Subscription Events
  SUBSCRIPTION_PAYWALL_VIEWED: 'subscription_paywall_viewed',
  SUBSCRIPTION_PLAN_SELECTED: 'subscription_plan_selected',
  SUBSCRIPTION_STARTED: 'subscription_started',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
  
  // Morning Routine Events
  ROUTINE_STARTED: 'routine_started',
  ROUTINE_COMPLETED: 'routine_completed',
  TASK_COMPLETED: 'task_completed',
  TASK_SKIPPED: 'task_skipped',
  DAY_SUBMITTED: 'day_submitted',
  
  // Analytics Events
  ANALYTICS_VIEWED: 'analytics_viewed',
  PROGRESS_SHARED: 'progress_shared',
  
  // Settings Events
  SETTINGS_UPDATED: 'settings_updated',
  NOTIFICATIONS_ENABLED: 'notifications_enabled',
  NOTIFICATIONS_DISABLED: 'notifications_disabled',
  
  // Achievement Events
  STREAK_MILESTONE: 'streak_milestone',
  PERFECT_WEEK: 'perfect_week',
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
} as const;

/**
 * Screen Names for screen view tracking
 */
export const ScreenNames = {
  SPLASH: 'Splash',
  WELCOME: 'Welcome',
  LOGIN: 'Login',
  REGISTER: 'Register',
  FORGOT_PASSWORD: 'ForgotPassword',
  ONBOARDING_WELCOME: 'OnboardingWelcome',
  ONBOARDING_QUESTIONS: 'OnboardingQuestions',
  ONBOARDING_ANIMATION: 'OnboardingAnimation',
  TASK_INTRO: 'TaskIntro',
  PLAN_DISPLAY: 'PlanDisplay',
  PAYWALL: 'Paywall',
  TASKS: 'Tasks',
  ANALYTICS: 'Analytics',
  SETTINGS: 'Settings',
} as const;

/**
 * Analytics Service Class
 */
class AnalyticsService {
  private isInitialized = false;
  private userId: string | null = null;
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initialize();
  }

  /**
   * Initialize analytics service
   */
  private async initialize(): Promise<void> {
    try {
      if (!FEATURE_FLAGS.enableAnalytics) {
        console.log('📊 Analytics disabled by feature flag');
        return;
      }

      // Phase 2 implementation:
      // await analytics().setAnalyticsCollectionEnabled(true);
      
      this.isInitialized = true;
      console.log('✅ Analytics service initialized');
    } catch (error) {
      console.error('❌ Analytics initialization failed:', error);
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Set user ID for analytics
   */
  async setUserId(userId: string): Promise<void> {
    try {
      this.userId = userId;
      
      if (__DEV__) {
        console.log('🆔 Analytics User ID set:', userId);
      }
      
      // Phase 2 implementation:
      // await analytics().setUserId(userId);
      
    } catch (error) {
      console.error('❌ Failed to set analytics user ID:', error);
    }
  }

  /**
   * Set user properties
   */
  async setUserProperties(properties: { [key: string]: string }): Promise<void> {
    try {
      if (__DEV__) {
        console.log('👤 Analytics User Properties:', properties);
      }
      
      // Phase 2 implementation:
      // await analytics().setUserProperties(properties);
      
    } catch (error) {
      console.error('❌ Failed to set user properties:', error);
    }
  }

  /**
   * Log custom event
   */
  async logEvent(eventName: string, parameters?: { [key: string]: any }): Promise<void> {
    try {
      if (!this.isInitialized && !__DEV__) {
        return;
      }

      const eventData = {
        eventId: `${eventName}_${Date.now()}`,
        userId: this.userId,
        event: {
          name: eventName,
          category: 'user_action',
          timestamp: new Date(),
        },
        properties: parameters || {},
        context: {
          appVersion: '1.0.0', // Should be dynamic
          platform: 'ios', // Should be detected
          sessionId: this.sessionId,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          locale: 'en-US', // Should be detected
        },
      };

      if (__DEV__) {
        console.log('📊 Analytics Event:', eventName, parameters);
      }

      // Log to Firestore for custom analytics
      if (this.userId && FEATURE_FLAGS.enableAnalytics) {
        await dbService.analytics.logEvent(this.userId, eventData);
      }

      // Phase 2 implementation:
      // await analytics().logEvent(eventName, parameters);
      
    } catch (error) {
      console.error('❌ Failed to log analytics event:', error);
    }
  }

  /**
   * Log screen view
   */
  async logScreenView(screenName: string, screenClass?: string): Promise<void> {
    try {
      const parameters = {
        screen_name: screenName,
        screen_class: screenClass || screenName,
        session_id: this.sessionId,
      };

      if (__DEV__) {
        console.log('📱 Screen View:', screenName, screenClass);
      }

      await this.logEvent('screen_view', parameters);

      // Phase 2 implementation:
      // await analytics().logScreenView(parameters);
      
    } catch (error) {
      console.error('❌ Failed to log screen view:', error);
    }
  }

  /**
   * Track user authentication events
   */
  async trackAuth(action: 'sign_up' | 'sign_in' | 'sign_out', method?: string): Promise<void> {
    const eventName = action === 'sign_up' ? UserActionEvents.SIGN_UP_COMPLETED :
                     action === 'sign_in' ? UserActionEvents.SIGN_IN_COMPLETED :
                     UserActionEvents.SIGN_OUT;

    await this.logEvent(eventName, {
      method: method || 'email',
      timestamp: Date.now(),
    });
  }

  /**
   * Track onboarding progress
   */
  async trackOnboarding(action: 'started' | 'question_answered' | 'question_skipped' | 'completed', questionId?: string): Promise<void> {
    const eventMap = {
      started: UserActionEvents.ONBOARDING_STARTED,
      question_answered: UserActionEvents.ONBOARDING_QUESTION_ANSWERED,
      question_skipped: UserActionEvents.ONBOARDING_QUESTION_SKIPPED,
      completed: UserActionEvents.ONBOARDING_COMPLETED,
    };

    await this.logEvent(eventMap[action], {
      question_id: questionId,
      timestamp: Date.now(),
    });
  }

  /**
   * Track subscription events
   */
  async trackSubscription(action: 'paywall_viewed' | 'plan_selected' | 'started' | 'cancelled', plan?: string): Promise<void> {
    const eventMap = {
      paywall_viewed: UserActionEvents.SUBSCRIPTION_PAYWALL_VIEWED,
      plan_selected: UserActionEvents.SUBSCRIPTION_PLAN_SELECTED,
      started: UserActionEvents.SUBSCRIPTION_STARTED,
      cancelled: UserActionEvents.SUBSCRIPTION_CANCELLED,
    };

    await this.logEvent(eventMap[action], {
      plan: plan,
      timestamp: Date.now(),
    });
  }

  /**
   * Track morning routine progress
   */
  async trackRoutine(action: 'started' | 'completed' | 'task_completed' | 'task_skipped' | 'day_submitted', data?: { [key: string]: any }): Promise<void> {
    const eventMap = {
      started: UserActionEvents.ROUTINE_STARTED,
      completed: UserActionEvents.ROUTINE_COMPLETED,
      task_completed: UserActionEvents.TASK_COMPLETED,
      task_skipped: UserActionEvents.TASK_SKIPPED,
      day_submitted: UserActionEvents.DAY_SUBMITTED,
    };

    await this.logEvent(eventMap[action], {
      ...data,
      timestamp: Date.now(),
    });
  }

  /**
   * Track achievement events
   */
  async trackAchievement(type: 'streak_milestone' | 'perfect_week' | 'achievement_unlocked', data: { [key: string]: any }): Promise<void> {
    const eventMap = {
      streak_milestone: UserActionEvents.STREAK_MILESTONE,
      perfect_week: UserActionEvents.PERFECT_WEEK,
      achievement_unlocked: UserActionEvents.ACHIEVEMENT_UNLOCKED,
    };

    await this.logEvent(eventMap[type], {
      ...data,
      timestamp: Date.now(),
    });
  }

  /**
   * Get current session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Start new session
   */
  startNewSession(): void {
    this.sessionId = this.generateSessionId();
    console.log('🔄 New analytics session started:', this.sessionId);
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();

// Export convenience functions
export const logEvent = (eventName: string, parameters?: { [key: string]: any }) => 
  analyticsService.logEvent(eventName, parameters);

export const logScreenView = (screenName: string, screenClass?: string) => 
  analyticsService.logScreenView(screenName, screenClass);

export const setUserId = (userId: string) => 
  analyticsService.setUserId(userId);

export const setUserProperties = (properties: { [key: string]: string }) => 
  analyticsService.setUserProperties(properties);

// Export tracking helpers
export const trackAuth = (action: 'sign_up' | 'sign_in' | 'sign_out', method?: string) =>
  analyticsService.trackAuth(action, method);

export const trackOnboarding = (action: 'started' | 'question_answered' | 'question_skipped' | 'completed', questionId?: string) =>
  analyticsService.trackOnboarding(action, questionId);

export const trackSubscription = (action: 'paywall_viewed' | 'plan_selected' | 'started' | 'cancelled', plan?: string) =>
  analyticsService.trackSubscription(action, plan);

export const trackRoutine = (action: 'started' | 'completed' | 'task_completed' | 'task_skipped' | 'day_submitted', data?: { [key: string]: any }) =>
  analyticsService.trackRoutine(action, data);

export const trackAchievement = (type: 'streak_milestone' | 'perfect_week' | 'achievement_unlocked', data: { [key: string]: any }) =>
  analyticsService.trackAchievement(type, data);

export default analyticsService;