/**
 * Onboarding Context for Productivity Morning Routine App
 * Manages form state and navigation across all 14 onboarding questions
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ONBOARDING_QUESTIONS } from '../constants';
import { FirestoreOnboardingResponses, QuestionType } from '../types';

interface OnboardingAnswer {
  questionId: string;
  answer: string | string[] | number;
  skipped?: boolean;
}

interface OnboardingContextType {
  // Current state
  currentQuestionIndex: number;
  answers: Record<string, OnboardingAnswer>;
  isComplete: boolean;
  
  // Navigation methods
  goToNextQuestion: () => void;
  goToPreviousQuestion: () => void;
  goToQuestion: (index: number) => void;
  canGoNext: () => boolean;
  canGoPrevious: () => boolean;
  
  // Answer management
  saveAnswer: (questionId: string, answer: string | string[] | number, skipped?: boolean) => void;
  getAnswer: (questionId: string) => OnboardingAnswer | undefined;
  skipQuestion: (questionId: string) => void;
  
  // Form validation
  isCurrentQuestionValid: () => boolean;
  getCompletionPercentage: () => number;
  
  // Reset and completion
  resetOnboarding: () => void;
  completeOnboarding: () => void;
  
  // Data export
  getOnboardingResponses: () => Partial<FirestoreOnboardingResponses>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

interface OnboardingProviderProps {
  children: ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, OnboardingAnswer>>({});
  const [isComplete, setIsComplete] = useState(false);

  const getCurrentQuestion = () => ONBOARDING_QUESTIONS[currentQuestionIndex];

  const goToNextQuestion = () => {
    if (currentQuestionIndex < ONBOARDING_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < ONBOARDING_QUESTIONS.length) {
      setCurrentQuestionIndex(index);
    }
  };

  const canGoNext = (): boolean => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return false;
    
    // Can always proceed if current question is valid or can be skipped
    return isCurrentQuestionValid() || !currentQuestion.required;
  };

  const canGoPrevious = (): boolean => {
    return currentQuestionIndex > 0;
  };

  const saveAnswer = (questionId: string, answer: string | string[] | number, skipped = false) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        questionId,
        answer,
        skipped,
      }
    }));
  };

  const getAnswer = (questionId: string): OnboardingAnswer | undefined => {
    return answers[questionId];
  };

  const skipQuestion = (questionId: string) => {
    const currentQuestion = ONBOARDING_QUESTIONS.find(q => q.id === questionId);
    if (currentQuestion && !currentQuestion.required) {
      saveAnswer(questionId, '', true);
    }
  };

  const isCurrentQuestionValid = (): boolean => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return false;
    
    const answer = getAnswer(currentQuestion.id);
    
    // If question is not required and no answer, it's valid (can be skipped)
    if (!currentQuestion.required && !answer) {
      return true;
    }
    
    // If question is required, must have non-empty answer and not skipped
    if (currentQuestion.required) {
      if (!answer || answer.skipped) return false;
      
      // Validate based on question type
      switch (currentQuestion.type as QuestionType) {
        case 'time_picker':
          return typeof answer.answer === 'string' && answer.answer.length > 0;
        case 'single_choice':
          return typeof answer.answer === 'string' && answer.answer.length > 0;
        case 'multiple_choice':
          return Array.isArray(answer.answer) && answer.answer.length > 0;
        case 'scale':
          return typeof answer.answer === 'number' && answer.answer > 0;
        default:
          return typeof answer.answer === 'string' && answer.answer.trim().length > 0;
      }
    }
    
    return true;
  };

  const getCompletionPercentage = (): number => {
    const totalQuestions = ONBOARDING_QUESTIONS.length;
    const answeredQuestions = Object.keys(answers).length;
    return Math.round((answeredQuestions / totalQuestions) * 100);
  };

  const resetOnboarding = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setIsComplete(false);
  };

  const completeOnboarding = () => {
    setIsComplete(true);
  };

  const getOnboardingResponses = (): Partial<FirestoreOnboardingResponses> => {
    const responses: Partial<FirestoreOnboardingResponses> = {
      motivations: [],
      challenges: [],
      experience: 'beginner',
      goals: []
    };
    
    // Map answers to the expected FirestoreOnboardingResponses format
    Object.values(answers).forEach(answer => {
      if (answer.skipped) return;
      
      switch (answer.questionId) {
        case 'productivity_challenge':
          responses.productivityChallenge = answer.answer as string;
          break;
        case 'wake_time':
          responses.currentWakeTime = answer.answer as string;
          break;
        case 'work_type':
          responses.workType = answer.answer as 'Employee' | 'Employer' | 'Student' | 'Freelancer';
          break;
        case 'work_style':
          responses.workStyle = answer.answer as 'Office' | 'Remote' | 'Hybrid' | 'Not applicable';
          break;
        case 'bed_time_habits':
          responses.bedTimeHabits = answer.answer as string;
          break;
        case 'energy_slumps':
          responses.energySlumps = answer.answer as string;
          break;
        case 'productivity_rating':
          responses.productivityRating = answer.answer as number;
          break;
        case 'primary_goal':
          responses.primaryGoal = answer.answer as string;
          break;
        case 'coffee_habits':
          responses.coffeeHabits = answer.answer as string;
          break;
        case 'social_media_habits':
          responses.socialMediaHabits = answer.answer as string;
          break;
        case 'weekend_productivity':
          responses.weekendProductivity = answer.answer as string;
          break;
      }
    });
    
    return responses;
  };

  const value: OnboardingContextType = {
    currentQuestionIndex,
    answers,
    isComplete,
    goToNextQuestion,
    goToPreviousQuestion,
    goToQuestion,
    canGoNext,
    canGoPrevious,
    saveAnswer,
    getAnswer,
    skipQuestion,
    isCurrentQuestionValid,
    getCompletionPercentage,
    resetOnboarding,
    completeOnboarding,
    getOnboardingResponses,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

// Custom hook to use the onboarding context
export const useOnboarding = (): OnboardingContextType => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

export default OnboardingContext;