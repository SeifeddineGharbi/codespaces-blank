// Settings screen placeholder

import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/src/constants';

const SettingsScreen: React.FC = () => {
  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.background.light }}>
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-2xl font-bold mb-4" style={{ color: COLORS.text.primary }}>
          Settings Screen
        </Text>
        <Text className="text-center" style={{ color: COLORS.text.secondary }}>
          This screen will be implemented by the Settings Agent
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default SettingsScreen;