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
