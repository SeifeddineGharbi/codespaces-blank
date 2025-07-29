/**
 * Centralized Firebase Error Handling Utility
 * Provides user-friendly error messages for all Firebase errors
 * 
 * This utility ensures that users NEVER see raw Firebase error codes or technical messages
 * All errors are mapped to friendly, actionable messages that match the app's design
 */

import { Alert } from 'react-native';
import { ERROR_MESSAGES } from '../constants';

export interface FirebaseError {
  code: string;
  message: string;
  details?: any;
}

export interface ProcessedError {
  message: string;
  field?: 'email' | 'password' | 'confirmPassword' | 'displayName';
  showAsAlert?: boolean;
  alertTitle?: string;
  alertActions?: Array<{
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>;
}

/**
 * Maps Firebase error codes to user-friendly messages
 * This is the single source of truth for all Firebase error handling
 */
const getFirebaseErrorMessage = (errorCode: string): string => {
  // Check auth errors first
  if (ERROR_MESSAGES.auth[errorCode as keyof typeof ERROR_MESSAGES.auth]) {
    return ERROR_MESSAGES.auth[errorCode as keyof typeof ERROR_MESSAGES.auth];
  }
  
  // Check firestore errors
  if (ERROR_MESSAGES.firestore[errorCode as keyof typeof ERROR_MESSAGES.firestore]) {
    return ERROR_MESSAGES.firestore[errorCode as keyof typeof ERROR_MESSAGES.firestore];
  }
  
  // Check network errors
  if (ERROR_MESSAGES.network[errorCode as keyof typeof ERROR_MESSAGES.network]) {
    return ERROR_MESSAGES.network[errorCode as keyof typeof ERROR_MESSAGES.network];
  }
  
  // Check subscription errors
  if (ERROR_MESSAGES.subscription[errorCode as keyof typeof ERROR_MESSAGES.subscription]) {
    return ERROR_MESSAGES.subscription[errorCode as keyof typeof ERROR_MESSAGES.subscription];
  }
  
  // Fallback for unknown errors
  return ERROR_MESSAGES.unknown;
};

/**
 * Determines which form field (if any) should show the error
 */
const getErrorField = (errorCode: string): 'email' | 'password' | 'confirmPassword' | 'displayName' | undefined => {
  // Email-related errors
  if (errorCode.includes('email') || 
      errorCode === 'auth/user-not-found' || 
      errorCode === 'auth/user-disabled' ||
      errorCode === 'auth/invalid-credential') {
    return 'email';
  }
  
  // Password-related errors
  if (errorCode.includes('password') || 
      errorCode === 'auth/weak-password' ||
      errorCode === 'auth/wrong-password') {
    return 'password';
  }
  
  // Display name errors
  if (errorCode.includes('display-name') || errorCode.includes('name')) {
    return 'displayName';
  }
  
  return undefined;
};

/**
 * Main function to process Firebase errors into user-friendly format
 */
export const processFirebaseError = (error: any, context?: string): ProcessedError => {
  // Only log user-friendly error info, never raw Firebase error objects
  const errorCode = error?.code || 'unknown';
  if (__DEV__) {
    console.error(`Auth error in ${context || 'Unknown context'}:`, errorCode);
  }
  const friendlyMessage = getFirebaseErrorMessage(errorCode);
  const field = getErrorField(errorCode);
  
  // Special handling for specific error types
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return {
        message: friendlyMessage,
        showAsAlert: true,
        alertTitle: 'Account Already Exists',
        alertActions: [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', style: 'default' }
        ]
      };
      
    case 'auth/user-not-found':
      return {
        message: 'No account found with this email address. Please check your email or create a new account.',
        field: 'email'
      };
      
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return {
        message: 'Invalid email or password. Please check your credentials and try again.',
        field: 'email' // Show on email field to be less specific about which is wrong
      };
      
    case 'auth/too-many-requests':
      return {
        message: 'Too many failed attempts. Please wait a few minutes before trying again.',
        showAsAlert: true,
        alertTitle: 'Too Many Attempts'
      };
      
    case 'auth/user-disabled':
      return {
        message: 'This account has been disabled. Please contact support for assistance.',
        showAsAlert: true,
        alertTitle: 'Account Disabled'
      };
      
    case 'auth/network-request-failed':
    case 'network/no-connection':
      return {
        message: 'Please check your internet connection and try again.',
        showAsAlert: true,
        alertTitle: 'Connection Problem'
      };
      
    case 'auth/weak-password':
      return {
        message: 'Password is too weak. Please choose a stronger password with at least 8 characters.',
        field: 'password'
      };
      
    case 'auth/invalid-email':
      return {
        message: 'Please enter a valid email address.',
        field: 'email'
      };
      
    case 'firestore/permission-denied':
      return {
        message: 'Access denied. Please sign in again to continue.',
        showAsAlert: true,
        alertTitle: 'Access Error'
      };
      
    case 'firestore/unavailable':
      return {
        message: 'Service temporarily unavailable. Please try again in a moment.',
        showAsAlert: true,
        alertTitle: 'Service Unavailable'
      };
      
    default:
      // For any unknown errors, show a generic message
      return {
        message: friendlyMessage,
        showAsAlert: !field, // Show as alert if no specific field
        alertTitle: 'Something went wrong'
      };
  }
};

