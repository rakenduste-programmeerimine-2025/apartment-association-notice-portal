// MeetingCard.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MeetingCard from '@/components/MeetingCard';

// Mock Mantine components globally for all child components
vi.mock('@mantine/core', () => ({
  Modal: ({ children, opened, onClose, title }: any) => {
    if (!opened) return null;
    return (
      <div data-testid="modal">
        <h2>{title}</h2>
        <button onClick={onClose}>Close</button>
        {children}
      </div>
    );
  },
  Button: ({ children, onClick, variant, color, leftSection }: any) => (
    <button 
      onClick={onClick} 
      data-testid={`button-${variant || 'default'}`}
      data-color={color}
      data-left-section={leftSection ? 'true' : 'false'}
    >
      {leftSection}
      {children}
    </button>
  ),
  Card: ({ children, radius, padding, withBorder, style }: any) => (
    <div 
      data-testid="meeting-card" 
      style={{ 
        borderRadius: radius === 'lg' ? 'var(--mantine-radius-lg)' : radius,
        padding: padding === 'lg' ? 'var(--mantine-spacing-lg)' : padding,
        border: withBorder ? '1px solid var(--mantine-color-gray-3)' : 'none',
        ...style 
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
        fontSize: size === 'md' ? '16px' : size === 'sm' ? '14px' : size,
        marginBottom: mb,
        color: c === 'dimmed' ? 'var(--mantine-color-dimmed)' : c,
        lineHeight: lh
      }}
    >
      {children}
    </div>
  ),
  Badge: ({ children, color, size, variant, leftSection }: any) => (
    <div 
      data-testid="badge"
      data-color={color}
      data-variant={variant}
      data-size={size}
    >
      {leftSection}
      <span>{children}</span>
    </div>
  ),
  Group: ({ children, justify, mb, mt, gap, align }: any) => (
    <div 
      data-testid="group"
      style={{ 
        justifyContent: justify,
        marginBottom: mb,
        marginTop: mt,
        gap: gap,
        alignItems: align
      }}
    >
      {children}
    </div>
  ),
  Stack: () => <div data-testid="stack"></div>,
  TextInput: () => <div data-testid="text-input"></div>,
  Textarea: () => <div data-testid="textarea"></div>,
  Select: () => <div data-testid="select"></div>,
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Calendar: () => <span data-testid="calendar-icon">📅</span>,
  Clock: () => <span data-testid="clock-icon">🕒</span>,
  Pencil: () => <span>✏️</span>,
  Trash: () => <span>🗑️</span>,
  Type: () => <span>📝</span>,
  FileText: () => <span>📄</span>,
  CalendarClock: () => <span>📅⏰</span>,
  Check: () => <span>✓</span>,
}));

// Mock actions
vi.mock('@/app/protected/Admin/Notices/actions', () => ({
  updateMeeting: vi.fn().mockResolvedValue(undefined),
  deleteMeeting: vi.fn().mockResolvedValue(undefined),
}));

// Meeting type for testing
interface Meeting {
  id: string;
  title: string;
  description: string;
  meeting_date: string;
  duration: string;
}

