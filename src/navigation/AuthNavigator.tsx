// Authentication navigation flow for Productivity Morning Routine

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import auth screens (placeholder imports - screens will be created by other agents)
import WelcomeScreen from '@/src/screens/auth/WelcomeScreen';
import LoginScreen from '@/src/screens/auth/LoginScreen';
import RegisterScreen from '@/src/screens/auth/RegisterScreen';
import ForgotPasswordScreen from '@/src/screens/auth/ForgotPasswordScreen';

// Types
import { AuthStackParamList } from '@/src/types';

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
      }}
      initialRouteName="Welcome"
    >
      <AuthStack.Screen 
        name="Welcome" 
        component={WelcomeScreen}
      />
      
      <AuthStack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{
          title: 'Sign In',
        }}
      />
      
      <AuthStack.Screen 
        name="Register" 
        component={RegisterScreen}
        options={{
          title: 'Create Account',
        }}
      />
      
      <AuthStack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen}
        options={{
          title: 'Reset Password',
        }}
      />
    </AuthStack.Navigator>
  );
};

export default AuthNavigator;