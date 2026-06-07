'use client';

import React from 'react';

const loaderStyles = `
  @keyframes morph1 {
    0%, 100% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; }
    50% { border-radius: 70% 30% 30% 70% / 70% 70% 30% 30%; }
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @keyframes pulse-blob {
    0%, 100% { transform: scale(1); opacity: 0.7; }
    50% { transform: scale(1.3); opacity: 1; }
  }

  @keyframes orbit {
    0% { transform: translate(20px, 0) scale(1); opacity: 1; }
    50% { transform: translate(0, 20px) scale(0.7); opacity: 0.6; }
    100% { transform: translate(-20px, 0) scale(1); opacity: 1; }
  }

  @keyframes expand-ring {
    0% { transform: scale(0.3); opacity: 1; }
    100% { transform: scale(1); opacity: 0; }
  }

  @keyframes bounce {
    0%, 100% { transform: scaleY(1); }
    50% { transform: scaleY(1.8); }
  }

  @keyframes rotate-spiral {
    to { transform: rotate(360deg); }
  }

  @keyframes morph-random {
    0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
    25% { border-radius: 30% 60% 70% 40% / 40% 70% 30% 60%; }
    50% { border-radius: 70% 30% 40% 60% / 30% 40% 60% 70%; }
    75% { border-radius: 40% 70% 60% 30% / 70% 60% 40% 30%; }
    100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
  }

  @keyframes float-particle {
    0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
    50% { transform: translate(var(--x), var(--y)) scale(1.2); opacity: 1; }
  }

  @keyframes rotate-ring {
    to { transform: rotate(360deg); }
  }

  @keyframes pulse-glow {
    0%, 100% { transform: translate(-50%, -50%) scale(1); }
    50% { transform: translate(-50%, -50%) scale(1.4); }
  }

  @keyframes pulse-ring {
    0% { transform: scale(0.5); opacity: 1; }
    100% { transform: scale(1.5); opacity: 0; }
  }

  @keyframes twist {
    0%, 100% { transform: translate(-50%, -50%) rotateY(0deg) rotateX(0deg); }
    50% { transform: translate(-50%, -50%) rotateY(180deg) rotateX(20deg); }
  }

  @keyframes breathe {
    0%, 100% { transform: scale(1); opacity: 0.8; }
    50% { transform: scale(1.3); opacity: 1; }
  }

  @keyframes rotate-around {
    0% { transform: translate(24px, 0) rotate(0deg); }
    100% { transform: translate(24px, 0) rotate(360deg); }
  }

  @keyframes wave {
    0%, 100% { transform: scaleY(0.5); }
    50% { transform: scaleY(2); }
  }

  @keyframes liquid {
    0%, 100% { border-radius: 36% 64% 64% 36% / 64% 36% 64% 36%; }
    25% { border-radius: 64% 36% 36% 64% / 36% 64% 36% 64%; }
    50% { border-radius: 36% 64% 64% 36% / 36% 64% 36% 64%; }
    75% { border-radius: 64% 36% 36% 64% / 64% 36% 64% 36%; }
  }

  @keyframes pulse-scale {
    0% { transform: scale(0.3); opacity: 1; }
    100% { transform: scale(1); opacity: 0; }
  }

  @keyframes rotate-segment {
    0% { opacity: 0.3; transform: scale(0.7); }
    50% { opacity: 1; transform: scale(1); }
    100% { opacity: 0.3; transform: scale(0.7); }
  }

  @keyframes morph-move {
    0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; transform: translate(0, 0); }
    50% { border-radius: 30% 60% 70% 40% / 40% 70% 30% 60%; transform: translate(10px, 10px); }
  }

  @keyframes spin-gradient {
    to { transform: rotate(360deg); }
  }

  @keyframes infinity-move {
    0% { transform: translate(0, 0) scale(1); opacity: 1; }
    25% { transform: translate(15px, -15px) scale(1.2); opacity: 0.8; }
    50% { transform: translate(20px, 0) scale(0.8); opacity: 0.6; }
    75% { transform: translate(15px, 15px) scale(1.2); opacity: 0.8; }
    100% { transform: translate(0, 0) scale(1); opacity: 1; }
  }
`;

interface LoaderProps {
  size?: 'small' | 'medium' | 'large';
}

const sizeMap = {
  small: 40,
  medium: 60,
  large: 80,
};

// Loader 1: Rotating Morphing Blob
export function Loader1({ size = 'medium' }: LoaderProps) {
  const px = sizeMap[size];
  return (
    <>
      <style>{loaderStyles}</style>
      <div
        style={{
          width: px,
          height: px,
          background: '#ff7a00',
          borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
          animation: 'morph1 3s ease-in-out infinite, spin 4s linear infinite',
          filter: 'drop-shadow(0 0 10px rgba(255, 122, 0, 0.6))',
        }}
      />
    </>
  );
}

