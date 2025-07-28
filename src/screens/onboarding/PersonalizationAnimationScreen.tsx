// Personalization animation screen placeholder

import React from 'react';
import { View, Text } from 'react-native';
import { COLORS } from '@/src/constants';

const PersonalizationAnimationScreen: React.FC = () => {
  return (
    <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: COLORS.background.light }}>
      <Text className="text-2xl font-bold mb-4" style={{ color: COLORS.text.primary }}>
        Personalization Animation Screen
      </Text>
      <Text className="text-center" style={{ color: COLORS.text.secondary }}>
        This screen will be implemented by the Onboarding Agent
      </Text>
    </View>
  );
};

export default PersonalizationAnimationScreen;