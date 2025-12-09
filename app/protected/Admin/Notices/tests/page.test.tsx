// app/protected/Admin/Notices/tests/page.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import AdminNoticesPage from '../page';
import * as actions from '../actions';

// --- Mock window.matchMedia for Mantine ---
if (!window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
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

// --- Mock next/navigation ---
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/admin/notices',
}));

// --- Mock components ---
vi.mock('@/components/NoticeCard', () => ({
  default: ({ notice }: any) => (
    <div data-testid={`notice-${notice.id}`}>
      {notice.title}
    </div>
  ),
}));

vi.mock('@/components/MeetingCard', () => ({
  default: ({ meeting }: any) => (
    <div data-testid={`meeting-${meeting.id}`}>
      {meeting.title}
    </div>
  ),
}));

vi.mock('@/components/FiltersNotices', () => ({
  default: () => <div data-testid="filters">Filters</div>,
}));

// --- Mock actions ---
vi.mock('../actions', () => ({
  getNotices: vi.fn(),
  getMeetings: vi.fn(),
  deletePastMeetings: vi.fn(),
}));

// --- Helper for mock Notice ---
const mockNotice = (overrides = {}) => ({
  id: '1',
  title: 'Test Notice',
  content: 'Notice content',
  category: 'general',
  community_id: null,
  created_by: null,
  updatedAt: null,
  created_at: '2024-01-01',
  likesCount: 0,
  hasLiked: false,
  ...overrides,
});

// --- Helper for mock Meeting ---
const mockMeeting = (overrides = {}) => ({
  id: '1',
  title: 'Test Meeting',
  description: 'Meeting description',
  meeting_date: '2024-01-01',
  duration: '1h',
  created_by: null,
  community_id: null,
  created_at: '2024-01-01',
  ...overrides,
});

// --- Custom render function ---
const customRender = (ui: React.ReactElement) => {
  return render(
    <MantineProvider>
      {ui}
    </MantineProvider>
  );
};

describe('AdminNoticesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(actions.getNotices).mockResolvedValue({ data: [], count: 0 });
    vi.mocked(actions.getMeetings).mockResolvedValue([]);
  });

  // --- TEST 1 ---
  it('renders basic page structure', async () => {
    customRender(<AdminNoticesPage />);
    
    await waitFor(() => {
      expect(screen.getByTestId('filters')).toBeInTheDocument();
    });
  });

  // --- TEST 2 ---
  it('shows data when loaded', async () => {
    vi.mocked(actions.getNotices).mockResolvedValue({
      data: [mockNotice({ id: '1', title: 'Test Notice' })],
      count: 1,
    });
    
    customRender(<AdminNoticesPage />);
    
    await waitFor(() => {
      expect(actions.getNotices).toHaveBeenCalled();
    });
  });

  // --- TEST 3 ---
  it('renders NoticeCard items when notices are loaded', async () => {
    vi.mocked(actions.getNotices).mockResolvedValue({
      data: [
        mockNotice({ id: '1', title: 'First Notice' }),
        mockNotice({ id: '2', title: 'Second Notice' }),
      ],
      count: 2,
    });

    customRender(<AdminNoticesPage />);

    await waitFor(() => {
      expect(screen.getByTestId('notice-1')).toBeInTheDocument();
      expect(screen.getByTestId('notice-2')).toBeInTheDocument();
    });
  });

  // --- TEST 4 ---
  it('calls router.push when clicking Next page', async () => {
    vi.mocked(actions.getNotices).mockResolvedValue({
      data: [mockNotice({ id: '1', title: 'Notice For Page 1' })],
      count: 10,
    });

    customRender(<AdminNoticesPage />);

    await waitFor(() => {
      expect(screen.getByTestId('notice-1')).toBeInTheDocument();
    });

    const nextButton = screen.getByText('Next →');
    nextButton.click();

    expect(mockPush).toHaveBeenCalledWith('?page=2');
  });

});
