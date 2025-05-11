import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import Script from 'next/script';
import '@mantine/notifications/styles.css';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@/styles/globals.css'; 

export const metadata = {
  title: 'My Mantine app',
  description: 'I have followed setup instructions carefully',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
        <meta name="viewport" content="width=device-width, initial-scale=1" />v
        {/* Add runtime_config.js script asynchronously */}
        <Script
          src="/runtime_config.js"
          strategy="beforeInteractive" // Ensures the script runs before the app becomes interactive
        />
      </head>
      <body style={{ overflowX: 'hidden' }}>
        <MantineProvider>
          <Notifications
            position="top-right"
            autoClose={3000}
            zIndex={1000}
            containerWidth="fit-content"
          />
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}