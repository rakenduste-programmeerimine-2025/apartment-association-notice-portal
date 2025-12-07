import { vi } from 'vitest';
import React from 'react';
//
//
export const mockPush = vi.fn();
export const mockSearchParamsGet = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({ get: mockSearchParamsGet }),
}));

//  Supabase 
export const mockCreateClient = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  createClient: mockCreateClient,
}));

mockCreateClient.mockReturnValue({
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn().mockResolvedValue({ data: null, error: null }), // для existingCommunity
      })),
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn().mockResolvedValue({ data: { id: 'community-id', ads_oid: 'ads123' }, error: null }),
      })),
    })),
  })),
  auth: {
    admin: {
      createUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'user-id' } },
        error: null,
      }),
      deleteUser: vi.fn().mockResolvedValue({ data: null, error: null }),
    },
    signInWithPassword: vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'Invalid login' },
    }),
  },
});

//  EstonianAddress 
interface EstonianAddressProps {
  onSelect: (address: {
    ads_oid: string;
    full_address: string;
    streetName: string;
    houseNumber: string;
    city: string;
    country: string;
  }) => void;
}

vi.mock('@/components/estonian-address', () => ({
  EstonianAddress: ({ onSelect }: EstonianAddressProps) =>
    React.createElement('input', {
      'aria-label': 'Select your address',
      onChange: () =>
        onSelect({
          ads_oid: 'mock',
          full_address: 'mock street',
          streetName: 'mock',
          houseNumber: '1',
          city: 'Tallinn',
          country: 'Estonia',
        }),
    }),
}));

//  window.matchMedia  Mantine 
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
