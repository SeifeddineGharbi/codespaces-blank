/**
 * Onboarding Welcome Screen for Productivity Morning Routine
 * First screen in the onboarding flow introducing the app
 */

import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    <>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background.light} />
      <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.background.light }} edges={['top', 'left', 'right']}>
        <ScrollView 
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
        <View className="flex-1 justify-center px-6 py-4">
          {/* Logo */}
          <View className="items-center mb-8">
            <View 
              className="w-28 h-28 rounded-full items-center justify-center mb-4 shadow-lg elevation-3"
              style={{ backgroundColor: COLORS.primary[50] }}
            >
              <Image 
                source={require('@/assets/logo.png')}
                className="w-20 h-20"
                resizeMode="contain"
              />
            </View>
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
            <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm elevation-2" style={{ borderColor: COLORS.background.gray, borderWidth: 1 }}>
              <View className="flex-row items-center mb-3">
                <View className="w-10 h-10 rounded-full items-center justify-center mr-4" style={{ backgroundColor: COLORS.primary[50] }}>
                  <Text className="text-xl">🎯</Text>
                </View>
                <Text 
                  className="text-base font-semibold flex-1"
                  style={{ color: COLORS.text.primary }}
                >
                  Personalized morning routine tailored to your lifestyle
                </Text>
              </View>
            </View>
            <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm elevation-2" style={{ borderColor: COLORS.background.gray, borderWidth: 1 }}>
              <View className="flex-row items-center mb-3">
                <View className="w-10 h-10 rounded-full items-center justify-center mr-4" style={{ backgroundColor: COLORS.primary[50] }}>
                  <Text className="text-xl">⚡</Text>
                </View>
                <Text 
                  className="text-base font-semibold flex-1"
                  style={{ color: COLORS.text.primary }}
                >
                  4 science-backed habits to maximize your daily energy
                </Text>
              </View>
            </View>
            <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm elevation-2" style={{ borderColor: COLORS.background.gray, borderWidth: 1 }}>
              <View className="flex-row items-center mb-3">
                <View className="w-10 h-10 rounded-full items-center justify-center mr-4" style={{ backgroundColor: COLORS.primary[50] }}>
                  <Text className="text-xl">📊</Text>
                </View>
                <Text 
                  className="text-base font-semibold flex-1"
                  style={{ color: COLORS.text.primary }}
                >
                  Track your progress and build unstoppable momentum
                </Text>
              </View>
            </View>
          </View>

          {/* Get started button with safe bottom area */}
          <View className="pb-6">
            <TouchableOpacity
              onPress={handleGetStarted}
              className="rounded-xl py-5 px-6 shadow-lg elevation-3"
              style={{ 
                backgroundColor: COLORS.primary[500],
                shadowColor: COLORS.primary[500],
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
              }}
            >
              <Text 
                className="text-white text-lg font-bold text-center"
              >
                Get Started 🚀
              </Text>
            </TouchableOpacity>

            <Text 
              className="text-sm text-center mt-4"
              style={{ color: COLORS.text.muted }}
            >
              Takes less than 3 minutes to personalize
            </Text>
          </View>
        </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default OnboardingWelcomeScreen;