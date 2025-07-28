// Authentication navigation flow for Productivity Morning Routine

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import auth screens
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';

// Types
import { AuthStackParamList } from '../types';

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
    </AuthStack.Navigator>
  );
};

export default AuthNavigator;