import type { Metadata } from 'next';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import UserNavbarWrapper from '@/components/NavBar/UserNavbarWrapper';

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: '',
  description: '',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider theme={{ fontFamily: 'Inter, sans-serif' }}>
      <UserNavbarWrapper />
      {children}
    </MantineProvider>
  );
}
