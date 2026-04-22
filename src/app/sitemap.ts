import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXTAUTH_URL ?? 'https://nasmenu.app'
  return [
    { url: `${base}/login`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.8 },
    { url: `${base}/register`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
  ]
}
