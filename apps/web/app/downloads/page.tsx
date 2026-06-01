import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'Downloads - Unimatrix',
  description: 'Download Unimatrix for macOS, Windows, Linux, iOS, and Android',
};

export default function DownloadsPage() {
  const desktop = [
    { os: 'macOS', note: 'Universal (Apple Silicon + Intel)', file: 'Unimatrix-mac.dmg', href: 'https://github.com/tjpoisal/UNIMATRIX/releases/latest/download/Unimatrix-mac.dmg' },
    { os: 'Windows', note: 'Windows 10 / 11 x64', file: 'Unimatrix-Setup-win.exe', href: 'https://github.com/tjpoisal/UNIMATRIX/releases/latest/download/Unimatrix-Setup-win.exe' },
    { os: 'Linux', note: 'AppImage (x64) / .deb', file: 'Unimatrix-linux.AppImage', href: 'https://github.com/tjpoisal/UNIMATRIX/releases/latest/download/Unimatrix-linux.AppImage' },
  ];

  const mobile = [
    { os: 'iOS', note: 'iPhone & iPad · iOS 16+', href: 'https://apps.apple.com/app/unimatrix/id6748523981' },
    { os: 'Android', note: 'Android 10+', href: 'https://play.google.com/store/apps/details?id=com.getstackmax.unimatrix' },
  ];

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-[#F1F5F9]">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="flex items-center gap-4 mb-8">
          <Image src="/logo-icon.png" alt="Unimatrix" width={36} height={36} />
          <h1 className="text-3xl font-black">Downloads</h1>
        </div>

        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Desktop</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {desktop.map((d) => (
              <div key={d.os} className="bg-[#111827] border border-[#334155]/30 rounded-2xl p-4 text-center">
                <div className="font-bold text-[#F1F5F9] mb-1">{d.os}</div>
                <div className="text-xs text-[#94A3B8] mb-3">{d.note}</div>
                <a href={d.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-2 bg-[#00F5FF]/10 text-[#00F5FF] rounded-lg border border-[#00F5FF]/20 text-sm">
                  Download {d.file}
                </a>
                <div className="text-xs text-[#475569] mt-3">Checksum: <em>coming soon</em></div>
              </div>
            ))}
          </div>
          <p className="text-sm text-[#94A3B8] mt-4">If you prefer a packaged installer, check the GitHub Releases page for signed artifacts and checksums.</p>
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Mobile</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
            {mobile.map((m) => (
              <a key={m.os} href={m.href} target="_blank" rel="noopener noreferrer" className="bg-[#111827] border border-[#334155]/30 rounded-2xl p-4 text-center">
                <div className="font-bold text-[#F1F5F9]">{m.os}</div>
                <div className="text-xs text-[#94A3B8] mt-1">{m.note}</div>
                <div className="mt-3 text-sm text-[#00F5FF]">Open in store →</div>
              </a>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Web App</h2>
          <p className="text-sm text-[#94A3B8] mb-4">Use the web app without installing: <Link href="/auth/login" className="text-[#00F5FF]">Open Web App</Link></p>
        </section>
      </div>
    </div>
  );
}
