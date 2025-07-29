// Main entry point for Productivity Morning Routine App
// Architecture: Project Architect setup with navigation structure + Firebase integration

import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LogBox } from 'react-native';
import { GluestackUIProvider } from "./components/ui/gluestack-ui-provider";
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import ErrorBoundary from './src/components/common/ErrorBoundary';

// Suppress Firebase error notifications in development
if (__DEV__) {
  LogBox.ignoreLogs([
    'Firebase Error',
    'auth/invalid-credential', 
    'auth/user-not-found',
    'auth/wrong-password',
    'auth/too-many-requests',
    'Firebase: Error (auth/',
    'FirebaseError:',
  ]);
}

// Import Firebase testing utilities for development
import { logFirebaseStatus, quickFirebaseCheck } from './src/utils/firebaseTest';

// Import global CSS for NativeWind styling
import "./global.css";

export default function App() {
  // Firebase initialization check on app start
  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        console.log('🚀 Productivity Morning Routine - App Starting');
        
        // Log Firebase configuration status
        logFirebaseStatus();
        
        // Quick Firebase health check
        const isFirebaseHealthy = await quickFirebaseCheck();
        
        if (isFirebaseHealthy) {
          console.log('✅ Firebase is ready for use');
        } else {
          console.warn('⚠️ Firebase health check failed - some features may not work');
        }
        
      } catch (error) {
        console.error('❌ Firebase initialization error:', error);
      }
    };

    // Only run Firebase checks in development mode
    if (__DEV__) {
      initializeFirebase();
    }
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <GluestackUIProvider mode="light">
          <ErrorBoundary>
            <AuthProvider>
              <ErrorBoundary>
                <AppNavigator />
              </ErrorBoundary>
            </AuthProvider>
          </ErrorBoundary>
        </GluestackUIProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
