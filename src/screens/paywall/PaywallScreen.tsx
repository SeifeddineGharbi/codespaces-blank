// Paywall screen placeholder

import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { COLORS } from '../../constants';
import { Button, ButtonText } from '../../../components/ui/button';
import { useAuth } from '../../contexts/AuthContext';

const PaywallScreen: React.FC = () => {
  const { signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  // DEV ONLY: Handle sign out for testing purposes
  // TODO: DELETE THIS ENTIRE FUNCTION WHEN BUILDING THE ACTUAL PAYWALL
  const handleDevSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      // User will be automatically redirected to login screen via AuthContext
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: COLORS.background.light }}>
      <Text className="text-2xl font-bold mb-4" style={{ color: COLORS.text.primary }}>
        Paywall Screen
      </Text>
      <Text className="text-center mb-8" style={{ color: COLORS.text.secondary }}>
        This screen will be implemented by the Subscription Agent
      </Text>
      
      {/* DEV ONLY: Sign Out Button for Testing */}
      {/* TODO: DELETE THIS ENTIRE SECTION WHEN BUILDING THE ACTUAL PAYWALL */}
      <View className="mt-8 pt-8 border-t border-gray-300 w-full">
        <Text className="text-sm text-center mb-4" style={{ color: COLORS.text.secondary }}>
          DEV ONLY - Testing Controls
        </Text>
        <Button 
          action="negative" 
          variant="outline" 
          size="sm"
          onPress={handleDevSignOut}
          disabled={isSigningOut}
          className="w-full"
        >
          <ButtonText>
            {isSigningOut ? 'Signing Out...' : 'Sign Out (Dev Testing)'}
          </ButtonText>
        </Button>
        <Text className="text-xs text-center mt-2" style={{ color: COLORS.text.secondary }}>
          This button will be removed in production
        </Text>
      </View>
    </View>
  );
};

export default PaywallScreen;