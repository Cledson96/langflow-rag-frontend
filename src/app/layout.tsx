import { AntdRegistry } from '@ant-design/nextjs-registry';
import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: 'Langflow RAG',
  description: 'Langflow RAG frontend',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <AntdRegistry>{children}</AntdRegistry>
      </body>
    </html>
  );
}
