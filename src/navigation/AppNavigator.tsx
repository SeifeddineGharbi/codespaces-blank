// Main app navigation structure for Productivity Morning Routine

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';

// Import screens (placeholder imports - screens will be created by other agents)
import SplashScreen from '@/src/screens/SplashScreen';
import AuthNavigator from './AuthNavigator';
import OnboardingNavigator from './OnboardingNavigator';
import PaywallScreen from '@/src/screens/paywall/PaywallScreen';

// Tab screens
import AnalyticsScreen from '@/src/screens/main/AnalyticsScreen';
import TasksScreen from '@/src/screens/main/TasksScreen';
import SettingsScreen from '@/src/screens/main/SettingsScreen';

// Types
import { RootStackParamList, MainTabParamList } from '@/src/types';

// Icons for tab navigation (using Expo vector icons)
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/src/constants';

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
  const { isAuthenticated, loading } = useAuth();

  return (
    <NavigationContainer>
      <StatusBar style="dark" backgroundColor={COLORS.background.white} />
      <RootStack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: false, // Disable swipe gestures for security
        }}
      >
        {loading ? (
          /* Show splash screen while loading */
          <RootStack.Screen 
            name="Splash" 
            component={SplashScreen}
          />
        ) : !isAuthenticated ? (
          /* Show auth flow when not authenticated */
          <>
            <RootStack.Screen 
              name="Auth" 
              component={AuthNavigator}
              options={{
                animationTypeForReplace: 'push',
              }}
            />
            <RootStack.Screen 
              name="Onboarding" 
              component={OnboardingNavigator}
              options={{
                animationTypeForReplace: 'push',
              }}
            />
            <RootStack.Screen 
              name="Paywall" 
              component={PaywallScreen}
              options={{
                animationTypeForReplace: 'push',
              }}
            />
          </>
        ) : (
          /* Show main app when authenticated */
          <RootStack.Screen 
            name="Main" 
            component={MainTabNavigator}
            options={{
              animationTypeForReplace: 'push',
            }}
          />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;