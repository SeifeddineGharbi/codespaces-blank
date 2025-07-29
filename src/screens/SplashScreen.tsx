// Splash screen for app initialization

import React, { useEffect } from 'react';
import { View, Image } from 'react-native';
import { COLORS } from '../constants/index';

const SplashScreen: React.FC = () => {
  useEffect(() => {
    // Show splash screen for 2 seconds, then let AppNavigator handle navigation
    // The AppNavigator will automatically route to the correct screen based on auth state
    const timer = setTimeout(() => {
      // Don't navigate manually - let the AppNavigator's auth state logic handle routing
      // This prevents navigation errors when auth state changes during splash
      console.log('🚀 Splash screen timer completed - navigation will be handled by AppNavigator');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 items-center justify-center" style={{ backgroundColor: COLORS.background.light }}>
      <Image
        source={require('../../assets/logo.png')}
        className="w-32 h-32"
        resizeMode="contain"
      />
    </View>
  );
};

export default SplashScreen;