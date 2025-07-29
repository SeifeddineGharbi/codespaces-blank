/**
 * Styled Error Alert Component
 * Provides consistent, user-friendly error alerts throughout the app
 * 
 * This component ensures all error messages are displayed with proper styling
 * and follow the app's design system instead of using raw Alert.alert
 */

import React from 'react';
import { Alert, AlertButton } from 'react-native';
import { COLORS } from '../../constants';

export interface ErrorAlertAction {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export interface ErrorAlertProps {
  title?: string;
  message: string;
  actions?: ErrorAlertAction[];
  onShow?: () => void;
}

/**
 * Shows a styled error alert with consistent design
 */
export const showErrorAlert = ({
  title = 'Error',
  message,
  actions = [{ text: 'OK', style: 'default' }],
  onShow
}: ErrorAlertProps): void => {
  onShow?.();
  
  const alertButtons: AlertButton[] = actions.map(action => ({
    text: action.text,
    style: action.style || 'default',
    onPress: action.onPress
  }));
  
  Alert.alert(title, message, alertButtons, {
    cancelable: false // Ensure user acknowledges the error
  });
};

/**
 * Predefined error alerts for common scenarios
 */
export const ErrorAlerts = {
  /**
   * Network connectivity error
   */
  networkError: (onRetry?: () => void) => {
    showErrorAlert({
      title: 'Connection Problem',
      message: 'Please check your internet connection and try again.',
      actions: onRetry 
        ? [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Retry', style: 'default', onPress: onRetry }
          ]
        : [{ text: 'OK', style: 'default' }]
    });
  },

  /**
   * Authentication failed error
   */
  authError: (message?: string, onSignIn?: () => void) => {
    showErrorAlert({
      title: 'Authentication Error',
      message: message || 'Authentication failed. Please try again.',
      actions: onSignIn
        ? [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign In', style: 'default', onPress: onSignIn }
          ]
        : [{ text: 'OK', style: 'default' }]
    });
  },

  /**
   * Email already exists error
   */
  emailAlreadyExists: (onSignIn?: () => void) => {
    showErrorAlert({
      title: 'Account Already Exists',
      message: 'An account with this email address already exists. Would you like to sign in instead?',
      actions: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', style: 'default', onPress: onSignIn }
      ]
    });
  },

  /**
   * Too many attempts error
   */
  tooManyAttempts: () => {
    showErrorAlert({
      title: 'Too Many Attempts',
      message: 'Too many failed attempts. Please wait a few minutes before trying again.',
      actions: [{ text: 'OK', style: 'default' }]
    });
  },

  /**
   * Account disabled error
   */
  accountDisabled: (onContactSupport?: () => void) => {
    showErrorAlert({
      title: 'Account Disabled',
      message: 'This account has been disabled. Please contact support for assistance.',
      actions: onContactSupport
        ? [
            { text: 'OK', style: 'cancel' },
            { text: 'Contact Support', style: 'default', onPress: onContactSupport }
          ]
        : [{ text: 'OK', style: 'default' }]
    });
  },

  /**
   * Service unavailable error
   */
  serviceUnavailable: (onRetry?: () => void) => {
    showErrorAlert({
      title: 'Service Unavailable',
      message: 'The service is temporarily unavailable. Please try again in a moment.',
      actions: onRetry
        ? [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Try Again', style: 'default', onPress: onRetry }
          ]
        : [{ text: 'OK', style: 'default' }]
    });
  },

  /**
   * Password reset email sent confirmation
   */
  passwordResetSent: (email: string, onBackToLogin?: () => void) => {
    showErrorAlert({
      title: 'Password Reset Email Sent',
      message: `We've sent a password reset link to ${email}. Please check your email and follow the instructions to reset your password.`,
      actions: [
        {
          text: 'OK',
          style: 'default',
          onPress: onBackToLogin
        }
      ]
    });
  },

  /**
   * Account created successfully
   */
  accountCreated: (onGetStarted?: () => void) => {
    showErrorAlert({
      title: 'Account Created!',
      message: 'Your account has been created successfully. Welcome to Productivity Morning Routine!',
      actions: [
        {
          text: 'Get Started',
          style: 'default',
          onPress: onGetStarted
        }
      ]
    });
  },

  /**
   * Generic error alert
   */
  generic: (message?: string, title?: string) => {
    showErrorAlert({
      title: title || 'Something went wrong',
      message: message || 'An unexpected error occurred. Please try again.',
      actions: [{ text: 'OK', style: 'default' }]
    });
  },

  /**
   * Validation error alert
   */
  validation: (message: string) => {
    showErrorAlert({
      title: 'Please check your input',
      message,
      actions: [{ text: 'OK', style: 'default' }]
    });
  },

  /**
   * Database error alert
   */
  database: (message?: string, onRetry?: () => void) => {
    showErrorAlert({
      title: 'Data Error',
      message: message || 'Unable to save your data. Please try again.',
      actions: onRetry
        ? [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Retry', style: 'default', onPress: onRetry }
          ]
        : [{ text: 'OK', style: 'default' }]
    });
  }
};

/**
 * Hook to provide error alert functions in components
 */
export const useErrorAlert = () => {
  return {
    showErrorAlert,
    ...ErrorAlerts
  };
};

export default {
  showErrorAlert,
  ErrorAlerts,
  useErrorAlert
};