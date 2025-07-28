/**
 * Firebase configuration and initialization for Productivity Morning Routine App
 * 
 * This service provides comprehensive Firebase integration including:
 * - Authentication (Email/Password, Google Sign-in)
 * - Firestore Database operations
 * - Analytics (placeholder for Phase 2)
 * - Push Notifications (placeholder for Phase 2)
 * 
 * @version 2.0.0 - Updated for Expo Firebase SDK
 * @author Backend Agent - Productivity Morning Routine
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User,
  Auth
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  addDoc,
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  onSnapshot,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  Firestore
} from 'firebase/firestore';

// Import constants and types (will need to create these if they don't exist)
// import { COLLECTIONS, ERROR_MESSAGES } from '@/src/constants';
// import { UserProfile, DailyProgress, AppError } from '@/src/types';

// Temporary constants until we create the constants file
const COLLECTIONS = {
  users: 'users',
  userProgress: 'user_progress',
  subscriptions: 'subscriptions',
  analyticsEvents: 'analytics_events',
  supportTickets: 'support_tickets',
  appConfig: 'app_config'
};

const ERROR_MESSAGES = {
  auth: {
    'auth/user-not-found': 'No account found with this email address.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Password should be at least 6 characters long.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
  },
  firestore: {
    'permission-denied': 'You do not have permission to perform this action.',
    'not-found': 'The requested document was not found.',
    'already-exists': 'A record with this identifier already exists.',
  },
  unknown: 'An unexpected error occurred. Please try again.'
};

// Firebase configuration from google-services.json
const firebaseConfig = {
  apiKey: "AIzaSyCEhFxLTUamzuJZKRYnZAX07yI7f1p_-IQ",
  authDomain: "productivity-morning-routine.firebaseapp.com",
  projectId: "productivity-morning-routine",
  storageBucket: "productivity-morning-routine.firebasestorage.app",
  messagingSenderId: "197877248013",
  appId: "1:197877248013:android:9a310e006c16304489e544"
};

/**
 * Firebase App Configuration
 * Initialize Firebase app and services
 */
const initializeFirebase = (): { app: FirebaseApp; auth: Auth; db: Firestore } | null => {
  try {
    // Check if Firebase app is already initialized
    let app: FirebaseApp;
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
      console.log('✅ Firebase initialized successfully:', app.name);
    } else {
      app = getApp();
      console.log('✅ Firebase app already initialized:', app.name);
    }
    
    // Initialize services
    const auth = getAuth(app);
    const db = getFirestore(app);
    
    return { app, auth, db };
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    return null;
  }
};

// Initialize Firebase on service load
const firebaseInstance = initializeFirebase();

if (!firebaseInstance) {
  console.error('❌ Failed to initialize Firebase');
}

const { app: firebaseApp, auth, db } = firebaseInstance || {};

/**
 * Enhanced error handling for Firebase operations
 */
const handleFirebaseError = (error: any, operation: string): any => {
  console.error(`Firebase ${operation} error:`, error);
  
  const errorCode = error.code || 'unknown';
  const errorMessage = ERROR_MESSAGES.auth[errorCode as keyof typeof ERROR_MESSAGES.auth] || 
                      ERROR_MESSAGES.firestore[errorCode as keyof typeof ERROR_MESSAGES.firestore] || 
                      ERROR_MESSAGES.unknown;
  
  return {
    code: errorCode,
    message: errorMessage,
    details: error
  };
};

/**
 * Connection status checker
 */
export const checkFirebaseConnection = async (): Promise<boolean> => {
  try {
    if (!db) {
      console.error('Firebase Firestore not initialized');
      return false;
    }
    
    // Test Firestore connection with a simple read operation
    const testDoc = doc(db, 'app_config', 'connection_test');
    await getDoc(testDoc);
    console.log('✅ Firebase connection verified');
    return true;
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    return false;
  }
};

/**
 * Firebase Authentication Service
 * Provides comprehensive authentication functionality with enhanced error handling
 */
