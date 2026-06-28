import fs from 'node:fs/promises';
import path from 'node:path';
import Link from 'next/link';

type SetupGuide = {
  platform: string;
  title: string;
  quickStart: string[];
  config: string;
  faq: Array<{ q: string; a: string }>;
};

async function loadGuide(platform: string): Promise<SetupGuide | null> {
  try {
    const filePath = path.join(process.cwd(), 'apps/web/content/setup', `${platform}.json`);
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw) as SetupGuide;
  } catch {
    return null;
  }
}

export default async function SetupPlatformPage({ params }: { params: Promise<{ platform: string }> }) {
  const { platform } = await params;
  const guide = await loadGuide(platform);
  if (!guide) {
    return <main className="p-8 text-[#F1F5F9] bg-[#0A0F1C] min-h-screen">Setup guide not found.</main>;
  }

  return (
    <main className="p-8 bg-[#0A0F1C] text-[#F1F5F9] min-h-screen">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/onboarding" className="text-[#00F5FF]">← Back to onboarding</Link>
        <h1 className="text-3xl font-bold">{guide.title} Setup</h1>

        <section className="bg-[#111827] border border-[#334155]/30 rounded p-4">
          <h2 className="font-semibold mb-3">Quick start</h2>
          <ol className="list-decimal pl-5 space-y-1 text-[#94A3B8]">
            {guide.quickStart.slice(0, 3).map((step) => <li key={step}>{step}</li>)}
          </ol>
        </section>

        <section className="bg-[#111827] border border-[#334155]/30 rounded p-4">
          <h2 className="font-semibold mb-3">Copy this config</h2>
          <pre className="bg-[#1F2937] p-3 rounded text-xs overflow-auto">{guide.config}</pre>
        </section>

        <section className="bg-[#111827] border border-[#334155]/30 rounded p-4">
          <h2 className="font-semibold mb-3">Test connection</h2>
          <form action="/api/health" method="get" target="_blank">
            <button className="px-3 py-2 rounded bg-[#00F5FF] text-[#0A0F1C] font-semibold" type="submit">
              Ping /api/health
            </button>
          </form>
        </section>

        <section className="bg-[#111827] border border-[#334155]/30 rounded p-4">
          <h2 className="font-semibold mb-3">Troubleshooting FAQ</h2>
          <div className="space-y-3">
            {guide.faq.map((item) => (
              <div key={item.q}>
                <p className="font-medium">{item.q}</p>
                <p className="text-[#94A3B8]">{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
