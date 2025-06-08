import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import Script from 'next/script';
import '@mantine/notifications/styles.css';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@/styles/globals.css'; 
import ClientSocketProvider from './socketProvider';

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
        <MantineProvider>
          <Notifications
            position="top-right"
            autoClose={3000}
            zIndex={1000}
            containerWidth="fit-content"
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: 400, // or whatever fits your layout
            }}
          />
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}