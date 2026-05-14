/**
 * Cognito Authentication Management
 *
 * Handles:
 * - Token storage and retrieval
 * - Token refresh logic
 * - Session management
 * - User context
 */

import { Amplify, Auth } from 'aws-amplify';

let isInitialized = false;

/**
 * Initialize Amplify with Cognito configuration
 */
export function initializeAuth(config: {
  region: string;
  userPoolId: string;
  userPoolWebClientId: string;
  identityPoolId: string;
  oauth?: {
    domain: string;
    scope: string[];
    redirectSignIn: string;
    redirectSignOut: string;
    responseType: string;
  };
}): void {
  if (isInitialized) return;

  Amplify.configure({
    region: config.region,
    Auth: {
      region: config.region,
      userPoolId: config.userPoolId,
      userPoolWebClientId: config.userPoolWebClientId,
      identityPoolId: config.identityPoolId,
      oauth: config.oauth,
    },
  });

  isInitialized = true;
}

/**
 * Get current Cognito token
 */
export async function getCognitoToken(): Promise<string> {
  try {
    const session = await Auth.currentSession();
    return session.getIdToken().getJwtToken();
  } catch (error) {
    // Try to refresh if token is expired
    try {
      await refreshCognitoToken();
      const session = await Auth.currentSession();
      return session.getIdToken().getJwtToken();
    } catch (refreshError) {
      console.error('Failed to get Cognito token:', refreshError);
      throw refreshError;
    }
  }
}

/**
 * Refresh Cognito token
 */
export async function refreshCognitoToken(): Promise<void> {
  try {
    const session = await Auth.currentSession();
    const refreshToken = session.getRefreshToken();
    await Auth.refreshSession(refreshToken);
  } catch (error) {
    console.error('Failed to refresh token:', error);
    throw error;
  }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<any> {
  try {
    return await Auth.currentAuthenticatedUser();
  } catch (error) {
    console.error('No authenticated user:', error);
    return null;
  }
}

/**
 * Sign in user with email and password
 */
export async function signIn(email: string, password: string): Promise<any> {
  try {
    const user = await Auth.signIn(email, password);
    return user;
  } catch (error) {
    console.error('Sign in failed:', error);
    throw error;
  }
}

/**
 * Sign up new user
 */
export async function signUp(
  email: string,
  password: string,
  attributes?: Record<string, string>
): Promise<any> {
  try {
    const user = await Auth.signUp({
      username: email,
      password,
      attributes: {
        email,
        ...attributes,
      },
    });
    return user;
  } catch (error) {
    console.error('Sign up failed:', error);
    throw error;
  }
}

/**
 * Confirm sign up with verification code
 */
export async function confirmSignUp(
  email: string,
  code: string
): Promise<void> {
  try {
    await Auth.confirmSignUp(email, code);
  } catch (error) {
    console.error('Confirmation failed:', error);
    throw error;
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
  try {
    await Auth.signOut();
  } catch (error) {
    console.error('Sign out failed:', error);
    throw error;
  }
}

/**
 * Request password reset
 */
export async function forgotPassword(email: string): Promise<void> {
  try {
    await Auth.forgotPassword(email);
  } catch (error) {
    console.error('Forgot password failed:', error);
    throw error;
  }
}

/**
 * Complete password reset with code
 */
export async function forgotPasswordSubmit(
  email: string,
  code: string,
  newPassword: string
): Promise<void> {
  try {
    await Auth.forgotPasswordSubmit(email, code, newPassword);
  } catch (error) {
    console.error('Password reset failed:', error);
    throw error;
  }
}

/**
 * Change password for authenticated user
 */
export async function changePassword(
  oldPassword: string,
  newPassword: string
): Promise<void> {
  try {
    const user = await Auth.currentAuthenticatedUser();
    await Auth.changePassword(user, oldPassword, newPassword);
  } catch (error) {
    console.error('Change password failed:', error);
    throw error;
  }
}

/**
 * Get user attributes
 */
export async function getUserAttributes(): Promise<Record<string, string>> {
  try {
    const user = await Auth.currentAuthenticatedUser();
    const attributes = await Auth.userAttributes(user);
    const result: Record<string, string> = {};
    attributes.forEach((attr) => {
      result[attr.Name] = attr.Value;
    });
    return result;
  } catch (error) {
    console.error('Get user attributes failed:', error);
    throw error;
  }
}

/**
 * Update user attributes
 */
export async function updateUserAttributes(
  attributes: Record<string, string>
): Promise<void> {
  try {
    const user = await Auth.currentAuthenticatedUser();
    await Auth.updateUserAttributes(user, attributes);
  } catch (error) {
    console.error('Update user attributes failed:', error);
    throw error;
  }
}
