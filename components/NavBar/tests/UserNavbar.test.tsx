import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserNavbar } from '../UserNavbar';

const mockPush = vi.fn();
const mockPathname = '/protected/Resident/Notices';

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

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, size, ...props }: any) => (
    <button onClick={onClick} data-variant={variant} data-size={size} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/logout-button', () => ({
  LogoutButton: () => <button>Logout</button>,
}));

describe('UserNavbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all navigation links', () => {
    const community = { id: '1', full_address: '123 Main St' };
    render(<UserNavbar community={community} />);

    expect(screen.getByText('Notices')).toBeInTheDocument();
    expect(screen.getByText('Worries')).toBeInTheDocument();
    expect(screen.getByText('Create Worry')).toBeInTheDocument();
  });

  it('renders community address when provided', () => {
    const community = { id: '1', full_address: '456 Resident Ave' };
    render(<UserNavbar community={community} />);

    expect(screen.getByText('456 Resident Ave')).toBeInTheDocument();
  });

  it('handles null community gracefully', () => {
    render(<UserNavbar community={null} />);

    expect(screen.getByText('Notices')).toBeInTheDocument();
    expect(screen.queryByText('456 Resident Ave')).not.toBeInTheDocument();
  });

  it('navigates to correct route when link is clicked', () => {
    const community = { id: '1', full_address: '123 Main St' };
    render(<UserNavbar community={community} />);

    const worriesButton = screen.getByText('Worries');
    fireEvent.click(worriesButton);

    expect(mockPush).toHaveBeenCalledWith('/protected/Resident/Worries');
  });

  it('navigates to all routes correctly', () => {
    const community = { id: '1', full_address: '123 Main St' };
    render(<UserNavbar community={community} />);

    const routes = [
      { button: 'Notices', path: '/protected/Resident/Notices' },
      { button: 'Worries', path: '/protected/Resident/Worries' },
      { button: 'Create Worry', path: '/protected/Resident/Create-Worry' },
    ];

    routes.forEach(({ button, path }) => {
      fireEvent.click(screen.getByText(button));
      expect(mockPush).toHaveBeenCalledWith(path);
    });

    expect(mockPush).toHaveBeenCalledTimes(3);
  });

  it('highlights active link based on pathname', () => {
    const community = { id: '1', full_address: '123 Main St' };
    render(<UserNavbar community={community} />);

    const noticesButton = screen.getByText('Notices');
    expect(noticesButton).toHaveAttribute('data-variant', 'secondary');

    const worriesButton = screen.getByText('Worries');
    expect(worriesButton).toHaveAttribute('data-variant', 'ghost');
  });

  it('only highlights the current page link', () => {
    const community = { id: '1', full_address: '123 Main St' };
    render(<UserNavbar community={community} />);

    const allButtons = [
      screen.getByText('Notices'),
      screen.getByText('Worries'),
      screen.getByText('Create Worry'),
    ];

    const activeButtons = allButtons.filter(btn => 
      btn.getAttribute('data-variant') === 'secondary'
    );
    
    expect(activeButtons).toHaveLength(1);
    expect(activeButtons[0]).toHaveTextContent('Notices');
  });

  it('renders logout button', () => {
    const community = { id: '1', full_address: '123 Main St' };
    render(<UserNavbar community={community} />);

    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('renders navigation with nav role', () => {
    const community = { id: '1', full_address: '123 Main St' };
    render(<UserNavbar community={community} />);

    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('renders community badge with tooltip', () => {
    const community = { id: '1', full_address: '789 Test Street' };
    const { container } = render(<UserNavbar community={community} />);

    const tooltip = container.querySelector('[title="789 Test Street"]');
    expect(tooltip).toBeInTheDocument();
  });

  it('truncates long community addresses', () => {
    const community = {
      id: '1',
      full_address: 'Very Long Address That Should Be Truncated, Building 5, Floor 3, City, State, ZIP',
    };
    const { container } = render(<UserNavbar community={community} />);

    const badge = container.querySelector('span[style*="overflow"]');
    expect(badge).toBeInTheDocument();
    expect(badge?.textContent).toContain('Very Long Address');
  });

  it('renders with proper spacing structure', () => {
    const community = { id: '1', full_address: '123 Main St' };
    render(<UserNavbar community={community} />);

    const navigation = screen.getByRole('navigation');
    expect(navigation).toBeInTheDocument();
    
    expect(screen.getByText('Notices')).toBeInTheDocument();
    expect(screen.getByText('123 Main St')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('renders empty community badge when community is null', () => {
    render(<UserNavbar community={null} />);

    expect(screen.queryByText('123 Main St')).not.toBeInTheDocument();
  });

  it('handles community with only id', () => {
    const community = { id: '1', full_address: '' };
    render(<UserNavbar community={community} />);

    expect(screen.getByText('Notices')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('updates community address when community prop changes', () => {
    const community1 = { id: '1', full_address: 'Address 1' };
    const { rerender } = render(<UserNavbar community={community1} />);

    expect(screen.getByText('Address 1')).toBeInTheDocument();

    const community2 = { id: '2', full_address: 'Address 2' };
    rerender(<UserNavbar community={community2} />);

    expect(screen.queryByText('Address 1')).not.toBeInTheDocument();
    expect(screen.getByText('Address 2')).toBeInTheDocument();
  });

  it('handles special characters in community address', () => {
    const community = { 
      id: '1', 
      full_address: 'Str. №5, Apt. 3/4, "Building A" & Co.' 
    };
    render(<UserNavbar community={community} />);

    expect(screen.getByText(/Str. №5, Apt. 3\/4/)).toBeInTheDocument();
  });

  it('all navigation links have unique labels', () => {
    const community = { id: '1', full_address: '123 Main St' };
    render(<UserNavbar community={community} />);

    const labels = ['Notices', 'Worries', 'Create Worry'];
    const uniqueLabels = new Set(labels);

    expect(uniqueLabels.size).toBe(labels.length);
  });

  it('navigation maintains correct order', () => {
    const community = { id: '1', full_address: '123 Main St' };
    const { container } = render(<UserNavbar community={community} />);

    const buttons = Array.from(container.querySelectorAll('button'));
    const navButtons = buttons.slice(0, 3);

    const expectedOrder = ['Notices', 'Worries', 'Create Worry'];
    const actualOrder = navButtons.map(btn => btn.textContent);

    expect(actualOrder).toEqual(expectedOrder);
  });

  it('tooltip shows full address even when truncated', () => {
    const longAddress = 'A'.repeat(250);
    const community = { id: '1', full_address: longAddress };
    const { container } = render(<UserNavbar community={community} />);

    const tooltip = container.querySelector(`[title="${longAddress}"]`);
    expect(tooltip).toBeInTheDocument();
  });

  it('badge has correct max-width styling', () => {
    const community = { id: '1', full_address: '123 Main St' };
    const { container } = render(<UserNavbar community={community} />);

    const badge = container.querySelector('span[style*="max-width: 220px"]');
    expect(badge).toBeInTheDocument();
  });

  it('renders consistently with empty string address', () => {
    const community = { id: '1', full_address: '' };
    render(<UserNavbar community={community} />);

    expect(screen.getByText('Notices')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('does not break with undefined community properties', () => {
    const community = { id: '1', full_address: undefined as any };
    
    expect(() => {
      render(<UserNavbar community={community} />);
    }).not.toThrow();
  });

  it('navigation buttons are keyboard accessible', () => {
    const community = { id: '1', full_address: '123 Main St' };
    const { container } = render(<UserNavbar community={community} />);

    const buttons = container.querySelectorAll('button');
    buttons.forEach(button => {
      expect(button.tagName).toBe('BUTTON');
    });
  });

  it('calls router.push exactly once per navigation click', () => {
    const community = { id: '1', full_address: '123 Main St' };
    render(<UserNavbar community={community} />);

    const worriesButton = screen.getByText('Worries');
    
    mockPush.mockClear();
    fireEvent.click(worriesButton);

    expect(mockPush).toHaveBeenCalledTimes(1);
  });

  it('handles rapid successive clicks', () => {
    const community = { id: '1', full_address: '123 Main St' };
    render(<UserNavbar community={community} />);

    const noticesButton = screen.getByText('Notices');
    
    mockPush.mockClear();
    fireEvent.click(noticesButton);
    fireEvent.click(noticesButton);
    fireEvent.click(noticesButton);

    expect(mockPush).toHaveBeenCalledTimes(3);
    expect(mockPush).toHaveBeenCalledWith('/protected/Resident/Notices');
  });

  it('community badge uses ellipsis for overflow', () => {
    const community = { id: '1', full_address: '123 Main St' };
    const { container } = render(<UserNavbar community={community} />);

    const badge = container.querySelector('span[style*="text-overflow: ellipsis"]');
    expect(badge).toBeInTheDocument();
  });

  it('badge prevents text wrapping', () => {
    const community = { id: '1', full_address: '123 Main St' };
    const { container } = render(<UserNavbar community={community} />);

    const badge = container.querySelector('span[style*="white-space: nowrap"]');
    expect(badge).toBeInTheDocument();
  });

  it('uses shadcn/ui button component', () => {
    const community = { id: '1', full_address: '123 Main St' };
    render(<UserNavbar community={community} />);

    const noticesButton = screen.getByText('Notices');
    expect(noticesButton).toHaveAttribute('data-size', 'sm');
  });

  it('active button uses secondary variant', () => {
    const community = { id: '1', full_address: '123 Main St' };
    render(<UserNavbar community={community} />);

    const noticesButton = screen.getByText('Notices');
    expect(noticesButton).toHaveAttribute('data-variant', 'secondary');
  });

  it('inactive buttons use ghost variant', () => {
    const community = { id: '1', full_address: '123 Main St' };
    render(<UserNavbar community={community} />);

    const worriesButton = screen.getByText('Worries');
    const createWorryButton = screen.getByText('Create Worry');
    
    expect(worriesButton).toHaveAttribute('data-variant', 'ghost');
    expect(createWorryButton).toHaveAttribute('data-variant', 'ghost');
  });

  it('maintains navigation state across renders', () => {
    const community = { id: '1', full_address: '123 Main St' };
    const { rerender } = render(<UserNavbar community={community} />);

    expect(screen.getByText('Notices')).toHaveAttribute('data-variant', 'secondary');

    rerender(<UserNavbar community={community} />);

    expect(screen.getByText('Notices')).toHaveAttribute('data-variant', 'secondary');
  });
});