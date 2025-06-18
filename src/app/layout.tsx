import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core';
import Script from 'next/script';
import '@mantine/notifications/styles.css';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@/styles/globals.css'; 
import ClientSocketProvider from './socketProvider';
import { ThemeProvider } from '@/components/shared/ThemeProvider';

export const metadata = {
  title: 'Momentum',
  description: 'Making lifes easier',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/momentum-icon.ico" type="image/x-icon" />
        {/* Add runtime_config.js script asynchronously */}
        <Script
          src="/runtime_config.js"
          strategy="beforeInteractive" // Ensures the script runs before the app becomes interactive
        />
        <ClientSocketProvider></ClientSocketProvider>
      </head>
      <body style={{ overflowX: 'hidden' }}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}