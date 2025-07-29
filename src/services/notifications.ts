/**
 * Push Notifications Service Implementation
 * 
 * This service handles Firebase Cloud Messaging for push notifications
 * in the Productivity Morning Routine app. Currently implemented as Phase 1
 * placeholders that will be fully activated in Phase 2.
 * 
 * @version 1.0.0
 * @author Backend Agent - Productivity Morning Routine
 */

// Phase 2 imports (commented for Phase 1)
// import messaging from '@react-native-firebase/messaging';
// import { Platform } from 'react-native';

import { FEATURE_FLAGS, NOTIFICATION_CONFIG } from '../constants';
import { dbService } from './firebase';

/**
 * Notification Types
 */
export interface NotificationPayload {
  title: string;
  body: string;
  data?: { [key: string]: string };
}

export interface ScheduledNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  scheduledTime: Date;
  type: 'morning_reminder' | 'streak_milestone' | 'motivational' | 'subscription';
  data?: { [key: string]: string };
}

/**
 * Notification Permission Status
 */
export type NotificationPermissionStatus = 
  | 'authorized' 
  | 'denied' 
  | 'not_determined' 
  | 'provisional';

/**
 * Push Notifications Service Class
 */
class NotificationsService {
  private isInitialized = false;
  private fcmToken: string | null = null;
  private messageHandlers: ((message: any) => void)[] = [];

  constructor() {
    this.initialize();
  }

  /**
   * Initialize notifications service
   */
  private async initialize(): Promise<void> {
    try {
      if (!FEATURE_FLAGS.enablePushNotifications) {
        console.log('🔔 Push notifications disabled by feature flag');
        return;
      }

      // Phase 2 implementation:
      // const authStatus = await messaging().requestPermission();
      // this.isInitialized = authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      //                     authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      this.isInitialized = true;
      console.log('✅ Push notifications service initialized');

      // Set up message handlers
      this.setupMessageHandlers();

    } catch (error) {
      console.error('❌ Push notifications initialization failed:', error);
    }
  }

  /**
   * Setup message handlers for foreground and background messages
   */
  private setupMessageHandlers(): void {
    if (!this.isInitialized) return;

    // Phase 2 implementation:
    // Foreground message handler
    // messaging().onMessage(async remoteMessage => {
    //   console.log('📱 Foreground message received:', remoteMessage);
    //   this.handleForegroundMessage(remoteMessage);
    // });

    // Background message handler
    // messaging().setBackgroundMessageHandler(async remoteMessage => {
    //   console.log('🔄 Background message received:', remoteMessage);
    //   this.handleBackgroundMessage(remoteMessage);
    // });

    if (__DEV__) {
      console.log('📡 Message handlers setup completed');
    }
  }

  /**
   * Handle foreground messages
   */
  private handleForegroundMessage(message: any): void {
    // Call registered message handlers
    this.messageHandlers.forEach(handler => {
      try {
        handler(message);
      } catch (error) {
        console.error('❌ Error in message handler:', error);
      }
    });

    // Show in-app notification or handle accordingly
    if (__DEV__) {
      console.log('📨 Handling foreground message:', message.notification?.title);
    }
  }

  /**
   * Handle background messages
   */
  private async handleBackgroundMessage(message: any): Promise<void> {
    // Handle background message processing
    if (__DEV__) {
      console.log('📫 Handling background message:', message.notification?.title);
    }

    // Update app badge, sync data, etc.
  }

  /**
   * Request notification permissions
   */
  async requestPermission(): Promise<NotificationPermissionStatus> {
    try {
      if (__DEV__) {
        console.log('🔔 Requesting notification permissions');
      }

      // Phase 2 implementation:
      // const authStatus = await messaging().requestPermission();
      
      // const status: NotificationPermissionStatus = 
      //   authStatus === messaging.AuthorizationStatus.AUTHORIZED ? 'authorized' :
      //   authStatus === messaging.AuthorizationStatus.DENIED ? 'denied' :
      //   authStatus === messaging.AuthorizationStatus.PROVISIONAL ? 'provisional' :
      //   'not_determined';

      const status: NotificationPermissionStatus = 'authorized'; // Placeholder

      console.log('🔔 Notification permission status:', status);
      return status;

    } catch (error) {
      console.error('❌ Failed to request notification permissions:', error);
      return 'denied';
    }
  }

