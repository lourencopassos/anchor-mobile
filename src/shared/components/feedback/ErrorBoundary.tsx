import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text } from 'react-native';
import { Button } from '../ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // TODO: Log error to analytics service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View className="flex-1 items-center justify-center px-6 bg-white">
          <Text className="text-6xl mb-4">😵</Text>
          <Text className="text-xl font-bold text-neutral-900 mb-2 text-center">
            Something went wrong
          </Text>
          <Text className="text-neutral-600 text-center mb-6">
            We're sorry, but something unexpected happened. Please try again.
          </Text>
          <Button title="Try Again" onPress={this.handleRetry} />
          {__DEV__ && this.state.error && (
            <View className="mt-6 p-4 bg-neutral-100 rounded-lg w-full">
              <Text className="text-sm font-mono text-error">
                {this.state.error.toString()}
              </Text>
            </View>
          )}
        </View>
      );
    }

    return this.props.children;
  }
}
