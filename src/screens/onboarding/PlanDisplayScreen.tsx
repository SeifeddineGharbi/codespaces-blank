/**
 * Plan Display Screen
 * Shows the personalized routine plan and completes onboarding
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CommonActions } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, MVP_TASKS } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';
import { enhancedDbService } from '../../services/firebase';
import { Timestamp } from 'firebase/firestore';

const PlanDisplayScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, refreshProfile } = useAuth();
  const [isCompleting, setIsCompleting] = useState(false);

  // Mock personalized plan based on common onboarding responses
  const personalizedPlan = {
    wakeTime: '07:00', // This would come from onboarding responses
    recommendedTasks: MVP_TASKS,
    motivationalMessage: "Based on your responses, you're ready to conquer your mornings! Your personalized routine is designed to maximize your energy and productivity.",
    personalizedTips: [
      "Start with hydration - your body needs water after hours of sleep",
      "Keep your phone away from your bed to maintain morning clarity",
      "Step outside for natural light to regulate your circadian rhythm",
      "Identify your most important task before getting distracted"
    ]
  };

  const handleStartJourney = async () => {
    if (!user) return;

    setIsCompleting(true);
    
    try {
      // Mark onboarding as completed
      await enhancedDbService.userProfile.updateUserProfile(user.uid, {
        onboarding: {
          isCompleted: true,
          completedAt: Timestamp.now(),
          responses: {} as any, // This will be updated with actual onboarding responses in real implementation
        }
      });

      // Refresh profile to trigger navigation flow
      await refreshProfile();

      // Navigate to root to trigger auth flow re-evaluation
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Auth' as never }],
        })
      );

    } catch (error) {
      console.error('Error completing onboarding:', error);
      Alert.alert(
        'Error',
        'There was an issue saving your plan. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setIsCompleting(false);
    }
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
          <View className="items-center mb-8">
            <View 
              className="w-20 h-20 rounded-full items-center justify-center mb-4 shadow-lg elevation-3"
              style={{ 
                backgroundColor: COLORS.primary[50],
                shadowColor: COLORS.primary[500],
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
              }}
            >
              <Text className="text-4xl">🎉</Text>
            </View>
            <Text 
              className="text-3xl font-bold text-center mb-4"
              style={{ color: COLORS.text.primary }}
            >
              Your Personalized Plan is Ready!
            </Text>
            <Text 
              className="text-base text-center leading-6"
              style={{ color: COLORS.text.secondary }}
            >
              {personalizedPlan.motivationalMessage}
            </Text>
          </View>

          {/* Wake time */}
          <View className="mb-8">
            <Text 
              className="text-xl font-semibold mb-4"
              style={{ color: COLORS.text.primary }}
            >
              Your Morning Schedule
            </Text>
            <View 
              className="rounded-2xl p-6 border-2"
              style={{
                backgroundColor: COLORS.background.white,
                borderColor: COLORS.primary[100],
              }}
            >
              <View className="flex-row items-center justify-between mb-4">
                <Text 
                  className="text-lg font-medium"
                  style={{ color: COLORS.text.primary }}
                >
                  Wake up time
                </Text>
                <Text 
                  className="text-2xl font-bold"
                  style={{ color: COLORS.primary[500] }}
                >
                  {personalizedPlan.wakeTime}
                </Text>
              </View>
              <Text 
                className="text-sm"
                style={{ color: COLORS.text.secondary }}
              >
                Your reminder will be sent 90 minutes after wake time (weekdays only)
              </Text>
            </View>
          </View>

          {/* Task overview */}
          <View className="mb-8">
            <Text 
              className="text-xl font-semibold mb-4"
              style={{ color: COLORS.text.primary }}
            >
              Your Four Daily Habits
            </Text>
            <View className="space-y-3">
              {personalizedPlan.recommendedTasks.map((task, index) => (
                <View
                  key={task.id}
                  className="flex-row items-center p-4 rounded-xl"
                  style={{ backgroundColor: COLORS.background.white }}
                >
                  <View 
                    className="w-10 h-10 rounded-full items-center justify-center mr-4"
                    style={{ backgroundColor: `${task.color}20` }}
                  >
                    <Text className="text-xl">{task.emoji}</Text>
                  </View>
                  <Text 
                    className="text-base font-medium flex-1"
                    style={{ color: COLORS.text.primary }}
                  >
                    {task.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Personalized tips */}
          <View className="mb-8">
            <Text 
              className="text-xl font-semibold mb-4"
              style={{ color: COLORS.text.primary }}
            >
              Tips for Success
            </Text>
            <View className="space-y-3">
              {personalizedPlan.personalizedTips.map((tip, index) => (
                <View key={index} className="flex-row items-start">
                  <Text 
                    className="text-base mr-3 mt-1"
                    style={{ color: COLORS.primary[500] }}
                  >
                    ✓
                  </Text>
                  <Text 
                    className="text-base flex-1 leading-6"
                    style={{ color: COLORS.text.secondary }}
                  >
                    {tip}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Start button with safe bottom area */}
          <View className="pb-6">
            <TouchableOpacity
              onPress={handleStartJourney}
              disabled={isCompleting}
              className="rounded-xl py-5 px-6 shadow-lg elevation-3"
              style={{
                backgroundColor: isCompleting 
                  ? COLORS.background.gray 
                  : COLORS.primary[500],
                shadowColor: isCompleting ? '#000' : COLORS.primary[500],
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isCompleting ? 0.1 : 0.3,
                shadowRadius: 8,
              }}
            >
              <Text 
                className="text-white text-lg font-bold text-center"
              >
                {isCompleting ? 'Setting Up Your Account...' : 'Start My Journey 🚀'}
              </Text>
            </TouchableOpacity>

            <Text 
              className="text-sm text-center mt-4"
              style={{ color: COLORS.text.muted }}
            >
              Ready to transform your mornings and conquer your days!
            </Text>
          </View>
        </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default PlanDisplayScreen;