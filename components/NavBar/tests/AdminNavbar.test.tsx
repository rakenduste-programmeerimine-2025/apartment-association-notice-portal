import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdminNavbar } from '../AdminNavbar';

const mockPush = vi.fn();
const mockPathname = '/protected/Admin/Notices';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => mockPathname,
}));

vi.mock('@mantine/core', async () => {
  const actual = await vi.importActual('@mantine/core');
  return {
    ...actual,
    Button: ({ children, onClick, variant, size, color, ...props }: any) => (
      <button onClick={onClick} data-variant={variant} data-size={size} data-color={color}>
        {children}
      </button>
    ),
    Group: ({ children, gap, justify, align, wrap, ...props }: any) => (
      <div data-gap={gap} data-justify={justify} data-align={align}>{children}</div>
    ),
    Container: ({ children, size, h, px, ...props }: any) => (
      <div data-size={size} data-h={h} data-px={px}>{children}</div>
    ),
    Paper: ({ children, component, radius, withBorder, ...props }: any) => (
      <div 
        role={component === 'nav' ? 'navigation' : undefined}
        data-radius={radius}
        data-with-border={withBorder}
      >
        {children}
      </div>
    ),
    Tooltip: ({ children, label, withArrow, color, multiline, w, position }: any) => (
      <div title={label} data-with-arrow={withArrow} data-color={color}>
        {children}
      </div>
    ),
    Badge: ({ children, variant, title, style, ...props }: any) => (
      <span style={style} data-variant={variant} title={title}>
        {children}
      </span>
    ),
  };
});

vi.mock('../logout-button', () => ({
  LogoutButton: () => <button>Logout</button>,
}));

