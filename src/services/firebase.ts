// Firebase configuration and initialization for Productivity Morning Routine App

import { getApps } from '@react-native-firebase/app';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
// Analytics and messaging imports removed for architecture phase
// Will be enabled in Phase 2: Backend Integration
import { COLLECTIONS } from '@/src/constants';
import { UserProfile, DailyProgress, User } from '@/src/types';

// Initialize Firebase app if not already initialized
// Note: Firebase is auto-initialized by React Native Firebase when using google-services.json/GoogleService-Info.plist

// Firebase Auth service
export const authService = {
  // Sign in with email and password
  signIn: async (email: string, password: string): Promise<FirebaseAuthTypes.UserCredential> => {
    try {
      return await auth().signInWithEmailAndPassword(email, password);
    } catch (error) {
      console.error('Auth sign in error:', error);
      throw error;
    }
  },

  // Create user with email and password
  signUp: async (email: string, password: string): Promise<FirebaseAuthTypes.UserCredential> => {
    try {
      return await auth().createUserWithEmailAndPassword(email, password);
    } catch (error) {
      console.error('Auth sign up error:', error);
      throw error;
    }
  },

  // Sign out current user
  signOut: async (): Promise<void> => {
    try {
      await auth().signOut();
    } catch (error) {
      console.error('Auth sign out error:', error);
      throw error;
    }
  },

  // Send password reset email
  resetPassword: async (email: string): Promise<void> => {
    try {
      await auth().sendPasswordResetEmail(email);
    } catch (error) {
      console.error('Auth reset password error:', error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (updates: { displayName?: string; photoURL?: string }): Promise<void> => {
    try {
      const user = auth().currentUser;
      if (user) {
        await user.updateProfile(updates);
      }
    } catch (error) {
      console.error('Auth update profile error:', error);
      throw error;
    }
  },

  // Get current user
  getCurrentUser: (): FirebaseAuthTypes.User | null => {
    return auth().currentUser;
  },

  // Auth state change listener
  onAuthStateChanged: (callback: (user: FirebaseAuthTypes.User | null) => void) => {
    return auth().onAuthStateChanged(callback);
  },
};

// Firestore database service
export const dbService = {
  // User profile operations
  user: {
    // Create or update user profile
    createOrUpdate: async (userId: string, profileData: Partial<UserProfile>): Promise<void> => {
      try {
        const userRef = firestore().collection(COLLECTIONS.users).doc(userId);
        await userRef.set(profileData, { merge: true });
      } catch (error) {
        console.error('DB create/update user error:', error);
        throw error;
      }
    },

    // Get user profile
    get: async (userId: string): Promise<UserProfile | null> => {
      try {
        const userDoc = await firestore().collection(COLLECTIONS.users).doc(userId).get();
        if (userDoc.exists()) {
          return userDoc.data() as UserProfile;
        }
        return null;
      } catch (error) {
        console.error('DB get user error:', error);
        throw error;
      }
    },

    // Listen to user profile changes
    listen: (userId: string, callback: (profile: UserProfile | null) => void) => {
      return firestore()
        .collection(COLLECTIONS.users)
        .doc(userId)
        .onSnapshot(
          (doc) => {
            if (doc.exists()) {
              callback(doc.data() as UserProfile);
            } else {
              callback(null);
            }
          },
          (error) => {
            console.error('DB listen user error:', error);
            callback(null);
          }
        );
    },

    // Delete user profile
    delete: async (userId: string): Promise<void> => {
      try {
        await firestore().collection(COLLECTIONS.users).doc(userId).delete();
      } catch (error) {
        console.error('DB delete user error:', error);
        throw error;
      }
    },
  },

  // Daily progress operations
  progress: {
    // Create or update daily progress
    createOrUpdate: async (userId: string, date: string, progressData: Partial<DailyProgress>): Promise<void> => {
      try {
        const progressRef = firestore()
          .collection(COLLECTIONS.userProgress)
          .doc(userId)
          .collection('daily_entries')
          .doc(date);
        
        await progressRef.set(progressData, { merge: true });
      } catch (error) {
        console.error('DB create/update progress error:', error);
        throw error;
      }
    },

    // Get daily progress for a specific date
    get: async (userId: string, date: string): Promise<DailyProgress | null> => {
      try {
        const progressDoc = await firestore()
          .collection(COLLECTIONS.userProgress)
          .doc(userId)
          .collection('daily_entries')
          .doc(date)
          .get();
        
        if (progressDoc.exists()) {
          return progressDoc.data() as DailyProgress;
        }
        return null;
      } catch (error) {
        console.error('DB get progress error:', error);
        throw error;
      }
    },

    // Get progress history for a date range
    getRange: async (userId: string, startDate: string, endDate: string): Promise<DailyProgress[]> => {
      try {
        const progressQuery = await firestore()
          .collection(COLLECTIONS.userProgress)
          .doc(userId)
          .collection('daily_entries')
          .where('date', '>=', startDate)
          .where('date', '<=', endDate)
          .orderBy('date', 'desc')
          .get();
        
        return progressQuery.docs.map(doc => doc.data() as DailyProgress);
      } catch (error) {
        console.error('DB get progress range error:', error);
        throw error;
      }
    },

    // Get recent progress (last N days)
    getRecent: async (userId: string, limit: number = 30): Promise<DailyProgress[]> => {
      try {
        const progressQuery = await firestore()
          .collection(COLLECTIONS.userProgress)
          .doc(userId)
          .collection('daily_entries')
          .orderBy('date', 'desc')
          .limit(limit)
          .get();
        
        return progressQuery.docs.map(doc => doc.data() as DailyProgress);
      } catch (error) {
        console.error('DB get recent progress error:', error);
        throw error;
      }
    },

    // Listen to today's progress
    listenToday: (userId: string, date: string, callback: (progress: DailyProgress | null) => void) => {
      return firestore()
        .collection(COLLECTIONS.userProgress)
        .doc(userId)
        .collection('daily_entries')
        .doc(date)
        .onSnapshot(
          (doc) => {
            if (doc.exists()) {
              callback(doc.data() as DailyProgress);
            } else {
              callback(null);
            }
          },
          (error) => {
            console.error('DB listen today progress error:', error);
            callback(null);
          }
        );
    },
  },

  // Subscription operations
  subscription: {
    // Create or update subscription
    createOrUpdate: async (userId: string, subscriptionData: any): Promise<void> => {
      try {
        const subscriptionRef = firestore().collection(COLLECTIONS.subscriptions).doc(userId);
        await subscriptionRef.set(subscriptionData, { merge: true });
      } catch (error) {
        console.error('DB create/update subscription error:', error);
        throw error;
      }
    },

    // Get subscription
    get: async (userId: string): Promise<any | null> => {
      try {
        const subscriptionDoc = await firestore().collection(COLLECTIONS.subscriptions).doc(userId).get();
        if (subscriptionDoc.exists()) {
          return subscriptionDoc.data();
        }
        return null;
      } catch (error) {
        console.error('DB get subscription error:', error);
        throw error;
      }
    },
  },

  // Analytics events
  analytics: {
    // Log analytics event
    logEvent: async (userId: string, eventData: any): Promise<void> => {
      try {
        await firestore().collection(COLLECTIONS.analyticsEvents).add({
          userId,
          ...eventData,
          timestamp: firestore.FieldValue.serverTimestamp(),
        });
      } catch (error) {
        console.error('DB log analytics event error:', error);
        throw error;
      }
    },
  },

  // Support tickets
  support: {
    // Create support ticket
    create: async (ticketData: any): Promise<string> => {
      try {
        const ticketRef = await firestore().collection(COLLECTIONS.supportTickets).add({
          ...ticketData,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
        return ticketRef.id;
      } catch (error) {
        console.error('DB create support ticket error:', error);
        throw error;
      }
    },
  },

  // App configuration
  appConfig: {
    // Get app configuration
    get: async (): Promise<any | null> => {
      try {
        const configDoc = await firestore().collection(COLLECTIONS.appConfig).doc('settings').get();
        if (configDoc.exists()) {
          return configDoc.data();
        }
        return null;
      } catch (error) {
        console.error('DB get app config error:', error);
        throw error;
      }
    },
  },
};

// Utility functions
export const firestoreUtils = {
  // Convert Firestore timestamp to Date
  timestampToDate: (timestamp: FirebaseFirestoreTypes.Timestamp): Date => {
    return timestamp.toDate();
  },

  // Convert Date to Firestore timestamp
  dateToTimestamp: (date: Date): FirebaseFirestoreTypes.Timestamp => {
    return firestore.Timestamp.fromDate(date);
  },

  // Get server timestamp
  serverTimestamp: () => firestore.FieldValue.serverTimestamp(),

  // Format date for Firestore document ID (YYYY-MM-DD)
  formatDateId: (date: Date): string => {
    return date.toISOString().split('T')[0];
  },

  // Get today's date formatted
  getTodayId: (): string => {
    return firestoreUtils.formatDateId(new Date());
  },
};

// Firebase Analytics service - Architecture phase placeholder
// Will be implemented in Phase 2: Backend Integration
export const analyticsService = {
  // Log custom event (placeholder)
  logEvent: async (eventName: string, parameters?: { [key: string]: any }): Promise<void> => {
    console.log('Analytics event (placeholder):', eventName, parameters);
  },

  // Log screen view (placeholder)
  logScreenView: async (screenName: string, screenClass?: string): Promise<void> => {
    console.log('Screen view (placeholder):', screenName, screenClass);
  },

  // Set user properties (placeholder)
  setUserProperties: async (properties: { [key: string]: string }): Promise<void> => {
    console.log('User properties (placeholder):', properties);
  },

  // Set user ID (placeholder)
  setUserId: async (userId: string): Promise<void> => {
    console.log('User ID (placeholder):', userId);
  },
};

// Firebase Cloud Messaging service - Architecture phase placeholder
// Will be implemented in Phase 2: Backend Integration
export const messagingService = {
  // Request messaging permission (placeholder)
  requestPermission: async (): Promise<boolean> => {
    console.log('Messaging permission request (placeholder)');
    return true;
  },

  // Get FCM token (placeholder)
  getToken: async (): Promise<string | null> => {
    console.log('Get FCM token (placeholder)');
    return 'placeholder-token';
  },

  // Subscribe to topic (placeholder)
  subscribeToTopic: async (topic: string): Promise<void> => {
    console.log('Subscribe to topic (placeholder):', topic);
  },

  // Unsubscribe from topic (placeholder)
  unsubscribeFromTopic: async (topic: string): Promise<void> => {
    console.log('Unsubscribe from topic (placeholder):', topic);
  },

  // Listen to messages (placeholder)
  onMessage: (callback: (message: any) => void) => {
    console.log('Message listener (placeholder)');
    return () => {}; // Return unsubscribe function
  },

  // Listen to background messages (placeholder)
  setBackgroundMessageHandler: (handler: (message: any) => Promise<void>) => {
    console.log('Background message handler (placeholder)');
  },
};

// Export default for potential app initialization
export default {
  authService,
  dbService,
  analyticsService,
  messagingService,
  firestoreUtils,
};