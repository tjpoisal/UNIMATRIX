/**
 * OAuth Button Component
 * 
 * Styled button for Google and GitHub OAuth login.
 */

import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useColorScheme } from 'nativewind';

interface OAuthButtonProps {
  provider: 'google' | 'github';
  onPress: () => void;
  loading?: boolean;
}

export function OAuthButton({ provider, onPress, loading }: OAuthButtonProps) {
  const { colorScheme } = useColorScheme();

  const isGoogle = provider === 'google';
  const bgColor = isGoogle ? '#DB4437' : '#24292F';
  const label = isGoogle ? 'Continue with Google' : 'Continue with GitHub';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      className="w-full h-12 rounded-xl flex-row items-center justify-center"
      style={{ backgroundColor: bgColor }}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <>
          <Text className="text-white font-semibold text-base">{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}
