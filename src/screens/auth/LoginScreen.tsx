import React from 'react';
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
import { useAuth } from '../../contexts/AuthContext';
import { AuthStackParamList } from '../../types';
import { COLORS } from '../../constants';

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

// Validation schema
const loginSchema = yup.object().shape({
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address')
    .lowercase(),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters long'),
});

interface LoginFormData {
  email: string;
  password: string;
}

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { signIn, loading } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await signIn(data.email, data.password);
      // Navigation is handled by AppNavigator based on auth state
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'Something went wrong. Please try again.';
      let fieldError: 'email' | 'password' | null = null;
      
      if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password. Please check your credentials.';
        fieldError = 'email';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
        fieldError = 'email';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
        fieldError = 'password';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled.';
        fieldError = 'email';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
        fieldError = 'email';
      }
      
      if (fieldError) {
        setError(fieldError, { message: errorMessage });
      } else {
        Alert.alert('Login Failed', errorMessage);
      }
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleCreateAccount = () => {
    navigation.navigate('Register');
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
              Welcome Back
            </Heading>
            <Text size="md" className="text-center" style={{ color: COLORS.text.secondary }}>
              Sign in to your account to continue
            </Text>
          </VStack>

          {/* Login Form */}
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

            {/* Password Field */}
            <VStack space="xs">
              <Text size="sm" className="font-medium" style={{ color: COLORS.text.primary }}>
                Password
              </Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    variant={errors.password ? 'outline' : 'outline'}
                    size="md"
                    className={errors.password ? 'border-red-500' : ''}
                  >
                    <InputField
                      placeholder="Enter your password"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry
                      autoComplete="current-password"
                    />
                  </Input>
                )}
              />
              {errors.password && (
                <Text size="xs" className="text-red-500">
                  {errors.password.message}
                </Text>
              )}
            </VStack>

            {/* Forgot Password Link */}
            <TouchableOpacity onPress={handleForgotPassword} className="self-end">
              <Text size="sm" style={{ color: COLORS.primary[500] }}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <Button
              size="lg"
              variant="solid"
              action="primary"
              onPress={handleSubmit(onSubmit)}
              isDisabled={loading || isSubmitting}
              className="mt-2"
              style={{ backgroundColor: COLORS.primary[500] }}
            >
              {loading || isSubmitting ? (
                <ButtonSpinner size="small" />
              ) : null}
              <ButtonText className="font-semibold">
                {loading || isSubmitting ? 'Signing In...' : 'Sign In'}
              </ButtonText>
            </Button>

            {/* Create Account Link */}
            <VStack className="items-center mt-6" space="xs">
              <Text size="sm" style={{ color: COLORS.text.secondary }}>
                Don't have an account?
              </Text>
              <TouchableOpacity onPress={handleCreateAccount}>
                <Text size="sm" className="font-semibold" style={{ color: COLORS.primary[500] }}>
                  Create Account
                </Text>
              </TouchableOpacity>
            </VStack>
          </VStack>
        </VStack>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;