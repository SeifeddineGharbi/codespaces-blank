// Authentication navigation flow for Productivity Morning Routine

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import auth screens
import WelcomeScreen from '@/src/screens/auth/WelcomeScreen';
import LoginScreen from '@/src/screens/auth/LoginScreen';
import RegisterScreen from '@/src/screens/auth/RegisterScreen';
import ForgotPasswordScreen from '@/src/screens/auth/ForgotPasswordScreen';

// Types
import { AuthStackParamList } from '@/src/types';
import { COLORS } from '@/src/constants';

const AuthStack = createStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        cardStyleInterpolator: ({ current, layouts }) => ({
          cardStyle: {
            transform: [
              {
                translateX: current.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [layouts.screen.width, 0],
                }),
              },
            ],
          },
        }),
        cardStyle: {
          backgroundColor: COLORS.background.light,
        },
      }}
      initialRouteName="Welcome"
    >
      {/* Welcome Screen - Entry point */}
      <AuthStack.Screen 
        name="Welcome" 
        component={WelcomeScreen}
        options={{
          animationTypeForReplace: 'push',
        }}
      />
      
      {/* Login Screen */}
      <AuthStack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{
          title: 'Sign In',
          headerBackTitle: 'Back',
        }}
      />

      {/* Register Screen */}
      <AuthStack.Screen 
        name="Register" 
        component={RegisterScreen}
        options={{
          title: 'Create Account',
          headerBackTitle: 'Back',
        }}
      />

      {/* Forgot Password Screen */}
      <AuthStack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen}
        options={{
          title: 'Reset Password',
          headerBackTitle: 'Back',
        }}
      />
    </AuthStack.Navigator>
  );
};

export default AuthNavigator;