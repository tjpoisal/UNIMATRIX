'use client';

import Link from 'next/link';
import { ArrowRight, Shield, Zap, Cloud, Lock, Smartphone, Code2, Check, Building2, Map, Sparkles, Brain } from 'lucide-react';

export function MarketingPagePalace() {
  return (
    <div className="min-h-screen bg-[#0e1030] text-[#F1F5F9]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#0e1030]/95 backdrop-blur-md border-b border-[#334155]/30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold flex items-center gap-2">
            <span className="text-2xl">🏛️</span>
            <span>
              Uni<span className="text-[#ff7a00]">matrix</span>
            </span>
          </div>
          <div className="hidden md:flex gap-8">
            <a href="#features" className="text-[#94A3B8] hover:text-[#ff7a00] transition">Features</a>
            <a href="#pricing" className="text-[#94A3B8] hover:text-[#ff7a00] transition">Pricing</a>
            <a href="#how" className="text-[#94A3B8] hover:text-[#ff7a00] transition">How It Works</a>
          </div>
          <div className="flex gap-3">
            <Link href="/auth/login" className="px-4 py-2 text-[#94A3B8] hover:text-[#ff7a00] transition">
              Sign In
            </Link>
            <Link href="/auth/register" className="px-6 py-2 bg-[#ff7a00] hover:bg-[#ff8a1a] text-[#0e1030] rounded-lg font-bold transition">
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO — Your AI Memory Palace */}
      <section className="pt-20 pb-32 px-6 relative overflow-hidden">
        {/* Background palace visualization (CSS gradient) */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#ff7a00] rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#334155] rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-12">
            {/* Tagline */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#111827] border border-[#334155]/30 rounded-full mb-6">
              <span className="text-[#ff7a00]">🏛️</span>
              <span className="text-sm text-[#94A3B8]">Your AI Memory Palace</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight">
              Persistent, Spatial Memory<br />for Any LLM
            </h1>

            {/* Subheading */}
            <p className="text-xl text-[#94A3B8] mb-8 max-w-3xl mx-auto leading-relaxed">
              Build your AI memory palace. ChatGPT on your phone. Claude on your tablet. Gemini on desktop. Same full context, every device. Cross-LLM continuity with privacy-first encryption.
            </p>

            {/* Author/Context */}
            <p className="text-[#64748B] text-sm mb-12">
              Timothy J. Poisal • NSF SBIR Phase 1 • Production Ready
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register" className="px-8 py-4 bg-[#ff7a00] hover:bg-[#ff8a1a] text-[#0e1030] rounded-lg font-bold text-lg transition shadow-lg shadow-[#ff7a00]/40">
                Get Started Free <ArrowRight className="inline ml-2 w-5 h-5" />
              </Link>
              <a href="#how" className="px-8 py-4 border border-[#334155]/30 hover:border-[#ff7a00]/50 text-[#F1F5F9] rounded-lg font-bold transition">
                Watch Demo
              </a>
            </div>

            {/* Trust Signals */}
            <div className="mt-12 text-[#64748B] text-sm">
              <p>No credit card • Encrypted end-to-end • Works with any AI</p>
            </div>
          </div>

          {/* Palace ASCII Art Placeholder (real image would go here) */}
          <div className="mt-20 relative h-80 bg-gradient-to-b from-[#111827] to-[#0a0f25] border border-[#334155]/30 rounded-lg overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🏛️</div>
                <p className="text-[#94A3B8]">Your Memory Palace Visualization</p>
                <p className="text-sm text-[#64748B]">(3D palace with rooms = contexts/devices)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES — Three Pillar Design */}
      <section id="features" className="py-20 px-6 bg-[#111827]/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Why Unimatrix?</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Private & Secure */}
            <div className="bg-[#111827] border border-[#334155]/30 rounded-lg p-8 hover:border-[#ff7a00]/50 transition">
              <div className="w-12 h-12 bg-[#ff7a00]/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-[#ff7a00]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Private & Secure</h3>
              <p className="text-[#94A3B8]">
                End-to-end encrypted. Server never sees plaintext. Your memories stay yours. AES-256-GCM encryption with PBKDF2 key derivation.
              </p>
            </div>

            {/* Cross-Device Sync */}
            <div className="bg-[#111827] border border-[#334155]/30 rounded-lg p-8 hover:border-[#ff7a00]/50 transition">
              <div className="w-12 h-12 bg-[#ff7a00]/10 rounded-lg flex items-center justify-center mb-4">
                <Smartphone className="w-6 h-6 text-[#ff7a00]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Cross-Device Sync</h3>
              <p className="text-[#94A3B8]">
                iPhone → iPad → Desktop. Every memory syncs instantly. Access your palace from any device. Same full context everywhere.
              </p>
            </div>

            {/* AI-Powered */}
            <div className="bg-[#111827] border border-[#334155]/30 rounded-lg p-8 hover:border-[#ff7a00]/50 transition">
              <div className="w-12 h-12 bg-[#ff7a00]/10 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-[#ff7a00]" />
              </div>
              <h3 className="text-xl font-bold mb-3">AI-Powered</h3>
              <p className="text-[#94A3B8]">
                Proprietary fine-tuned model. Organization, analysis, and intelligent recall. Coming Week 2: Librarian AI recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — Building Your Palace */}
      <section id="how" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Building Your Memory Palace</h2>

          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="w-12 h-12 rounded-full bg-[#ff7a00] text-[#0e1030] font-bold flex items-center justify-center flex-shrink-0 text-lg">1</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Create Your Palace</h3>
                <p className="text-[#94A3B8]">Sign up in seconds. Set up your memory palace with your encryption password.</p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-12 h-12 rounded-full bg-[#ff7a00] text-[#0e1030] font-bold flex items-center justify-center flex-shrink-0 text-lg">2</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Build Rooms (Contexts)</h3>
                <p className="text-[#94A3B8]">Organize memories into rooms: Projects, Learning, Research. Each LLM gets its own room or shares.</p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-12 h-12 rounded-full bg-[#ff7a00] text-[#0e1030] font-bold flex items-center justify-center flex-shrink-0 text-lg">3</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Save Memories</h3>
                <p className="text-[#94A3B8]">Use browser extension, MCP protocol, or web UI to save conversations. Encrypted instantly.</p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-12 h-12 rounded-full bg-[#ff7a00] text-[#0e1030] font-bold flex items-center justify-center flex-shrink-0 text-lg">4</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Recall & Access</h3>
                <p className="text-[#94A3B8]">Any LLM can recall from your palace. ChatGPT picks up where Claude left off. Full context preserved.</p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link href="/auth/register" className="inline-block px-8 py-4 bg-[#ff7a00] hover:bg-[#ff8a1a] text-[#0e1030] rounded-lg font-bold transition shadow-lg shadow-[#ff7a00]/40">
              Start Building Your Palace
            </Link>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-20 px-6 bg-[#111827]/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Simple Pricing</h2>
          <p className="text-center text-[#94A3B8] mb-16 max-w-2xl mx-auto">
            Start free. Upgrade when you need more. No surprises, no hidden fees.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* FREE */}
            <div className="bg-[#111827] border border-[#334155]/30 rounded-lg p-8 flex flex-col">
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <div className="text-[#ff7a00] text-4xl font-bold mb-6">$0<span className="text-base text-[#94A3B8]">/mo</span></div>
              <ul className="text-[#94A3B8] space-y-3 mb-8 flex-grow">
                <li className="flex items-start"><Check className="w-5 h-5 text-[#ff7a00] mr-3 flex-shrink-0 mt-0.5" /> 3 workspaces</li>
                <li className="flex items-start"><Check className="w-5 h-5 text-[#ff7a00] mr-3 flex-shrink-0 mt-0.5" /> 1,000 memories</li>
                <li className="flex items-start"><Check className="w-5 h-5 text-[#ff7a00] mr-3 flex-shrink-0 mt-0.5" /> 2 devices</li>
                <li className="flex items-start"><Check className="w-5 h-5 text-[#ff7a00] mr-3 flex-shrink-0 mt-0.5" /> Any LLM</li>
                <li className="flex items-start"><Check className="w-5 h-5 text-[#ff7a00] mr-3 flex-shrink-0 mt-0.5" /> Encrypted</li>
              </ul>
              <Link href="/auth/register" className="w-full py-3 bg-[#1F2937] hover:bg-[#374151] text-[#F1F5F9] rounded-lg font-bold transition border border-[#334155]/30">
                Get Started
              </Link>
            </div>

            {/* PRO — Featured */}
            <div className="bg-[#111827] border-2 border-[#ff7a00] rounded-lg p-8 flex flex-col relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#ff7a00] text-[#0e1030] px-4 py-1 rounded-full text-sm font-bold">
                POPULAR
              </div>
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <div className="text-[#ff7a00] text-4xl font-bold mb-6">$9.99<span className="text-base text-[#94A3B8]">/mo</span></div>
              <ul className="text-[#94A3B8] space-y-3 mb-8 flex-grow">
                <li className="flex items-start"><Check className="w-5 h-5 text-[#ff7a00] mr-3 flex-shrink-0 mt-0.5" /> Unlimited workspaces</li>
                <li className="flex items-start"><Check className="w-5 h-5 text-[#ff7a00] mr-3 flex-shrink-0 mt-0.5" /> Unlimited memories</li>
                <li className="flex items-start"><Check className="w-5 h-5 text-[#ff7a00] mr-3 flex-shrink-0 mt-0.5" /> Unlimited devices</li>
                <li className="flex items-start"><Check className="w-5 h-5 text-[#ff7a00] mr-3 flex-shrink-0 mt-0.5" /> Librarian AI (coming)</li>
                <li className="flex items-start"><Check className="w-5 h-5 text-[#ff7a00] mr-3 flex-shrink-0 mt-0.5" /> Priority support</li>
              </ul>
              <Link href="/auth/register" className="w-full py-3 bg-[#ff7a00] hover:bg-[#ff8a1a] text-[#0e1030] rounded-lg font-bold transition">
                Start Free Trial
              </Link>
            </div>

            {/* ENTERPRISE */}
            <div className="bg-[#111827] border border-[#334155]/30 rounded-lg p-8 flex flex-col">
              <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
              <div className="text-[#ff7a00] text-4xl font-bold mb-6">Custom</div>
              <ul className="text-[#94A3B8] space-y-3 mb-8 flex-grow">
                <li className="flex items-start"><Check className="w-5 h-5 text-[#ff7a00] mr-3 flex-shrink-0 mt-0.5" /> Self-hosted</li>
                <li className="flex items-start"><Check className="w-5 h-5 text-[#ff7a00] mr-3 flex-shrink-0 mt-0.5" /> Team management</li>
                <li className="flex items-start"><Check className="w-5 h-5 text-[#ff7a00] mr-3 flex-shrink-0 mt-0.5" /> SLA guarantee</li>
                <li className="flex items-start"><Check className="w-5 h-5 text-[#ff7a00] mr-3 flex-shrink-0 mt-0.5" /> Custom integrations</li>
                <li className="flex items-start"><Check className="w-5 h-5 text-[#ff7a00] mr-3 flex-shrink-0 mt-0.5" /> Audit logs</li>
              </ul>
              <a href="mailto:hello@deployunimatrix.com" className="w-full py-3 bg-[#1F2937] hover:bg-[#374151] text-[#F1F5F9] rounded-lg font-bold transition border border-[#334155]/30 text-center">
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 bg-[#0a0f25]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Build Your Memory Palace?</h2>
          <p className="text-xl text-[#94A3B8] mb-8">
            Join thousands building the future of AI memory.
          </p>
          <Link href="/auth/register" className="inline-block px-8 py-4 bg-[#ff7a00] hover:bg-[#ff8a1a] text-[#0e1030] rounded-lg font-bold text-lg transition shadow-lg shadow-[#ff7a00]/40">
            Create Free Account <ArrowRight className="inline ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[#334155]/30 bg-[#0a0f25]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="text-xl font-bold mb-4">
              Uni<span className="text-[#ff7a00]">matrix</span>
            </div>
            <p className="text-[#94A3B8] text-sm">Your AI remembers everything, everywhere.</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Product</h4>
            <ul className="space-y-2 text-[#94A3B8] text-sm">
              <li><Link href="/pricing" className="hover:text-[#ff7a00] transition">Pricing</Link></li>
              <li><Link href="/docs" className="hover:text-[#ff7a00] transition">Docs</Link></li>
              <li><Link href="/downloads" className="hover:text-[#ff7a00] transition">Downloads</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-[#94A3B8] text-sm">
              <li><a href="#" className="hover:text-[#ff7a00] transition">About</a></li>
              <li><a href="#" className="hover:text-[#ff7a00] transition">Blog</a></li>
              <li><a href="mailto:hello@deployunimatrix.com" className="hover:text-[#ff7a00] transition">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-[#94A3B8] text-sm">
              <li><a href="/privacy" className="hover:text-[#ff7a00] transition">Privacy</a></li>
              <li><a href="/terms" className="hover:text-[#ff7a00] transition">Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[#334155]/30 pt-8 text-center text-[#64748B] text-sm">
          <p>&copy; 2026 Unimatrix. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
