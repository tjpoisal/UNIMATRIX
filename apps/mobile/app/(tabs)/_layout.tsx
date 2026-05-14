import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RootLayout() {
  const [initialRoute, setInitialRoute] = useState<'auth' | 'tabs' | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = await AsyncStorage.getItem('authToken');
    setInitialRoute(token ? 'tabs' : 'auth');
  };

  if (initialRoute === null) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {initialRoute === 'auth' ? (
        <Stack.Screen name="(auth)" />
      ) : (
        <Stack.Screen name="(tabs)" />
      )}
    </Stack>
  );
}