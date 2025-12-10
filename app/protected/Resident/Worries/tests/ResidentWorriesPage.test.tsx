// app/protected/Resident/Worries/tests/ResidentWorriesPage.test.tsx
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';

// --- shared data for the mocked "worries" query ---
let worriesData: any[] = [];

// --- mock next/navigation (router + search params) ---
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(), // no ?page or ?sort in tests
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// --- mock supabase client (NO external variables inside the factory) ---
vi.mock('@/lib/supabase/client', () => {
  const mockAuthGetUser = vi.fn();
  const mockFrom = vi.fn((table: string) => {
    // users table: return community_id
    if (table === 'users') {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { community_id: 'community-1' },
          error: null,
        }),
      };
    }

    // worries table: return worriesData array
    if (table === 'worries') {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({
          data: worriesData,
          error: null,
          count: worriesData.length,
        }),
      };
    }

    // default fallback (not really used here)
    return {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
    };
  });

  const createClient = () => ({
    auth: { getUser: mockAuthGetUser },
    from: mockFrom,
  });

  return {
    __esModule: true,
    createClient,
    // expose mocks so we can configure them in tests
    mockAuthGetUser,
    mockFrom,
  };
});

// --- polyfills for Mantine (ScrollArea, color scheme, etc.) ---
if (!(global as any).ResizeObserver) {
  (global as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
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
}

// now import AFTER mocks
import ResidentWorriesPage from '../page';
import { mockAuthGetUser } from '@/lib/supabase/client';

// helper: render page inside MantineProvider
const renderWithMantine = () =>
  render(
    <MantineProvider>
      <ResidentWorriesPage />
    </MantineProvider>
  );

beforeEach(() => {
  vi.clearAllMocks();
  worriesData = [];

  // logged-in user for all tests
  mockAuthGetUser.mockResolvedValue({
    data: { user: { id: 'user-1' } },
    error: null,
  });
});

describe('ResidentWorriesPage', () => {
  it('renders empty state when there are no worries', async () => {
    // no worries
    worriesData = [];

    renderWithMantine();

    await waitFor(() => {
      expect(
        screen.getByText('No worries have been submitted yet.')
      ).toBeInTheDocument();
    });
  });

  it('renders worries list with title and likes', async () => {
    // one worry with 2 likes (one of them from current user)
    worriesData = [
      {
        id: 'w1',
        title: 'Noise at night',
        content: 'Too loud after 23:00.',
        created_at: '2024-01-01T10:00:00',
        likesworry: [
          { id: 'l1', user_id: 'user-1' },
          { id: 'l2', user_id: 'user-2' },
        ],
      },
    ];

    renderWithMantine();

    // waits until data is loaded and rendered
    await waitFor(() => {
      expect(screen.getByText('Noise at night')).toBeInTheDocument();
    });

    // button text depends on hasLiked, but likes count should be 2
    const likeButton = screen.getByRole('button', { name: /· 2/ });
    expect(likeButton).toBeInTheDocument();
  });
});
