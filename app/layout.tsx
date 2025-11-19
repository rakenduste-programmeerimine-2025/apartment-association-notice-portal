import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import "./globals.css";
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "",
  description: "",
};

const geistSans = Geist({
  variable: '--font-geist-sans',
  display: 'swap',
  subsets: ['latin'],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <MantineProvider theme={{ fontFamily: 'Inter, sans-serif' }}>
            <Notifications position="top-right" />   
            {children}
          </MantineProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
