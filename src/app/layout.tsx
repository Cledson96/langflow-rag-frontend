import { AntdRegistry } from '@ant-design/nextjs-registry';
import type { Metadata } from 'next';

import './globals.css';
import AppProvider from '@/components/providers/app-provider';
import { metadataBase, siteMetadata } from '@/lib/metadata';

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: siteMetadata.name,
    template: `%s | ${siteMetadata.name}`,
  },
  description: siteMetadata.description,
  openGraph: {
    description: siteMetadata.description,
    locale: 'pt_BR',
    siteName: siteMetadata.name,
    title: siteMetadata.name,
    type: 'website',
    url: '/',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <AntdRegistry>
          <AppProvider>{children}</AppProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