// Loader 2: Pulsing Double Blob
export function Loader2({ size = 'medium' }: LoaderProps) {
  const px = sizeMap[size];
  const halfPx = px / 2;
  return (
    <>
      <style>{loaderStyles}</style>
      <div style={{ position: 'relative', width: px, height: px }}>
        <div
          style={{
            position: 'absolute',
            width: halfPx,
            height: halfPx,
            background: '#ff7a00',
            borderRadius: '40% 60% 50% 50%',
            filter: 'drop-shadow(0 0 8px rgba(255, 122, 0, 0.5))',
            animation: 'pulse-blob 1.5s ease-in-out infinite',
            top: 0,
            left: 0,
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: halfPx,
            height: halfPx,
            background: '#ff7a00',
            borderRadius: '40% 60% 50% 50%',
            filter: 'drop-shadow(0 0 8px rgba(255, 122, 0, 0.5))',
            animation: 'pulse-blob 1.5s ease-in-out infinite 0.3s',
            bottom: 0,
            right: 0,
          }}
        />
      </div>
    </>
  );
}

// Loader 12: Breathing Blob
export function Loader12({ size = 'medium' }: LoaderProps) {
  const px = sizeMap[size];
  return (
    <>
      <style>{loaderStyles}</style>
      <div
        style={{
          width: px,
          height: px,
          background: '#ff7a00',
          borderRadius: '45% 55% 52% 48% / 48% 45% 55% 52%',
          animation: 'breathe 2.5s ease-in-out infinite',
          filter: 'drop-shadow(0 0 14px rgba(255, 122, 0, 0.7))',
        }}
      />
    </>
  );
}

// Loader 15: Liquid Blob
export function Loader15({ size = 'medium' }: LoaderProps) {
  const px = sizeMap[size];
  return (
    <>
      <style>{loaderStyles}</style>
      <div
        style={{
          width: px,
          height: px,
          background: '#ff7a00',
          borderRadius: '36% 64% 64% 36% / 64% 36% 64% 36%',
          animation: 'liquid 3s ease-in-out infinite',
          filter: 'drop-shadow(0 0 12px rgba(255, 122, 0, 0.6))',
        }}
      />
    </>
  );
}

// Loader 7: Morphing Circle
export function Loader7({ size = 'medium' }: LoaderProps) {
  const px = sizeMap[size];
  return (
    <>
      <style>{loaderStyles}</style>
      <div
        style={{
          width: px,
          height: px,
          background: '#ff7a00',
          borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
          animation: 'morph-random 3s ease-in-out infinite',
          filter: 'drop-shadow(0 0 12px rgba(255, 122, 0, 0.7))',
        }}
      />
    </>
  );
}

// Loader 19: Spinning Gradient
export function Loader19({ size = 'medium' }: LoaderProps) {
  const px = sizeMap[size];
  return (
    <>
      <style>{loaderStyles}</style>
      <div
        style={{
          width: px,
          height: px,
          background: 'conic-gradient(from 45deg, #ff7a00, #ff7a00 45deg, transparent 45deg, transparent 90deg)',
          borderRadius: '50%',
          animation: 'spin-gradient 2s linear infinite',
          filter: 'drop-shadow(0 0 10px rgba(255, 122, 0, 0.5))',
        }}
      />
    </>
  );
}

// Loader 16: Pulsing Rings (DEFAULT - best for general use)
export function LoaderDefault({ size = 'medium' }: LoaderProps) {
  const px = sizeMap[size];
  const borderWidth = px / 20;
  return (
    <>
      <style>{loaderStyles}</style>
      <div style={{ position: 'relative', width: px, height: px }}>
        {[0, 0.5, 1].map((delay, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              border: `${borderWidth}px solid #ff7a00`,
              borderRadius: '50%',
              filter: 'drop-shadow(0 0 6px rgba(255, 122, 0, 0.4))',
              animation: `pulse-scale 1.5s ease-out infinite ${delay}s`,
            }}
          />
        ))}
      </div>
    </>
  );
}

// Export all loaders for showcase
export const LOADERS = [
  { name: 'Rotating Morph', Component: Loader1 },
  { name: 'Double Pulse', Component: Loader2 },
  { name: 'Morphing Circle', Component: Loader7 },
  { name: 'Breathing', Component: Loader12 },
  { name: 'Liquid', Component: Loader15 },
  { name: 'Spinning Gradient', Component: Loader19 },
  { name: 'Pulsing Rings (Default)', Component: LoaderDefault },
];
