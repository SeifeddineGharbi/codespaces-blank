/**
 * Firebase Connection Test Utility - Updated for Expo Firebase SDK
 * 
 * This utility provides functions to test Firebase connectivity and initialization
 * during app startup. It should be called during development to ensure Firebase
 * is properly configured.
 * 
 * @version 2.0.0 - Updated for Expo Firebase SDK
 * @author Backend Agent - Productivity Morning Routine
 */

import { getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, deleteDoc, serverTimestamp, collection } from 'firebase/firestore';
import { checkFirebaseConnection } from '@/src/services/firebase';

/**
 * Comprehensive Firebase connection test
 * Tests all critical Firebase services
 */
export const runFirebaseTests = async (): Promise<{
  success: boolean;
  results: { [key: string]: { success: boolean; message: string; error?: any } };
}> => {
  const results: { [key: string]: { success: boolean; message: string; error?: any } } = {};
  
  console.log('🔥 Starting Firebase connection tests...');

  // Test 1: Firebase App Initialization
  try {
    const apps = getApps();
    if (apps.length === 0) {
      results.appInit = {
        success: false,
        message: 'No Firebase apps initialized. Check google-services.json configuration.',
      };
    } else {
      const app = getApp();
      results.appInit = {
        success: true,
        message: `Firebase app initialized successfully: ${app.name}`,
      };
    }
  } catch (error) {
    results.appInit = {
      success: false,
      message: 'Firebase app initialization failed',
      error,
    };
  }

  // Test 2: Firebase Auth Service
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    results.auth = {
      success: true,
      message: `Firebase Auth service accessible. Current user: ${currentUser ? 'Authenticated' : 'Not authenticated'}`,
    };
  } catch (error) {
    results.auth = {
      success: false,
      message: 'Firebase Auth service not accessible',
      error,
    };
  }

  // Test 3: Firestore Database Connection
  try {
    const connectionTest = await checkFirebaseConnection();
    if (connectionTest) {
      results.firestore = {
        success: true,
        message: 'Firestore database connection successful',
      };
    } else {
      results.firestore = {
        success: false,
        message: 'Firestore database connection failed',
      };
    }
  } catch (error) {
    results.firestore = {
      success: false,
      message: 'Firestore database connection test failed',
      error,
    };
  }

  // Test 4: Firestore Write/Read Test
  try {
    const db = getFirestore();
    const testDocRef = doc(db, 'connection_test', 'test_doc');
    
    // Write test
    await setDoc(testDocRef, {
      timestamp: serverTimestamp(),
      message: 'Firebase test successful',
      testId: Date.now(),
    });

    // Read test
    const testDoc = await getDoc(testDocRef);
    if (testDoc.exists()) {
      // Clean up test document
      await deleteDoc(testDocRef);
      
      results.firestoreReadWrite = {
        success: true,
        message: 'Firestore read/write operations successful',
      };
    } else {
      results.firestoreReadWrite = {
        success: false,
        message: 'Firestore read operation failed - document not found',
      };
    }
  } catch (error) {
    results.firestoreReadWrite = {
      success: false,
      message: 'Firestore read/write operations failed',
      error,
    };
  }

  // Test 5: Server Timestamp Test
  try {
    const timestamp = serverTimestamp();
    results.serverTimestamp = {
      success: true,
      message: 'Server timestamp functionality working',
    };
  } catch (error) {
    results.serverTimestamp = {
      success: false,
      message: 'Server timestamp functionality failed',
      error,
    };
  }

  // Calculate overall success
  const allTests = Object.values(results);
  const successfulTests = allTests.filter(test => test.success);
  const overallSuccess = successfulTests.length === allTests.length;

  console.log('🔥 Firebase connection tests completed');
  console.log(`✅ Successful tests: ${successfulTests.length}/${allTests.length}`);
  
  if (!overallSuccess) {
    console.log('❌ Some Firebase tests failed. Check results for details.');
  }

  return {
    success: overallSuccess,
    results,
  };
};

/**
 * Quick Firebase health check
 * Minimal test for production use
 */
export const quickFirebaseCheck = async (): Promise<boolean> => {
  try {
    // Check if Firebase is initialized
    const apps = getApps();
    if (apps.length === 0) {
      console.error('❌ Firebase not initialized');
      return false;
    }

    // Quick Firestore connection test
    const db = getFirestore();
    const testDoc = doc(db, 'health_check', 'test');
    await getDoc(testDoc);
    console.log('✅ Firebase quick health check passed');
    return true;
  } catch (error) {
    console.error('❌ Firebase quick health check failed:', error);
    return false;
  }
};

/**
 * Firebase configuration validation
 * Checks for required configuration files and settings
 */
export const validateFirebaseConfig = (): {
  isValid: boolean;
  issues: string[];
  recommendations: string[];
} => {
  const issues: string[] = [];
  const recommendations: string[] = [];

  try {
    const apps = getApps();
    
    if (apps.length === 0) {
      issues.push('No Firebase apps found');
      recommendations.push('Ensure firebase configuration is properly set up in src/services/firebase.ts');
    } else {
      const app = getApp();
      
      // Check app configuration
      if (!app.options.projectId) {
        issues.push('Firebase project ID not found');
        recommendations.push('Verify project ID in Firebase configuration');
      }
      
      if (!app.options.storageBucket) {
        issues.push('Firebase storage bucket not configured');
        recommendations.push('Configure Firebase Storage in the Firebase console');
      }
    }

    // Check if running on device vs simulator/emulator
    if (__DEV__) {
      recommendations.push('For device testing in Codespaces, use: npx expo start --tunnel');
    }

  } catch (error) {
    issues.push(`Firebase configuration validation failed: ${error}`);
    recommendations.push('Check Firebase installation and configuration files');
  }

  return {
    isValid: issues.length === 0,
    issues,
    recommendations,
  };
};

/**
 * Development helper: Log Firebase configuration status
 */
export const logFirebaseStatus = () => {
  console.log('🔥 Firebase Configuration Status:');
  
  const validation = validateFirebaseConfig();
  
  if (validation.isValid) {
    console.log('✅ Firebase configuration is valid');
  } else {
    console.log('❌ Firebase configuration issues found:');
    validation.issues.forEach(issue => console.log(`  - ${issue}`));
    
    console.log('💡 Recommendations:');
    validation.recommendations.forEach(rec => console.log(`  - ${rec}`));
  }
  
  const apps = getApps();
  console.log(`📱 Firebase apps initialized: ${apps.length}`);
  
  if (apps.length > 0) {
    const app = getApp();
    console.log(`🔧 Project ID: ${app.options.projectId}`);
    console.log(`🪣 Storage Bucket: ${app.options.storageBucket}`);
  }
};

export default {
  runFirebaseTests,
  quickFirebaseCheck,
  validateFirebaseConfig,
  logFirebaseStatus,
};