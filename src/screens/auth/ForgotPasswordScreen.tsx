import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Import Gluestack UI components
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Input, InputField } from '@/components/ui/input';
import { Button, ButtonText, ButtonSpinner } from '@/components/ui/button';

// Import context and types
import { useAuth } from '@/src/contexts/AuthContext';
import { AuthStackParamList } from '@/src/types';
import { COLORS } from '@/src/constants';

type ForgotPasswordScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

// Validation schema
const forgotPasswordSchema = yup.object().shape({
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address')
    .lowercase(),
});

interface ForgotPasswordFormData {
  email: string;
}

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const { resetPassword } = useAuth();
  const [emailSent, setEmailSent] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await resetPassword(data.email);
      setEmailSent(true);
      Alert.alert(
        'Password Reset Email Sent', 
        `We've sent a password reset link to ${data.email}. Please check your email and follow the instructions to reset your password.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      let errorMessage = 'Something went wrong. Please try again.';
      let fieldError: 'email' | null = null;
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
        fieldError = 'email';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
        fieldError = 'email';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled.';
        fieldError = 'email';
      }
      
      if (fieldError) {
        setError(fieldError, { message: errorMessage });
      } else {
        Alert.alert('Password Reset Failed', errorMessage);
      }
    }
  };

  const handleResendEmail = async () => {
    const email = getValues('email');
    if (!email) {
      Alert.alert('Error', 'Please enter your email address first.');
      return;
    }
    
    try {
      await resetPassword(email);
      Alert.alert(
        'Email Sent', 
        'Password reset email has been sent again. Please check your email.'
      );
    } catch (error: any) {
      Alert.alert('Error', 'Failed to send email. Please try again.');
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.background.light }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <VStack className="flex-1 px-6 justify-center">
          {/* Header */}
          <VStack className="items-center mb-8">
            <Heading size="2xl" className="text-center mb-2" style={{ color: COLORS.text.primary }}>
              Reset Password
            </Heading>
            <Text size="md" className="text-center" style={{ color: COLORS.text.secondary }}>
              Enter your email address and we'll send you a link to reset your password
            </Text>
          </VStack>

          {/* Reset Password Form */}
          <VStack className="w-full max-w-sm mx-auto" space="md">
            {/* Email Field */}
            <VStack space="xs">
              <Text size="sm" className="font-medium" style={{ color: COLORS.text.primary }}>
                Email Address
              </Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    variant={errors.email ? 'outline' : 'outline'}
                    size="md"
                    className={errors.email ? 'border-red-500' : ''}
                  >
                    <InputField
                      placeholder="Enter your email"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="email"
                    />
                  </Input>
                )}
              />
              {errors.email && (
                <Text size="xs" className="text-red-500">
                  {errors.email.message}
                </Text>
              )}
            </VStack>

            {/* Reset Password Button */}
            <Button
              size="lg"
              variant="solid"
              action="primary"
              onPress={handleSubmit(onSubmit)}
              isDisabled={isSubmitting}
              className="mt-2"
              style={{ backgroundColor: COLORS.primary[500] }}
            >
              {isSubmitting ? (
                <ButtonSpinner size="small" />
              ) : null}
              <ButtonText className="font-semibold">
                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
              </ButtonText>
            </Button>

            {/* Resend Email Button (only show after first attempt) */}
            {emailSent && (
              <VStack className="items-center mt-4" space="xs">
                <Text size="sm" style={{ color: COLORS.text.secondary }}>
                  Didn't receive the email?
                </Text>
                <TouchableOpacity onPress={handleResendEmail}>
                  <Text size="sm" className="font-semibold" style={{ color: COLORS.primary[500] }}>
                    Resend Email
                  </Text>
                </TouchableOpacity>
              </VStack>
            )}

            {/* Back to Login Link */}
            <VStack className="items-center mt-6" space="xs">
              <TouchableOpacity onPress={handleBackToLogin}>
                <Text size="sm" className="font-semibold" style={{ color: COLORS.primary[500] }}>
                  Back to Sign In
                </Text>
              </TouchableOpacity>
            </VStack>

            {/* Instructions */}
            <VStack className="mt-8 p-4 bg-blue-50 rounded-lg" space="xs">
              <Text size="sm" className="font-medium" style={{ color: COLORS.text.primary }}>
                What happens next?
              </Text>
              <Text size="xs" style={{ color: COLORS.text.secondary }}>
                • Check your email inbox (and spam folder)
              </Text>
              <Text size="xs" style={{ color: COLORS.text.secondary }}>
                • Click the reset link in the email
              </Text>
              <Text size="xs" style={{ color: COLORS.text.secondary }}>
                • Create a new password
              </Text>
              <Text size="xs" style={{ color: COLORS.text.secondary }}>
                • Sign in with your new password
              </Text>
            </VStack>
          </VStack>
        </VStack>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;