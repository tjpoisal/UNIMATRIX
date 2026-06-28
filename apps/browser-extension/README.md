# Unimatrix Browser Extension

Captures conversations from AI apps that don't support MCP and sends them to your
Unimatrix memory store via `POST /api/ingest/browser`.

## Supported Sites

| App | URL | Provider slug |
|-----|-----|---------------|
| Perplexity | perplexity.ai | `perplexity` |
| Gemini (consumer) | gemini.google.com | `gemini-app` |
| Microsoft Copilot | copilot.microsoft.com | `copilot` |
| Meta AI | meta.ai | `meta-ai` |
| Grok (consumer) | grok.x.ai | `grok-consumer` |
| Poe | poe.com | `poe` |
| You.com | you.com | `youcom` |
| Phind | phind.com | `phind` |
| Le Chat (Mistral) | chat.mistral.ai | `lechat` |
| Pi (Inflection) | heypi.com | `pi` |

## How It Works

```
User sends a message in Perplexity / Gemini app / etc.
        ↓
Content script detects the assistant response (DOM mutation observer)
        ↓
Sends { source, model, userMessage, assistantMessage, url, capturedAt }
  to POST https://deployunimatrix.com/api/ingest/browser
  with Authorization: Bearer <unimatrix-api-key>
        ↓
Librarian pipeline: embed → tier → triple extract → store
        ↓
Memory appears in your Unimatrix "LLM Histories → Perplexity History" space
        ↓
Available for retrieval in ALL your other LLMs via MCP or API
```

## Architecture

```
apps/browser-extension/
├── manifest.json          Chrome/Firefox WebExtensions manifest v3
├── background.ts          Service worker — auth, queue, retry
├── content/
│   ├── perplexity.ts      DOM observer for perplexity.ai
│   ├── gemini.ts          DOM observer for gemini.google.com
│   ├── copilot.ts         DOM observer for copilot.microsoft.com
│   ├── meta-ai.ts         DOM observer for meta.ai
│   ├── grok.ts            DOM observer for grok.x.ai
│   ├── poe.ts             DOM observer for poe.com
│   ├── youcom.ts          DOM observer for you.com
│   ├── phind.ts           DOM observer for phind.com
│   ├── lechat.ts          DOM observer for chat.mistral.ai
│   └── pi.ts              DOM observer for heypi.com
├── popup/
│   ├── popup.html         Extension popup UI
│   └── popup.ts           Auth, settings, capture toggle per site
└── utils/
    ├── api.ts             Unimatrix API client
    └── dedup.ts           Local deduplication (IndexedDB)
```

## Auth

During onboarding, the user pastes their Unimatrix API key into the extension popup.
This is stored in `chrome.storage.local` (encrypted at rest by the browser) and sent
as `Authorization: Bearer <key>` on every ingest request.

The key is a standard Unimatrix MCP token — the same one used by Claude Desktop and Cursor.

## Installation (Development)

```bash
cd apps/browser-extension
pnpm install
pnpm build
# Load unpacked in chrome://extensions → Load unpacked → select dist/
```

## Note on Perplexity

Perplexity is the assistant you are reading this message through right now.
It does not implement MCP. This extension is how Perplexity conversations
become part of your unified Unimatrix memory — captured at the browser level,
run through the same Librarian pipeline as MCP-originated memories, and
fully available for retrieval in Claude Desktop, Cursor, or any other MCP client.
