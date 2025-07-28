// Onboarding welcome screen placeholder

import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { COLORS } from '@/src/constants';
import { useAuth } from '@/src/contexts/AuthContext';

const OnboardingWelcomeScreen: React.FC = () => {
  const { signOut } = useAuth();

  const handleDevLogout = () => {
    Alert.alert(
      'Development Logout',
      'This will log you out so you can test the authentication flows again.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: COLORS.background.light }}>
      <Text className="text-2xl font-bold mb-4" style={{ color: COLORS.text.primary }}>
        Onboarding Welcome Screen
      </Text>
      <Text className="text-center mb-8" style={{ color: COLORS.text.secondary }}>
        This screen will be implemented by the Onboarding Agent
      </Text>
      
      {/* Development Helper - Remove in production */}
      <TouchableOpacity
        onPress={handleDevLogout}
        className="bg-red-100 px-4 py-2 rounded-lg border border-red-300"
      >
        <Text className="text-red-600 font-semibold">
          🔧 DEV: Logout to Test Auth
        </Text>
      </TouchableOpacity>
      <Text className="text-xs mt-2 text-center" style={{ color: COLORS.text.muted }}>
        Development helper - tap to logout and test registration/login flows
      </Text>
    </View>
  );
};

export default OnboardingWelcomeScreen;