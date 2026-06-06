# Unimatrix Browser Extension

Save your web LLM conversations to Unimatrix. Works with ChatGPT, Claude web, Google Gemini, Microsoft Copilot, and more.

## Features

✅ **Auto-Capture** — Click a button to capture conversations from web LLMs  
✅ **Encrypted** — All memories encrypted end-to-end (AES-256-GCM)  
✅ **Cross-LLM** — Works with ChatGPT, Claude, Gemini, Copilot  
✅ **Quick Save** — Save memories in seconds with optional context tags  
✅ **Secure** — Your encryption password never leaves your device  

## Supported LLMs

- ChatGPT (chat.openai.com)
- Claude Web (claude.ai)
- Google Gemini (gemini.google.com)
- Microsoft Copilot (copilot.microsoft.com)
- HuggingFace Spaces (huggingface.co)

## Installation

### From Source (Development)
1. Clone the Unimatrix repository
2. Navigate to `apps/extension/`
3. Open `chrome://extensions/` in Chrome
4. Enable "Developer Mode" (toggle in top right)
5. Click "Load unpacked" and select the `apps/extension/` directory

### From Chrome Web Store (Soon)
Extension pending submission to Chrome Web Store.

## Usage

1. **Sign In**
   - Click extension icon → Settings
   - Enter your Unimatrix email and password
   - Create an encryption password (used to encrypt memories locally)

2. **Save a Memory**
   - Visit ChatGPT, Claude, Gemini, or any supported LLM
   - Click the "💾 Save to Unimatrix" button (bottom right)
   - Paste conversation excerpt or click "Auto-Capture"
   - Add context tag (optional) and importance level
   - Click "Save Memory" → done!

3. **View Your Memories**
   - Go to https://deployunimatrix.com/dashboard
   - See all saved memories across all LLMs
   - Search, tag, and organize

## How It Works

```
Web LLM Page
    ↓
[💾 Save to Unimatrix] button appears
    ↓
Auto-capture or manual paste
    ↓
Client-side encryption (PBKDF2 + AES-256-GCM)
    ↓
Send ciphertext to Unimatrix
    ↓
Server stores encrypted content only
    ↓
View/search in Unimatrix dashboard (decrypted on your device)
```

## Privacy & Security

- **Your password never reaches the server** — used only to derive encryption key locally
- **All memories encrypted before leaving your device** — server never sees plaintext
- **AES-256-GCM cipher** — NIST-approved, military-grade encryption
- **Random nonce per message** — prevents replay attacks
- **HMAC-SHA256 signatures** — detects tampering

## Troubleshooting

### Extension button doesn't appear
- Check you're on a supported LLM site
- Try refreshing the page
- Ensure extension is enabled in Chrome

### Auto-capture returns empty
- The LLM website structure may have changed
- Manual paste works reliably as alternative
- Report issue at github.com/tjpoisal/UNIMATRIX/issues

### Password reset
- If you lose your encryption password, you won't be able to decrypt old memories
- You can still create new memories with a new password
- Export encrypted memories for backup before password loss

## FAQ

**Q: Can Unimatrix read my memories?**  
A: No. All memories encrypted with YOUR password on YOUR device. Unimatrix server stores only ciphertext.

**Q: What if I forget my encryption password?**  
A: You can still sign in and create new memories. Old memories remain encrypted and unreadable. Export encrypted backups to save them.

**Q: Does this work on mobile?**  
A: Browser extensions work on mobile Chrome (Android 88+). iOS Safari doesn't support extensions yet — use the Unimatrix mobile app instead.

**Q: Can I use this with multiple LLMs at once?**  
A: Yes! Switch between ChatGPT, Claude, Gemini anytime. All memories stay synced in your Unimatrix dashboard.

**Q: Is there a size limit?**  
A: Free tier: 1,000 memories. Pro: unlimited. Enterprise: custom limits.

## Support

- **GitHub Issues**: github.com/tjpoisal/UNIMATRIX/issues
- **Email**: hello@deployunimatrix.com
- **Twitter**: @unimatrix

## License

MIT — Use freely, modify, share.

---

Made with ❤️ by Unimatrix  
Your AI remembers everything, everywhere.
