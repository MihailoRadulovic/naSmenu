import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXTAUTH_URL ?? 'https://nasmenu.app'
  return {
    rules: [
      {
        userAgent: '*',
        disallow: ['/api/', '/novi', '/statistika', '/zaposleni', '/salary'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
