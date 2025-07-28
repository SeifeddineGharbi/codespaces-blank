// Welcome screen for authentication flow

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../types';
import { COLORS, APP_CONFIG } from '../../constants';

type WelcomeScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Welcome'>;

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.background.light }}>
      <View className="flex-1 px-6">
        {/* Header */}
        <View className="flex-1 justify-center items-center">
          <Text className="text-4xl font-bold text-center mb-4" style={{ color: COLORS.text.primary }}>
            {APP_CONFIG.name}
          </Text>
          <Text className="text-lg text-center mb-8" style={{ color: COLORS.text.secondary }}>
            {APP_CONFIG.description}
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="pb-8">
          <TouchableOpacity
            className="py-4 px-6 rounded-xl mb-4"
            style={{ backgroundColor: COLORS.primary[500] }}
            onPress={() => navigation.navigate('Login')}
          >
            <Text className="text-white text-lg font-semibold text-center">
              Sign In
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="py-4 px-6 rounded-xl border"
            style={{ 
              borderColor: COLORS.primary[500],
              backgroundColor: 'transparent'
            }}
            onPress={() => navigation.navigate('Login')}
          >
            <Text className="text-lg font-semibold text-center" style={{ color: COLORS.primary[500] }}>
              Create Account
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default WelcomeScreen;