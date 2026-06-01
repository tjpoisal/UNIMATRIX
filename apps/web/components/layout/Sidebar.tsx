'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isOpen }: SidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: '~' },
    { label: 'Workspaces', href: '/palace', icon: 'W' },
    { label: 'Search', href: '/search', icon: 'S' },
    { label: 'Friends', href: '/friends', icon: 'F' },
    { label: 'Connect AIs', href: '/onboarding', icon: '+' },
    { label: 'Settings', href: '/settings', icon: '=' },
  ];

  const isActive = (href: string) => href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  return (
    <div
      className={`bg-surface border-r border-border/30 backdrop-blur-xl transition-all duration-300 flex flex-col ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Logo */}
      <div className="p-6 border-b border-border/30">
        <div className="flex items-center gap-3">
          <Image
            src="/LOGO_DARK_BACKGROUND.png"
            alt="Unimatrix"
            width={36}
            height={40}
            className="flex-shrink-0"
          />
          {isOpen && (
            <span className="font-black text-lg tracking-tight leading-none">
              <span className="text-accent">UNI</span>
              <span className="text-[#8892A4]">MATRIX</span>
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive(item.href)
                ? 'bg-accent/10 border border-accent/30 text-accent'
                : 'text-text-secondary hover:bg-surface-elevated hover:text-text'
            }`}
          >
            <span className="text-sm font-bold font-mono w-5 text-center flex-shrink-0">{item.icon}</span>
            {isOpen && <span className="text-sm font-medium">{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Upgrade CTA — shown only for free users */}
      {session?.user?.tier !== 'pro' && (
        <div className="px-4 pb-3">
          <Link
            href="/pricing"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-[accent-secondary]/20 to-[accent]/10 border border-accent-secondary/30 hover:border-accent-secondary/60 transition-all duration-200 ${
              isOpen ? '' : 'justify-center'
            }`}
          >
            <span className="text-xs font-bold text-accent-secondary flex-shrink-0">PRO</span>
            {isOpen && (
              <div className="min-w-0">
                <p className="text-xs font-bold text-accent-secondary">Upgrade to Pro</p>
                <p className="text-[10px] text-[#64748B] truncate">Unlimited workspaces &amp; memory</p>
              </div>
            )}
          </Link>
        </div>
      )}

      {/* User Section */}
      <div className="p-4 border-t border-border/30 space-y-3">
        {session && (
          <div className={`flex items-center gap-3 ${isOpen ? 'flex-row' : 'flex-col'}`}>
            <div className="w-8 h-8 rounded-lg bg-[accent-secondary] flex items-center justify-center text-text text-sm font-bold">
              {session.user?.name?.[0] || 'U'}
            </div>
            {isOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text truncate">
                  {session.user?.name}
                </p>
                <p className="text-xs text-[#64748B] truncate">
                  {session.user?.email}
                </p>
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => signOut({ redirect: true, callbackUrl: '/auth/login' })}
          className="w-full px-4 py-2 text-sm bg-[#1F2937] hover:bg-[#2D3748] text-text rounded-lg transition-all duration-200"
        >
          {isOpen ? 'Sign Out' : '→'}
        </button>
      </div>
    </div>
  );
}
