/**
 * Progress Indicator Component for Onboarding Flow
 * Shows current question progress with visual indicators
 */

import React from 'react';
import { View, Text } from 'react-native';
import { COLORS } from '../../constants';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  title?: string;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  title
}) => {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <View className="w-full mb-6">
      {/* Step counter */}
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-base font-semibold" style={{ color: COLORS.text.primary }}>
          {title || 'Question'} {currentStep} of {totalSteps}
        </Text>
        <View className="px-3 py-1 rounded-full" style={{ backgroundColor: COLORS.primary[50] }}>
          <Text className="text-sm font-bold" style={{ color: COLORS.primary[600] }}>
            {Math.round(progressPercentage)}%
          </Text>
        </View>
      </View>

      {/* Progress bar container */}
      <View 
        className="w-full h-3 rounded-full shadow-sm"
        style={{ backgroundColor: COLORS.background.gray }}
      >
        {/* Progress bar fill */}
        <View
          className="h-full rounded-full transition-all duration-300"
          style={{
            backgroundColor: COLORS.primary[500],
            width: `${progressPercentage}%`,
            shadowColor: COLORS.primary[500],
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.3,
            shadowRadius: 2,
          }}
        />
      </View>

      {/* Optional step dots for smaller numbers of steps */}
      {totalSteps <= 10 && (
        <View className="flex-row justify-between mt-3">
          {Array.from({ length: totalSteps }, (_, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;
            
            return (
              <View
                key={stepNumber}
                className={`w-2 h-2 rounded-full ${
                  isCompleted || isCurrent ? 'opacity-100' : 'opacity-30'
                }`}
                style={{
                  backgroundColor: isCompleted 
                    ? COLORS.status.success
                    : isCurrent 
                      ? COLORS.primary[500]
                      : COLORS.text.muted
                }}
              />
            );
          })}
        </View>
      )}
    </View>
  );
};

export default ProgressIndicator;