/**
 * Handles Firebase authentication errors specifically
 */
export const handleAuthError = (
  error: any, 
  context: 'login' | 'register' | 'forgot-password',
  setError?: (field: any, error: { message: string }) => void,
  navigation?: any
): void => {
  const processedError = processFirebaseError(error, `auth-${context}`);
  
  if (processedError.field && setError) {
    // Show error on specific form field
    setError(processedError.field, { message: processedError.message });
  } else if (processedError.showAsAlert) {
    // Show as alert dialog
    const actions = processedError.alertActions || [{ text: 'OK', style: 'default' as const }];
    
    // Handle special navigation actions
    const processedActions = actions.map(action => ({
      ...action,
      onPress: () => {
        action.onPress?.();
        
        // Special handling for "Sign In" action in email-already-in-use error
        if (action.text === 'Sign In' && navigation && context === 'register') {
          try {
            navigation.navigate('Login');
          } catch (navError) {
            console.error('Navigation error:', navError);
          }
        }
      }
    }));
    
    Alert.alert(
      processedError.alertTitle || 'Error',
      processedError.message,
      processedActions
    );
  } else {
    // Fallback: show as generic alert
    Alert.alert('Error', processedError.message);
  }
};

/**
 * Handles Firebase database/Firestore errors
 */
export const handleDatabaseError = (error: any, context?: string): string => {
  const processedError = processFirebaseError(error, `database-${context || 'unknown'}`);
  
  if (processedError.showAsAlert) {
    Alert.alert(
      processedError.alertTitle || 'Database Error',
      processedError.message
    );
  }
  
  return processedError.message;
};

/**
 * Generic error handler for any Firebase operation
 */
export const handleFirebaseError = (
  error: any, 
  context?: string,
  showAlert = true
): string => {
  const processedError = processFirebaseError(error, context);
  
  if (showAlert && processedError.showAsAlert) {
    Alert.alert(
      processedError.alertTitle || 'Error',
      processedError.message,
      processedError.alertActions || [{ text: 'OK' }]
    );
  }
  
  return processedError.message;
};

/**
 * Validation for common error patterns to prevent showing technical details
 */
export const sanitizeErrorMessage = (message: string): string => {
  // Remove Firebase technical details
  const technicalPatterns = [
    /Firebase: .+? \(.+?\)/gi,
    /\[firebase_auth\/.+?\]/gi,
    /\[firebase_core\/.+?\]/gi,
    /FirebaseError: .+/gi,
    /Error: Firebase: .+/gi
  ];
  
  let sanitized = message;
  technicalPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });
  
  // If message becomes empty after sanitization, use generic message
  if (!sanitized.trim()) {
    return ERROR_MESSAGES.unknown;
  }
  
  return sanitized.trim();
};

/**
 * Export common error messages for direct use
 */
export const COMMON_ERROR_MESSAGES = {
  NETWORK_ERROR: 'Please check your internet connection and try again.',
  GENERIC_ERROR: ERROR_MESSAGES.unknown,
  AUTH_FAILED: 'Authentication failed. Please try again.',
  INVALID_CREDENTIALS: 'Invalid email or password. Please check your credentials.',
  EMAIL_ALREADY_EXISTS: 'An account already exists with this email address.',
  WEAK_PASSWORD: 'Password is too weak. Please choose a stronger password.',
  TOO_MANY_ATTEMPTS: 'Too many failed attempts. Please try again later.',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable. Please try again.',
} as const;

/**
 * Utility to check if an error is retryable
 */
export const isRetryableError = (errorCode: string): boolean => {
  const retryableErrors = [
    'auth/network-request-failed',
    'auth/timeout',
    'firestore/unavailable',
    'network/no-connection',
    'network/timeout'
  ];
  
  return retryableErrors.includes(errorCode);
};

/**
 * Creates a retry function for failed operations
 */
export const createRetryHandler = (
  operation: () => Promise<any>,
  maxRetries = 3,
  delayMs = 1000
) => {
  return async (): Promise<any> => {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        const errorCode = (error as any)?.code || 'unknown';
        if (!isRetryableError(errorCode) || attempt === maxRetries) {
          throw error;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
      }
    }
    
    throw lastError;
  };
};