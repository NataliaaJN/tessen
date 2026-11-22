import '@tessen-ui/styles/index.css';
import '@tessen-ui/motion/motion.css';
import type { ReactNode } from 'react';

// `icons` avoids a /favicon.ico 404 that would show up as a console error in the hydration test.
export const metadata = { title: 'Tessen consumer: Next.js', icons: { icon: 'data:,' } };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
