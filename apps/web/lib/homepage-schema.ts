/**
 * lib/homepage-schema.ts
 * JSON-LD structured data for the marketing homepage (deployunimatrix.com).
 * FAQ + pricing entries are kept in sync with the visible homepage content.
 */

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Unimatrix',
  url: 'https://deployunimatrix.com',
  logo: 'https://deployunimatrix.com/logo.png',
  description:
    'Managed MCP server providing persistent, hierarchical AI memory across Claude Desktop, Cursor, Windsurf, and custom agents.',
  foundingDate: '2024',
  sameAs: [],
}

export const softwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Unimatrix',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Web, macOS, Linux, Windows',
  url: 'https://deployunimatrix.com',
  description:
    'One MCP server. Every AI tool you use — Claude Desktop, Cursor, Windsurf — shares the same memory. Encrypted, cross-device, always available.',
  offers: [
    { '@type': 'Offer', name: 'Free', price: '0', priceCurrency: 'USD' },
    { '@type': 'Offer', name: 'Pro', price: '9', priceCurrency: 'USD', billingIncrement: 'monthly' },
    { '@type': 'Offer', name: 'Enterprise', price: '29', priceCurrency: 'USD', billingIncrement: 'monthly' },
  ],
}

export const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How is Unimatrix different from ChatGPT memory?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "ChatGPT memory is siloed inside ChatGPT. Unimatrix is a protocol layer — your memories are available to Claude, Cursor, Windsurf, and any other MCP-compatible tool simultaneously. You own the data and control exactly when it's accessed.",
      },
    },
    {
      '@type': 'Question',
      name: 'Does it work automatically or do I have to configure it?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Intentionally explicit. You add a system prompt to each AI tool instructing it to load your memory at the start of sessions. No hidden background syncing — you always know exactly what context each AI has. This is how MCP memory actually works.',
      },
    },
    {
      '@type': 'Question',
      name: "What counts as a 'memory'?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Any piece of text you store — a note, a fact, a code snippet, a meeting summary, a project decision. Each individual entry is one memory. They live inside named Palaces (workspaces), organized into Locations.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is my data encrypted?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Data is encrypted at rest with AES-256-GCM. TLS 1.3 in transit. API keys are bcrypt-hashed — we never see the raw value. Payments are processed by Stripe — we never touch your card details.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I self-host the entire thing?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes — the full stack (server, web app, worker) runs on Docker + PostgreSQL + pgvector. Enterprise plan includes the self-host guide and dedicated setup support.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I cancel anytime?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes — cancel from Settings at any time. You keep full Pro access until the end of your billing period. No questions asked.',
      },
    },
  ],
}

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Unimatrix',
  url: 'https://deployunimatrix.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://deployunimatrix.com/docs?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
}
