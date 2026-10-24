import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const privatePaths = ['/api/', '/_next/', '/directory', '/investment-funds'];
  const crawlerUserAgents = ['Googlebot', 'Bingbot', 'Yandex', 'DuckDuckBot'];

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: privatePaths,
      },
      ...crawlerUserAgents.map((userAgent) => ({
        userAgent,
        allow: '/',
        disallow: privatePaths,
      })),
    ],
    sitemap: 'https://tvijo.com/sitemap.xml',
  };
}
