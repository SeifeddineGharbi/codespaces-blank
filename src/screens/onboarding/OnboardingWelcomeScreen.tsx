/**
 * Onboarding Welcome Screen for Productivity Morning Routine
 * First screen in the onboarding flow introducing the app
 */

import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, APP_CONFIG } from '../../constants';
import { OnboardingStackParamList } from '../../types';

type NavigationProp = StackNavigationProp<OnboardingStackParamList, 'Welcome'>;

const OnboardingWelcomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const handleGetStarted = () => {
    navigation.navigate('TaskIntro');
  };

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background.light }}>
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 justify-center px-6 py-12">
          {/* Logo */}
          <View className="items-center mb-8">
            <Image 
              source={require('@/assets/logo.png')}
              className="w-24 h-24 mb-4"
              resizeMode="contain"
            />
            <Text 
              className="text-3xl font-bold text-center"
              style={{ color: COLORS.text.primary }}
            >
              {APP_CONFIG.name}
            </Text>
          </View>

          {/* Welcome message */}
          <View className="mb-8">
            <Text 
              className="text-xl font-semibold text-center mb-4"
              style={{ color: COLORS.text.primary }}
            >
              Welcome to your journey!
            </Text>
            <Text 
              className="text-base text-center leading-6 mb-4"
              style={{ color: COLORS.text.secondary }}
            >
              {APP_CONFIG.description}
            </Text>
            <Text 
              className="text-base text-center leading-6"
              style={{ color: COLORS.text.secondary }}
            >
              Let's personalize your morning routine with science-backed habits that will transform your productivity.
            </Text>
          </View>

          {/* Key benefits */}
          <View className="mb-8">
            <View className="flex-row items-center mb-3">
              <Text className="text-2xl mr-3">🎯</Text>
              <Text 
                className="text-base font-medium flex-1"
                style={{ color: COLORS.text.primary }}
              >
                Personalized morning routine tailored to your lifestyle
              </Text>
            </View>
            <View className="flex-row items-center mb-3">
              <Text className="text-2xl mr-3">⚡</Text>
              <Text 
                className="text-base font-medium flex-1"
                style={{ color: COLORS.text.primary }}
              >
                4 science-backed habits to maximize your daily energy
              </Text>
            </View>
            <View className="flex-row items-center mb-3">
              <Text className="text-2xl mr-3">📊</Text>
              <Text 
                className="text-base font-medium flex-1"
                style={{ color: COLORS.text.primary }}
              >
                Track your progress and build unstoppable momentum
              </Text>
            </View>
          </View>

          {/* Get started button */}
          <TouchableOpacity
            onPress={handleGetStarted}
            className="rounded-xl py-4 px-6 shadow-sm"
            style={{ backgroundColor: COLORS.primary[500] }}
          >
            <Text 
              className="text-white text-lg font-semibold text-center"
            >
              Get Started
            </Text>
          </TouchableOpacity>

          <Text 
            className="text-sm text-center mt-4"
            style={{ color: COLORS.text.muted }}
          >
            Takes less than 3 minutes to personalize
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default OnboardingWelcomeScreen;