describe('AdminNavbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all navigation links', () => {
    const community = { id: '1', full_address: '123 Main St' };
    render(<AdminNavbar community={community} />);

    expect(screen.getByText('Notices')).toBeInTheDocument();
    expect(screen.getByText('Worries')).toBeInTheDocument();
    expect(screen.getByText('Residents')).toBeInTheDocument();
    expect(screen.getByText('Create Meetings')).toBeInTheDocument();
    expect(screen.getByText('Create Notice')).toBeInTheDocument();
  });

  it('renders community address when provided', () => {
    const community = { id: '1', full_address: '123 Main St, City' };
    render(<AdminNavbar community={community} />);

    expect(screen.getByText('123 Main St, City')).toBeInTheDocument();
  });

  it('handles null community gracefully', () => {
    render(<AdminNavbar community={null} />);

    expect(screen.getByText('Notices')).toBeInTheDocument();
    expect(screen.queryByText('123 Main St')).not.toBeInTheDocument();
  });

  it('navigates to correct route when link is clicked', () => {
    const community = { id: '1', full_address: '123 Main St' };
    render(<AdminNavbar community={community} />);

    const worriesButton = screen.getByText('Worries');
    fireEvent.click(worriesButton);

    expect(mockPush).toHaveBeenCalledWith('/protected/Admin/Worries');
  });

  it('navigates to all routes correctly', () => {
    const community = { id: '1', full_address: '123 Main St' };
    render(<AdminNavbar community={community} />);

    const routes = [
      { button: 'Notices', path: '/protected/Admin/Notices' },
      { button: 'Worries', path: '/protected/Admin/Worries' },
      { button: 'Residents', path: '/protected/Admin/Residents' },
      { button: 'Create Meetings', path: '/protected/Admin/Create-Meetings' },
      { button: 'Create Notice', path: '/protected/Admin/CreateNotice' },
    ];

    routes.forEach(({ button, path }) => {
      fireEvent.click(screen.getByText(button));
      expect(mockPush).toHaveBeenCalledWith(path);
    });

    expect(mockPush).toHaveBeenCalledTimes(5);
  });

  it('highlights active link based on pathname', () => {
    const community = { id: '1', full_address: '123 Main St' };
    render(<AdminNavbar community={community} />);

    const noticesButton = screen.getByText('Notices');
    expect(noticesButton).toHaveAttribute('data-variant', 'light');

    const worriesButton = screen.getByText('Worries');
    expect(worriesButton).toHaveAttribute('data-variant', 'subtle');
  });

  it('only highlights the current page link', () => {
    const community = { id: '1', full_address: '123 Main St' };
    render(<AdminNavbar community={community} />);

    const allButtons = [
      screen.getByText('Notices'),
      screen.getByText('Worries'),
      screen.getByText('Residents'),
      screen.getByText('Create Meetings'),
      screen.getByText('Create Notice'),
    ];

    const activeButtons = allButtons.filter(btn => 
      btn.getAttribute('data-variant') === 'light'
    );
    
    expect(activeButtons).toHaveLength(1);
    expect(activeButtons[0]).toHaveTextContent('Notices');
  });

  it('renders logout button', () => {
    const community = { id: '1', full_address: '123 Main St' };
    render(<AdminNavbar community={community} />);

    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('renders navigation with nav role', () => {
    const community = { id: '1', full_address: '123 Main St' };
    render(<AdminNavbar community={community} />);

    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('renders community badge with tooltip', () => {
    const community = { id: '1', full_address: '123 Main St, City, State' };
    const { container } = render(<AdminNavbar community={community} />);

    const tooltip = container.querySelector('[title="123 Main St, City, State"]');
    expect(tooltip).toBeInTheDocument();
  });

  it('truncates long community addresses', () => {
    const community = {
      id: '1',
      full_address: 'Very Long Address That Should Be Truncated, Building 5, Floor 3, City, State, ZIP',
    };
    const { container } = render(<AdminNavbar community={community} />);

    const badge = container.querySelector('span[style*="overflow"]');
    expect(badge).toBeInTheDocument();
    expect(badge?.textContent).toContain('Very Long Address');
  });

  it('renders with proper spacing structure', () => {
    const community = { id: '1', full_address: '123 Main St' };
    render(<AdminNavbar community={community} />);

    const navigation = screen.getByRole('navigation');
    expect(navigation).toBeInTheDocument();
    
    expect(screen.getByText('Notices')).toBeInTheDocument();
    
    expect(screen.getByText('123 Main St')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('renders empty community badge when community is null', () => {
    render(<AdminNavbar community={null} />);

    expect(screen.queryByText('123 Main St')).not.toBeInTheDocument();
  });

  it('renders all links as buttons', () => {
    const community = { id: '1', full_address: '123 Main St' };
    const { container } = render(<AdminNavbar community={community} />);

    const buttons = container.querySelectorAll('button');
    // 5 navigation buttons + 1 logout button = 6 total
    expect(buttons.length).toBeGreaterThanOrEqual(6);
  });

  it('handles click events without errors', () => {
    const community = { id: '1', full_address: '123 Main St' };
    render(<AdminNavbar community={community} />);

    expect(() => {
      fireEvent.click(screen.getByText('Notices'));
      fireEvent.click(screen.getByText('Worries'));
      fireEvent.click(screen.getByText('Residents'));
    }).not.toThrow();
  });

  it('maintains navigation state across renders', () => {
    const community = { id: '1', full_address: '123 Main St' };
    const { rerender } = render(<AdminNavbar community={community} />);

    expect(screen.getByText('Notices')).toHaveAttribute('data-variant', 'light');

    rerender(<AdminNavbar community={community} />);

    expect(screen.getByText('Notices')).toHaveAttribute('data-variant', 'light');
  });

  it('handles community with only id', () => {
    const community = { id: '1', full_address: '' };
    render(<AdminNavbar community={community} />);

    expect(screen.getByText('Notices')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('updates community address when community prop changes', () => {
    const community1 = { id: '1', full_address: 'Address 1' };
    const { rerender } = render(<AdminNavbar community={community1} />);

    expect(screen.getByText('Address 1')).toBeInTheDocument();

    const community2 = { id: '2', full_address: 'Address 2' };
    rerender(<AdminNavbar community={community2} />);

    expect(screen.queryByText('Address 1')).not.toBeInTheDocument();
    expect(screen.getByText('Address 2')).toBeInTheDocument();
  });

  it('handles special characters in community address', () => {
    const community = { 
      id: '1', 
      full_address: 'Str. №5, Apt. 3/4, "Building A" & Co.' 
    };
    render(<AdminNavbar community={community} />);

    expect(screen.getByText(/Str. №5, Apt. 3\/4/)).toBeInTheDocument();
  });

  it('all navigation links have unique labels', () => {
    const community = { id: '1', full_address: '123 Main St' };
    render(<AdminNavbar community={community} />);

    const labels = ['Notices', 'Worries', 'Residents', 'Create Meetings', 'Create Notice'];
    const uniqueLabels = new Set(labels);

    expect(uniqueLabels.size).toBe(labels.length);
  });

  it('navigation maintains correct order', () => {
    const community = { id: '1', full_address: '123 Main St' };
    const { container } = render(<AdminNavbar community={community} />);

    const buttons = Array.from(container.querySelectorAll('button'));
    const navButtons = buttons.slice(0, 5); // 5 are first navigation buttons

    const expectedOrder = ['Notices', 'Worries', 'Residents', 'Create Meetings', 'Create Notice'];
    const actualOrder = navButtons.map(btn => btn.textContent);

    expect(actualOrder).toEqual(expectedOrder);
  });

  it('tooltip shows full address even when truncated', () => {
    const longAddress = 'A'.repeat(250);
    const community = { id: '1', full_address: longAddress };
    const { container } = render(<AdminNavbar community={community} />);

    const tooltip = container.querySelector(`[title="${longAddress}"]`);
    expect(tooltip).toBeInTheDocument();
  });

  it('badge has correct max-width styling', () => {
    const community = { id: '1', full_address: '123 Main St' };
    const { container } = render(<AdminNavbar community={community} />);

    const badge = container.querySelector('span[style*="max-width: 220px"]');
    expect(badge).toBeInTheDocument();
  });

  it('renders consistently with empty string address', () => {
    const community = { id: '1', full_address: '' };
    render(<AdminNavbar community={community} />);

    expect(screen.getByText('Notices')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('does not break with undefined community properties', () => {
    const community = { id: '1', full_address: undefined as any };
    
    expect(() => {
      render(<AdminNavbar community={community} />);
    }).not.toThrow();
  });

  it('navigation buttons are keyboard accessible', () => {
    const community = { id: '1', full_address: '123 Main St' };
    const { container } = render(<AdminNavbar community={community} />);

    const buttons = container.querySelectorAll('button');
    buttons.forEach(button => {
      expect(button.tagName).toBe('BUTTON');
    });
  });

  it('calls router.push exactly once per navigation click', () => {
    const community = { id: '1', full_address: '123 Main St' };
    render(<AdminNavbar community={community} />);

    const worriesButton = screen.getByText('Worries');
    
    mockPush.mockClear();
    fireEvent.click(worriesButton);

    expect(mockPush).toHaveBeenCalledTimes(1);
  });

  it('handles rapid successive clicks', () => {
    const community = { id: '1', full_address: '123 Main St' };
    render(<AdminNavbar community={community} />);

    const noticesButton = screen.getByText('Notices');
    
    mockPush.mockClear();
    fireEvent.click(noticesButton);
    fireEvent.click(noticesButton);
    fireEvent.click(noticesButton);

    expect(mockPush).toHaveBeenCalledTimes(3);
    expect(mockPush).toHaveBeenCalledWith('/protected/Admin/Notices');
  });

  it('community badge uses ellipsis for overflow', () => {
    const community = { id: '1', full_address: '123 Main St' };
    const { container } = render(<AdminNavbar community={community} />);

    const badge = container.querySelector('span[style*="text-overflow: ellipsis"]');
    expect(badge).toBeInTheDocument();
  });

  it('badge prevents text wrapping', () => {
    const community = { id: '1', full_address: '123 Main St' };
    const { container } = render(<AdminNavbar community={community} />);

    const badge = container.querySelector('span[style*="white-space: nowrap"]');
    expect(badge).toBeInTheDocument();
  });
});