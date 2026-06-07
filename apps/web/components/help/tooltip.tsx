'use client';

import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

interface TooltipProps {
  content: string;
  title?: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ content, title, children, position = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2',
  };

  return (
    <div className="relative inline-block group">
      {children}

      {isVisible && (
        <div
          className={`absolute ${positionClasses[position]} left-1/2 -translate-x-1/2 bg-[#1F2937] border border-[#334155]/50 rounded-lg p-3 shadow-lg z-50 max-w-xs`}
        >
          {title && <p className="font-bold text-[#ff7a00] text-sm mb-1">{title}</p>}
          <p className="text-[#94A3B8] text-sm leading-relaxed">{content}</p>
          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-2 right-2 text-[#64748B] hover:text-[#F1F5F9]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {!isVisible && (
        <button
          onClick={() => setIsVisible(true)}
          className="ml-1 inline-flex text-[#64748B] hover:text-[#ff7a00] transition"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  cta: {
    text: string;
    onClick: () => void;
  };
  suggestedAction?: string;
}

export function EmptyState({ icon, title, description, cta, suggestedAction }: EmptyStateProps) {
  return (
    <div className="min-h-96 flex flex-col items-center justify-center p-8 text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <p className="text-[#94A3B8] mb-8 max-w-sm">{description}</p>

      <button
        onClick={cta.onClick}
        className="px-6 py-3 bg-[#ff7a00] hover:bg-[#ff8a1a] text-[#0e1030] rounded-lg font-bold transition mb-6"
      >
        {cta.text}
      </button>

      {suggestedAction && (
        <p className="text-sm text-[#64748B]">
          💡 <em>{suggestedAction}</em>
        </p>
      )}
    </div>
  );
}

interface OnboardingPromptProps {
  step: number;
  totalSteps: number;
  title: string;
  content: string;
  showNextButton: boolean;
  onNext: () => void;
  onDismiss: () => void;
}

export function OnboardingPrompt({
  step,
  totalSteps,
  title,
  content,
  showNextButton,
  onNext,
  onDismiss,
}: OnboardingPromptProps) {
  return (
    <div className="fixed bottom-6 right-6 bg-[#111827] border border-[#334155]/30 rounded-lg p-6 shadow-lg max-w-sm z-40 animate-in fade-in">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-[#ff7a00]">
          Tip {step} of {totalSteps}
        </h3>
        <button onClick={onDismiss} className="text-[#64748B] hover:text-[#F1F5F9]">
          <X className="w-4 h-4" />
        </button>
      </div>

      <h4 className="font-bold text-lg mb-2">{title}</h4>
      <p className="text-[#94A3B8] text-sm mb-4">{content}</p>

      <div className="flex justify-between items-center">
        <div className="flex gap-1">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full ${
                i < step ? 'bg-[#ff7a00] w-4' : 'bg-[#334155]/30 w-2'
              }`}
            />
          ))}
        </div>

        {showNextButton && (
          <button
            onClick={onNext}
            className="px-3 py-1 text-sm bg-[#ff7a00] hover:bg-[#ff8a1a] text-[#0e1030] rounded font-bold transition"
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
}

interface HotspotProps {
  label: string;
  x: number;
  y: number;
  onClick: () => void;
}

export function Hotspot({ label, x, y, onClick }: HotspotProps) {
  return (
    <button
      onClick={onClick}
      className="absolute bg-[#ff7a00] rounded-full animate-pulse cursor-pointer"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: '40px',
        height: '40px',
        transform: 'translate(-50%, -50%)',
      }}
      title={label}
    >
      <span className="absolute inset-0 rounded-full border-2 border-[#ff7a00] opacity-75 animate-ping" />
    </button>
  );
}
