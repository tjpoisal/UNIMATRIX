/**
 * lib/marketing-schema.ts
 * JSON-LD structured data for SEO
 */

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Unimatrix',
  url: 'https://deployunimatrix.com',
  logo: 'https://deployunimatrix.com/logo.png',
  description: 'Cross-LLM memory continuity with end-to-end encryption',
  foundingDate: '2026',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Support',
    email: 'hello@deployunimatrix.com',
    url: 'https://deployunimatrix.com/contact',
  },
  sameAs: [
    'https://github.com/tjpoisal/UNIMATRIX',
    'https://twitter.com/unimatrix',
  ],
};

export const productSchema = {
  '@context': 'https://schema.org',
  '@type': 'SaasProduct',
  name: 'Unimatrix',
  description: 'AI memory that works across all LLMs and devices',
  url: 'https://deployunimatrix.com',
  image: 'https://deployunimatrix.com/product.png',
  brand: {
    '@type': 'Brand',
    name: 'Unimatrix',
  },
  offers: [
    {
      '@type': 'Offer',
      name: 'Free Plan',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      description: '3 workspaces, 1,000 memories, 2 devices',
    },
    {
      '@type': 'Offer',
      name: 'Pro Plan',
      price: '9.99',
      priceCurrency: 'USD',
      billingIncrement: 'P1M',
      availability: 'https://schema.org/InStock',
      description: 'Unlimited workspaces, memories, devices',
    },
    {
      '@type': 'Offer',
      name: 'Enterprise Plan',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      description: 'Self-hosted, team sharing, SLA',
    },
  ],
  features: [
    'Cross-LLM memory continuity',
    'End-to-end encryption',
    'Privacy-first architecture',
    'MCP protocol support',
    'Cloud + self-hosted options',
  ],
};

export const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is Unimatrix?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Unimatrix is a cross-LLM memory platform. Start a conversation with ChatGPT on your phone, continue with Claude on your tablet with full context — zero re-explaining.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is my data private?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Unimatrix uses end-to-end encryption. Your memories are encrypted on your device before reaching our servers. Even we cannot read them.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you lock me into a specific AI?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Unimatrix works with any LLM via the Model Context Protocol. ChatGPT, Claude, Gemini, Ollama — all supported.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I self-host?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Enterprise tier includes self-hosted Docker deployment for maximum privacy and control.',
      },
    },
  ],
};
