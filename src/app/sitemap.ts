import type { MetadataRoute } from 'next';

import { publicUrl } from '@/lib/metadata';

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: publicUrl('/login') }, { url: publicUrl('/register') }];
}
