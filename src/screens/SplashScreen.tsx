// Splash screen for app initialization

import React, { useEffect } from 'react';
import { View, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/src/types';
import { COLORS } from '@/src/constants';

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

const SplashScreen: React.FC = () => {
  const navigation = useNavigation<SplashScreenNavigationProp>();

  useEffect(() => {
    // TEMPORARY: Skip directly to Main app for testing
    // TODO: Add auth state check here and restore full flow
    const timer = setTimeout(() => {
      navigation.replace('Main');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

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