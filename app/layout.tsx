import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import './globals.css';
import '@mantine/core/styles.css';
import { createTheme, MantineProvider } from '@mantine/core';

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'Next.js and Supabase Starter Kit',
  description: 'The fastest way to build apps with Next.js and Supabase',
};

const geistSans = Geist({
  variable: '--font-geist-sans',
  display: 'swap',
  subsets: ['latin'],
});

const theme = createTheme({
  fontFamily: "var(--font-geist-sans), sans-serif",
  primaryColor: "brand",
  colors: {
    brand: [
      "#e6f4ff", 
      "#cceaff",
      "#99d5ff",
      "#66c1ff",
      "#33acff",
      "#2098e9", 
      "#1b82c7",
      "#156ca5",
      "#105684",
      "#0a4062",
    ],
  },
  primaryShade: { light: 5, dark: 5 },
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <MantineProvider theme={theme}>{children}</MantineProvider>
      </body>
    </html>
  );
}
