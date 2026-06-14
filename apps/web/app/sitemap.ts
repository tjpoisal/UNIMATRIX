import { MetadataRoute } from 'next'

const BASE = 'https://deployunimatrix.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    { url: BASE, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/pricing`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/docs/mcp`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/downloads`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/quickstart`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/security`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/status`, lastModified: now, changeFrequency: 'daily', priority: 0.5 },
    { url: `${BASE}/setup/claude-desktop`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/auth/login`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${BASE}/auth/register`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
  ]
}
