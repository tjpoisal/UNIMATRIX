/**
 * OAuth Helper for React Native
 * 
 * Handles Google and GitHub OAuth flows using expo-auth-session.
 */

import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from './api';

const DISCOVERY = {
  google: {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://www.googleapis.com/oauth2/v4/token',
    revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
    scopes: ['openid', 'profile', 'email'],
  },
  github: {
    authorizationEndpoint: 'https://github.com/login/oauth/authorize',
    tokenEndpoint: 'https://github.com/login/oauth/access_token',
    revocationEndpoint: 'https://github.com/settings/connections/applications{/client_id}/token',
    scopes: ['read:user', 'user:email'],
  },
};

export async function handleGoogleOAuth() {
  try {
    const config = DISCOVERY.google;
    const authUrl = await AuthSession.startAsync({
      authUrl: config.authorizationEndpoint,
      clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',
      redirectUri: AuthSession.makeRedirectUri({
        scheme: 'unimatrix',
      }),
      scopes: config.scopes,
    });

    if (authUrl.type === 'success') {
      const tokenResponse = await AuthSession.exchangeCodeAsync(
        authUrl.params.code,
        config.tokenEndpoint,
        {
          clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',
          redirectUri: AuthSession.makeRedirectUri({
            scheme: 'unimatrix',
          }),
          clientSecret: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_SECRET || '',
        }
      );

      // Send token to backend for verification and session creation
      const response = await apiClient.post('/auth/oauth/google', {
        token: tokenResponse.accessToken,
        idToken: tokenResponse.idToken,
      });

      if (response.token) {
        await AsyncStorage.setItem('authToken', response.token);
        await AsyncStorage.setItem('userId', response.user.id);
        return { success: true, user: response.user };
      }
    }

    return { success: false, error: 'OAuth failed' };
  } catch (error: any) {
    console.error('[OAuth] Google error:', error);
    return { success: false, error: error.message };
  }
}

export async function handleGitHubOAuth() {
  try {
    const config = DISCOVERY.github;
    const authUrl = await AuthSession.startAsync({
      authUrl: config.authorizationEndpoint,
      clientId: process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID || '',
      redirectUri: AuthSession.makeRedirectUri({
        scheme: 'unimatrix',
      }),
      scopes: config.scopes,
    });

    if (authUrl.type === 'success') {
      const tokenResponse = await AuthSession.exchangeCodeAsync(
        authUrl.params.code,
        config.tokenEndpoint,
        {
          clientId: process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID || '',
          redirectUri: AuthSession.makeRedirectUri({
            scheme: 'unimatrix',
          }),
          clientSecret: process.env.EXPO_PUBLIC_GITHUB_CLIENT_SECRET || '',
        }
      );

      // Send token to backend for verification and session creation
      const response = await apiClient.post('/auth/oauth/github', {
        token: tokenResponse.accessToken,
      });

      if (response.token) {
        await AsyncStorage.setItem('authToken', response.token);
        await AsyncStorage.setItem('userId', response.user.id);
        return { success: true, user: response.user };
      }
    }

    return { success: false, error: 'OAuth failed' };
  } catch (error: any) {
    console.error('[OAuth] GitHub error:', error);
    return { success: false, error: error.message };
  }
}
