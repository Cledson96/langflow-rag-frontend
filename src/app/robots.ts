import type { MetadataRoute } from 'next';

import { publicUrl } from '@/lib/metadata';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      allow: ['/login', '/register'],
      disallow: '/',
      userAgent: '*',
    },
    sitemap: publicUrl('/sitemap.xml'),
  };
}