export const authService = {
  /**
   * Sign in with email and password
   */
  signIn: async (email: string, password: string): Promise<any> => {
    try {
      if (!auth) throw new Error('Firebase Auth not initialized');
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      const credential = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ User signed in successfully:', credential.user.uid);
      return credential;
    } catch (error) {
      throw handleFirebaseError(error, 'sign in');
    }
  },

  /**
   * Create user with email and password
   */
  signUp: async (email: string, password: string, displayName?: string): Promise<any> => {
    try {
      if (!auth) throw new Error('Firebase Auth not initialized');
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name if provided
      if (displayName && credential.user) {
        await updateProfile(credential.user, { displayName });
      }
      
      console.log('✅ User created successfully:', credential.user.uid);
      return credential;
    } catch (error) {
      throw handleFirebaseError(error, 'sign up');
    }
  },

  /**
   * Sign out current user
   */
  signOut: async (): Promise<void> => {
    try {
      if (!auth) throw new Error('Firebase Auth not initialized');
      
      if (auth.currentUser) {
        await signOut(auth);
        console.log('✅ User signed out successfully');
      } else {
        console.log('ℹ️ No user currently signed in');
      }
    } catch (error) {
      throw handleFirebaseError(error, 'sign out');
    }
  },

  /**
   * Send password reset email
   */
  resetPassword: async (email: string): Promise<void> => {
    try {
      if (!auth) throw new Error('Firebase Auth not initialized');
      if (!email) {
        throw new Error('Email is required');
      }
      
      await sendPasswordResetEmail(auth, email);
      console.log('✅ Password reset email sent to:', email);
    } catch (error) {
      throw handleFirebaseError(error, 'reset password');
    }
  },

  /**
   * Update user profile
   */
  updateProfile: async (updates: { displayName?: string; photoURL?: string }): Promise<void> => {
    try {
      if (!auth) throw new Error('Firebase Auth not initialized');
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user found');
      }
      
      await updateProfile(user, updates);
      console.log('✅ User profile updated successfully:', updates);
    } catch (error) {
      throw handleFirebaseError(error, 'update profile');
    }
  },

  /**
   * Get current authenticated user
   */
  getCurrentUser: (): User | null => {
    return auth?.currentUser || null;
  },
  
  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return auth?.currentUser !== null;
  },

  /**
   * Auth state change listener
   */
  onAuthStateChanged: (callback: (user: User | null) => void) => {
    if (!auth) {
      console.error('Firebase Auth not initialized');
      callback(null);
      return () => {};
    }
    
    return onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user ? `User: ${user.uid}` : 'No user');
      callback(user);
    });
  },
};

/**
 * Firestore Database Service
 * Provides comprehensive database operations with enhanced error handling and validation
 */
