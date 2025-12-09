import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ResidentNoticesPage from '@/app/protected/Resident/Notices/page';
import { getNotices, getMeetings } from '@/app/protected/Resident/Notices/actions';

// Мокаем серверные действия
vi.mock('@/app/protected/Resident/Notices/actions', () => ({
  getNotices: vi.fn(),
  getMeetings: vi.fn(),
}));

// Мокаем компоненты
vi.mock('@/components/NoticeCard', () => ({
  default: ({ notice }: any) => (
    <div data-testid="notice-card">
      <div>{notice.title}</div>
      <div>{notice.content}</div>
    </div>
  ),
}));

vi.mock('@/components/MeetingCard', () => ({
  default: ({ meeting }: any) => (
    <div data-testid="meeting-card">
      <div>{meeting.title}</div>
      <div>{meeting.description}</div>
    </div>
  ),
}));

vi.mock('@/components/FiltersNotices', () => ({
  default: () => <div data-testid="filters">Filters Component</div>,
}));

// Мокаем next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  })),
  useSearchParams: vi.fn(() => ({
    get: vi.fn((key: string) => {
      if (key === 'page') return '1';
      if (key === 'category') return '';
      if (key === 'sort') return 'newest';
      return null;
    }),
    toString: vi.fn(() => ''),
  })),
}));

// Мокаем Mantine компоненты
vi.mock('@mantine/core', () => ({
  Flex: ({ children, ...props }: any) => <div data-testid="flex" {...props}>{children}</div>,
  Divider: ({ orientation, color, ...props }: any) => <hr data-testid="divider" data-orientation={orientation} data-color={color} {...props} />,
  Group: ({ children, ...props }: any) => <div data-testid="group" {...props}>{children}</div>,
  Text: ({ children, ...props }: any) => <span data-testid="text" {...props}>{children}</span>,
  Badge: ({ children, ...props }: any) => <span data-testid="badge" {...props}>{children}</span>,
}));

