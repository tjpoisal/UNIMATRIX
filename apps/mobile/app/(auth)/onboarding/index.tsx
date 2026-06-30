/**
 * Mobile Onboarding Flow
 * 
 * A 5-step guided setup wizard for new mobile users:
 * 1. Welcome - Introduction to Unimatrix
 * 2. Encryption - How memory encryption works
 * 3. Workspace - Create your first workspace (optional)
 * 4. First Memory - Create your first memory (optional)
 * 5. Completion - Celebration and dashboard navigation
 */

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, StatusBar,
  Animated, Dimensions, ActivityIndicator, TextInput,
  ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '@/lib/api';

const { width, height } = Dimensions.get('window');

type Step = 'welcome' | 'encryption' | 'workspace' | 'memory' | 'completion';

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceDescription, setWorkspaceDescription] = useState('');
  const [firstMemory, setFirstMemory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [currentStep, fadeAnim]);

  const nextStep = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      const steps: Step[] = ['welcome', 'encryption', 'workspace', 'memory', 'completion'];
      const currentIndex = steps.indexOf(currentStep);
      if (currentIndex < steps.length - 1) {
        setCurrentStep(steps[currentIndex + 1]);
      }
    });
  };

  const skipStep = () => {
    if (currentStep === 'workspace') {
      nextStep(); // Skip to memory
    } else if (currentStep === 'memory') {
      nextStep(); // Skip to completion
    }
  };

  const completeOnboarding = async () => {
    setIsSubmitting(true);
    try {
      // Mark onboarding as complete
      await AsyncStorage.setItem('onboardingCompleted', 'true');
      
      // If workspace was created, it's already in the API
      // If memory was created, it's already in the API
      
      // Navigate to dashboard
      router.replace('/(tabs)/dashboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to complete onboarding');
    } finally {
      setIsSubmitting(false);
    }
  };

  const createWorkspace = async () => {
    if (!workspaceName.trim()) {
      Alert.alert('Error', 'Please enter a workspace name');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.createPalace(workspaceName, workspaceDescription);
      nextStep();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create workspace');
    } finally {
      setIsSubmitting(false);
    }
  };

  const createFirstMemory = async () => {
    if (!firstMemory.trim()) {
      Alert.alert('Error', 'Please enter a memory');
      return;
    }

    setIsSubmitting(true);
    try {
      // Get the first palace ID (or create a default one)
      const palaces = await apiClient.getPalaces();
      const palaceId = palaces[0]?.id;
      
      if (!palaceId) {
        Alert.alert('Error', 'Please create a workspace first');
        return;
      }

      // Create a default location if needed
      const location = await apiClient.createLocation(palaceId, 'General', 'General memories');
      
      await apiClient.createMemory(location.id, firstMemory, ['onboarding']);
      nextStep();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create memory');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    const animatedStyle = {
      opacity: fadeAnim,
    };

    switch (currentStep) {
      case 'welcome':
        return (
          <Animated.View style={[styles.stepContainer, animatedStyle]}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>🧠</Text>
            </View>
            <Text style={styles.title}>Welcome to Unimatrix</Text>
            <Text style={styles.subtitle}>
              Your universal AI memory vault. Remember everything across all your AI conversations.
            </Text>
            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>✨</Text>
                <Text style={styles.featureText}>Works with all AI tools</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🔒</Text>
                <Text style={styles.featureText}>End-to-end encrypted</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>📱</Text>
                <Text style={styles.featureText}>Syncs across all devices</Text>
              </View>
            </View>
          </Animated.View>
        );

      case 'encryption':
        return (
          <Animated.View style={[styles.stepContainer, animatedStyle]}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>🔐</Text>
            </View>
            <Text style={styles.title}>Your Memory, Your Key</Text>
            <Text style={styles.subtitle}>
              All your memories are encrypted on your device before they leave. We never see your actual memories.
            </Text>
            <View style={styles.encryptionCard}>
              <Text style={styles.encryptionTitle}>How it works:</Text>
              <View style={styles.encryptionStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={styles.encryptionText}>Memory encrypted on your device</Text>
              </View>
              <View style={styles.encryptionStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={styles.encryptionText}>Encrypted data sent to secure vault</Text>
              </View>
              <View style={styles.encryptionStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={styles.encryptionText}>Only you can decrypt with your key</Text>
              </View>
            </View>
          </Animated.View>
        );

      case 'workspace':
        return (
          <Animated.View style={[styles.stepContainer, animatedStyle]}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>🏛️</Text>
            </View>
            <Text style={styles.title}>Create Your Workspace</Text>
            <Text style={styles.subtitle}>
              Workspaces help you organize memories by topic or project. You can create more later.
            </Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Workspace Name</Text>
              <TextInput
                style={styles.input}
                placeholder="My Memory Palace"
                placeholderTextColor="#64748B"
                value={workspaceName}
                onChangeText={setWorkspaceName}
              />
              <Text style={styles.inputLabel}>Description (optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="What will you remember here?"
                placeholderTextColor="#64748B"
                value={workspaceDescription}
                onChangeText={setWorkspaceDescription}
                multiline
                numberOfLines={3}
              />
            </View>
          </Animated.View>
        );

      case 'memory':
        return (
          <Animated.View style={[styles.stepContainer, animatedStyle]}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>💭</Text>
            </View>
            <Text style={styles.title}>Your First Memory</Text>
            <Text style={styles.subtitle}>
              Let's save your first memory. It could be anything you want to remember.
            </Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>What do you want to remember?</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Example: I prefer dark mode in my IDE, use 4-space tabs, and love TypeScript"
                placeholderTextColor="#64748B"
                value={firstMemory}
                onChangeText={setFirstMemory}
                multiline
                numberOfLines={5}
              />
            </View>
          </Animated.View>
        );

      case 'completion':
        return (
          <Animated.View style={[styles.stepContainer, animatedStyle]}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>🎉</Text>
            </View>
            <Text style={styles.title}>You're All Set!</Text>
            <Text style={styles.subtitle}>
              Your Unimatrix is ready. Start using any AI tool, and your memories will be automatically captured.
            </Text>
            <View style={styles.completionCard}>
              <Text style={styles.completionTitle}>What's next?</Text>
              <View style={styles.completionItem}>
                <Text style={styles.completionIcon}>💬</Text>
                <Text style={styles.completionText}>Chat with any AI (Claude, ChatGPT, etc.)</Text>
              </View>
              <View style={styles.completionItem}>
                <Text style={styles.completionIcon}>🔍</Text>
                <Text style={styles.completionText}>Search your memories anytime</Text>
              </View>
              <View style={styles.completionItem}>
                <Text style={styles.completionIcon}>📱</Text>
                <Text style={styles.completionText}>Access memories on all your devices</Text>
              </View>
            </View>
          </Animated.View>
        );

      default:
        return null;
    }
  };

  const renderButton = () => {
    const steps: Step[] = ['welcome', 'encryption', 'workspace', 'memory', 'completion'];
    const currentIndex = steps.indexOf(currentStep);
    const isLastStep = currentStep === 'completion';

    const handlePress = () => {
      if (currentStep === 'workspace') {
        createWorkspace();
      } else if (currentStep === 'memory') {
        createFirstMemory();
      } else if (currentStep === 'completion') {
        completeOnboarding();
      } else {
        nextStep();
      }
    };

    return (
      <View style={styles.buttonContainer}>
        {(currentStep === 'workspace' || currentStep === 'memory') && (
          <TouchableOpacity
            onPress={skipStep}
            style={styles.skipButton}
            disabled={isSubmitting}
          >
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={handlePress}
          disabled={isSubmitting}
          style={[
            styles.primaryButton,
            (currentStep === 'workspace' || currentStep === 'memory') && !workspaceName && !firstMemory && styles.disabledButton,
          ]}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#0A0F1C" />
          ) : (
            <Text style={styles.primaryButtonText}>
              {isLastStep ? 'Start Using Unimatrix' : 'Continue'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderProgress = () => {
    const steps: Step[] = ['welcome', 'encryption', 'workspace', 'memory', 'completion'];
    const currentIndex = steps.indexOf(currentStep);

    return (
      <View style={styles.progressContainer}>
        {steps.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              index <= currentIndex && styles.progressDotActive,
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {renderProgress()}
        {renderStep()}
      </ScrollView>
      {renderButton()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A0F1C',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 40,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 40,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1E293B',
  },
  progressDotActive: {
    backgroundColor: '#00F5FF',
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 80,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#F1F5F9',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  featureList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#111827',
    padding: 16,
    borderRadius: 12,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureText: {
    fontSize: 16,
    color: '#CBD5E1',
    flex: 1,
  },
  encryptionCard: {
    backgroundColor: '#111827',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  encryptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F1F5F9',
    marginBottom: 16,
  },
  encryptionStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#00F5FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0A0F1C',
  },
  encryptionText: {
    fontSize: 14,
    color: '#CBD5E1',
    flex: 1,
  },
  inputContainer: {
    gap: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
  },
  input: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#F1F5F9',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  completionCard: {
    backgroundColor: '#111827',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  completionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F1F5F9',
    marginBottom: 16,
  },
  completionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  completionIcon: {
    fontSize: 24,
  },
  completionText: {
    fontSize: 15,
    color: '#CBD5E1',
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 24,
    paddingBottom: 32,
  },
  skipButton: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94A3B8',
  },
  primaryButton: {
    flex: 2,
    backgroundColor: '#00F5FF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A0F1C',
  },
});