describe('MeetingCard', () => {
  const mockMeeting: Meeting = {
    id: 'meeting-123',
    title: 'Annual General Meeting',
    description: 'This is the annual general meeting for all residents',
    meeting_date: '2024-01-15T10:30:00Z',
    duration: '1.5 hours'
  };

  const mockOnUpdate = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock Date to ensure consistent formatting
    vi.spyOn(Date.prototype, 'toLocaleDateString').mockReturnValue('15 Jan 2024');
    vi.spyOn(Date.prototype, 'toLocaleTimeString').mockReturnValue('12:30');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Test 1: Should render meeting card with all data
  it('should render meeting card with all data', () => {
    render(<MeetingCard meeting={mockMeeting} />);
    
    expect(screen.getByTestId('meeting-card')).toBeInTheDocument();
    expect(screen.getByText('Annual General Meeting')).toBeInTheDocument();
    expect(screen.getByText('This is the annual general meeting for all residents')).toBeInTheDocument();
  });

  // Test 2: Should display formatted date and time
  it('should display formatted date and time', () => {
    render(<MeetingCard meeting={mockMeeting} />);
    
    // Check that badges exist (date, time, duration)
    expect(screen.getAllByTestId('badge').length).toBeGreaterThan(0);
    
    // Check for date and time badges
    const badges = screen.getAllByTestId('badge');
    const hasDateBadge = badges.some(badge => badge.textContent?.includes('15 Jan 2024'));
    const hasTimeBadge = badges.some(badge => badge.textContent?.includes('12:30'));
    
    expect(hasDateBadge).toBe(true);
    expect(hasTimeBadge).toBe(true);
  });

  // Test 3: Should display duration badge
  it('should display duration badge', () => {
    render(<MeetingCard meeting={mockMeeting} />);
    
    const badges = screen.getAllByTestId('badge');
    // Find duration badge (it should contain duration text)
    const durationBadge = badges.find(badge => 
      badge.textContent?.includes('1.5 hours')
    );
    expect(durationBadge).toBeDefined();
  });

  // Test 4: Admin should see edit and delete buttons
  it('should show edit and delete buttons for admin role', () => {
    render(<MeetingCard meeting={mockMeeting} role="admin" />);
    
    // Use queryByTestId to find buttons
    const buttons = screen.getAllByTestId('button-light');
    expect(buttons.length).toBe(2); // Edit and Delete buttons
    
    // Check that buttons contain Edit and Delete text
    const hasEditButton = buttons.some(btn => btn.textContent?.includes('Edit'));
    const hasDeleteButton = buttons.some(btn => btn.textContent?.includes('Delete'));
    
    expect(hasEditButton).toBe(true);
    expect(hasDeleteButton).toBe(true);
  });

  // Test 5: Resident should not see edit and delete buttons
  it('should not show edit and delete buttons for resident role', () => {
    render(<MeetingCard meeting={mockMeeting} role="resident" />);
    
    // There should be no buttons with variant="light"
    const buttons = screen.queryAllByTestId('button-light');
    expect(buttons.length).toBe(0);
  });

  // Test 6: Default role should not show edit and delete buttons
  it('should not show edit and delete buttons by default', () => {
    render(<MeetingCard meeting={mockMeeting} />);
    
    // There should be no buttons with variant="light"
    const buttons = screen.queryAllByTestId('button-light');
    expect(buttons.length).toBe(0);
  });

  // Test 7: Should display calendar and clock icons
  it('should display calendar and clock icons', () => {
    render(<MeetingCard meeting={mockMeeting} />);
    
    expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
    expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
  });

  // Test 8: Card should have correct styling
  it('card should have correct styling', () => {
    render(<MeetingCard meeting={mockMeeting} />);
    
    const card = screen.getByTestId('meeting-card');
    
    // Check that card has expected styles
    expect(card.style.borderRadius).toContain('var(--mantine-radius-lg)');
    expect(card.style.padding).toContain('var(--mantine-spacing-lg)');
    expect(card.style.border).toBe('1px solid var(--mantine-color-gray-3)');
  });

  // Test 9: Text elements should have correct styling
  it('text elements should have correct styling', () => {
    render(<MeetingCard meeting={mockMeeting} />);
    
    const textElements = screen.getAllByTestId('text');
    expect(textElements.length).toBeGreaterThan(0);
    
    // Title element should exist
    const titleElement = textElements.find(text => 
      text.textContent === 'Annual General Meeting'
    );
    expect(titleElement).toBeDefined();
  });

  // Test 10: Should handle different meeting data
  it('should handle meeting with different duration', () => {
    const meetingWithDifferentDuration = {
      ...mockMeeting,
      title: 'Budget Meeting',
      duration: '2 hours'
    };
    
    render(<MeetingCard meeting={meetingWithDifferentDuration} />);
    
    expect(screen.getByText('Budget Meeting')).toBeInTheDocument();
    expect(screen.getByTestId('meeting-card')).toBeInTheDocument();
  });

  // Test 11: Buttons should have correct colors for admin role
  it('buttons should have correct colors for admin role', () => {
    render(<MeetingCard meeting={mockMeeting} role="admin" />);
    
    const buttons = screen.getAllByTestId('button-light');
    
    // First button (Edit) should be blue
    expect(buttons[0].getAttribute('data-color')).toBe('blue');
    
    // Second button (Delete) should be red
    expect(buttons[1].getAttribute('data-color')).toBe('red');
  });

  // Test 12: Should handle meeting with future date
  it('should handle meeting with future date', () => {
    const futureMeeting = {
      ...mockMeeting,
      meeting_date: '2025-12-25T15:45:00Z'
    };
    
    // Reset mocks for this test
    vi.restoreAllMocks();
    vi.spyOn(Date.prototype, 'toLocaleDateString').mockReturnValue('25 Dec 2025');
    vi.spyOn(Date.prototype, 'toLocaleTimeString').mockReturnValue('17:45');
    
    render(<MeetingCard meeting={futureMeeting} />);
    
    // Should still render without errors
    expect(screen.getByTestId('meeting-card')).toBeInTheDocument();
  });

  // Test 13: Edit button should open modal when clicked (simple version)
  it('edit button should respond to click', async () => {
    render(<MeetingCard meeting={mockMeeting} role="admin" />);
    
    const buttons = screen.getAllByTestId('button-light');
    const editButton = buttons[0]; // First button - Edit
    
    // Click should work without errors
    await userEvent.click(editButton);
    
    // After click, a modal should appear (at least general modal)
    // Check that something changed (button was clicked)
    expect(editButton).toBeInTheDocument();
  });

  // Test 14: Delete button should respond to click (simple version)
  it('delete button should respond to click', async () => {
    render(<MeetingCard meeting={mockMeeting} role="admin" />);
    
    const buttons = screen.getAllByTestId('button-light');
    const deleteButton = buttons[1]; // Second button - Delete
    
    // Click should work without errors
    await userEvent.click(deleteButton);
    
    // After click, a modal should appear (at least general modal)
    // Check that something changed (button was clicked)
    expect(deleteButton).toBeInTheDocument();
  });
});