describe('ResidentNoticesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getNotices as any).mockResolvedValue({ data: [], count: 0 });
    (getMeetings as any).mockResolvedValue([]);
  });

  it('renders page title and sections', async () => {
    render(<ResidentNoticesPage />);
    expect(screen.getByText('Notices')).toBeInTheDocument();
    expect(screen.getByText('Meetings')).toBeInTheDocument();
    expect(screen.getByTestId('filters')).toBeInTheDocument();
    await waitFor(() => {
      expect(getNotices).toHaveBeenCalled();
      expect(getMeetings).toHaveBeenCalled();
    });
  });

  it('displays notices and meetings when data exists', async () => {
    const mockNotices = [
      { id: '1', title: 'Test', content: 'Content', category: 'General', created_at: '', likesCount: 0, hasLiked: false },
      { id: '2', title: 'Notice2', content: 'Content2', category: 'Maintenance', created_at: '', likesCount: 0, hasLiked: false },
    ];
    const mockMeetings = [
      { id: '1', title: 'Meeting1', description: 'Desc', meeting_date: '', duration: '1', community_id: 'c1' }
    ];
    (getNotices as any).mockResolvedValue({ data: mockNotices, count: 2 });
    (getMeetings as any).mockResolvedValue(mockMeetings);

    render(<ResidentNoticesPage />);
    await waitFor(() => {
      expect(screen.getByText('Test')).toBeInTheDocument();
      expect(screen.getByText('Notice2')).toBeInTheDocument();
      expect(screen.getByText('Meeting1')).toBeInTheDocument();
    });
    expect(screen.getAllByTestId('notice-card')).toHaveLength(2);
    expect(screen.getAllByTestId('meeting-card')).toHaveLength(1);
  });

  it('displays empty state when no data', async () => {
    render(<ResidentNoticesPage />);
    await waitFor(() => {
      expect(screen.getByText(/No notices yet/i)).toBeInTheDocument();
      expect(screen.getByText(/No meetings yet/i)).toBeInTheDocument();
    });
  });

  it('fetches data with correct parameters', async () => {
    const mockSearchParams = {
      get: vi.fn((key: string) => {
        if (key === 'page') return '2';
        if (key === 'category') return 'Safety';
        if (key === 'sort') return 'oldest';
        return null;
      }),
      toString: vi.fn(() => 'page=2&category=Safety&sort=oldest'),
    };
    const { useSearchParams } = await import('next/navigation');
    (useSearchParams as any).mockReturnValue(mockSearchParams);

    render(<ResidentNoticesPage />);
    await waitFor(() => {
      expect(getNotices).toHaveBeenCalledWith(2, 3, 'Safety', 'oldest');
      expect(getMeetings).toHaveBeenCalled();
    });
  });

  it('displays correct badges for category and sort', async () => {
    const mockSearchParams = {
      get: vi.fn((key: string) => {
        if (key === 'category') return '';
        if (key === 'sort') return 'newest';
        return null;
      }),
      toString: vi.fn(() => ''),
    };
    const { useSearchParams } = await import('next/navigation');
    (useSearchParams as any).mockReturnValue(mockSearchParams);

    render(<ResidentNoticesPage />);
    await waitFor(() => {
      const badges = screen.getAllByTestId('badge');
      expect(badges.some(b => b.textContent === 'All')).toBe(true);
      expect(badges.some(b => b.textContent === 'Newest')).toBe(true);
    });
  });

  it('renders pagination correctly', async () => {
    (getNotices as any).mockResolvedValue({
      data: [{ id: '1', title: 'Test', content: 'Content', category: '', created_at: '', likesCount: 0, hasLiked: false }],
      count: 4
    });
    render(<ResidentNoticesPage />);
    await waitFor(() => {
      const pageText = screen.getAllByTestId('text').find(t => t.textContent?.match(/\d+\s*\/\s*\d+/));
      expect(pageText).toBeTruthy();
      expect(pageText?.textContent).toMatch(/1\s*\/\s*2/);
    });
  });

  it('navigates to next page when clicking Next', async () => {
    const pushMock = vi.fn();
    const { useRouter } = await import('next/navigation');
    (useRouter as any).mockReturnValue({ push: pushMock, replace: vi.fn(), prefetch: vi.fn() });

    (getNotices as any).mockResolvedValue({
      data: [{ id: '1', title: 'Test', content: 'Content', category: '', created_at: '', likesCount: 0, hasLiked: false }],
      count: 4
    });

    render(<ResidentNoticesPage />);
    await waitFor(() => {
      const nextButton = screen.getByText('Next →');
      expect(nextButton).toBeTruthy();
      fireEvent.click(nextButton);
      expect(pushMock).toHaveBeenCalled();
    });
  });

  it('navigates to previous page when clicking Previous', async () => {
    const pushMock = vi.fn();
    const { useRouter, useSearchParams } = await import('next/navigation');
    (useRouter as any).mockReturnValue({ push: pushMock, replace: vi.fn(), prefetch: vi.fn() });
    (useSearchParams as any).mockReturnValue({
      get: vi.fn((key: string) => (key === 'page' ? '2' : '')),
      toString: vi.fn(() => 'page=2')
    });

    (getNotices as any).mockResolvedValue({
      data: [{ id: '1', title: 'Test', content: 'Content', category: '', created_at: '', likesCount: 0, hasLiked: false }],
      count: 4
    });

    render(<ResidentNoticesPage />);
    await waitFor(() => {
      const prevButton = screen.getByText('← Previous');
      expect(prevButton).toBeTruthy();
      fireEvent.click(prevButton);
      expect(pushMock).toHaveBeenCalled();
    });
  });

  it('renders multiple pages correctly', async () => {
    (getNotices as any).mockResolvedValue({
      data: Array.from({ length: 6 }, (_, i) => ({ id: `${i}`, title: `Notice${i}`, content: 'Content', category: '', created_at: '', likesCount: 0, hasLiked: false })),
      count: 6
    });
    render(<ResidentNoticesPage />);
    await waitFor(() => {
      expect(screen.getAllByTestId('notice-card')).toHaveLength(6);
    });
  });

  it('updates when category changes', async () => {
    const mockSearchParams = {
      get: vi.fn((k: string) => (k === 'category' ? 'Safety' : '1')),
      toString: vi.fn(() => 'page=1&category=Safety')
    };
    const { useSearchParams } = await import('next/navigation');
    (useSearchParams as any).mockReturnValue(mockSearchParams);

    render(<ResidentNoticesPage />);
    await waitFor(() => {
      const badges = screen.getAllByTestId('badge');
      expect(badges.some(b => b.textContent === 'Safety')).toBe(true);
    });
  });
});
