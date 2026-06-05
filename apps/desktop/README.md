# Unimatrix Desktop

Electron wrapper that loads `https://deployunimatrix.com`.

## Development
```bash
cd apps/desktop
npm install
npm start
```

## Build locally
```bash
npm run dist:mac    # → dist/Unimatrix-mac.dmg
npm run dist:win    # → dist/Unimatrix-Setup-win.exe
npm run dist:linux  # → dist/Unimatrix-linux.AppImage
```

## CI Release
Push a version tag to trigger GitHub Actions:
```bash
git tag v1.0.0 && git push origin v1.0.0
```
GitHub Actions builds all three platforms and uploads to GitHub Releases automatically.

## Code Signing (macOS)
Set these secrets in GitHub repo settings:
- `MAC_CERTS` — base64-encoded .p12 certificate
- `MAC_CERTS_PASSWORD` — certificate password
- `APPLE_ID` — Apple ID for notarization
- `APPLE_ID_PASSWORD` — app-specific password
- `APPLE_TEAM_ID` — team ID from developer.apple.com

## Code Signing (Windows)
- `WIN_CSC_LINK` — base64-encoded .pfx certificate
- `WIN_CSC_KEY_PASSWORD` — certificate password

## Easy Onboarding + Auto Installer (new)
The desktop app is the recommended way to get started.

When you launch the built Unimatrix Desktop:
- It loads the web onboarding at deployunimatrix.com/onboarding (or your self-host).
- The onboarding now collects both your Unimatrix client API key(s) **and** your LLM provider logins (Claude, OpenAI, Gemini, Groq, Ollama) in one flow.
- "Auto-configure Claude Desktop" button (and future ones) will use native Electron access to find your `claude_desktop_config.json` and automatically merge the Unimatrix MCP bridge entry using the key you just created. No copy-paste.
- Self-host flow can write a ready-to-use `.env.unimatrix` pre-populated with the LLM keys you entered.

Build the installer after changes:
```bash
cd apps/desktop
npm run dist:mac   # or dist:win / dist:linux
```

The resulting .dmg / .exe / AppImage is what end users download for the "super easy" experience.
