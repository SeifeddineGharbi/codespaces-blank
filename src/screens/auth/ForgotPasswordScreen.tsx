import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
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
import { useAuth } from '../../contexts/AuthContext';
import { AuthStackParamList } from '../../types';
import { COLORS } from '../../constants';
import { handleAuthError } from '../../utils/errorHandling';
import { ErrorAlerts } from '../../components/common/ErrorAlert';

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
      
      // Show success message using styled alert
      ErrorAlerts.passwordResetSent(data.email, () => {
        navigation.navigate('Login');
      });
    } catch (error: any) {
      console.error('Password reset error:', error);
      // Use centralized error handling to ensure user-friendly messages
      handleAuthError(error, 'forgot-password', setError, navigation);
    }
  };

  const handleResendEmail = async () => {
    const email = getValues('email');
    if (!email) {
      ErrorAlerts.validation('Please enter your email address first.');
      return;
    }
    
    try {
      await resetPassword(email);
      ErrorAlerts.generic(
        'Password reset email has been sent again. Please check your email.',
        'Email Sent'
      );
    } catch (error: any) {
      // Use centralized error handling
      handleAuthError(error, 'forgot-password', setError, navigation);
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