export const dbService = {
  /**
   * User profile operations
   */
  user: {
    /**
     * Create or update user profile
     */
    createOrUpdate: async (userId: string, profileData: any): Promise<void> => {
      try {
        if (!db) throw new Error('Firebase Firestore not initialized');
        if (!userId) {
          throw new Error('User ID is required');
        }
        
        const userRef = doc(db, COLLECTIONS.users, userId);
        const updateData = {
          ...profileData,
          metadata: {
            ...profileData.metadata,
            lastUpdated: serverTimestamp(),
            ...(profileData.metadata?.createdAt ? {} : { createdAt: serverTimestamp() })
          }
        };
        
        await setDoc(userRef, updateData, { merge: true });
        console.log('✅ User profile created/updated successfully:', userId);
      } catch (error) {
        throw handleFirebaseError(error, 'create/update user');
      }
    },

    /**
     * Get user profile
     */
    get: async (userId: string): Promise<any | null> => {
      try {
        if (!db) throw new Error('Firebase Firestore not initialized');
        if (!userId) {
          throw new Error('User ID is required');
        }
        
        const userRef = doc(db, COLLECTIONS.users, userId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log('✅ User profile retrieved successfully:', userId);
          return userData;
        }
        
        console.log('ℹ️ User profile not found:', userId);
        return null;
      } catch (error) {
        throw handleFirebaseError(error, 'get user');
      }
    },

    /**
     * Listen to user profile changes
     */
    listen: (userId: string, callback: (profile: any | null) => void) => {
      if (!db) {
        console.error('Firebase Firestore not initialized');
        callback(null);
        return () => {};
      }
      
      if (!userId) {
        console.error('User ID is required for listening to profile changes');
        callback(null);
        return () => {};
      }
      
      console.log('👂 Listening to user profile changes:', userId);
      
      const userRef = doc(db, COLLECTIONS.users, userId);
      return onSnapshot(
        userRef,
        (doc) => {
          if (doc.exists()) {
            const userData = doc.data();
            console.log('📄 User profile updated:', userId);
            callback(userData);
          } else {
            console.log('ℹ️ User profile not found during listen:', userId);
            callback(null);
          }
        },
        (error) => {
          console.error('❌ Error listening to user profile:', error);
          callback(null);
        }
      );
    },

    /**
     * Delete user profile (GDPR compliance)
     */
    delete: async (userId: string): Promise<void> => {
      try {
        if (!db) throw new Error('Firebase Firestore not initialized');
        if (!userId) {
          throw new Error('User ID is required');
        }
        
        const userRef = doc(db, COLLECTIONS.users, userId);
        await deleteDoc(userRef);
        console.log('✅ User profile deleted successfully:', userId);
      } catch (error) {
        throw handleFirebaseError(error, 'delete user');
      }
    },
  },

  /**
   * Daily progress operations
   */
  progress: {
    /**
     * Create or update daily progress
     */
    createOrUpdate: async (userId: string, date: string, progressData: any): Promise<void> => {
      try {
        if (!db) throw new Error('Firebase Firestore not initialized');
        if (!userId || !date) {
          throw new Error('User ID and date are required');
        }
        
        const progressRef = doc(db, COLLECTIONS.userProgress, userId, 'daily_entries', date);
        const updateData = {
          ...progressData,
          userId,
          date,
          metadata: {
            ...progressData.metadata,
            lastUpdated: serverTimestamp(),
            ...(progressData.metadata?.createdAt ? {} : { createdAt: serverTimestamp() })
          }
        };
        
        await setDoc(progressRef, updateData, { merge: true });
        console.log('✅ Daily progress created/updated successfully:', userId, date);
      } catch (error) {
        throw handleFirebaseError(error, 'create/update progress');
      }
    },

    /**
     * Get daily progress for a specific date
     */
    get: async (userId: string, date: string): Promise<any | null> => {
      try {
        if (!db) throw new Error('Firebase Firestore not initialized');
        if (!userId || !date) {
          throw new Error('User ID and date are required');
        }
        
        const progressRef = doc(db, COLLECTIONS.userProgress, userId, 'daily_entries', date);
        const progressDoc = await getDoc(progressRef);
        
        if (progressDoc.exists()) {
          const progressData = progressDoc.data();
          console.log('✅ Daily progress retrieved successfully:', userId, date);
          return progressData;
        }
        
        console.log('ℹ️ Daily progress not found:', userId, date);
        return null;
      } catch (error) {
        throw handleFirebaseError(error, 'get progress');
      }
    },

    /**
     * Get progress history for a date range
     */
    getRange: async (userId: string, startDate: string, endDate: string): Promise<any[]> => {
      try {
        if (!db) throw new Error('Firebase Firestore not initialized');
        if (!userId || !startDate || !endDate) {
          throw new Error('User ID, start date, and end date are required');
        }
        
        const progressCollection = collection(db, COLLECTIONS.userProgress, userId, 'daily_entries');
        const progressQuery = query(
          progressCollection,
          where('date', '>=', startDate),
          where('date', '<=', endDate),
          orderBy('date', 'desc')
        );
        
        const progressSnapshot = await getDocs(progressQuery);
        const progressData = progressSnapshot.docs.map(doc => doc.data());
        
        console.log('✅ Progress range retrieved successfully:', userId, startDate, endDate, progressData.length, 'entries');
        return progressData;
      } catch (error) {
        throw handleFirebaseError(error, 'get progress range');
      }
    },

    /**
     * Get recent progress (last N days)
     */
    getRecent: async (userId: string, limitCount: number = 30): Promise<any[]> => {
      try {
        if (!db) throw new Error('Firebase Firestore not initialized');
        if (!userId) {
          throw new Error('User ID is required');
        }
        
        if (limitCount <= 0 || limitCount > 365) {
          throw new Error('Limit must be between 1 and 365');
        }
        
        const progressCollection = collection(db, COLLECTIONS.userProgress, userId, 'daily_entries');
        const progressQuery = query(
          progressCollection,
          orderBy('date', 'desc'),
          limit(limitCount)
        );
        
        const progressSnapshot = await getDocs(progressQuery);
        const progressData = progressSnapshot.docs.map(doc => doc.data());
        
        console.log('✅ Recent progress retrieved successfully:', userId, progressData.length, 'entries');
        return progressData;
      } catch (error) {
        throw handleFirebaseError(error, 'get recent progress');
      }
    },

    /**
     * Listen to today's progress changes
     */
    listenToday: (userId: string, date: string, callback: (progress: any | null) => void) => {
      if (!db) {
        console.error('Firebase Firestore not initialized');
        callback(null);
        return () => {};
      }
      
      if (!userId || !date) {
        console.error('User ID and date are required for listening to progress changes');
        callback(null);
        return () => {};
      }
      
      console.log('👂 Listening to daily progress changes:', userId, date);
      
      const progressRef = doc(db, COLLECTIONS.userProgress, userId, 'daily_entries', date);
      return onSnapshot(
        progressRef,
        (doc) => {
          if (doc.exists()) {
            const progressData = doc.data();
            console.log('📊 Daily progress updated:', userId, date);
            callback(progressData);
          } else {
            console.log('ℹ️ Daily progress not found during listen:', userId, date);
            callback(null);
          }
        },
        (error) => {
          console.error('❌ Error listening to daily progress:', error);
          callback(null);
        }
      );
    },
  },

  /**
   * Analytics events operations
   */
  analytics: {
    /**
     * Log analytics event
     */
    logEvent: async (userId: string, eventData: any): Promise<void> => {
      try {
        if (!db) throw new Error('Firebase Firestore not initialized');
        if (!userId) {
          throw new Error('User ID is required');
        }
        
        const eventDocument = {
          userId,
          ...eventData,
          event: {
            ...eventData.event,
            timestamp: serverTimestamp(),
          },
          metadata: {
            createdAt: serverTimestamp(),
            processed: false,
          },
        };
        
        const analyticsCollection = collection(db, COLLECTIONS.analyticsEvents);
        await addDoc(analyticsCollection, eventDocument);
        console.log('✅ Analytics event logged successfully:', userId, eventData.event?.name);
      } catch (error) {
        throw handleFirebaseError(error, 'log analytics event');
      }
    },
  },
};

