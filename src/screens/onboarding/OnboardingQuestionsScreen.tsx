/**
 * Onboarding Questions Screen
 * Handles all 14 personalization questions with navigation and validation
 */

import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, ONBOARDING_QUESTIONS } from '../../constants';
import { OnboardingStackParamList } from '../../types';
import { OnboardingProvider, useOnboarding } from '../../contexts/OnboardingContext';
import ProgressIndicator from '../../components/onboarding/ProgressIndicator';
import QuestionCard from '../../components/onboarding/QuestionCard';

type NavigationProp = StackNavigationProp<OnboardingStackParamList, 'Questions'>;

const OnboardingQuestionsContent: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const {
    currentQuestionIndex,
    answers,
    goToNextQuestion,
    goToPreviousQuestion,
    canGoNext,
    canGoPrevious,
    saveAnswer,
    getAnswer,
    isCurrentQuestionValid,
    completeOnboarding,
  } = useOnboarding();

  const currentQuestion = ONBOARDING_QUESTIONS[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === ONBOARDING_QUESTIONS.length - 1;

  useEffect(() => {
    console.log('📋 Current question:', {
      index: currentQuestionIndex,
      question: currentQuestion?.question,
      isValid: isCurrentQuestionValid(),
      canGoNext: canGoNext(),
    });
  }, [currentQuestionIndex, answers]);

  const handleAnswer = (answer: string | string[] | number, skipped = false) => {
    if (currentQuestion) {
      saveAnswer(currentQuestion.id, answer, skipped);
    }
  };

  const handleNext = () => {
    if (!canGoNext()) {
      Alert.alert(
        'Question Required',
        'Please answer this question before continuing, or skip it if optional.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    if (isLastQuestion) {
      // Complete onboarding and navigate to animation
      completeOnboarding();
      navigation.navigate('PersonalizationAnimation');
    } else {
      goToNextQuestion();
    }
  };

  const handleBack = () => {
    if (canGoPrevious()) {
      goToPreviousQuestion();
    }
  };

  const getCurrentAnswer = () => {
    const answer = getAnswer(currentQuestion?.id || '');
    return answer?.answer;
  };

  const isCurrentSkipped = () => {
    const answer = getAnswer(currentQuestion?.id || '');
    return answer?.skipped || false;
  };

  if (!currentQuestion) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text style={{ color: COLORS.text.primary }}>Loading questions...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.background.light }}>
      {/* Header with back button */}
      <View className="flex-row items-center justify-between px-6 py-4">
        {canGoPrevious() ? (
          <TouchableOpacity
            onPress={handleBack}
            className="flex-row items-center"
          >
            <Ionicons 
              name="chevron-back" 
              size={24} 
              color={COLORS.primary[500]} 
            />
            <Text 
              className="text-base font-medium ml-1"
              style={{ color: COLORS.primary[500] }}
            >
              Back
            </Text>
          </TouchableOpacity>
        ) : (
          <View />
        )}
        
        {!currentQuestion.required && (
          <TouchableOpacity
            onPress={() => handleAnswer('', true)}
          >
            <Text 
              className="text-base font-medium"
              style={{ color: COLORS.text.secondary }}
            >
              Skip
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Progress indicator */}
      <View className="px-6">
        <ProgressIndicator
          currentStep={currentQuestionIndex + 1}
          totalSteps={ONBOARDING_QUESTIONS.length}
          title="Question"
        />
      </View>

      {/* Question content */}
      <View className="flex-1 px-6">
        <QuestionCard
          questionId={currentQuestion.id}
          onAnswer={handleAnswer}
          currentAnswer={getCurrentAnswer()}
          skipped={isCurrentSkipped()}
        />
      </View>

      {/* Next button */}
      <View className="px-6 pb-8">
        <TouchableOpacity
          onPress={handleNext}
          className="rounded-xl py-4 px-6 shadow-sm"
          style={{
            backgroundColor: canGoNext() 
              ? COLORS.primary[500] 
              : COLORS.background.gray,
          }}
        >
          <Text 
            className="text-lg font-semibold text-center"
            style={{
              color: canGoNext() 
                ? COLORS.background.white 
                : COLORS.text.muted,
            }}
          >
            {isLastQuestion ? 'Create My Plan' : 'Next'}
          </Text>
        </TouchableOpacity>

        {!isCurrentQuestionValid() && !isCurrentSkipped() && (
          <Text 
            className="text-sm text-center mt-2"
            style={{ color: COLORS.text.muted }}
          >
            {currentQuestion.required 
              ? 'Please answer this question to continue'
              : 'Answer the question or tap Skip to continue'
            }
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
};

const OnboardingQuestionsScreen: React.FC = () => {
  return (
    <OnboardingProvider>
      <OnboardingQuestionsContent />
    </OnboardingProvider>
  );
};

export default OnboardingQuestionsScreen;