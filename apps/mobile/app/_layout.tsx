import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import '../globals.css';
import { initSentry } from '../sentry';
import { initAnalytics } from '../lib/analytics';

// Initialize Sentry
initSentry();

// Initialize Analytics
initAnalytics();

export default function RootLayout() {
  const [initialRoute, setInitialRoute] = useState<'auth' | 'tabs' | null>(null);

  const checkAuth = async () => {
    const token = await AsyncStorage.getItem('authToken');
    setTimeout(() => {
      setInitialRoute(token ? 'tabs' : 'auth');
    }, 0);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  if (initialRoute === null) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {initialRoute === 'auth' ? (
          <Stack.Screen name="(auth)" options={{ gestureEnabled: false }} />
        ) : (
          <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
        )}
      </Stack>
    </SafeAreaProvider>
  );
}
