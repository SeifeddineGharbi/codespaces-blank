// Main entry point for Productivity Morning Routine App
// Architecture: Project Architect setup with navigation structure

import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GluestackUIProvider } from "./components/ui/gluestack-ui-provider";
import AppNavigator from './src/navigation/AppNavigator';

// Import global CSS for NativeWind styling
import "./global.css";

export default function App() {
  return (
    <SafeAreaProvider>
      <GluestackUIProvider mode="light">
        <AppNavigator />
      </GluestackUIProvider>
    </SafeAreaProvider>
  );
}
