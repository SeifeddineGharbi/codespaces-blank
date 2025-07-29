/**
 * Personalization Animation Screen
 * Shows loading sequence while "creating" personalized plan
 * Fixed: Text padding, logo animations, no element collisions
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StatusBar, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  withDelay,
} from 'react-native-reanimated';
import { COLORS } from '../../constants';
import { OnboardingStackParamList } from '../../types';

type NavigationProp = StackNavigationProp<OnboardingStackParamList, 'PersonalizationAnimation'>;

const PersonalizationAnimationScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [currentStep, setCurrentStep] = useState(0);

  // Animation values for logo
  const logoScale = useSharedValue(0.8);
  const logoRotation = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  
  // Animation values for pulse rings
  const ring1Scale = useSharedValue(0.8);
  const ring1Opacity = useSharedValue(0);
  const ring2Scale = useSharedValue(0.8);
  const ring2Opacity = useSharedValue(0);
  const ring3Scale = useSharedValue(0.8);
  const ring3Opacity = useSharedValue(0);

  // Text animation
  const textOpacity = useSharedValue(0);

  const animationSteps = [
    {
      text: "Analyzing your responses...",
      duration: 2000,
    },
    {
      text: "Creating your personal routine...",
      duration: 2000,
    },
    {
      text: "Finalizing your plan...",
      duration: 1000,
    }
  ];

  // Logo animation styles
  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotation.value}deg` as const }
    ],
    opacity: logoOpacity.value,
  }));

  // Pulse ring animation styles
  const ring1AnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ring1Scale.value }],
    opacity: ring1Opacity.value,
  }));

  const ring2AnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ring2Scale.value }],
    opacity: ring2Opacity.value,
  }));

  const ring3AnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ring3Scale.value }],
    opacity: ring3Opacity.value,
  }));

  // Text animation style
  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  useEffect(() => {
    const runAnimation = async () => {
      // Initial logo entrance
      logoOpacity.value = withTiming(1, { duration: 500 });
      logoScale.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });

      // Start continuous logo rotation
      logoRotation.value = withRepeat(
        withTiming(360, { duration: 8000, easing: Easing.linear }),
        -1,
        false
      );

      // Start pulse rings animation
      const startPulseRings = () => {
        // Ring 1
        ring1Scale.value = withRepeat(
          withSequence(
            withTiming(1.4, { duration: 1500, easing: Easing.out(Easing.cubic) }),
            withTiming(0.8, { duration: 0 })
          ),
          -1,
          false
        );
        ring1Opacity.value = withRepeat(
          withSequence(
            withTiming(0.6, { duration: 200 }),
            withTiming(0, { duration: 1300 })
          ),
          -1,
          false
        );

        // Ring 2 (delayed)
        ring2Scale.value = withDelay(500, withRepeat(
          withSequence(
            withTiming(1.4, { duration: 1500, easing: Easing.out(Easing.cubic) }),
            withTiming(0.8, { duration: 0 })
          ),
          -1,
          false
        ));
        ring2Opacity.value = withDelay(500, withRepeat(
          withSequence(
            withTiming(0.4, { duration: 200 }),
            withTiming(0, { duration: 1300 })
          ),
          -1,
          false
        ));

        // Ring 3 (more delayed)
        ring3Scale.value = withDelay(1000, withRepeat(
          withSequence(
            withTiming(1.4, { duration: 1500, easing: Easing.out(Easing.cubic) }),
            withTiming(0.8, { duration: 0 })
          ),
          -1,
          false
        ));
        ring3Opacity.value = withDelay(1000, withRepeat(
          withSequence(
            withTiming(0.2, { duration: 200 }),
            withTiming(0, { duration: 1300 })
          ),
          -1,
          false
        ));
      };

      startPulseRings();

      // Animate through steps
      for (let i = 0; i < animationSteps.length; i++) {
        setCurrentStep(i);
        
        // Fade in text
        textOpacity.value = withTiming(1, { duration: 300 });

        // Wait for step duration
        await new Promise(resolve => setTimeout(resolve, animationSteps[i].duration));

        // Fade out text (except for last step)
        if (i < animationSteps.length - 1) {
          textOpacity.value = withTiming(0, { duration: 300 });
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
    <>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background.light} />
      <SafeAreaView 
        className="flex-1 items-center justify-center" 
        style={{ backgroundColor: COLORS.background.light }} 
        edges={['top', 'left', 'right', 'bottom']}
      >
        {/* Logo Animation Container */}
        <View className="items-center mb-12 relative">
          {/* Pulse Rings - Behind logo */}
          <Animated.View
            className="absolute w-32 h-32 rounded-full border-2"
            style={[
              {
                borderColor: COLORS.primary[500],
              },
              ring1AnimatedStyle,
            ]}
          />
          <Animated.View
            className="absolute w-32 h-32 rounded-full border-2"
            style={[
              {
                borderColor: COLORS.primary[100],
              },
              ring2AnimatedStyle,
            ]}
          />
          <Animated.View
            className="absolute w-32 h-32 rounded-full border-2"
            style={[
              {
                borderColor: COLORS.primary[50],
              },
              ring3AnimatedStyle,
            ]}
          />

          {/* Main Logo */}
          <Animated.View
            className="w-24 h-24 items-center justify-center rounded-full shadow-lg elevation-4"
            style={[
              {
                backgroundColor: 'white',
                shadowColor: COLORS.primary[500],
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
              },
              logoAnimatedStyle,
            ]}
          >
            <Image
              source={require('../../../assets/logo.png')}
              className="w-16 h-16"
              resizeMode="contain"
            />
          </Animated.View>
        </View>

        {/* Animation Text */}
        <Animated.View style={textAnimatedStyle} className="px-8">
          <Text 
            className="text-2xl font-bold text-center mb-4"
            style={{ color: COLORS.text.primary }}
          >
            {animationSteps[currentStep]?.text}
          </Text>
        </Animated.View>

        {/* Progress Indicator */}
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

        {/* Encouraging Text - Fixed padding */}
        <View className="px-8 mt-8">
          <Text 
            className="text-base text-center leading-6"
            style={{ color: COLORS.text.secondary }}
          >
            We're creating a routine that fits your unique lifestyle and goals.
          </Text>
        </View>
      </SafeAreaView>
    </>
  );
};

export default PersonalizationAnimationScreen;