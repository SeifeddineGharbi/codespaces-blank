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

type RegisterScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;

// Password strength validation
const passwordSchema = yup
  .string()
  .required('Password is required')
  .min(8, 'Password must be at least 8 characters long')
  .matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  );

// Validation schema
const registerSchema = yup.object().shape({
  displayName: yup
    .string()
    .required('Full name is required')
    .min(2, 'Name must be at least 2 characters long')
    .max(50, 'Name must be less than 50 characters')
    .matches(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address')
    .lowercase(),
  password: passwordSchema,
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
  acceptTerms: yup
    .boolean()
    .required('You must accept the terms and conditions')
    .oneOf([true], 'You must accept the terms and conditions'),
});

interface RegisterFormData {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const { signUp, loading } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch,
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });

  // Watch password for strength indicator
  const password = watch('password');

  const getPasswordStrength = (password: string): { score: number; text: string; color: string } => {
    if (!password) return { score: 0, text: '', color: '' };
    
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^a-zA-Z\d]/.test(password)) score += 1;

    if (score < 2) return { score, text: 'Weak', color: '#FF3B30' };
    if (score < 4) return { score, text: 'Fair', color: '#FF9500' };
    if (score < 5) return { score, text: 'Good', color: '#34C759' };
    return { score, text: 'Strong', color: '#34C759' };
  };

  const passwordStrength = getPasswordStrength(password);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await signUp(data.email, data.password, data.displayName);
      Alert.alert(
        'Account Created!', 
        'Your account has been created successfully. You can now sign in.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Something went wrong. Please try again.';
      let fieldError: 'email' | 'password' | 'displayName' | null = null;
      
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert(
          'Account Already Exists', 
          'An account with this email address already exists. Would you like to sign in instead?',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Sign In',
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
        return; // Don't set field error, the alert handles it
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
        fieldError = 'password';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
        fieldError = 'email';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/password accounts are not enabled. Please contact support.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
      }
      
      if (fieldError) {
        setError(fieldError, { message: errorMessage });
      } else {
        Alert.alert('Registration Failed', errorMessage);
      }
    }
  };

  const handleSignIn = () => {
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
              Create Account
            </Heading>
            <Text size="md" className="text-center" style={{ color: COLORS.text.secondary }}>
              Join thousands of users building better morning routines
            </Text>
          </VStack>

          {/* Registration Form */}
          <VStack className="w-full max-w-sm mx-auto" space="md">
            {/* Full Name Field */}
            <VStack space="xs">
              <Text size="sm" className="font-medium" style={{ color: COLORS.text.primary }}>
                Full Name
              </Text>
              <Controller
                control={control}
                name="displayName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    variant={errors.displayName ? 'outline' : 'outline'}
                    size="md"
                    className={errors.displayName ? 'border-red-500' : ''}
                  >
                    <InputField
                      placeholder="Enter your full name"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      autoCapitalize="words"
                      autoComplete="name"
                    />
                  </Input>
                )}
              />
              {errors.displayName && (
                <Text size="xs" className="text-red-500">
                  {errors.displayName.message}
                </Text>
              )}
            </VStack>

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
                      placeholder="Create a strong password"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry
                      autoComplete="new-password"
                    />
                  </Input>
                )}
              />
              {/* Password Strength Indicator */}
              {password && (
                <VStack space="xs">
                  <Text size="xs" style={{ color: passwordStrength.color }}>
                    Password strength: {passwordStrength.text}
                  </Text>
                  <VStack className="h-1 bg-gray-200 rounded-full overflow-hidden">
                    <VStack 
                      className="h-full rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(passwordStrength.score / 5) * 100}%`,
                        backgroundColor: passwordStrength.color 
                      }}
                    />
                  </VStack>
                </VStack>
              )}
              {errors.password && (
                <Text size="xs" className="text-red-500">
                  {errors.password.message}
                </Text>
              )}
            </VStack>

            {/* Confirm Password Field */}
            <VStack space="xs">
              <Text size="sm" className="font-medium" style={{ color: COLORS.text.primary }}>
                Confirm Password
              </Text>
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    variant={errors.confirmPassword ? 'outline' : 'outline'}
                    size="md"
                    className={errors.confirmPassword ? 'border-red-500' : ''}
                  >
                    <InputField
                      placeholder="Confirm your password"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry
                      autoComplete="new-password"
                    />
                  </Input>
                )}
              />
              {errors.confirmPassword && (
                <Text size="xs" className="text-red-500">
                  {errors.confirmPassword.message}
                </Text>
              )}
            </VStack>

            {/* Terms and Conditions */}
            <VStack space="xs">
              <Controller
                control={control}
                name="acceptTerms"
                render={({ field: { onChange, value } }) => (
                  <TouchableOpacity 
                    onPress={() => onChange(!value)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      paddingVertical: 8,
                    }}
                  >
                    <VStack 
                      style={{
                        width: 24,
                        height: 24,
                        borderWidth: 2,
                        borderColor: '#000000',
                        backgroundColor: '#FFFFFF',
                        borderRadius: 6,
                        marginRight: 12,
                        alignItems: 'center',
                        justifyContent: 'center',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.1,
                        shadowRadius: 2,
                        elevation: 2,
                      }}
                    >
                      {value && (
                        <Text style={{ 
                          color: '#000000', 
                          fontSize: 16, 
                          fontWeight: 'bold' 
                        }}>
                          ✓
                        </Text>
                      )}
                    </VStack>
                    <Text size="sm" className="flex-1" style={{ color: COLORS.text.secondary }}>
                      I agree to the{' '}
                      <Text size="sm" style={{ color: COLORS.primary[500] }}>
                        Terms of Service
                      </Text>
                      {' '}and{' '}
                      <Text size="sm" style={{ color: COLORS.primary[500] }}>
                        Privacy Policy
                      </Text>
                    </Text>
                  </TouchableOpacity>
                )}
              />
              {errors.acceptTerms && (
                <Text size="xs" className="text-red-500">
                  {errors.acceptTerms.message}
                </Text>
              )}
            </VStack>

            {/* Create Account Button */}
            <Button
              size="lg"
              variant="solid"
              action="primary"
              onPress={handleSubmit(onSubmit)}
              isDisabled={loading || isSubmitting}
              className="mt-4"
              style={{ backgroundColor: COLORS.primary[500] }}
            >
              {loading || isSubmitting ? (
                <ButtonSpinner size="small" />
              ) : null}
              <ButtonText className="font-semibold">
                {loading || isSubmitting ? 'Creating Account...' : 'Create Account'}
              </ButtonText>
            </Button>

            {/* Sign In Link */}
            <VStack className="items-center mt-6" space="xs">
              <Text size="sm" style={{ color: COLORS.text.secondary }}>
                Already have an account?
              </Text>
              <TouchableOpacity onPress={handleSignIn}>
                <Text size="sm" className="font-semibold" style={{ color: COLORS.primary[500] }}>
                  Sign In
                </Text>
              </TouchableOpacity>
            </VStack>
          </VStack>
        </VStack>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;