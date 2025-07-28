/**
 * Personalization Animation Screen
 * Shows loading sequence while "creating" personalized plan
 */

import React, { useEffect, useState } from 'react';
import { View, Text, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS } from '../../constants';
import { OnboardingStackParamList } from '../../types';

type NavigationProp = StackNavigationProp<OnboardingStackParamList, 'PersonalizationAnimation'>;

const PersonalizationAnimationScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [currentStep, setCurrentStep] = useState(0);
  const fadeAnim = new Animated.Value(0);

  const animationSteps = [
    {
      text: "Analyzing your responses...",
      duration: 2000,
      emoji: "🔍"
    },
    {
      text: "Creating your personal plan...",
      duration: 2000,
      emoji: "⚡"
    },
    {
      text: "Almost ready...",
      duration: 1000,
      emoji: "🎯"
    }
  ];

  useEffect(() => {
    const runAnimation = async () => {
      for (let i = 0; i < animationSteps.length; i++) {
        setCurrentStep(i);
        
        // Fade in animation
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();

        // Wait for step duration
        await new Promise(resolve => setTimeout(resolve, animationSteps[i].duration));

        // Fade out animation (except for last step)
        if (i < animationSteps.length - 1) {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start();
          
          // Wait for fade out to complete
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }

      // Navigate to plan display after animation completes
      setTimeout(() => {
        navigation.navigate('PlanDisplay');
      }, 500);
    };

    runAnimation();
  }, [navigation]);

  return (
    <View className="flex-1 items-center justify-center px-8" style={{ backgroundColor: COLORS.background.light }}>
      {/* Loading indicator */}
      <View className="items-center mb-8">
        <View 
          className="w-20 h-20 rounded-full items-center justify-center mb-6"
          style={{ backgroundColor: COLORS.primary[50] }}
        >
          <Text className="text-4xl">
            {animationSteps[currentStep]?.emoji}
          </Text>
        </View>

        {/* Animated loading dots */}
        <View className="flex-row items-center mb-4">
          <LoadingDot delay={0} />
          <LoadingDot delay={200} />
          <LoadingDot delay={400} />
        </View>
      </View>

      {/* Animation text */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text 
          className="text-2xl font-bold text-center mb-4"
          style={{ color: COLORS.text.primary }}
        >
          {animationSteps[currentStep]?.text}
        </Text>
      </Animated.View>

      {/* Progress indicator */}
      <View className="flex-row space-x-2 mt-8">
        {animationSteps.map((_, index) => (
          <View
            key={index}
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: index <= currentStep 
                ? COLORS.primary[500] 
                : COLORS.background.gray,
            }}
          />
        ))}
      </View>

      {/* Encouraging text */}
      <Text 
        className="text-base text-center mt-6 leading-6"
        style={{ color: COLORS.text.secondary }}
      >
        We're creating a routine that fits your unique lifestyle and goals.
      </Text>
    </View>
  );
};

// Loading dot component with animation
const LoadingDot: React.FC<{ delay: number }> = ({ delay }) => {
  const bounceAnim = new Animated.Value(0);

  useEffect(() => {
    const bounce = () => {
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -10,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    };

    const interval = setInterval(bounce, 1000);
    const timeout = setTimeout(bounce, delay);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [delay]);

  return (
    <Animated.View
      className="w-3 h-3 rounded-full mx-1"
      style={{
        backgroundColor: COLORS.primary[500],
        transform: [{ translateY: bounceAnim }],
      }}
    />
  );
};

export default PersonalizationAnimationScreen;