  /**
   * Get FCM token
   */
  async getToken(): Promise<string | null> {
    try {
      if (!this.isInitialized) {
        console.warn('⚠️ Notifications service not initialized');
        return null;
      }

      // Phase 2 implementation:
      // this.fcmToken = await messaging().getToken();

      this.fcmToken = 'placeholder-fcm-token'; // Placeholder

      if (__DEV__) {
        console.log('🎫 FCM Token:', this.fcmToken);
      }

      return this.fcmToken;

    } catch (error) {
      console.error('❌ Failed to get FCM token:', error);
      return null;
    }
  }

  /**
   * Subscribe to topic
   */
  async subscribeToTopic(topic: string): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        console.warn('⚠️ Notifications service not initialized');
        return false;
      }

      // Phase 2 implementation:
      // await messaging().subscribeToTopic(topic);

      if (__DEV__) {
        console.log('📢 Subscribed to topic:', topic);
      }

      return true;

    } catch (error) {
      console.error('❌ Failed to subscribe to topic:', error);
      return false;
    }
  }

  /**
   * Unsubscribe from topic
   */
  async unsubscribeFromTopic(topic: string): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        console.warn('⚠️ Notifications service not initialized');
        return false;
      }

      // Phase 2 implementation:
      // await messaging().unsubscribeFromTopic(topic);

      if (__DEV__) {
        console.log('🔕 Unsubscribed from topic:', topic);
      }

      return true;

    } catch (error) {
      console.error('❌ Failed to unsubscribe from topic:', error);
      return false;
    }
  }

  /**
   * Register message handler
   */
  onMessage(handler: (message: any) => void): () => void {
    this.messageHandlers.push(handler);

    // Return unsubscribe function
    return () => {
      const index = this.messageHandlers.indexOf(handler);
      if (index > -1) {
        this.messageHandlers.splice(index, 1);
      }
    };
  }

  /**
   * Schedule morning reminder notification
   */
  async scheduleMorningReminder(userId: string, wakeTime: string, message?: string): Promise<boolean> {
    try {
      const reminderMessage = message || this.getRandomMotivationalMessage();
      
      // Calculate reminder time (90 minutes after wake time)
      const reminderTime = this.calculateReminderTime(wakeTime, NOTIFICATION_CONFIG.morningReminderDelay);
      
      const notification: ScheduledNotification = {
        id: `morning_reminder_${userId}_${Date.now()}`,
        userId,
        title: 'Ready to CONQUER your day? ✨',
        body: reminderMessage,
        scheduledTime: reminderTime,
        type: 'morning_reminder',
        data: {
          type: 'morning_reminder',
          userId,
          wakeTime,
        },
      };

      if (__DEV__) {
        console.log('⏰ Scheduling morning reminder:', notification);
      }

      // Phase 2: Send to Cloud Function to schedule actual notification
      // await this.sendToCloudFunction('scheduleMorningReminder', notification);

      return true;

    } catch (error) {
      console.error('❌ Failed to schedule morning reminder:', error);
      return false;
    }
  }

  /**
   * Schedule streak milestone notification
   */
  async scheduleStreakMilestone(userId: string, streakCount: number): Promise<boolean> {
    try {
      const notification: ScheduledNotification = {
        id: `streak_milestone_${userId}_${streakCount}`,
        userId,
        title: `🔥 ${streakCount} Day Streak!`,
        body: 'You\'re on fire! Keep the momentum going!',
        scheduledTime: new Date(), // Send immediately
        type: 'streak_milestone',
        data: {
          type: 'streak_milestone',
          userId,
          streakCount: streakCount.toString(),
        },
      };

      if (__DEV__) {
        console.log('🏆 Scheduling streak milestone notification:', notification);
      }

      // Phase 2: Send actual notification
      return true;

    } catch (error) {
      console.error('❌ Failed to schedule streak milestone notification:', error);
      return false;
    }
  }

  /**
   * Cancel scheduled notifications
   */
  async cancelNotifications(userId: string, type?: string): Promise<boolean> {
    try {
      if (__DEV__) {
        console.log('🚫 Cancelling notifications for user:', userId, type || 'all types');
      }

      // Phase 2: Implement actual notification cancellation
      return true;

    } catch (error) {
      console.error('❌ Failed to cancel notifications:', error);
      return false;
    }
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(userId: string, preferences: {
    morningReminder: boolean;
    streakMilestones: boolean;
    motivationalQuotes: boolean;
    weeklyProgress: boolean;
  }): Promise<boolean> {
    try {
      if (__DEV__) {
        console.log('⚙️ Updating notification preferences:', preferences);
      }

      // Update topics subscription based on preferences
      if (preferences.morningReminder) {
        await this.subscribeToTopic(`morning_reminders_${userId}`);
      } else {
        await this.unsubscribeFromTopic(`morning_reminders_${userId}`);
      }

      if (preferences.streakMilestones) {
        await this.subscribeToTopic(`streak_milestones`);
      } else {
        await this.unsubscribeFromTopic(`streak_milestones`);
      }

      return true;

    } catch (error) {
      console.error('❌ Failed to update notification preferences:', error);
      return false;
    }
  }

  /**
   * Get random motivational message
   */
  private getRandomMotivationalMessage(): string {
    return NOTIFICATION_CONFIG.defaultMessages[
      Math.floor(Math.random() * NOTIFICATION_CONFIG.defaultMessages.length)
    ];
  }

  /**
   * Calculate reminder time based on wake time and delay
   */
  private calculateReminderTime(wakeTime: string, delayMinutes: number): Date {
    const [hours, minutes] = wakeTime.split(':').map(Number);
    const today = new Date();
    today.setHours(hours, minutes, 0, 0);
    
    return new Date(today.getTime() + (delayMinutes * 60 * 1000));
  }

  /**
   * Check if today is a weekday (for notification scheduling)
   */
  private isWeekday(date: Date = new Date()): boolean {
    const dayOfWeek = date.getDay();
    return dayOfWeek >= 1 && dayOfWeek <= 5; // Monday to Friday
  }

  /**
   * Get notification permission status
   */
  async getPermissionStatus(): Promise<NotificationPermissionStatus> {
    try {
      // Phase 2 implementation:
      // const authStatus = await messaging().hasPermission();
      // Return appropriate status based on authStatus

      return 'authorized'; // Placeholder

    } catch (error) {
      console.error('❌ Failed to get permission status:', error);
      return 'not_determined';
    }
  }

  /**
   * Handle notification tap (when app is opened from notification)
   */
  handleNotificationTap(notification: any): void {
    if (__DEV__) {
      console.log('👆 Notification tapped:', notification);
    }

    // Navigate to appropriate screen based on notification type
    const notificationType = notification.data?.type;
    
    switch (notificationType) {
      case 'morning_reminder':
        // Navigate to Tasks screen
        break;
      case 'streak_milestone':
        // Navigate to Analytics screen
        break;
      case 'motivational':
        // Navigate to Tasks screen
        break;
      default:
        // Navigate to home screen
        break;
    }
  }
}

// Export singleton instance
export const notificationsService = new NotificationsService();

// Export convenience functions
export const requestNotificationPermission = () => 
  notificationsService.requestPermission();

export const getFCMToken = () => 
  notificationsService.getToken();

export const subscribeToTopic = (topic: string) => 
  notificationsService.subscribeToTopic(topic);

export const unsubscribeFromTopic = (topic: string) => 
  notificationsService.unsubscribeFromTopic(topic);

export const onMessage = (handler: (message: any) => void) => 
  notificationsService.onMessage(handler);

export const scheduleMorningReminder = (userId: string, wakeTime: string, message?: string) =>
  notificationsService.scheduleMorningReminder(userId, wakeTime, message);

export const scheduleStreakMilestone = (userId: string, streakCount: number) =>
  notificationsService.scheduleStreakMilestone(userId, streakCount);

export const updateNotificationPreferences = (userId: string, preferences: any) =>
  notificationsService.updateNotificationPreferences(userId, preferences);

export default notificationsService;