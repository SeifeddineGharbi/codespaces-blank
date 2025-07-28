/**
 * Question Card Component for Onboarding
 * Renders different question types with proper validation
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, ONBOARDING_QUESTIONS } from '../../constants';

interface QuestionCardProps {
  questionId: string;
  onAnswer: (answer: string | string[] | number, skipped?: boolean) => void;
  currentAnswer?: string | string[] | number;
  skipped?: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  questionId,
  onAnswer,
  currentAnswer,
  skipped
}) => {
  const question = ONBOARDING_QUESTIONS.find(q => q.id === questionId);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(() => {
    if (question?.type === 'time_picker' && currentAnswer) {
      const [hours, minutes] = (currentAnswer as string).split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date;
    }
    const defaultTime = new Date();
    if (question?.type === 'time_picker' && 'defaultValue' in question && question.defaultValue) {
      const [hours, minutes] = question.defaultValue.split(':');
      defaultTime.setHours(parseInt(hours), parseInt(minutes));
    }
    return defaultTime;
  });

  if (!question) return null;

  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleSingleChoice = (option: string) => {
    onAnswer(option);
  };

  const handleMultipleChoice = (option: string) => {
    const currentAnswers = Array.isArray(currentAnswer) ? currentAnswer : [];
    const newAnswers = currentAnswers.includes(option)
      ? currentAnswers.filter(a => a !== option)
      : [...currentAnswers, option];
    onAnswer(newAnswers);
  };

  const handleTimeChange = (event: any, date?: Date) => {
    setShowTimePicker(false);
    if (date) {
      setSelectedTime(date);
      onAnswer(formatTime(date));
    }
  };

  const handleScale = (value: number) => {
    onAnswer(value);
  };

  const handleSkip = () => {
    onAnswer('', true);
  };

  const renderTimePickerButton = () => {
    const displayTime = currentAnswer ? currentAnswer as string : formatTime(selectedTime);
    const [hours, minutes] = displayTime.split(':');
    const displayHours = parseInt(hours);
    const ampm = displayHours >= 12 ? 'PM' : 'AM';
    const display12Hour = displayHours > 12 ? displayHours - 12 : displayHours === 0 ? 12 : displayHours;
    
    return (
      <TouchableOpacity
        onPress={() => setShowTimePicker(true)}
        className="border-2 rounded-xl px-6 py-4 mb-4"
        style={{
          borderColor: currentAnswer ? COLORS.primary[500] : COLORS.background.gray,
          backgroundColor: currentAnswer ? COLORS.primary[50] : COLORS.background.white,
        }}
      >
        <Text
          className="text-lg font-semibold text-center"
          style={{ color: COLORS.text.primary }}
        >
          {display12Hour}:{minutes} {ampm}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderSingleChoice = () => (
    <View className="space-y-3">
      {('options' in question && question.options ? question.options : []).map((option: string, index: number) => {
        const isSelected = currentAnswer === option;
        return (
          <TouchableOpacity
            key={index}
            onPress={() => handleSingleChoice(option)}
            className="border-2 rounded-xl px-4 py-4"
            style={{
              borderColor: isSelected ? COLORS.primary[500] : COLORS.background.gray,
              backgroundColor: isSelected ? COLORS.primary[50] : COLORS.background.white,
            }}
          >
            <Text
              className="font-medium"
              style={{ color: COLORS.text.primary }}
            >
              {option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderMultipleChoice = () => (
    <View className="space-y-3">
      {('options' in question && question.options ? question.options : []).map((option: string, index: number) => {
        const currentAnswers = Array.isArray(currentAnswer) ? currentAnswer : [];
        const isSelected = currentAnswers.includes(option);
        return (
          <TouchableOpacity
            key={index}
            onPress={() => handleMultipleChoice(option)}
            className="border-2 rounded-xl px-4 py-4"
            style={{
              borderColor: isSelected ? COLORS.primary[500] : COLORS.background.gray,
              backgroundColor: isSelected ? COLORS.primary[50] : COLORS.background.white,
            }}
          >
            <Text
              className="font-medium"
              style={{ color: COLORS.text.primary }}
            >
              {option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderScale = () => {
    const currentValue = typeof currentAnswer === 'number' ? currentAnswer : 0;
    const minValue = question.type === 'scale' && 'min' in question ? question.min || 1 : 1;
    const maxValue = question.type === 'scale' && 'max' in question ? question.max || 10 : 10;
    
    return (
      <View className="space-y-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-sm" style={{ color: COLORS.text.secondary }}>
            {minValue}
          </Text>
          <Text className="text-sm" style={{ color: COLORS.text.secondary }}>
            {maxValue}
          </Text>
        </View>
        
        <View className="flex-row justify-between space-x-2">
          {Array.from({ length: maxValue - minValue + 1 }, (_, index) => {
            const value = minValue + index;
            const isSelected = currentValue === value;
            
            return (
              <TouchableOpacity
                key={value}
                onPress={() => handleScale(value)}
                className="flex-1 border-2 rounded-lg py-3"
                style={{
                  borderColor: isSelected ? COLORS.primary[500] : COLORS.background.gray,
                  backgroundColor: isSelected ? COLORS.primary[500] : COLORS.background.white,
                }}
              >
                <Text
                  className="text-center font-semibold"
                  style={{ color: isSelected ? COLORS.background.white : COLORS.text.primary }}
                >
                  {value}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Question text */}
        <Text
          className="text-2xl font-bold mb-8 leading-8"
          style={{ color: COLORS.text.primary }}
        >
          {question.question}
        </Text>

        {/* Question input based on type */}
        {question.type === 'time_picker' && renderTimePickerButton()}
        {question.type === 'single_choice' && renderSingleChoice()}
        {question.type === 'multiple_choice' && renderMultipleChoice()}
        {question.type === 'scale' && renderScale()}

        {/* Skip button for optional questions */}
        {!question.required && (
          <TouchableOpacity
            onPress={handleSkip}
            className="mt-6 py-3"
          >
            <Text
              className="text-center font-medium"
              style={{ color: COLORS.text.secondary }}
            >
              Skip this question
            </Text>
          </TouchableOpacity>
        )}

        {/* Time picker modal */}
        {showTimePicker && question.type === 'time_picker' && (
          <DateTimePicker
            value={selectedTime}
            mode="time"
            is24Hour={false}
            display="spinner"
            onChange={handleTimeChange}
          />
        )}
      </ScrollView>
    </View>
  );
};

export default QuestionCard;