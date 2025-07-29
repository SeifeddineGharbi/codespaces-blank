import React from 'react';
import { TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Import Gluestack UI components
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Button, ButtonText } from '@/components/ui/button';
import { Center } from '@/components/ui/center';

// Import context and types
import { AuthStackParamList } from '../../types';
import { COLORS, APP_CONFIG } from '../../constants';

type WelcomeScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Welcome'>;

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();

  const handleSignIn = () => {
    navigation.navigate('Login');
  };

  const handleCreateAccount = () => {
    navigation.navigate('Register');
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.background.light }}>
      <VStack className="flex-1 px-6">
        {/* Hero Section */}
        <VStack className="flex-1 justify-center items-center" space="lg">
          {/* App Logo */}
          <Center className="mb-8">
            <Image
              source={require('../../../assets/logo.png')}
              className="w-24 h-24 mb-4"
              resizeMode="contain"
            />
            <Heading size="3xl" className="text-center mb-2" style={{ color: COLORS.text.primary }}>
              {APP_CONFIG.name}
            </Heading>
            <Text size="lg" className="text-center max-w-xs" style={{ color: COLORS.text.secondary }}>
              Transform your mornings with science-backed routines
            </Text>
          </Center>

          {/* Features Highlight */}
          <VStack className="w-full max-w-sm" space="md">
            <VStack className="flex-row items-center" space="sm">
              <Text size="2xl">💧</Text>
              <Text size="md" style={{ color: COLORS.text.secondary }}>
                Hydration tracking for better energy
              </Text>
            </VStack>
            <VStack className="flex-row items-center" space="sm">
              <Text size="2xl">☀️</Text>
              <Text size="md" style={{ color: COLORS.text.secondary }}>
                Natural sunlight exposure benefits
              </Text>
            </VStack>
            <VStack className="flex-row items-center" space="sm">
              <Text size="2xl">🐘</Text>
              <Text size="md" style={{ color: COLORS.text.secondary }}>
                Identify your most important daily task
              </Text>
            </VStack>
            <VStack className="flex-row items-center" space="sm">
              <Text size="2xl">📊</Text>
              <Text size="md" style={{ color: COLORS.text.secondary }}>
                Track progress and build streaks
              </Text>
            </VStack>
          </VStack>
        </VStack>

        {/* Action Buttons */}
        <VStack className="pb-8" space="md">
          <Button
            size="lg"
            variant="solid"
            action="primary"
            onPress={handleCreateAccount}
            style={{ backgroundColor: COLORS.primary[500] }}
          >
            <ButtonText className="text-lg font-semibold">
              Get Started
            </ButtonText>
          </Button>

          <Button
            size="lg"
            variant="outline"
            action="secondary"
            onPress={handleSignIn}
            style={{ 
              borderColor: COLORS.primary[500],
              backgroundColor: 'transparent'
            }}
          >
            <ButtonText 
              className="text-lg font-semibold" 
              style={{ color: COLORS.primary[500] }}
            >
              I Already Have an Account
            </ButtonText>
          </Button>

          {/* Trust Indicators */}
          <VStack className="items-center mt-4" space="xs">
            <Text size="xs" style={{ color: COLORS.text.muted }}>
              Join thousands of users building better morning routines
            </Text>
            <VStack className="flex-row items-center" space="xs">
              <Text size="xs" style={{ color: COLORS.text.muted }}>
                ⭐⭐⭐⭐⭐
              </Text>
              <Text size="xs" style={{ color: COLORS.text.muted }}>
                4.8/5 rating
              </Text>
            </VStack>
          </VStack>
        </VStack>
      </VStack>
    </SafeAreaView>
  );
};

export default WelcomeScreen;