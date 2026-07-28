'use client';

import { XProvider } from '@ant-design/x';
import type { PropsWithChildren } from 'react';

export default function AppProvider({ children }: PropsWithChildren) {
  return (
    <XProvider
      theme={{
        token: {
          borderRadius: 12,
          colorBgLayout: '#f4f7fb',
          colorPrimary: '#6d5dfc',
          colorText: '#172033',
          colorTextSecondary: '#6b7280',
          fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        },
        components: {
          Button: { borderRadius: 10, controlHeight: 40, fontWeight: 600 },
          Card: { borderRadiusLG: 18 },
          Menu: { itemBorderRadius: 10, itemHeight: 42 },
        },
      }}
    >
      {children}
    </XProvider>
  );
}
