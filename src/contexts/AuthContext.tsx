/**
 * Enhanced Authentication Context for Productivity Morning Routine App
 * Provides comprehensive authentication state management with Firebase integration
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { authService, enhancedDbService } from '../services/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  // Core state
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  initializing: boolean;
  isAuthenticated: boolean;
  
  // Authentication methods
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  
  // Profile management
  refreshProfile: () => Promise<void>;
  
  // Navigation helpers
  shouldShowOnboarding: () => boolean;
  shouldShowPaywall: () => boolean;
  hasActiveSubscription: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // Initialize auth state listener
  useEffect(() => {
    console.log('🔥 Setting up Firebase auth state listener...');
    
    const unsubscribe = authService.onAuthStateChanged(async (firebaseUser) => {
      try {
        console.log('🔥 Auth state changed:', firebaseUser ? 'User signed in' : 'User signed out');
        console.log('🔥 Auth state details:', {
          uid: firebaseUser?.uid,
          email: firebaseUser?.email,
          emailVerified: firebaseUser?.emailVerified,
          displayName: firebaseUser?.displayName,
        });
        
        setUser(firebaseUser);
        
        if (firebaseUser) {
          // User is signed in, fetch their profile
          try {
            console.log('👤 Fetching user profile for:', firebaseUser.uid);
            const profileResult = await enhancedDbService.userProfile.getUserProfile(firebaseUser.uid);
            
            if (profileResult.success && profileResult.data) {
              console.log('✅ User profile loaded successfully');
              console.log('👤 Profile state:', {
                hasOnboarding: !!profileResult.data.onboarding,
                isOnboardingCompleted: profileResult.data.onboarding?.isCompleted,
                hasSubscription: !!profileResult.data.subscription,
                subscriptionStatus: profileResult.data.subscription?.status,
              });
              setUserProfile(profileResult.data as any);
            } else {
              console.log('ℹ️ No user profile found:', profileResult.error || 'Unknown error');
              console.log('ℹ️ User may need onboarding or profile creation');
              setUserProfile(null);
            }
          } catch (error) {
            console.error('❌ Error fetching user profile:', error);
            setUserProfile(null);
          }
        } else {
          // User is signed out
          setUserProfile(null);
        }
        
        setInitializing(false);
      } catch (error) {
        console.error('❌ Critical error in auth state listener:', error);
        setInitializing(false);
      }
    });

    return () => {
      console.log('🔥 Cleaning up auth state listener');
      unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('🔐 Attempting sign in for:', email);
    setLoading(true);
    try {
      await authService.signIn({ email, password, rememberMe: true });
      console.log('✅ Sign in successful');
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Sign in failed - error code:', (error as any)?.code || 'unknown');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    console.log('📝 Attempting sign up for:', email);
    setLoading(true);
    try {
      const result = await authService.signUp({ 
        email, 
        password, 
        displayName,
        acceptTerms: true,
        acceptPrivacy: true,
        receiveMarketing: false
      });
      
      // Create initial user profile after successful registration
      if (result && result.uid) {
        console.log('👤 Creating initial user profile...');
        const initialProfile: Partial<UserProfile> = {
          userId: result.uid,
          profile: {
            email: email.toLowerCase(),
            displayName: displayName || email.split('@')[0],
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            locale: 'en-US',
          },
          onboarding: {
            isCompleted: false,
            responses: {} as any, // Will be filled during onboarding
          },
          routine: {
            wakeTime: '07:00',
            routineDuration: 30,
            selectedTasks: [],
          },
          settings: {
            notifications: {
              morningReminder: true,
              reminderTime: '06:30',
            },
            privacy: {
              analyticsOptIn: true,
              crashReportingOptIn: true,
            },
          },
          subscription: {
            status: 'none',
            isTrialUser: false,
            hasUsedTrial: false,
          },
          stats: {
            totalCompletions: 0,
            currentStreak: 0,
            longestStreak: 0,
            averageCompletionScore: 0,
            totalDaysActive: 0,
            joinDate: new Date(),
            lastActive: new Date(),
            achievements: [],
          },
          metadata: {
            createdAt: new Date(),
            lastUpdated: new Date(),
            version: 1,
          },
        };
        
        await enhancedDbService.userProfile.createUserProfile(result.uid, initialProfile as any);
        console.log('✅ Initial user profile created');
      }
      
      console.log('✅ Sign up successful');
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Sign up failed - error code:', (error as any)?.code || 'unknown');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    console.log('🚪 Attempting sign out...');
    setLoading(true);
    try {
      await authService.signOut();
      setUserProfile(null);
      console.log('✅ Sign out successful');
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Sign out failed - error code:', (error as any)?.code || 'unknown');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    console.log('🔑 Sending password reset email to:', email);
    try {
      await authService.resetPassword(email);
      console.log('✅ Password reset email sent');
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Password reset failed - error code:', (error as any)?.code || 'unknown');
      }
      throw error;
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    
    console.log('🔄 Refreshing user profile...');
    try {
      const profileResult = await enhancedDbService.userProfile.getUserProfile(user.uid);
      
      if (profileResult.success && profileResult.data) {
        setUserProfile(profileResult.data as any);
        console.log('✅ User profile refreshed');
      } else {
        console.log('ℹ️ Failed to refresh user profile:', profileResult.error || 'Unknown error');
        setUserProfile(null);
      }
    } catch (error) {
      console.error('❌ Error refreshing user profile:', error);
      setUserProfile(null);
    }
  };

  // Navigation helper methods
  const shouldShowOnboarding = (): boolean => {
    if (!user) return false;
    // If user exists but no profile loaded yet, assume they need onboarding (new user)
    if (!userProfile) return true;
    // Handle case where onboarding property might be undefined
    return !userProfile.onboarding?.isCompleted;
  };

  const shouldShowPaywall = (): boolean => {
    if (!user) return false;
    // If user exists but no profile loaded yet, don't show paywall (they need onboarding first)
    if (!userProfile) return false;
    // Handle case where subscription property might be undefined
    const subscription = userProfile.subscription;
    if (!subscription) return true; // Default to showing paywall if no subscription info
    return subscription.status === 'none' || subscription.status === 'expired';
  };

  const hasActiveSubscription = (): boolean => {
    if (!userProfile || !userProfile.subscription) return false;
    const { subscription } = userProfile;
    return subscription.status === 'active' || subscription.status === 'trial';
  };

  const value: AuthContextType = {
    // Core state
    user,
    userProfile,
    loading,
    initializing,
    isAuthenticated: !!user,
    
    // Authentication methods
    signIn,
    signUp,
    signOut,
    resetPassword,
    
    // Profile management
    refreshProfile,
    
    // Navigation helpers
    shouldShowOnboarding,
    shouldShowPaywall,
    hasActiveSubscription,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;