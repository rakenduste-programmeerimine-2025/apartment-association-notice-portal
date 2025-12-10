import React from 'react';
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';
import AdminResidentsPage from '../page';


// mock getResidents + removeResidentAction used in the page
const mockGetResidents = vi.fn();
const mockRemoveResidentAction = vi.fn();

vi.mock('../actions', () => ({
  getResidents: (...args: any[]) => mockGetResidents(...args),
  removeResidentAction: (...args: any[]) => mockRemoveResidentAction(...args),
}));

// mock supabase client used in updateStatus
vi.mock('@/lib/supabase/client', () => {
  const mockUpdate = vi.fn().mockResolvedValue({ error: null });

  return {
    createClient: () => ({
      from: () => ({
        update: (payload: any) => ({
          eq: () => {
            mockUpdate(payload);
            return { error: null };
          },
        }),
      }),
    }),
  };
});

// mock DeleteResidentButton to avoid dealing with the modal UI
vi.mock('../components/DeleteResidentButton', () => ({
  default: (props: { id: string; mode: 'reject' | 'remove'; onDone: () => void }) => (
    <button onClick={props.onDone}>
      {props.mode === 'reject' ? 'Reject' : 'Remove'}
    </button>
  ),
}));

// ---- Global browser APIs needed by Mantine (ScrollArea, etc.) ----
beforeAll(() => {
  if (!(window as any).matchMedia) {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }),
    });
  }

  if (!(globalThis as any).ResizeObserver) {
    (globalThis as any).ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
});

// helper: render page inside MantineProvider
const renderWithMantine = () =>
  render(
    <MantineProvider>
      <AdminResidentsPage />
    </MantineProvider>
  );

describe('AdminResidentsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty states when there are no residents', async () => {
    mockGetResidents.mockResolvedValue({ data: [], count: 0 });

    renderWithMantine();

    // sections
    expect(await screen.findByText('Pending requests')).toBeInTheDocument();
    expect(screen.getByText('Residents')).toBeInTheDocument();
    expect(screen.getByText('Admins')).toBeInTheDocument();

    // empty texts
    expect(screen.getByText('No pending join requests.')).toBeInTheDocument();
    expect(screen.getByText('No approved residents yet.')).toBeInTheDocument();
    expect(screen.getByText('No admins found.')).toBeInTheDocument();
  });

  it('renders residents grouped and allows approving a pending request', async () => {
    const now = new Date().toISOString();

    const mockUsers = [
      {
        id: 'pending-1',
        email: 'pending@example.com',
        full_name: 'Pending User',
        role: 'resident',
        community_id: 'community-1',
        created_at: now,
        status: 'pending',
        flat_number: '1',
      },
      {
        id: 'approved-1',
        email: 'approved@example.com',
        full_name: 'Approved User',
        role: 'resident',
        community_id: 'community-1',
        created_at: now,
        status: 'approved',
        flat_number: '2',
      },
      {
        id: 'admin-1',
        email: 'admin@example.com',
        full_name: 'Admin User',
        role: 'admin',
        community_id: 'community-1',
        created_at: now,
        status: null,
        flat_number: null,
      },
    ];

    mockGetResidents.mockResolvedValue({
      data: mockUsers,
      count: mockUsers.length,
    });

    renderWithMantine();

    // names appear in the correct sections initially
    expect(await screen.findByText('Pending User')).toBeInTheDocument();
    expect(screen.getByText('Approved User')).toBeInTheDocument();
    expect(screen.getByText('Admin User')).toBeInTheDocument();

    // click Approve on the pending user
    const user = userEvent.setup();
    const approveButton = screen.getByRole('button', { name: /approve/i });
    await user.click(approveButton);

    // after approve, pending list should be empty
    await waitFor(() => {
      expect(screen.getByText('No pending join requests.')).toBeInTheDocument();
    });

    // residents section is still there (and now has at least one resident)
    expect(screen.getByText('Residents')).toBeInTheDocument();
  });
});
