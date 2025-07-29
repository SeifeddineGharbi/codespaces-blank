// Main app navigation structure for Productivity Morning Routine

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';

// Import screens (placeholder imports - screens will be created by other agents)
import SplashScreen from '../screens/SplashScreen';
import AuthNavigator from './AuthNavigator';
import OnboardingNavigator from './OnboardingNavigator';
import PaywallScreen from '../screens/paywall/PaywallScreen';

// Tab screens
import AnalyticsScreen from '../screens/main/AnalyticsScreen';
import TasksScreen from '../screens/main/TasksScreen';
import SettingsScreen from '../screens/main/SettingsScreen';

// Types
import { RootStackParamList, MainTabParamList } from '../types';

// Icons for tab navigation (using Expo vector icons)
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';

const RootStack = createStackNavigator<RootStackParamList>();
const MainTabs = createBottomTabNavigator<MainTabParamList>();

// Main tab navigator component
const MainTabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <MainTabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Analytics') {
            iconName = focused ? 'analytics' : 'analytics-outline';
          } else if (route.name === 'Tasks') {
            iconName = focused ? 'checkbox' : 'checkbox-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary[500],
        tabBarInactiveTintColor: COLORS.text.muted,
        tabBarStyle: {
          backgroundColor: COLORS.background.white,
          borderTopColor: COLORS.background.gray,
          borderTopWidth: 1,
          paddingBottom: Math.max(insets.bottom, 8), // Respect safe area bottom
          paddingTop: 8,
          height: 60 + Math.max(insets.bottom, 8), // Adjust height for safe area
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
      })}
      initialRouteName="Tasks" // Default to Tasks tab as specified in requirements
    >
      <MainTabs.Screen 
        name="Analytics" 
        component={AnalyticsScreen}
        options={{
          tabBarLabel: 'Analytics',
        }}
      />
      <MainTabs.Screen 
        name="Tasks" 
        component={TasksScreen}
        options={{
          tabBarLabel: 'Tasks',
        }}
      />
      <MainTabs.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
        }}
      />
    </MainTabs.Navigator>
  );
};

// Root navigator component
const AppNavigator: React.FC = () => {
  const { 
    user, 
    userProfile,
    loading, 
    initializing,
    isAuthenticated,
    shouldShowOnboarding,
    shouldShowPaywall,
    hasActiveSubscription
  } = useAuth();

  // Add navigation stability state
  const [navigationStable, setNavigationStable] = useState(false);
  const [lastAppState, setLastAppState] = useState<string>('loading');
  const [splashComplete, setSplashComplete] = useState(false);

  // Determine app state based on user authentication and profile
  const getAppState = () => {
    // Always show splash first, regardless of auth state
    if (!splashComplete) return 'loading';
    if (initializing || loading) return 'loading';
    if (!isAuthenticated || !user) return 'unauthenticated';
    
    // For authenticated users, check onboarding and subscription status
    if (!userProfile) {
      // Profile not loaded yet or user needs onboarding
      return 'needs_onboarding';
    }
    
    if (shouldShowOnboarding()) {
      return 'needs_onboarding';
    }
    
    if (shouldShowPaywall()) {
      return 'needs_subscription';
    }
    
    return 'authenticated';
  };

  const appState = getAppState();

  // Handle splash screen completion
  useEffect(() => {
    const timer = setTimeout(() => {
      setSplashComplete(true);
    }, 2500); // 2.5 seconds to match splash screen

    return () => clearTimeout(timer);
  }, []);

  // Stabilize navigation state to prevent rapid changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (appState !== lastAppState) {
        console.log('🧭 App state transition:', lastAppState, '->', appState);
        setLastAppState(appState);
      }
      setNavigationStable(true);
    }, 300); // 300ms delay to prevent rapid navigation changes

    return () => clearTimeout(timer);
  }, [appState, lastAppState]);

  // Use stable state for navigation decisions
  const stableAppState = navigationStable ? appState : lastAppState;
  
  console.log('🧭 App navigation state:', {
    currentAppState: appState,
    stableAppState,
    navigationStable,
    splashComplete,
    isAuthenticated,
    hasUser: !!user,
    hasProfile: !!userProfile,
    shouldShowOnboarding: shouldShowOnboarding(),
    shouldShowPaywall: shouldShowPaywall(),
    hasActiveSubscription: hasActiveSubscription(),
  });

  // Navigation state debugging
  const onNavigationStateChange = (state: any) => {
    try {
      console.log('🧭 Navigation state changed:', JSON.stringify(state, null, 2));
    } catch (error) {
      console.error('❌ Error logging navigation state:', error);
    }
  };

  const onNavigationReady = () => {
    console.log('🧭 Navigation container ready');
  };

  // Error boundary for navigation
  const handleNavigationError = (error: any) => {
    console.error('❌ Navigation error caught:', error);
    console.error('❌ Navigation error stack:', error.stack);
    // Reset navigation state to prevent infinite loops
    setNavigationStable(false);
    setLastAppState('loading');
  };

  try {
    return (
      <NavigationContainer
        onStateChange={onNavigationStateChange}
        onReady={onNavigationReady}
        fallback={<SplashScreen />}
      >
        <StatusBar style="dark" backgroundColor={COLORS.background.white} />
        <RootStack.Navigator
          screenOptions={{
            headerShown: false,
            gestureEnabled: false, // Disable swipe gestures for security
          }}
        >
        {(() => {
          switch (stableAppState) {
            case 'loading':
              return (
                <RootStack.Screen 
                  name="Splash" 
                  component={SplashScreen}
                />
              );

            case 'unauthenticated':
              return (
                <>
                  {/* Authentication Flow */}
                  <RootStack.Screen 
                    name="Auth" 
                    component={AuthNavigator}
                    options={{
                      animationTypeForReplace: 'push',
                    }}
                  />
                </>
              );

            case 'needs_onboarding':
              return (
                <>
                  {/* Onboarding Flow - For new users after authentication */}
                  <RootStack.Screen 
                    name="Onboarding" 
                    component={OnboardingNavigator}
                    options={{
                      animationTypeForReplace: 'push',
                    }}
                  />
                </>
              );

            case 'needs_subscription':
              return (
                <>
                  {/* Paywall Flow - After onboarding completion */}
                  <RootStack.Screen 
                    name="Paywall" 
                    component={PaywallScreen}
                    options={{
                      animationTypeForReplace: 'push',
                    }}
                  />
                </>
              );

            case 'authenticated':
            default:
              return (
                <>
                  {/* Main App for fully authenticated and subscribed users */}
                  <RootStack.Screen 
                    name="Main" 
                    component={MainTabNavigator}
                    options={{
                      animationTypeForReplace: 'push',
                    }}
                  />
                  
                  {/* Modal screens available from main app */}
                  <RootStack.Screen 
                    name="Onboarding" 
                    component={OnboardingNavigator}
                    options={{
                      presentation: 'modal',
                      headerShown: false,
                    }}
                  />
                  
                  <RootStack.Screen 
                    name="Paywall" 
                    component={PaywallScreen}
                    options={{
                      presentation: 'modal',
                      headerShown: false,
                    }}
                  />
                </>
              );
          }
        })()}
        </RootStack.Navigator>
      </NavigationContainer>
    );
  } catch (error) {
    console.error('❌ Critical navigation error:', error);
    handleNavigationError(error);
    // Return fallback screen on navigation error
    return <SplashScreen />;
  }
};

export default AppNavigator;