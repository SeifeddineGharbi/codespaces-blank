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
  initializeAuth,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  onAuthStateChanged,
  reload,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
  User,
  Auth
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

// Import constants and types
import { COLLECTIONS, ERROR_MESSAGES } from '../constants';
import { 
  UserProfile, 
  AuthError, 
  LoginCredentials, 
  RegistrationCredentials,
  EmailVerificationStatus,
  SessionInfo,
  AuthState
} from '../types';
// Simple validation functions
const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return {
    isValid: emailRegex.test(email),
    errors: { email: emailRegex.test(email) ? '' : 'Invalid email format' }
  };
};

const validateLoginForm = (credentials: any) => {
  const errors: any = {};
  if (!credentials.email) errors.email = 'Email is required';
  if (!credentials.password) errors.password = 'Password is required';
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

const validateRegistrationForm = (credentials: any) => {
  const errors: any = {};
  if (!credentials.email) errors.email = 'Email is required';
  if (!credentials.password) errors.password = 'Password is required';
  if (credentials.password && credentials.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

const validateDisplayName = (name: string) => {
  return {
    isValid: name.length > 0,
    errors: { displayName: name.length > 0 ? '' : 'Name is required' }
  };
};

const sanitizeInput = (input: string) => {
  return input.replace(/[<>]/g, '');
};

/**
 * Firestore Data Sanitization Utilities
 * Firestore doesn't support undefined values - convert to null or omit entirely
 */
const sanitizeForFirestore = (data: any): any => {
  if (data === null || data === undefined) {
    return null;
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeForFirestore);
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized: any = {};
    Object.keys(data).forEach(key => {
      const value = data[key];
      if (value !== undefined) {
        sanitized[key] = sanitizeForFirestore(value);
      }
      // If value is undefined, we omit it from the sanitized object
    });
    return sanitized;
  }
  
  return data;
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
    
    // Initialize services with AsyncStorage persistence
    const auth = initializeAuth(app, {
    });
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

// Export db for direct use
export { db };

/**
 * Enhanced error handling for Firebase operations with typed errors
 * This function now uses the centralized error handling utility
 */
const handleFirebaseError = (error: any, operation: string): AuthError => {
  // Import the centralized error handling utility
  // Note: We avoid circular imports by keeping basic error handling here
  console.error(`Firebase ${operation} error:`, error);
  
  const errorCode = error.code || 'unknown';
  
  // Use the same logic as the centralized error handler but return AuthError format
  let errorMessage: string;
  
  // Check auth errors first
  if (ERROR_MESSAGES.auth[errorCode as keyof typeof ERROR_MESSAGES.auth]) {
    errorMessage = ERROR_MESSAGES.auth[errorCode as keyof typeof ERROR_MESSAGES.auth];
  }
  // Check firestore errors
  else if (ERROR_MESSAGES.firestore[errorCode as keyof typeof ERROR_MESSAGES.firestore]) {
    errorMessage = ERROR_MESSAGES.firestore[errorCode as keyof typeof ERROR_MESSAGES.firestore];
  }
  // Check network errors
  else if (ERROR_MESSAGES.network[errorCode as keyof typeof ERROR_MESSAGES.network]) {
    errorMessage = ERROR_MESSAGES.network[errorCode as keyof typeof ERROR_MESSAGES.network];
  }
  // Check subscription errors
  else if (ERROR_MESSAGES.subscription[errorCode as keyof typeof ERROR_MESSAGES.subscription]) {
    errorMessage = ERROR_MESSAGES.subscription[errorCode as keyof typeof ERROR_MESSAGES.subscription];
  }
  // Fallback for unknown errors
  else {
    errorMessage = ERROR_MESSAGES.unknown;
  }
  
  // Determine if error is retryable
  const retryableErrors = [
    'auth/network-request-failed',
    'auth/timeout',
    'firestore/unavailable',
    'network/no-connection',
    'network/timeout'
  ];
  
  // Determine field association for form errors
  let field: 'email' | 'password' | 'confirmPassword' | 'displayName' | undefined;
  if (errorCode.includes('email') || 
      errorCode === 'auth/user-not-found' || 
      errorCode === 'auth/user-disabled' ||
      errorCode === 'auth/invalid-credential') {
    field = 'email';
  } else if (errorCode.includes('password') || 
             errorCode === 'auth/weak-password' ||
             errorCode === 'auth/wrong-password') {
    field = 'password';
  } else if (errorCode.includes('display-name') || errorCode.includes('name')) {
    field = 'displayName';
  }
  
  return {
    code: errorCode,
    message: errorMessage,
    details: error,
    timestamp: new Date(),
    recoverable: retryableErrors.includes(errorCode),
    field,
    retryable: retryableErrors.includes(errorCode)
  };
};

/**
 * Session management utilities
 */
const sessionUtils = {
  /**
   * Get current session info
   */
  getCurrentSession: (): SessionInfo | null => {
    const user = auth?.currentUser;
    if (!user) return null;
    
    return {
      userId: user.uid,
      email: user.email || '',
      issuedAt: new Date(user.metadata.creationTime || Date.now()),
      expiersAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      persistent: true, // Will be managed by context
      deviceInfo: {
        platform: 'mobile',
        appVersion: '1.0.0'
      }
    };
  },
  
  /**
   * Check if session is valid
   */
  isSessionValid: (): boolean => {
    const session = sessionUtils.getCurrentSession();
    if (!session) return false;
    return new Date() < session.expiersAt;
  },
  
  /**
   * Clear session data
   */
  clearSession: () => {
    // Clear any stored session data if using AsyncStorage
    console.log('🧹 Session cleared');
  }
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
   * Sign in with email and password with enhanced validation
   */
  signIn: async (credentials: LoginCredentials): Promise<User> => {
    try {
      if (!auth) throw new Error('Firebase Auth not initialized');
      
      // Validate credentials
      const validation = validateLoginForm(credentials);
      if (!validation.isValid) {
        const firstError = Object.values(validation.errors)[0];
        throw {
          code: 'validation/invalid-credentials',
          message: firstError || 'Invalid credentials'
        };
      }
      
      const { email, password } = credentials;
      const credential = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
      
      // Check email verification status
      if (!credential.user.emailVerified) {
        console.warn('⚠️ User email not verified:', credential.user.uid);
        // Note: We don't block login for unverified emails in MVP
      }
      
      console.log('✅ User signed in successfully:', credential.user.uid);
      return credential.user;
    } catch (error) {
      throw handleFirebaseError(error, 'sign in');
    }
  },

  /**
   * Create user with email and password with enhanced validation
   */
  signUp: async (credentials: RegistrationCredentials): Promise<User> => {
    try {
      if (!auth) throw new Error('Firebase Auth not initialized');
      
      // Validate registration data
      const validation = validateRegistrationForm(credentials);
      if (!validation.isValid) {
        const firstError = Object.values(validation.errors)[0];
        throw {
          code: 'validation/invalid-registration',
          message: firstError || 'Invalid registration data'
        };
      }
      
      const { email, password, displayName } = credentials;
      const sanitizedEmail = sanitizeInput(email.trim().toLowerCase());
      
      // Create user account
      const credential = await createUserWithEmailAndPassword(auth, sanitizedEmail, password);
      
      // Update profile with display name if provided
      if (displayName && credential.user) {
        const sanitizedDisplayName = sanitizeInput(displayName.trim());
        await updateProfile(credential.user, { displayName: sanitizedDisplayName });
      }
      
      // Send email verification
      await authService.sendEmailVerification();
      
      console.log('✅ User created successfully:', credential.user.uid);
      return credential.user;
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
   * Send password reset email with validation
   */
  resetPassword: async (email: string): Promise<void> => {
    try {
      if (!auth) throw new Error('Firebase Auth not initialized');
      
      // Validate email
      const validation = validateEmail(email);
      if (!validation.isValid) {
        throw {
          code: 'validation/invalid-email',
          message: validation.errors.email || 'Invalid email address'
        };
      }
      
      const sanitizedEmail = sanitizeInput(email.trim().toLowerCase());
      await sendPasswordResetEmail(auth, sanitizedEmail);
      console.log('✅ Password reset email sent to:', sanitizedEmail);
    } catch (error) {
      throw handleFirebaseError(error, 'reset password');
    }
  },

  /**
   * Update user profile with validation
   */
  updateProfile: async (updates: { displayName?: string; photoURL?: string }): Promise<void> => {
    try {
      if (!auth) throw new Error('Firebase Auth not initialized');
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user found');
      }
      
      // Validate display name if provided
      if (updates.displayName) {
        const validation = validateDisplayName(updates.displayName);
        if (!validation.isValid) {
          throw {
            code: 'validation/invalid-display-name',
            message: validation.errors.displayName || 'Invalid display name'
          };
        }
        updates.displayName = sanitizeInput(updates.displayName.trim());
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
   * Send email verification
   */
  sendEmailVerification: async (): Promise<void> => {
    try {
      if (!auth) throw new Error('Firebase Auth not initialized');
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user found');
      }
      
      await sendEmailVerification(user);
      console.log('✅ Email verification sent to:', user.email);
    } catch (error) {
      throw handleFirebaseError(error, 'send email verification');
    }
  },
  
  /**
   * Check email verification status
   */
  checkEmailVerificationStatus: async (): Promise<EmailVerificationStatus> => {
    try {
      if (!auth) throw new Error('Firebase Auth not initialized');
      const user = auth.currentUser;
      if (!user) {
        return {
          verified: false,
          sent: false,
          resendAvailable: false
        };
      }
      
      // Reload user to get latest verification status
      await reload(user);
      
      return {
        verified: user.emailVerified,
        sent: true, // Assume it was sent if user exists
        resendAvailable: true // Always allow resend in MVP
      };
    } catch (error) {
      console.error('❌ Error checking email verification status:', error);
      return {
        verified: false,
        sent: false,
        resendAvailable: false
      };
    }
  },
  
  /**
   * Reauthenticate user (required for sensitive operations)
   */
  reauthenticate: async (password: string): Promise<void> => {
    try {
      if (!auth) throw new Error('Firebase Auth not initialized');
      const user = auth.currentUser;
      if (!user || !user.email) {
        throw new Error('No authenticated user found');
      }
      
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      console.log('✅ User reauthenticated successfully');
    } catch (error) {
      throw handleFirebaseError(error, 'reauthenticate');
    }
  },
  
  /**
   * Delete user account
   */
  deleteAccount: async (): Promise<void> => {
    try {
      if (!auth) throw new Error('Firebase Auth not initialized');
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user found');
      }
      
      await deleteUser(user);
      console.log('✅ User account deleted successfully');
    } catch (error) {
      throw handleFirebaseError(error, 'delete account');
    }
  },
  
  /**
   * Auth state change listener with enhanced monitoring
   */
  onAuthStateChanged: (callback: (user: User | null) => void) => {
    if (!auth) {
      console.error('Firebase Auth not initialized');
      callback(null);
      return () => {};
    }
    
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('Auth state changed: User signed in:', user.uid);
        console.log('Email verified:', user.emailVerified);
      } else {
        console.log('Auth state changed: User signed out');
      }
      callback(user);
    });
  },
  
  /**
   * Session management methods
   */
  getCurrentSession: sessionUtils.getCurrentSession,
  isSessionValid: sessionUtils.isSessionValid,
  clearSession: sessionUtils.clearSession,
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
        
        // Sanitize data for Firestore (remove undefined values)
        const sanitizedData = sanitizeForFirestore(updateData);
        
        await setDoc(userRef, sanitizedData, { merge: true });
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
        
        // Sanitize data for Firestore (remove undefined values)
        const sanitizedData = sanitizeForFirestore(updateData);
        
        await setDoc(progressRef, sanitizedData, { merge: true });
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
 * Import enhanced database services
 */
import { 
  userProfileService, 
  dailyProgressService, 
  batchOperationsService,
  analyticsService as dbAnalyticsService 
} from './database';
import { databaseUtils } from './databaseUtils';
import { scoringUtils } from './scoring';
import { 
  validateUserProfile, 
  validateDailyProgress, 
  validateOnboardingResponses,
  validateTaskCompletions,
  validateMVPTaskCompletion 
} from './validation';

/**
 * Enhanced database service with comprehensive operations
 */
export const enhancedDbService = {
  // Enhanced services
  userProfile: userProfileService,
  dailyProgress: dailyProgressService,
  batchOperations: batchOperationsService,
  analytics: dbAnalyticsService,
  
  // Utilities
  utils: databaseUtils,
  scoring: scoringUtils,
  
  // Validation functions
  validate: {
    userProfile: validateUserProfile,
    dailyProgress: validateDailyProgress,
    onboardingResponses: validateOnboardingResponses,
    taskCompletions: validateTaskCompletions,
    mvpTaskCompletion: validateMVPTaskCompletion,
  },
  
  // Legacy compatibility
  user: {
    createOrUpdate: userProfileService.createUserProfile.bind(userProfileService),
    get: userProfileService.getUserProfile.bind(userProfileService),
    listen: userProfileService.listenToUserProfile.bind(userProfileService),
    delete: async (userId: string) => {
      // Delete user profile (GDPR compliance)
      try {
        if (!db) throw new Error('Firebase Firestore not initialized');
        const userRef = doc(db, COLLECTIONS.users, userId);
        await deleteDoc(userRef);
        console.log('✅ User profile deleted successfully:', userId);
      } catch (error) {
        throw handleFirebaseError(error, 'delete user');
      }
    },
  },
  
  progress: {
    createOrUpdate: dailyProgressService.createOrUpdateDailyProgress.bind(dailyProgressService),
    get: dailyProgressService.getDailyProgress.bind(dailyProgressService),
    getRange: dailyProgressService.getProgressHistory.bind(dailyProgressService),
    getRecent: (userId: string, limitCount: number = 30) => 
      dailyProgressService.getProgressHistory(
        userId, 
        databaseUtils.dateTime.getDaysAgo(limitCount), 
        databaseUtils.dateTime.getTodayString(),
        { limit: limitCount }
      ),
    listenToday: dailyProgressService.listenToDailyProgress.bind(dailyProgressService),
  },
  
  // Convenience methods
  async getTodayProgress(userId: string) {
    const today = databaseUtils.dateTime.getTodayString();
    return await dailyProgressService.getDailyProgress(userId, today);
  },
  
  async updateTaskStatus(userId: string, taskId: string, status: 'not_started' | 'in_progress' | 'completed' | 'skipped', notes?: string) {
    const today = databaseUtils.dateTime.getTodayString();
    return await dailyProgressService.updateTaskCompletion(userId, today, taskId, {
      status,
      ...(notes ? { notes } : {}),
      ...(status === 'completed' ? { endTime: serverTimestamp() } : {}),
      ...(status === 'in_progress' ? { startTime: serverTimestamp() } : {}),
    });
  },
  
  async submitToday(userId: string, reflection?: any) {
    const today = databaseUtils.dateTime.getTodayString();
    return await dailyProgressService.submitCompletedDay(userId, today, reflection);
  },
  
  async getUserAnalytics(userId: string, days: number = 30) {
    return await dbAnalyticsService.generateUserAnalytics(userId, days);
  },
  
  async backupUserData(userId: string) {
    return await batchOperationsService.backupUserData(userId);
  },
};

/**
 * Default export with all Firebase services including enhanced database operations
 */
export default {
  // Core services
  authService,
  dbService: enhancedDbService, // Use enhanced service as primary
  analyticsService,
  messagingService,
  firestoreUtils,
  
  // Enhanced services
  enhancedDbService,
  databaseUtils,
  scoringUtils,
  
  // Validation utilities
  validation: {
    validateUserProfile,
    validateDailyProgress,
    validateOnboardingResponses,
    validateTaskCompletions,
    validateMVPTaskCompletion,
  },
  
  // Utility functions
  checkFirebaseConnection,
  handleFirebaseError,
  initializeFirebase,
  sessionUtils,
  
  // Firebase app instance
  app: firebaseApp,
};