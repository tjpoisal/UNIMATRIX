'use client';

import Link from 'next/link';
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
    { label: 'Dashboard', href: '/dashboard', icon: '🏠' },
    { label: 'Palaces', href: '/palaces', icon: '🏛️' },
    { label: 'Search', href: '/search', icon: '🔍' },
    { label: 'Settings', href: '/settings', icon: '⚙️' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div
      className={`bg-[#111827] border-r border-[#334155]/30 backdrop-blur-xl transition-all duration-300 flex flex-col ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Logo */}
      <div className="p-6 border-b border-[#334155]/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00F5FF] to-[#A855F7] flex items-center justify-center">
            <span className="text-[#0A0F1C] font-bold text-sm">M</span>
          </div>
          {isOpen && <span className="text-[#F1F5F9] font-bold">Unimatrix</span>}
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
                ? 'bg-[#00F5FF]/10 border border-[#00F5FF]/30 text-[#00F5FF]'
                : 'text-[#94A3B8] hover:bg-[#1F2937] hover:text-[#F1F5F9]'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {isOpen && <span className="text-sm font-medium">{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-[#334155]/30 space-y-3">
        {session && (
          <div className={`flex items-center gap-3 ${isOpen ? 'flex-row' : 'flex-col'}`}>
            <div className="w-8 h-8 rounded-lg bg-[#A855F7] flex items-center justify-center text-[#F1F5F9] text-sm font-bold">
              {session.user?.name?.[0] || 'U'}
            </div>
            {isOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#F1F5F9] truncate">
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
          className="w-full px-4 py-2 text-sm bg-[#1F2937] hover:bg-[#2D3748] text-[#F1F5F9] rounded-lg transition-all duration-200"
        >
          {isOpen ? 'Sign Out' : '→'}
        </button>
      </div>
    </div>
  );
}
