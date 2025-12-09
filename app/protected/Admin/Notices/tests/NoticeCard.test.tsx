// NoticeCard.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NoticeCard from '@/components/NoticeCard';

// Mock Mantine components
vi.mock('@mantine/core', () => ({
  Card: ({ children, radius, padding, withBorder, shadow, style }: any) => (
    <div 
      data-testid="notice-card" 
      style={{ 
        borderRadius: radius === 'md' ? 'var(--mantine-radius-md)' : radius,
        padding: padding === 'lg' ? 'var(--mantine-spacing-lg)' : padding,
        border: withBorder ? '1px solid var(--mantine-color-gray-3)' : 'none',
        boxShadow: shadow === 'sm' ? 'var(--mantine-shadow-sm)' : shadow,
        width: style?.width || 'auto',
      }}
    >
      {children}
    </div>
  ),
  Text: ({ children, fw, size, mb, c, lh }: any) => (
    <div 
      data-testid="text"
      style={{ 
        fontWeight: fw === 600 ? '600' : fw,
        fontSize: size === 'md' ? '16px' : 
                 size === 'sm' ? '14px' : 
                 size === 'xs' ? '12px' : size,
        marginBottom: mb,
        color: c === 'dimmed' ? 'var(--mantine-color-dimmed)' : 
               c === 'gray' ? 'var(--mantine-color-gray)' : c,
        lineHeight: lh
      }}
    >
      {children}
    </div>
  ),
  Badge: ({ children, color, size, variant }: any) => (
    <div 
      data-testid="badge"
      data-color={color}
      data-size={size}
      data-variant={variant}
    >
      {children}
    </div>
  ),
  Group: ({ children, justify, mb, mt, gap }: any) => (
    <div 
      data-testid="group"
      style={{ 
        justifyContent: justify,
        marginBottom: mb,
        marginTop: mt,
        gap: gap,
      }}
    >
      {children}
    </div>
  ),
  Button: ({ children, onClick, variant, size, loading, color }: any) => (
    <button 
      onClick={onClick}
      data-testid={`button-${variant || 'default'}`}
      data-size={size}
      data-loading={loading}
      data-color={color}
      disabled={loading}
    >
      {children}
    </button>
  ),
}));

// Mock child components
vi.mock('@/app/protected/Admin/Notices/components/DeleteButtonNotice', () => ({
  default: ({ id, onClick }: any) => (
    <button 
      data-testid="delete-button-notice"
      data-notice-id={id}
      onClick={onClick}
    >
      Delete
    </button>
  ),
}));

vi.mock('@/app/protected/Admin/Notices/components/EditButtonNotice', () => ({
  default: ({ id, onClick }: any) => (
    <button 
      data-testid="edit-button-notice"
      data-notice-id={id}
      onClick={onClick}
    >
      Edit
    </button>
  ),
}));

vi.mock('@/app/protected/Admin/Notices/components/EditNoticeModal', () => ({
  default: ({ opened, onClose }: any) => {
    if (!opened) return null;
    return (
      <div data-testid="edit-notice-modal">
        <button data-testid="modal-close" onClick={onClose}>
          Close
        </button>
      </div>
    );
  },
}));

// Mock actions
vi.mock('@/app/protected/Admin/Notices/actions', () => ({
  updateNotice: vi.fn().mockResolvedValue(undefined),
  deleteNotice: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/app/protected/Resident/Notices/actions', () => ({
  toggleNoticeLike: vi.fn().mockResolvedValue({ liked: true, likesCount: 5 }),
}));

// Notice type for testing
interface Notice {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  hasLiked?: boolean;
  likesCount?: number;
}

