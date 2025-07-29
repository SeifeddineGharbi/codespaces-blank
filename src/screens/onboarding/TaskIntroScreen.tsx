/**
 * Task Introduction Screen for Onboarding
 * Shows the 4 MVP tasks that users will complete daily
 */

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, MVP_TASKS } from '../../constants';
import { OnboardingStackParamList } from '../../types';

type NavigationProp = StackNavigationProp<OnboardingStackParamList, 'TaskIntro'>;

const TaskIntroScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const handleContinue = () => {
    navigation.navigate('Questions');
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
        <View className="flex-1 px-6 py-4">
          {/* Header */}
          <View className="mb-8">
            <Text 
              className="text-3xl font-bold text-center mb-4"
              style={{ color: COLORS.text.primary }}
            >
              Your Four Daily Tasks
            </Text>
            <Text 
              className="text-base text-center leading-6"
              style={{ color: COLORS.text.secondary }}
            >
              These science-backed habits will transform your mornings and boost your productivity all day long.
            </Text>
          </View>

          {/* Task cards */}
          <View className="space-y-4 mb-8">
            {MVP_TASKS.map((task, index) => (
              <View
                key={task.id}
                className="rounded-2xl p-6 border shadow-sm elevation-2"
                style={{
                  backgroundColor: COLORS.background.white,
                  borderColor: COLORS.background.gray,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                }}
              >
                <View className="flex-row items-center mb-4">
                  <View 
                    className="w-14 h-14 rounded-full items-center justify-center mr-4 shadow-sm"
                    style={{ backgroundColor: `${task.color}30` }}
                  >
                    <Text className="text-3xl">{task.emoji}</Text>
                  </View>
                  <Text 
                    className="text-xl font-bold flex-1"
                    style={{ color: COLORS.text.primary }}
                  >
                    {task.name}
                  </Text>
                </View>
                <Text 
                  className="text-base leading-5"
                  style={{ color: COLORS.text.secondary }}
                >
                  {task.description}
                </Text>
              </View>
            ))}
          </View>

          {/* Benefits section */}
          <View className="mb-8">
            <Text 
              className="text-xl font-semibold mb-4"
              style={{ color: COLORS.text.primary }}
            >
              Why these 4 habits?
            </Text>
            <View className="space-y-3">
              <View className="flex-row items-start">
                <Text className="text-lg mr-3">💧</Text>
                <Text 
                  className="text-base flex-1"
                  style={{ color: COLORS.text.secondary }}
                >
                  <Text className="font-semibold">Hydration</Text> kickstarts your metabolism and brain function
                </Text>
              </View>
              <View className="flex-row items-start">
                <Text className="text-lg mr-3">📵</Text>
                <Text 
                  className="text-base flex-1"
                  style={{ color: COLORS.text.secondary }}
                >
                  <Text className="font-semibold">Digital boundaries</Text> protect your mental clarity
                </Text>
              </View>
              <View className="flex-row items-start">
                <Text className="text-lg mr-3">☀️</Text>
                <Text 
                  className="text-base flex-1"
                  style={{ color: COLORS.text.secondary }}
                >
                  <Text className="font-semibold">Natural light</Text> regulates your circadian rhythm
                </Text>
              </View>
              <View className="flex-row items-start">
                <Text className="text-lg mr-3">🎯</Text>
                <Text 
                  className="text-base flex-1"
                  style={{ color: COLORS.text.secondary }}
                >
                  <Text className="font-semibold">Priority focus</Text> ensures your most important work gets done
                </Text>
              </View>
            </View>
          </View>

          {/* Continue button with safe bottom area */}
          <View className="pb-6">
            <TouchableOpacity
              onPress={handleContinue}
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
                Let's Personalize Your Routine 🎯
              </Text>
            </TouchableOpacity>

            <Text 
              className="text-sm text-center mt-4"
              style={{ color: COLORS.text.muted }}
            >
              Just a few quick questions to customize your experience
            </Text>
          </View>
        </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default TaskIntroScreen;