// Onboarding navigation flow for Productivity Morning Routine

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import onboarding screens (placeholder imports - screens will be created by other agents)
import OnboardingWelcomeScreen from '@/src/screens/onboarding/OnboardingWelcomeScreen';
import TaskIntroScreen from '@/src/screens/onboarding/TaskIntroScreen';
import OnboardingQuestionsScreen from '@/src/screens/onboarding/OnboardingQuestionsScreen';
import PersonalizationAnimationScreen from '@/src/screens/onboarding/PersonalizationAnimationScreen';
import PlanDisplayScreen from '@/src/screens/onboarding/PlanDisplayScreen';

// Types
import { OnboardingStackParamList } from '@/src/types';

const OnboardingStack = createStackNavigator<OnboardingStackParamList>();

const OnboardingNavigator: React.FC = () => {
  return (
    <OnboardingStack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: false, // Disable swipe back to prevent skipping onboarding steps
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
      <OnboardingStack.Screen 
        name="Welcome" 
        component={OnboardingWelcomeScreen}
        options={{
          // Initial screen - animation handled by stack navigator options
        }}
      />
      
      <OnboardingStack.Screen 
        name="TaskIntro" 
        component={TaskIntroScreen}
        options={{
          title: 'Your Daily Tasks',
        }}
      />
      
      <OnboardingStack.Screen 
        name="Questions" 
        component={OnboardingQuestionsScreen}
        options={{
          title: 'Personalization',
        }}
      />
      
      <OnboardingStack.Screen 
        name="PersonalizationAnimation" 
        component={PersonalizationAnimationScreen}
        options={{
          title: 'Creating Your Plan',
          // Loading screen - animation controlled by custom interpolator
        }}
      />
      
      <OnboardingStack.Screen 
        name="PlanDisplay" 
        component={PlanDisplayScreen}
        options={{
          title: 'Your Personalized Plan',
        }}
      />
    </OnboardingStack.Navigator>
  );
};

export default OnboardingNavigator;