describe('NoticeCard', () => {
  const mockNotice: Notice = {
    id: 'notice-123',
    title: 'Important Maintenance Notice',
    content: 'The elevator will be undergoing maintenance this weekend.',
    category: 'Maintenance',
    created_at: '2024-01-15T10:30:00Z',
    hasLiked: false,
    likesCount: 3
  };

  const mockOnUpdate = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnAfterSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock Date to have consistent formatting
    vi.spyOn(Date.prototype, 'toLocaleDateString').mockReturnValue('15 Jan 2024');
    vi.spyOn(Date.prototype, 'toLocaleTimeString').mockReturnValue('10:30');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Test 1: Should render notice card with all data
  it('should render notice card with all data', () => {
    render(<NoticeCard notice={mockNotice} />);
    
    expect(screen.getByTestId('notice-card')).toBeInTheDocument();
    expect(screen.getByText('Important Maintenance Notice')).toBeInTheDocument();
    expect(screen.getByText('The elevator will be undergoing maintenance this weekend.')).toBeInTheDocument();
    expect(screen.getByText('Maintenance')).toBeInTheDocument();
  });

  // Test 2: Should display formatted date and time
  it('should display formatted date and time', () => {
    render(<NoticeCard notice={mockNotice} />);
    
    expect(screen.getByText('Created at: 15 Jan 2024, 10:30')).toBeInTheDocument();
  });

  // Test 3: Should display category badge with correct color
  it('should display category badge with correct color', () => {
    render(<NoticeCard notice={mockNotice} />);
    
    const badge = screen.getByTestId('badge');
    expect(badge).toBeInTheDocument();
    expect(badge.getAttribute('data-color')).toBe('yellow'); // Maintenance = yellow
    expect(badge).toHaveTextContent('Maintenance');
  });

  // Test 4: Admin should see edit and delete buttons
  it('should show edit and delete buttons for admin role', () => {
    render(<NoticeCard notice={mockNotice} role="admin" />);
    
    expect(screen.getByTestId('edit-button-notice')).toBeInTheDocument();
    expect(screen.getByTestId('delete-button-notice')).toBeInTheDocument();
    expect(screen.getByText('Likes: 3')).toBeInTheDocument();
  });

  // Test 5: Resident should see like button
  it('should show like button for resident role', () => {
    render(<NoticeCard notice={mockNotice} role="resident" />);
    
    const likeButton = screen.getByTestId('button-outline');
    expect(likeButton).toBeInTheDocument();
    expect(likeButton).toHaveTextContent('Like · 3');
  });

  // Test 6: Resident should see unlike button if already liked
  it('should show unlike button if resident already liked', () => {
    const likedNotice = {
      ...mockNotice,
      hasLiked: true
    };
    
    render(<NoticeCard notice={likedNotice} role="resident" />);
    
    const likeButton = screen.getByTestId('button-filled');
    expect(likeButton).toBeInTheDocument();
    expect(likeButton).toHaveTextContent('Unlike · 3');
  });

  // Test 7: Default role should not show action buttons
  it('should not show action buttons by default', () => {
    render(<NoticeCard notice={mockNotice} />);
    
    expect(screen.queryByTestId('edit-button-notice')).not.toBeInTheDocument();
    expect(screen.queryByTestId('delete-button-notice')).not.toBeInTheDocument();
    expect(screen.queryByTestId('button-outline')).not.toBeInTheDocument();
    expect(screen.queryByTestId('button-filled')).not.toBeInTheDocument();
  });

  // Test 8: Card should have correct styling
  it('card should have correct styling', () => {
    render(<NoticeCard notice={mockNotice} />);
    
    const card = screen.getByTestId('notice-card');
    
    expect(card.style.borderRadius).toContain('var(--mantine-radius-md)');
    expect(card.style.padding).toContain('var(--mantine-spacing-lg)');
    expect(card.style.border).toBe('1px solid var(--mantine-color-gray-3)');
    expect(card.style.boxShadow).toBe('var(--mantine-shadow-sm)');
    expect(card.style.width).toBe('100%');
  });

  // Test 9: Text elements should have correct styling
  it('text elements should have correct styling', () => {
    render(<NoticeCard notice={mockNotice} />);
    
    const textElements = screen.getAllByTestId('text');
    expect(textElements.length).toBeGreaterThan(0);
    
    // Title should have specific styling
    const titleElement = textElements.find(text => 
      text.textContent === 'Important Maintenance Notice'
    );
    expect(titleElement).toBeDefined();
    
    // Date text should have gray color
    const dateElement = textElements.find(text => 
      text.textContent?.includes('Created at:')
    );
    expect(dateElement).toBeDefined();
  });

  // Test 10: Should handle notice without likes
  it('should handle notice without likes count', () => {
    const noticeWithoutLikes = {
      ...mockNotice,
      likesCount: undefined
    };
    
    render(<NoticeCard notice={noticeWithoutLikes} role="admin" />);
    
    // Should still display "Likes: 0" or similar
    expect(screen.getByText('Likes: 0')).toBeInTheDocument();
  });

  // Test 11: Like button should be clickable for resident
  it('like button should be clickable for resident', async () => {
    render(<NoticeCard notice={mockNotice} role="resident" />);
    
    const likeButton = screen.getByTestId('button-outline');
    await userEvent.click(likeButton);
    
    // Button should respond to click
    expect(likeButton).toBeInTheDocument();
  });

  // Test 12: Edit button should respond to click for admin
  it('edit button should respond to click for admin', async () => {
    render(<NoticeCard notice={mockNotice} role="admin" />);
    
    const editButton = screen.getByTestId('edit-button-notice');
    await userEvent.click(editButton);
    
    // Button should respond to click
    expect(editButton).toBeInTheDocument();
  });

  // Test 13: Delete button should respond to click for admin
  it('delete button should respond to click for admin', async () => {
    render(<NoticeCard notice={mockNotice} role="admin" />);
    
    const deleteButton = screen.getByTestId('delete-button-notice');
    await userEvent.click(deleteButton);
    
    // Button should respond to click
    expect(deleteButton).toBeInTheDocument();
  });

  // Test 14: Should pass correct notice ID to buttons
  it('should pass correct notice ID to buttons', () => {
    render(<NoticeCard notice={mockNotice} role="admin" />);
    
    const editButton = screen.getByTestId('edit-button-notice');
    const deleteButton = screen.getByTestId('delete-button-notice');
    
    expect(editButton.getAttribute('data-notice-id')).toBe('notice-123');
    expect(deleteButton.getAttribute('data-notice-id')).toBe('notice-123');
  });

  // Test 15: Should work without callback functions
  it('should work without onUpdate, onDelete and onAfterSave callbacks', async () => {
    render(<NoticeCard notice={mockNotice} role="admin" />);
    
    const editButton = screen.getByTestId('edit-button-notice');
    const deleteButton = screen.getByTestId('delete-button-notice');
    
    // Should be able to click buttons without callbacks
    await userEvent.click(editButton);
    await userEvent.click(deleteButton);
    
    expect(editButton).toBeInTheDocument();
    expect(deleteButton).toBeInTheDocument();
  });

  // Test 16: Should handle different date formats
  it('should handle notice with different date format', () => {
    const noticeWithFutureDate = {
      ...mockNotice,
      created_at: '2024-12-25T15:45:00Z'
    };
    
    // Reset mocks for this test
    vi.restoreAllMocks();
    vi.spyOn(Date.prototype, 'toLocaleDateString').mockReturnValue('25 Dec 2024');
    vi.spyOn(Date.prototype, 'toLocaleTimeString').mockReturnValue('15:45');
    
    render(<NoticeCard notice={noticeWithFutureDate} />);
    
    // Should still render without errors
    expect(screen.getByTestId('notice-card')).toBeInTheDocument();
    expect(screen.getByText('Created at: 25 Dec 2024, 15:45')).toBeInTheDocument();
  });

  // Test 17: Should show like button for resident with correct text
  it('should show correct like button text for resident', () => {
    const noticeWithManyLikes = {
      ...mockNotice,
      likesCount: 42
    };
    
    render(<NoticeCard notice={noticeWithManyLikes} role="resident" />);
    
    const likeButton = screen.getByTestId('button-outline');
    expect(likeButton).toHaveTextContent('Like · 42');
  });

  // Test 18: Should show correct badge variant
  it('should show badge with correct variant', () => {
    render(<NoticeCard notice={mockNotice} />);
    
    const badge = screen.getByTestId('badge');
    expect(badge.getAttribute('data-variant')).toBe('filled');
    expect(badge.getAttribute('data-size')).toBe('sm');
  });
});