import React, { Component, ReactNode } from 'react';
import { View } from 'react-native';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Button, ButtonText } from '@/components/ui/button';
import { COLORS } from '../../constants';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    console.error('❌ ErrorBoundary caught error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('❌ ErrorBoundary componentDidCatch:', error, errorInfo);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Component stack:', errorInfo.componentStack);
  }

  handleReset = () => {
    console.log('🔄 Resetting error boundary');
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={{ 
          flex: 1, 
          backgroundColor: COLORS.background.light,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}>
          <VStack space="lg" className="items-center max-w-sm">
            <Heading size="xl" className="text-center" style={{ color: COLORS.text.primary }}>
              Something went wrong
            </Heading>
            
            <Text size="md" className="text-center" style={{ color: COLORS.text.secondary }}>
              We encountered an unexpected error. This has been logged and we'll work to fix it.
            </Text>
            
            {__DEV__ && this.state.error && (
              <VStack className="w-full bg-red-50 p-4 rounded-lg" space="xs">
                <Text size="sm" className="font-bold text-red-700">
                  Debug Info:
                </Text>
                <Text size="xs" className="text-red-600 font-mono">
                  {this.state.error.message}
                </Text>
              </VStack>
            )}
            
            <Button
              size="lg"
              variant="solid"
              action="primary"
              onPress={this.handleReset}
              style={{ backgroundColor: COLORS.primary[500] }}
            >
              <ButtonText>Try Again</ButtonText>
            </Button>
          </VStack>
        </View>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;