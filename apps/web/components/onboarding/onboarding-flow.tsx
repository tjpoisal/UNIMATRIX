"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, ArrowRight, ArrowLeft, Sparkles, Lock, Brain, Zap, Rocket } from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const steps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Unimatrix',
    description: 'Your AI memory vault - one memory that works across every AI tool and device.',
    icon: <Sparkles className="w-8 h-8" />,
  },
  {
    id: 'workspace',
    title: 'Create Your First Workspace',
    description: 'Set up your first memory palace to organize your AI conversations and context.',
    icon: <Brain className="w-8 h-8" />,
  },
  {
    id: 'encryption',
    title: 'Set Up Encryption',
    description: 'Your memories are encrypted client-side - only you can read them.',
    icon: <Lock className="w-8 h-8" />,
  },
  {
    id: 'first-memory',
    title: 'Create Your First Memory',
    description: 'Store something important and see how easy it is to recall later.',
    icon: <Zap className="w-8 h-8" />,
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    description: 'Your Unimatrix is ready. Start connecting your AI tools and never lose context again.',
    icon: <Rocket className="w-8 h-8" />,
  },
];

export default function OnboardingFlow(): React.ReactElement {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');
  const [firstMemory, setFirstMemory] = useState('');
  const [error, setError] = useState('');

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = async () => {
    setError('');
    
    if (currentStep === 1 && !workspaceName.trim()) {
      setError('Please enter a workspace name');
      return;
    }
    
    // Removed memory validation since we're skipping actual memory creation for now

    if (currentStep === 1) {
      // Create workspace (palace)
      setLoading(true);
      try {
        const response = await fetch('/api/palaces', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: workspaceName, description: 'My first AI memory workspace' }),
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to create workspace');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create workspace');
        setLoading(false);
        return;
      }
      setLoading(false);
    }

    if (currentStep === 3) {
      // Skip memory creation for now - requires location setup
      // In production, this would create a default location and memory
      // For now, we'll just mark this step as complete
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate loading
      setLoading(false);
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      await fetch('/api/user/onboarding-complete', { method: 'POST' });
      router.push('/dashboard');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    await fetch('/api/user/onboarding-complete', { method: 'POST' });
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-[#F1F5F9]">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-[#111827] z-50">
        <div 
          className="h-full bg-gradient-to-r from-[#00F5FF] to-[#00D9FF] transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16 pt-20">
        {/* Step Indicators */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-2">
            {steps.map((s, index) => (
              <React.Fragment key={s.id}>
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                    index === currentStep
                      ? 'border-[#00F5FF] bg-[#00F5FF]/10 text-[#00F5FF]'
                      : index < currentStep
                      ? 'border-green-500 bg-green-500/10 text-green-500'
                      : 'border-[#334155] text-[#64748B]'
                  }`}
                >
                  {index < currentStep ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 h-0.5 ${
                      index < currentStep ? 'bg-green-500' : 'bg-[#334155]'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-[#111827] border border-[#334155]/30 rounded-2xl p-8 md:p-12">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className={`p-3 rounded-xl ${
              currentStep === 0 ? 'bg-[#00F5FF]/10 text-[#00F5FF]' :
              currentStep === 1 ? 'bg-purple-500/10 text-purple-400' :
              currentStep === 2 ? 'bg-blue-500/10 text-blue-400' :
              currentStep === 3 ? 'bg-yellow-500/10 text-yellow-400' :
              'bg-green-500/10 text-green-400'
            }`}>
              {step.icon}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{step.title}</h1>
              <p className="text-[#94A3B8] mt-1">{step.description}</p>
            </div>
          </div>

          {/* Step Content */}
          {currentStep === 0 && (
            <WelcomeStep onNext={handleNext} />
          )}

          {currentStep === 1 && (
            <WorkspaceStep
              workspaceName={workspaceName}
              setWorkspaceName={setWorkspaceName}
              error={error}
              onNext={handleNext}
              onBack={handleBack}
              loading={loading}
            />
          )}

          {currentStep === 2 && (
            <EncryptionStep onNext={handleNext} onBack={handleBack} />
          )}

          {currentStep === 3 && (
            <FirstMemoryStep
              firstMemory={firstMemory}
              setFirstMemory={setFirstMemory}
              error={error}
              onNext={handleNext}
              onBack={handleBack}
              loading={loading}
            />
          )}

          {currentStep === 4 && (
            <CompleteStep onDashboard={() => router.push('/dashboard')} />
          )}
        </div>

        {/* Skip Button */}
        {currentStep < steps.length - 1 && (
          <button
            onClick={handleSkip}
            className="mt-6 text-[#64748B] hover:text-[#94A3B8] text-sm transition-colors"
          >
            Skip onboarding →
          </button>
        )}
      </div>
    </div>
  );
}

// Step Components
function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="space-y-8">
      <div className="bg-[#0A0F1C] rounded-xl p-6 border border-[#334155]/30">
        <h3 className="font-semibold text-lg mb-4 text-[#00F5FF]">What is Unimatrix?</h3>
        <p className="text-[#94A3B8] leading-relaxed">
          Unimatrix is your universal AI memory layer. It stores context from your conversations 
          with ChatGPT, Claude, Gemini, and any other AI, making that context available 
          across all your devices and tools.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <FeatureCard
          icon={<Brain className="w-6 h-6 text-purple-400" />}
          title="Cross-LLM Memory"
          description="Start with ChatGPT, continue with Claude. Same context, always."
        />
        <FeatureCard
          icon={<Lock className="w-6 h-6 text-blue-400" />}
          title="End-to-End Encrypted"
          description="Your memories are encrypted before they leave your device."
        />
        <FeatureCard
          icon={<Zap className="w-6 h-6 text-yellow-400" />}
          title="Real-Time Sync"
          description="Access your memories instantly from any device or AI tool."
        />
      </div>

      <button
        onClick={onNext}
        className="w-full py-3 px-6 bg-[#00F5FF] hover:bg-[#00D9FF] text-[#0A0F1C] font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
      >
        Get Started
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}

function WorkspaceStep({ 
  workspaceName, 
  setWorkspaceName, 
  error, 
  onNext, 
  onBack, 
  loading 
}: { 
  workspaceName: string;
  setWorkspaceName: (name: string) => void;
  error: string;
  onNext: () => void;
  onBack: () => void;
  loading: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="bg-[#0A0F1C] rounded-xl p-6 border border-[#334155]/30">
        <h3 className="font-semibold text-lg mb-4 text-purple-400">Create Your First Workspace</h3>
        <p className="text-[#94A3B8] text-sm mb-4">
          Workspaces (we call them &quot;Palaces&quot;) help you organize memories by project, topic, or context.
        </p>
        
        <div>
          <label className="block text-sm font-medium text-[#F1F5F9] mb-2">Workspace Name</label>
          <input
            type="text"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            placeholder="e.g., My Projects, Research, Personal"
            className="w-full px-4 py-3 bg-[#111827] border border-[#334155]/50 rounded-lg text-[#F1F5F9] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
          />
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>

        <div className="mt-4 p-4 bg-purple-500/5 border border-purple-500/20 rounded-lg">
          <p className="text-sm text-purple-300">
            💡 You can create multiple workspaces later for different projects or contexts.
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 py-3 px-6 bg-[#111827] border border-[#334155]/50 rounded-lg text-[#F1F5F9] hover:bg-[#1a1f2e] transition-all flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <button
          onClick={onNext}
          disabled={loading}
          className="flex-1 py-3 px-6 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Continue'}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function EncryptionStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <div className="space-y-6">
      <div className="bg-[#0A0F1C] rounded-xl p-6 border border-[#334155]/30">
        <h3 className="font-semibold text-lg mb-4 text-blue-400">End-to-End Encryption</h3>
        <p className="text-[#94A3B8] text-sm mb-4">
          Your memories are encrypted on your device before they&apos;re stored. Even we can&apos;t read them.
        </p>

        <div className="space-y-3">
          <SecurityFeature
            title="Client-Side Encryption"
            description="Memories are encrypted using AES-256-GCM before they leave your device."
          />
          <SecurityFeature
            title="Zero-Knowledge"
            description="The encryption key never leaves your device. We only store encrypted data."
          />
          <SecurityFeature
            title="Military-Grade Security"
            description="Using the same encryption standards used by governments and enterprises."
          />
        </div>

        <div className="mt-4 p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
          <p className="text-sm text-blue-300">
            🔒 Your encryption password is set up automatically when you create your account.
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 py-3 px-6 bg-[#111827] border border-[#334155]/50 rounded-lg text-[#F1F5F9] hover:bg-[#1a1f2e] transition-all flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-3 px-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
        >
          I Understand
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function FirstMemoryStep({ 
  firstMemory, 
  setFirstMemory, 
  error, 
  onNext, 
  onBack, 
  loading 
}: { 
  firstMemory: string;
  setFirstMemory: (memory: string) => void;
  error: string;
  onNext: () => void;
  onBack: () => void;
  loading: boolean;
}) {
  const suggestions = [
    "I prefer TypeScript over JavaScript for new projects",
    "I'm working on a React Native mobile app",
    "My favorite programming language is Python",
    "I use VS Code as my primary editor",
  ];

  return (
    <div className="space-y-6">
      <div className="bg-[#0A0F1C] rounded-xl p-6 border border-[#334155]/30">
        <h3 className="font-semibold text-lg mb-4 text-yellow-400">Create Your First Memory (Optional)</h3>
        <p className="text-[#94A3B8] text-sm mb-4">
          Store something about yourself - a preference, a project you&apos;re working on, or anything you want your AI to remember.
          <span className="text-yellow-400/70 block mt-2">You can skip this step and create memories later from your dashboard.</span>
        </p>

        <div>
          <label className="block text-sm font-medium text-[#F1F5F9] mb-2">Your Memory (Optional)</label>
          <textarea
            value={firstMemory}
            onChange={(e) => setFirstMemory(e.target.value)}
            placeholder="e.g., I prefer dark mode in all my applications..."
            rows={4}
            className="w-full px-4 py-3 bg-[#111827] border border-[#334155]/50 rounded-lg text-[#F1F5F9] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all resize-none"
          />
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>

        <div className="mt-4">
          <p className="text-sm text-[#94A3B8] mb-2">Quick suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setFirstMemory(suggestion)}
                className="px-3 py-1.5 bg-[#111827] border border-[#334155]/50 rounded-full text-sm text-[#94A3B8] hover:text-[#F1F5F9] hover:border-[#00F5FF]/50 transition-all"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 py-3 px-6 bg-[#111827] border border-[#334155]/50 rounded-lg text-[#F1F5F9] hover:bg-[#1a1f2e] transition-all flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <button
          onClick={onNext}
          disabled={loading}
          className="flex-1 py-3 px-6 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Continue'}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function CompleteStep({ onDashboard }: { onDashboard: () => void }) {
  return (
    <div className="space-y-8 text-center">
      <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-10 h-10 text-green-500" />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">You&apos;re All Set! 🎉</h2>
        <p className="text-[#94A3B8]">
          Your Unimatrix is ready. You've created your first workspace and learned about our security features.
          You can now connect your AI tools and start building your memory vault.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 text-left">
        <NextStepCard
          title="Connect Claude Desktop"
          description="Set up Claude Desktop to use your Unimatrix memory"
          href="/setup/claude-desktop"
        />
        <NextStepCard
          title="Explore Your Dashboard"
          description="View your workspaces and create memories"
          action={onDashboard}
        />
      </div>

      <button
        onClick={onDashboard}
        className="w-full py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
      >
        Go to Dashboard
        <Rocket className="w-5 h-5" />
      </button>
    </div>
  );
}

// Helper Components
function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-[#0A0F1C] rounded-xl p-4 border border-[#334155]/30">
      <div className="mb-3">{icon}</div>
      <h4 className="font-semibold text-[#F1F5F9] mb-1">{title}</h4>
      <p className="text-sm text-[#94A3B8]">{description}</p>
    </div>
  );
}

function SecurityFeature({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-6 h-6 bg-blue-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
        <Lock className="w-3 h-3 text-blue-400" />
      </div>
      <div>
        <h4 className="font-medium text-[#F1F5F9] text-sm">{title}</h4>
        <p className="text-xs text-[#94A3B8] mt-1">{description}</p>
      </div>
    </div>
  );
}

function NextStepCard({ title, description, href, action }: { title: string; description: string; href?: string; action?: () => void }) {
  if (href) {
    return (
      <a href={href} className="block bg-[#0A0F1C] rounded-xl p-4 border border-[#334155]/30 hover:border-[#00F5FF]/50 transition-all">
        <h4 className="font-semibold text-[#F1F5F9] mb-1">{title}</h4>
        <p className="text-sm text-[#94A3B8]">{description}</p>
      </a>
    );
  }
  return (
    <button onClick={action} className="w-full text-left bg-[#0A0F1C] rounded-xl p-4 border border-[#334155]/30 hover:border-[#00F5FF]/50 transition-all">
      <h4 className="font-semibold text-[#F1F5F9] mb-1">{title}</h4>
      <p className="text-sm text-[#94A3B8]">{description}</p>
    </button>
  );
}
