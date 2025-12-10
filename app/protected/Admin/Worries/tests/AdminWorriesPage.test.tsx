// app/protected/Admin/Worries/tests/AdminWorriesPage.test.tsx
import React from 'react';
import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';

// --- Mocks ---

// Mock next/navigation (useRouter + useSearchParams)
vi.mock('next/navigation', () => {
  return {
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    }),
    useSearchParams: () => ({
      get: vi.fn().mockReturnValue(null),
      toString: () => '',
    }),
  };
});

// Mock actions (getWorries)
vi.mock('../actions', () => ({
  getWorries: vi.fn(),
}));

import AdminWorriesPage from '../page';
import { getWorries } from '../actions';

// --- JSDOM polyfills for Mantine ---

beforeAll(() => {
  // matchMedia used by Mantine color scheme
  if (!(window as any).matchMedia) {
    (window as any).matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  }

  // ResizeObserver used by Mantine ScrollArea
  if (!(global as any).ResizeObserver) {
    (global as any).ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Helper: render page inside MantineProvider
const renderWithMantine = () =>
  render(
    <MantineProvider>
      <AdminWorriesPage />
    </MantineProvider>,
  );

describe('AdminWorriesPage', () => {
  it('renders empty state when there are no worries', async () => {
    // getWorries returns empty list
    (getWorries as any).mockResolvedValue({
      data: [],
      count: 0,
    });

    renderWithMantine();

    await waitFor(() => {
      expect(
        screen.getByText(/No worries have been submitted yet/i),
      ).toBeInTheDocument();
    });
  });

  it('renders worries list with title and likes', async () => {
    const mockWorries: any[] = [
      {
        id: '1',
        title: 'Leaky roof',
        content: 'Water is dripping in the hallway',
        created_at: '2024-01-01T10:00:00Z',
        creator_name: 'John Doe',
        likesCount: 3,
      },
    ];

    (getWorries as any).mockResolvedValue({
      data: mockWorries,
      count: 1,
    });

    renderWithMantine();

    // Title
    await waitFor(() => {
      expect(screen.getByText('Leaky roof')).toBeInTheDocument();
    });

    // Created by
    expect(
      screen.getByText(/Created by John Doe/i),
    ).toBeInTheDocument();

    // Likes
    expect(
      screen.getByText(/Likes:\s*3/i),
    ).toBeInTheDocument();
  });
});
