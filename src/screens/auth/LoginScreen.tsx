import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, signUp, loading } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    try {
      await signIn(email, password);
    } catch (error: any) {
      let errorMessage = 'Something went wrong';
      
      if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }
      
      Alert.alert('Login Failed', errorMessage);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    try {
      await signUp(email, password);
      Alert.alert('Success', 'Account created successfully! You can now sign in.');
    } catch (error: any) {
      let errorMessage = 'Something went wrong';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists. Please sign in instead.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      }
      
      Alert.alert('Signup Failed', errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white px-6 justify-center"
    >
      <View className="w-full max-w-sm mx-auto">
        <Text className="text-3xl font-bold text-center mb-8 text-gray-900">
          Welcome
        </Text>
        
        <Text className="text-center text-gray-600 text-base mb-6">
          Sign in to your account or create a new one
        </Text>
        
        <View className="mb-4">
          <Text className="text-gray-700 mb-2">Email</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 text-base"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View className="mb-6">
          <Text className="text-gray-700 mb-2">Password</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 text-base"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          className="bg-blue-500 rounded-lg py-3 mb-3"
          onPress={handleLogin}
          disabled={loading}
        >
          <Text className="text-white text-center font-semibold text-base">
            {loading ? 'Signing In...' : 'Sign In'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-green-500 rounded-lg py-3"
          onPress={handleSignUp}
          disabled={loading}
        >
          <Text className="text-white text-center font-semibold text-base">
            {loading ? 'Creating Account...' : 'Create Account'}
          </Text>
        </TouchableOpacity>

        <View className="mt-6">
          <Text className="text-center text-gray-600 text-sm">
            • "Sign In" - Login with existing account{'\n'}
            • "Create Account" - Register a new account{'\n'}
            • Use any valid email format and 6+ character password
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;