'use client';

import Link from 'next/link';
import Image from 'next/image';

export function MarketingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0e1030] via-[#1a1f3a] to-[#0e1030] text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#0e1030]/90 backdrop-blur-md border-b border-[#ff7a00]/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold">
            Uni<span className="text-[#ff7a00]">matrix</span>
          </div>
          <div className="hidden md:flex gap-8">
            <a href="#features" className="hover:text-[#ff7a00] transition">Features</a>
            <a href="#pricing" className="hover:text-[#ff7a00] transition">Pricing</a>
            <a href="#how" className="hover:text-[#ff7a00] transition">How It Works</a>
            <a href="#faq" className="hover:text-[#ff7a00] transition">FAQ</a>
          </div>
          <div className="flex gap-3">
            <Link href="/auth/login" className="px-4 py-2 text-gray-300 hover:text-[#ff7a00] transition">
              Sign In
            </Link>
            <Link href="/auth/register" className="px-6 py-2 bg-[#ff7a00] hover:brightness-110 text-[#0e1030] rounded-lg font-bold transition">
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO — STAGE 1 OF FUNNEL */}
      <section className="pt-32 pb-24 px-6 relative">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,122,0,0.1),transparent_70%)] pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight">
              Your AI Remembers<br /><span className="text-[#ff7a00]">Everything</span>
            </h1>
            <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
              Start a conversation with ChatGPT on your iPhone. Pick up your iPad. Open Claude. Full context, zero re-explaining.
              <strong> That's Unimatrix.</strong>
            </p>

            {/* CTA Button — Primary Conversion Point */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register" className="px-8 py-4 bg-[#ff7a00] hover:brightness-110 text-[#0e1030] rounded-lg font-bold text-lg transition shadow-lg shadow-[#ff7a00]/40">
                Get Started Free <ArrowRight className="inline ml-2 w-5 h-5" />
              </Link>
              <a href="#how" className="px-8 py-4 border-2 border-[#ff7a00]/50 hover:border-[#ff7a00] text-white rounded-lg font-bold transition">
                See How It Works
              </a>
            </div>

            {/* Trust signals */}
            <div className="mt-12 text-gray-400 text-sm">
              <p className="mb-4">No credit card required • Works with any AI • Encrypted end-to-end</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES — STAGE 2: Value Prop */}
      <section id="features" className="py-20 px-6 bg-[#0a0f25]/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Why Choose Unimatrix?</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#1a1f3a]/60 border border-[#ff7a00]/20 rounded-lg p-8 hover:border-[#ff7a00]/50 transition">
              <Zap className="w-12 h-12 text-[#ff7a00] mb-4" />
              <h3 className="text-xl font-bold mb-3">Cross-LLM Continuity</h3>
              <p className="text-gray-400">
                ChatGPT → Claude → Gemini. Same conversation, full context. No re-explaining.
              </p>
            </div>

            <div className="bg-[#1a1f3a]/60 border border-[#ff7a00]/20 rounded-lg p-8 hover:border-[#ff7a00]/50 transition">
              <Shield className="w-12 h-12 text-[#ff7a00] mb-4" />
              <h3 className="text-xl font-bold mb-3">Encrypted by Default</h3>
              <p className="text-gray-400">
                End-to-end encryption. Server never sees plaintext. Your memories stay yours.
              </p>
            </div>

            <div className="bg-[#1a1f3a]/60 border border-[#ff7a00]/20 rounded-lg p-8 hover:border-[#ff7a00]/50 transition">
              <Cloud className="w-12 h-12 text-[#ff7a00] mb-4" />
              <h3 className="text-xl font-bold mb-3">Cloud + Self-Hosted</h3>
              <p className="text-gray-400">
                Use cloud for convenience. Self-host for total privacy. Your choice.
              </p>
            </div>

            <div className="bg-[#1a1f3a]/60 border border-[#ff7a00]/20 rounded-lg p-8 hover:border-[#ff7a00]/50 transition">
              <Smartphone className="w-12 h-12 text-[#ff7a00] mb-4" />
              <h3 className="text-xl font-bold mb-3">Everywhere</h3>
              <p className="text-gray-400">
                Phone, tablet, desktop, Mac, Linux. Memory syncs instantly everywhere.
              </p>
            </div>

            <div className="bg-[#1a1f3a]/60 border border-[#ff7a00]/20 rounded-lg p-8 hover:border-[#ff7a00]/50 transition">
              <Code2 className="w-12 h-12 text-[#ff7a00] mb-4" />
              <h3 className="text-xl font-bold mb-3">MCP Standard</h3>
              <p className="text-gray-400">
                Built on Model Context Protocol. No vendor lock-in. Open standard.
              </p>
            </div>

            <div className="bg-[#1a1f3a]/60 border border-[#ff7a00]/20 rounded-lg p-8 hover:border-[#ff7a00]/50 transition">
              <Lock className="w-12 h-12 text-[#ff7a00] mb-4" />
              <h3 className="text-xl font-bold mb-3">Zero API Dependency</h3>
              <p className="text-gray-400">
                Local embeddings. Proprietary AI. No external service calls needed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — STAGE 3: Build confidence */}
      <section id="how" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>

          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-full bg-[#ff7a00] text-[#0e1030] font-bold flex items-center justify-center flex-shrink-0">1</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Create Your Account</h3>
                <p className="text-gray-400">Sign up in 30 seconds. No credit card needed. Get 3 free workspaces immediately.</p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-full bg-[#ff7a00] text-[#0e1030] font-bold flex items-center justify-center flex-shrink-0">2</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Connect Your LLMs</h3>
                <p className="text-gray-400">Add the Unimatrix MCP endpoint to Claude Desktop, Cursor, or any MCP-compatible tool. Takes 2 minutes.</p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-full bg-[#ff7a00] text-[#0e1030] font-bold flex items-center justify-center flex-shrink-0">3</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Start Remembering</h3>
                <p className="text-gray-400">Every conversation is stored, encrypted, and synced. Switch between LLMs. Same context everywhere.</p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link href="/auth/register" className="inline-block px-8 py-4 bg-[#ff7a00] hover:brightness-110 text-[#0e1030] rounded-lg font-bold transition shadow-lg shadow-[#ff7a00]/40">
              Start Free Now
            </Link>
          </div>
        </div>
      </section>

      {/* PRICING — STAGE 4: Conversion decision */}
      <section id="pricing" className="py-20 px-6 bg-[#0a0f25]/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Simple, Transparent Pricing</h2>
          <p className="text-center text-gray-400 mb-16 max-w-2xl mx-auto">
            No surprises. No hidden fees. Start free, upgrade when you need more.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* FREE */}
            <div className="bg-[#1a1f3a]/80 border border-[#ff7a00]/20 rounded-lg p-8 flex flex-col">
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <div className="text-[#ff7a00] text-4xl font-bold mb-6">$0<span className="text-base text-gray-400">/mo</span></div>
              <ul className="text-gray-400 space-y-3 mb-8 flex-grow">
                <li className="flex items-start"><Check className="w-5 h-5 text-[#ff7a00] mr-3 flex-shrink-0 mt-0.5" /> 3 workspaces</li>
                <li className="flex items-start"><Check className="w-5 h-5 text-[#ff7a00] mr-3 flex-shrink-0 mt-0.5" /> 1,000 memories</li>
                <li className="flex items-start"><Check className="w-5 h-5 text-[#ff7a00] mr-3 flex-shrink-0 mt-0.5" /> 2 devices</li>
                <li className="flex items-start"><Check className="w-5 h-5 text-[#ff7a00] mr-3 flex-shrink-0 mt-0.5" /> Any LLM</li>
                <li className="flex items-start"><Check className="w-5 h-5 text-[#ff7a00] mr-3 flex-shrink-0 mt-0.5" /> End-to-end encrypted</li>
              </ul>
              <Link href="/auth/register" className="w-full py-3 bg-[#1a1f3a] hover:bg-[#252a45] text-white rounded-lg font-bold transition border border-[#ff7a00]/30">
                Get Started
              </Link>
            </div>

            {/* PRO — FEATURED */}
            <div className="bg-[#1a1f3a]/80 border-2 border-[#ff7a00] rounded-lg p-8 flex flex-col relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#ff7a00] text-[#0e1030] px-4 py-1 rounded-full text-sm font-bold">
                MOST POPULAR
              </div>
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <div className="text-[#ff7a00] text-4xl font-bold mb-6">$9.99<span className="text-base text-gray-400">/mo</span></div>
              <ul className="text-gray-400 space-y-3 mb-8 flex-grow">
                <li className="flex items-start"><Check className="w-5 h-5 text-[#ff7a00] mr-3 flex-shrink-0 mt-0.5" /> Unlimited workspaces</li>
                <li className="flex items-start"><Check className="w-5 h-5 text-[#ff7a00] mr-3 flex-shrink-0 mt-0.5" /> Unlimited memories</li>
                <li className="flex items-start"><Check className="w-5 h-5 text-[#ff7a00] mr-3 flex-shrink-0 mt-0.5" /> Unlimited devices</li>
                <li className="flex items-start"><Check className="w-5 h-5 text-[#ff7a00] mr-3 flex-shrink-0 mt-0.5" /> Priority support</li>
                <li className="flex items-start"><Check className="w-5 h-5 text-[#ff7a00] mr-3 flex-shrink-0 mt-0.5" /> Team sharing (coming)</li>
              </ul>
              <Link href="/auth/register" className="w-full py-3 bg-[#ff7a00] hover:brightness-110 text-[#0e1030] rounded-lg font-bold transition">
                Start 14-Day Free Trial
              </Link>
            </div>

            {/* ENTERPRISE */}
            <div className="bg-[#1a1f3a]/80 border border-[#ff7a00]/20 rounded-lg p-8 flex flex-col">
              <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
              <div className="text-[#ff7a00] text-4xl font-bold mb-6">Custom</div>
              <ul className="text-gray-400 space-y-3 mb-8 flex-grow">
                <li className="flex items-start"><Check className="w-5 h-5 text-[#ff7a00] mr-3 flex-shrink-0 mt-0.5" /> Self-hosted deployment</li>
                <li className="flex items-start"><Check className="w-5 h-5 text-[#ff7a00] mr-3 flex-shrink-0 mt-0.5" /> Team management</li>
                <li className="flex items-start"><Check className="w-5 h-5 text-[#ff7a00] mr-3 flex-shrink-0 mt-0.5" /> SLA + priority support</li>
                <li className="flex items-start"><Check className="w-5 h-5 text-[#ff7a00] mr-3 flex-shrink-0 mt-0.5" /> Custom integrations</li>
                <li className="flex items-start"><Check className="w-5 h-5 text-[#ff7a00] mr-3 flex-shrink-0 mt-0.5" /> Audit logging</li>
              </ul>
              <a href="mailto:hello@deployunimatrix.com" className="w-full py-3 bg-[#1a1f3a] hover:bg-[#252a45] text-white rounded-lg font-bold transition border border-[#ff7a00]/30 text-center">
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ — STAGE 5: Remove objections */}
      <section id="faq" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Frequently Asked Questions</h2>

          <div className="space-y-6">
            {[
              { q: 'Is my data really private?', a: 'Yes. All memories are encrypted end-to-end with AES-256-GCM before leaving your device. Even we cannot read them.' },
              { q: 'What happens if I switch LLMs?', a: 'Everything continues seamlessly. All your memories sync instantly. Switch between Claude, ChatGPT, Gemini anytime.' },
              { q: 'Can I export my memories?', a: 'Yes. Export encrypted or decrypted JSON at any time. Full data portability guaranteed.' },
              { q: 'Do you have an API?', a: 'Yes, via the Model Context Protocol. Connect any MCP-compatible tool. Standard, open protocol.' },
              { q: 'Can I self-host?', a: 'Yes. Enterprise tier includes Docker self-hosted option with full privacy.' },
              { q: 'How much data can I store?', a: 'Free: 1,000 memories. Pro: Unlimited. Enterprise: Custom limits.' },
            ].map((item, i) => (
              <details key={i} className="group bg-[#1a1f3a]/60 border border-[#ff7a00]/20 rounded-lg p-6 cursor-pointer hover:border-[#ff7a00]/50 transition">
                <summary className="font-bold text-lg flex items-center justify-between">
                  {item.q}
                  <span className="group-open:rotate-180 transition">▼</span>
                </summary>
                <p className="text-gray-400 mt-4">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA — STAGE 6: Last chance conversion */}
      <section className="py-20 px-6 bg-gradient-to-r from-[#ff7a00]/20 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Remember Everything?
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of developers and researchers using Unimatrix for seamless AI memory.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register" className="px-8 py-4 bg-[#ff7a00] hover:brightness-110 text-[#0e1030] rounded-lg font-bold text-lg transition shadow-lg shadow-[#ff7a00]/40">
              Create Free Account <ArrowRight className="inline ml-2 w-5 h-5" />
            </Link>
            <a href="#faq" className="px-8 py-4 border-2 border-[#ff7a00]/50 hover:border-[#ff7a00] rounded-lg font-bold text-lg transition">
              Still Have Questions?
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER — Trust & SEO */}
      <footer className="py-12 px-6 border-t border-[#ff7a00]/10 bg-[#0a0f25]/50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="text-xl font-bold mb-4">Uni<span className="text-[#ff7a00]">matrix</span></div>
            <p className="text-gray-400 text-sm">Cross-LLM memory. Encrypted. Vendor-free.</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Product</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link href="/pricing" className="hover:text-[#ff7a00] transition">Pricing</Link></li>
              <li><Link href="/docs" className="hover:text-[#ff7a00] transition">Documentation</Link></li>
              <li><Link href="/downloads" className="hover:text-[#ff7a00] transition">Downloads</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-[#ff7a00] transition">About</a></li>
              <li><a href="#" className="hover:text-[#ff7a00] transition">Blog</a></li>
              <li><a href="mailto:hello@deployunimatrix.com" className="hover:text-[#ff7a00] transition">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="/privacy" className="hover:text-[#ff7a00] transition">Privacy</a></li>
              <li><a href="/terms" className="hover:text-[#ff7a00] transition">Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[#ff7a00]/10 pt-8 text-center text-gray-500 text-sm">
          <p>&copy; 2026 Unimatrix. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