/**
 * Firestore Utility Functions
 */
export const firestoreUtils = {
  /**
   * Convert Firestore timestamp to Date
   */
  timestampToDate: (timestamp: Timestamp): Date => {
    return timestamp.toDate();
  },

  /**
   * Get server timestamp field value
   */
  serverTimestamp: () => serverTimestamp(),

  /**
   * Format date for Firestore document ID (YYYY-MM-DD)
   */
  formatDateId: (date: Date): string => {
    return date.toISOString().split('T')[0];
  },

  /**
   * Get today's date formatted for Firestore document ID
   */
  getTodayId: (): string => {
    return firestoreUtils.formatDateId(new Date());
  },
  
  /**
   * Validate date string format (YYYY-MM-DD)
   */
  isValidDateFormat: (dateString: string): boolean => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    return dateRegex.test(dateString);
  },
};

/**
 * Firebase Analytics Service - Phase 1 Implementation (Placeholders)
 */
export const analyticsService = {
  logEvent: async (eventName: string, parameters?: { [key: string]: any }): Promise<void> => {
    if (__DEV__) {
      console.log('📊 Analytics event (placeholder):', eventName, parameters);
    }
  },

  logScreenView: async (screenName: string, screenClass?: string): Promise<void> => {
    if (__DEV__) {
      console.log('👀 Screen view (placeholder):', screenName, screenClass);
    }
  },

  setUserProperties: async (properties: { [key: string]: string }): Promise<void> => {
    if (__DEV__) {
      console.log('👤 User properties (placeholder):', properties);
    }
  },

  setUserId: async (userId: string): Promise<void> => {
    if (__DEV__) {
      console.log('🆔 User ID (placeholder):', userId);
    }
  },
};

/**
 * Firebase Cloud Messaging Service - Phase 1 Implementation (Placeholders)
 */
export const messagingService = {
  requestPermission: async (): Promise<boolean> => {
    if (__DEV__) {
      console.log('🔔 Messaging permission request (placeholder)');
    }
    return true;
  },

  getToken: async (): Promise<string | null> => {
    if (__DEV__) {
      console.log('🎫 Get FCM token (placeholder)');
    }
    return 'placeholder-token';
  },

  subscribeToTopic: async (topic: string): Promise<void> => {
    if (__DEV__) {
      console.log('📢 Subscribe to topic (placeholder):', topic);
    }
  },

  unsubscribeFromTopic: async (topic: string): Promise<void> => {
    if (__DEV__) {
      console.log('🔕 Unsubscribe from topic (placeholder):', topic);
    }
  },

  onMessage: (callback: (message: any) => void) => {
    if (__DEV__) {
      console.log('📨 Message listener (placeholder)');
    }
    return () => {};
  },

  setBackgroundMessageHandler: (handler: (message: any) => Promise<void>) => {
    if (__DEV__) {
      console.log('📱 Background message handler (placeholder)');
    }
  },
};

/**
 * Default export with all Firebase services
 */
export default {
  // Core services
  authService,
  dbService,
  analyticsService,
  messagingService,
  firestoreUtils,
  
  // Utility functions
  checkFirebaseConnection,
  handleFirebaseError,
  initializeFirebase,
  
  // Firebase app instance
  app: firebaseApp,
};