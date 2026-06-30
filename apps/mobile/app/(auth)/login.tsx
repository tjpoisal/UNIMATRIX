import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, Linking } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '@/lib/api';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { handleGoogleOAuth, handleGitHubOAuth } from '@/lib/oauth';
import { OAuthButton } from '@/components/OAuthButton';

export default function LoginScreen() {
  const params = useLocalSearchParams<{ key?: string; token?: string; connectToken?: string }>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [apiKey, setApiKey] = useState(params.key || '');
  const [mode, setMode] = useState<'password' | 'apikey'>(params.key || params.connectToken ? 'apikey' : 'password');
  const [loading, setLoading] = useState(false);

  // In-app QR scanner for mobile
  const [scanning, setScanning] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  // Enhanced auto-magic setup for first-time mobile connect
  const runAutoMagicSetup = async () => {
    try {
      let palaces = await apiClient.getPalaces();
      if (!Array.isArray(palaces)) palaces = [];

      let mobilePalace = palaces.find((p: any) => p.name === 'Mobile');

      if (!mobilePalace) {
        mobilePalace = await apiClient.createPalace(
          'Mobile',
          'Memories synced from mobile devices and on-the-go use. Auto-created by the installer.'
        );

        // Fetch connected LLM providers FIRST for personalization and per-LLM history org
        let providers: any[] = [];
        try {
          providers = await apiClient.getLLMProviders();
        } catch (e) {
          // ignore
        }
        const providerNames = providers.length > 0 
          ? providers.map((p: any) => `${p.provider} (${p.model})`).join(', ')
          : 'your connected LLMs (Claude, OpenAI, Gemini, Groq, Ollama, etc.)';

        // 1. Create "This Mobile Device" location (device-specific auto-magic)
        await apiClient.createLocation(
          mobilePalace.id,
          'This Mobile Device',
          'Auto-detected context and memories from this phone/tablet.'
        );

        // 2. Create useful default sub-locations
        const quickCapture = await apiClient.createLocation(
          mobilePalace.id,
          'Quick Capture',
          'Fast notes, thoughts, and voice memos captured on mobile'
        );

        await apiClient.createLocation(
          mobilePalace.id,
          'Synced Context',
          'Automatically pulled context from desktop, web, and other LLMs'
        );

        const resilienceLoc = await apiClient.createLocation(
          mobilePalace.id,
          'Resilience & Alerts',
          'Weather events, emergency prep, cascading hazards, and important updates'
        );

        // 3. For EACH connected LLM, auto-create a dedicated history location
        //    The LLM layer will auto-store conversation history here based on source LLM.
        for (const prov of providers) {
          const llmName = prov.provider.charAt(0).toUpperCase() + prov.provider.slice(1);
          const historyLoc = await apiClient.createLocation(
            mobilePalace.id,
            `${llmName} History`,
            `Auto-stored full conversation history from ${llmName} (${prov.model}). Unimatrix automatically organizes and stores turns from this LLM here.`
          );

          await apiClient.createMemory(
            historyLoc.id,
            `This location receives automatic history from every interaction with ${llmName}.

The Unimatrix LLM wrappers (when you call ${llmName} through agents or direct integrations) will auto-store the user message + assistant response here, tagged with the LLM source, model, and any context used.

This lets you search "what did I discuss with Claude last week" separately from other LLMs, while still having cross-LLM recall when needed.`,
            ['history', 'auto-store', prov.provider, 'llm-source', 'conversation']
          );
        }

        // 4. Auto-seed richer welcome + example prompt memories (personalized)
        await apiClient.createMemory(
          quickCapture.id,
          `Welcome to Unimatrix Mobile! 

This palace + locations were auto-created by the installer because you connected LLM logins in web onboarding.

Your providers: ${providerNames}

Future conversations will be automatically captured and filed into the per-LLM History locations above.`,
          ['welcome', 'setup', 'auto-magic']
        );

        if (providers.length > 0) {
          const ex = providers[0];
          await apiClient.createMemory(
            quickCapture.id,
            `Auto-example for ${ex.provider}:

"Based on my full history in the '${ex.provider} History' location and other synced context, continue our discussion about [topic]."

The system will automatically include relevant history from that LLM's dedicated space.`,
            ['example', 'prompt', ex.provider]
          );
        }

        // 5. Resilience example
        await apiClient.createMemory(
          resilienceLoc.id,
          `Use the per-LLM histories + this location together for multi-model analysis of weather/resilience scenarios. All auto-organized by source LLM.`,
          ['resilience', 'auto', 'example']
        );

        // 6. Pinned location for "favorite" equivalent
        await apiClient.createLocation(
          mobilePalace.id,
          '⭐ Pinned / Favorites',
          'Auto or manually pin important mobile memories here for fast access.'
        );
      }
    } catch (e) {
      console.warn('[Auto-magic] Setup skipped:', e);
    }
  };

  // Handle deep link with API key or one-time connectToken from web onboarding (unimatrix://login?connectToken=xxx or ?key=...)
  React.useEffect(() => {
    const apiBase = process.env.EXPO_PUBLIC_API_URL || 'https://deployunimatrix.com';

    if (params.connectToken) {
      // One-time token from QR/deep link: exchange it for a secure device key
      (async () => {
        setLoading(true);
        try {
          const res = await fetch(`${apiBase}/api/auth/exchange-mobile-connect-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ connectToken: params.connectToken }),
          });
          const data = await res.json();
          if (!res.ok || !data.key) throw new Error(data.error || 'Exchange failed');

          await AsyncStorage.setItem('authToken', data.key);
          await AsyncStorage.setItem('userId', 'from-connect-token');
          setTimeout(() => {
            setApiKey(data.key);
            setMode('apikey');
          }, 0);

          // Enhanced auto-magic setup (palace + locations + welcome content)
          setTimeout(async () => {
            await runAutoMagicSetup();
            const onboardingCompleted = await AsyncStorage.getItem('onboardingCompleted');
            if (onboardingCompleted === 'true') {
              router.replace('/(tabs)/dashboard');
            } else {
              router.replace('/(auth)/onboarding');
            }
          }, 200);
        } catch (e: any) {
          Alert.alert('Connect Failed', e.message || 'Could not exchange the mobile connect token. Please use the API key manually.');
        } finally {
          setLoading(false);
        }
      })();
    } else if (params.key) {
      setTimeout(() => {
        setApiKey(params.key);
        setMode('apikey');
      }, 0);

      // Auto login with the key from deep link / QR for super easy flow
      (async () => {
        try {
          await AsyncStorage.setItem('authToken', params.key as string);
          await AsyncStorage.setItem('userId', 'from-deep-link');
          // Enhanced auto-magic setup (palace + locations + welcome content)
          setTimeout(async () => {
            await runAutoMagicSetup();
            const onboardingCompleted = await AsyncStorage.getItem('onboardingCompleted');
            if (onboardingCompleted === 'true') {
              router.replace('/(tabs)/dashboard');
            } else {
              router.replace('/(auth)/onboarding');
            }
          }, 300);
        } catch (e) {
          // fall to manual
        }
      })();
    }
    if (params.token) {
      (async () => {
        await AsyncStorage.setItem('authToken', params.token as string);
        const onboardingCompleted = await AsyncStorage.getItem('onboardingCompleted');
        if (onboardingCompleted === 'true') {
          router.replace('/(tabs)/dashboard');
        } else {
          router.replace('/(auth)/onboarding');
        }
      })();
    }
  }, [params.key, params.token, params.connectToken]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.login(email, password);
      await AsyncStorage.setItem('authToken', response.token);
      await AsyncStorage.setItem('userId', response.user.id);
      
      // Check if onboarding is completed
      const onboardingCompleted = await AsyncStorage.getItem('onboardingCompleted');
      if (onboardingCompleted === 'true') {
        router.replace('/(tabs)/dashboard');
      } else {
        router.replace('/(auth)/onboarding');
      }
    } catch (error: any) {
      Alert.alert('Login Failed', error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleApiKeyLogin = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Error', 'Please enter your Unimatrix API key from the web onboarding');
      return;
    }

    setLoading(true);
    try {
      await AsyncStorage.setItem('authToken', apiKey.trim());
      await AsyncStorage.setItem('userId', 'from-key');
      
      // Check if onboarding is completed
      const onboardingCompleted = await AsyncStorage.getItem('onboardingCompleted');
      if (onboardingCompleted === 'true') {
        router.replace('/(tabs)/dashboard');
      } else {
        router.replace('/(auth)/onboarding');
      }
    } catch (error: any) {
      Alert.alert('Login Failed', 'Invalid API key or network error. Make sure the key was created in web onboarding.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await handleGoogleOAuth();
      if (result.success) {
        const onboardingCompleted = await AsyncStorage.getItem('onboardingCompleted');
        if (onboardingCompleted === 'true') {
          router.replace('/(tabs)/dashboard');
        } else {
          router.replace('/(auth)/onboarding');
        }
      } else {
        Alert.alert('OAuth Failed', result.error || 'Failed to sign in with Google');
      }
    } catch (error: any) {
      Alert.alert('OAuth Failed', error.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    setLoading(true);
    try {
      const result = await handleGitHubOAuth();
      if (result.success) {
        const onboardingCompleted = await AsyncStorage.getItem('onboardingCompleted');
        if (onboardingCompleted === 'true') {
          router.replace('/(tabs)/dashboard');
        } else {
          router.replace('/(auth)/onboarding');
        }
      } else {
        Alert.alert('OAuth Failed', result.error || 'Failed to sign in with GitHub');
      }
    } catch (error: any) {
      Alert.alert('OAuth Failed', error.message || 'Failed to sign in with GitHub');
    } finally {
      setLoading(false);
    }
  };

  // Listen for incoming links (for when user taps "Open in mobile" from web)
  React.useEffect(() => {
    const handleDeepLink = ({ url }: { url: string }) => {
      try {
        const parsed = new URL(url);
        const key = parsed.searchParams.get('key');
        const connectToken = parsed.searchParams.get('connectToken');
        if (connectToken) {
          // Will be handled by the main effect above via params
          // But we can trigger re-render or just let router handle
          router.replace(`/(auth)/login?connectToken=${encodeURIComponent(connectToken)}`);
        } else if (key) {
          setApiKey(key);
          setMode('apikey');
        }
      } catch {}
    };

    const sub = Linking.addEventListener('url', handleDeepLink);
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => sub.remove();
  }, []);

  // Handle scanned QR code (from in-app camera)
  const handleBarcodeScanned = ({ data }: { data: string }) => {
    setScanning(false);
    try {
      const parsed = new URL(data);
      const connectToken = parsed.searchParams.get('connectToken');
      const key = parsed.searchParams.get('key');
      if (connectToken) {
        router.replace(`/(auth)/login?connectToken=${encodeURIComponent(connectToken)}`);
      } else if (key) {
        setApiKey(key);
        setMode('apikey');
        // Auto attempt
        (async () => {
          await AsyncStorage.setItem('authToken', key);
          await AsyncStorage.setItem('userId', 'from-scanned-key');
          const onboardingCompleted = await AsyncStorage.getItem('onboardingCompleted');
          if (onboardingCompleted === 'true') {
            router.replace('/(tabs)/dashboard');
          } else {
            router.replace('/(auth)/onboarding');
          }
        })();
      } else {
        Alert.alert('Invalid QR', 'This QR does not contain a valid Unimatrix connect link.');
      }
    } catch {
      // If not URL, perhaps raw key
      if (data.startsWith('umx_')) {
        setApiKey(data);
        setMode('apikey');
      } else {
        Alert.alert('Invalid QR', 'Could not parse the scanned code.');
      }
    }
  };

  const startScanner = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Permission required', 'Camera permission is needed to scan the QR code from web onboarding.');
        return;
      }
    }
    setScanning(true);
  };

  if (scanning) {
    return (
      <View style={{ flex: 1 }}>
        <CameraView
          style={{ flex: 1 }}
          facing="back"
          onBarcodeScanned={handleBarcodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        />
        <TouchableOpacity
          style={{ position: 'absolute', bottom: 40, alignSelf: 'center', backgroundColor: '#EF4444', padding: 12, borderRadius: 8 }}
          onPress={() => setScanning(false)}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Cancel Scan</Text>
        </TouchableOpacity>
        <Text style={{ position: 'absolute', top: 60, alignSelf: 'center', color: 'white', backgroundColor: 'rgba(0,0,0,0.6)', padding: 8, borderRadius: 4 }}>
          Point camera at the QR code from web onboarding
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#0A0F1C] justify-center px-6">
      <Text className="text-3xl font-bold text-white mb-8 text-center">Unimatrix</Text>

      {/* Easy switcher so web onboarding users can use the API key they just created */}
      <View className="flex-row mb-6 bg-[#1A1F35] rounded-lg p-1">
        <TouchableOpacity
          onPress={() => setMode('password')}
          className={`flex-1 py-2 rounded-md ${mode === 'password' ? 'bg-[#00F5FF]' : ''}`}
        >
          <Text className={`text-center font-semibold ${mode === 'password' ? 'text-[#0A0F1C]' : 'text-white'}`}>Email + Password</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setMode('apikey')}
          className={`flex-1 py-2 rounded-md ${mode === 'apikey' ? 'bg-[#00F5FF]' : ''}`}
        >
          <Text className={`text-center font-semibold ${mode === 'apikey' ? 'text-[#0A0F1C]' : 'text-white'}`}>API Key (from Web Onboarding)</Text>
        </TouchableOpacity>
      </View>

      {mode === 'password' ? (
        <>
          <View className="mb-6">
            <Text className="text-gray-300 mb-2">Email</Text>
            <TextInput
              placeholder="you@example.com"
              placeholderTextColor="#6B7280"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              className="bg-[#1A1F35] border border-[#00F5FF]/20 rounded-lg px-4 py-3 text-white"
            />
          </View>

          <View className="mb-2">
            <Text className="text-gray-300 mb-2">Password</Text>
            <TextInput
              placeholder="••••••••"
              placeholderTextColor="#6B7280"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              className="bg-[#1A1F35] border border-[#00F5FF]/20 rounded-lg px-4 py-3 text-white"
            />
          </View>

          <TouchableOpacity onPress={() => router.push('/forgot-password')} className="self-end mb-6">
            <Text className="text-[#00F5FF] text-sm">Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            className="bg-[#00F5FF] rounded-lg py-3 mb-4"
          >
            {loading ? (
              <ActivityIndicator color="#0A0F1C" />
            ) : (
              <Text className="text-[#0A0F1C] font-semibold text-center text-lg">Sign In</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row items-center mb-4">
            <View className="flex-1 h-px bg-gray-600" />
            <Text className="mx-4 text-gray-500 text-sm">or continue with</Text>
            <View className="flex-1 h-px bg-gray-600" />
          </View>

          <OAuthButton
            provider="google"
            onPress={handleGoogleSignIn}
            loading={loading}
          />

          <View className="h-3" />

          <OAuthButton
            provider="github"
            onPress={handleGitHubSignIn}
            loading={loading}
          />
        </>
      ) : (
        <>
          <View className="mb-4">
            <Text className="text-gray-300 mb-2">Unimatrix API Key (from web onboarding)</Text>
            <TextInput
              placeholder="umx_..."
              placeholderTextColor="#6B7280"
              value={apiKey}
              onChangeText={setApiKey}
              autoCapitalize="none"
              className="bg-[#1A1F35] border border-[#00F5FF]/20 rounded-lg px-4 py-3 text-white font-mono text-sm"
            />
            <Text className="text-[10px] text-gray-500 mt-1">Paste the key created in the web onboarding. This also gives access to all your connected LLM providers (Claude, OpenAI, etc.) without re-entering keys here.</Text>
          </View>

          <TouchableOpacity
            onPress={startScanner}
            className="bg-[#1A1F35] border border-[#00F5FF]/30 rounded-lg py-2 mb-3"
          >
            <Text className="text-[#00F5FF] text-center text-sm font-medium">📷 Scan QR from Web Onboarding</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleApiKeyLogin}
            disabled={loading || !apiKey.trim()}
            className="bg-[#00F5FF] rounded-lg py-3 mb-4"
          >
            {loading ? (
              <ActivityIndicator color="#0A0F1C" />
            ) : (
              <Text className="text-[#0A0F1C] font-semibold text-center text-lg">Continue with API Key</Text>
            )}
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity onPress={() => router.push('/register')}>
        <Text className="text-gray-400 text-center">
          Don&apos;t have an account? <Text className="text-[#00F5FF] font-semibold">Sign up on web first (recommended for full setup)</Text>
        </Text>
      </TouchableOpacity>

      {mode === 'apikey' && (
        <Text className="text-center text-[10px] text-gray-500 mt-4">
          Perfect for the &quot;super easy installer&quot; flow: set up everything (including LLM logins) on web/desktop, then use the key here for instant mobile access.
        </Text>
      )}
    </View>
  );
}
