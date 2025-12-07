import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LogoutButton } from '../logout-button';

const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

const mockNotificationsShow = vi.fn();
vi.mock('@mantine/notifications', () => ({
  notifications: {
    show: (...args: any[]) => mockNotificationsShow(...args),
  },
}));

vi.mock('@mantine/core', () => ({
  Button: ({ children, onClick, variant, color, size }: any) => (
    <button 
      onClick={onClick} 
      data-variant={variant}
      data-color={color}
      data-size={size}
    >
      {children}
    </button>
  ),
}));

describe('LogoutButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear all cookies before each test
    document.cookie.split(';').forEach(cookie => {
      const name = cookie.split('=')[0].trim();
      document.cookie = `${name}=; Max-Age=0; path=/;`;
    });
  });

  afterEach(() => {
    document.cookie.split(';').forEach(cookie => {
      const name = cookie.split('=')[0].trim();
      document.cookie = `${name}=; Max-Age=0; path=/;`;
    });
  });

  it('renders logout button with correct text', () => {
    render(<LogoutButton />);
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('renders button as a button element', () => {
    render(<LogoutButton />);
    const button = screen.getByText('Logout');
    expect(button.tagName).toBe('BUTTON');
  });

  it('renders button with filled variant', () => {
    render(<LogoutButton />);
    const button = screen.getByText('Logout');
    expect(button).toHaveAttribute('data-variant', 'filled');
  });

  it('renders button with gray color', () => {
    render(<LogoutButton />);
    const button = screen.getByText('Logout');
    expect(button).toHaveAttribute('data-color', 'gray');
  });

  it('renders button with xs size', () => {
    render(<LogoutButton />);
    const button = screen.getByText('Logout');
    expect(button).toHaveAttribute('data-size', 'xs');
  });

  it('shows notification when clicked', () => {
    render(<LogoutButton />);
    fireEvent.click(screen.getByText('Logout'));

    expect(mockNotificationsShow).toHaveBeenCalledTimes(1);
  });

  it('shows notification with correct title', () => {
    render(<LogoutButton />);
    fireEvent.click(screen.getByText('Logout'));

    expect(mockNotificationsShow).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Logged out',
      })
    );
  });

  it('shows notification with correct message', () => {
    render(<LogoutButton />);
    fireEvent.click(screen.getByText('Logout'));

    expect(mockNotificationsShow).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'You have been successfully logged out.',
      })
    );
  });

  it('shows notification with gray color', () => {
    render(<LogoutButton />);
    fireEvent.click(screen.getByText('Logout'));

    expect(mockNotificationsShow).toHaveBeenCalledWith(
      expect.objectContaining({
        color: 'gray',
      })
    );
  });

  it('shows notification with all correct properties', () => {
    render(<LogoutButton />);
    fireEvent.click(screen.getByText('Logout'));

    expect(mockNotificationsShow).toHaveBeenCalledWith({
      title: 'Logged out',
      message: 'You have been successfully logged out.',
      color: 'gray',
    });
  });

  it('redirects to login page when clicked', () => {
    render(<LogoutButton />);
    fireEvent.click(screen.getByText('Logout'));

    expect(mockReplace).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith('/auth/login');
  });

  it('uses router.replace instead of router.push', () => {
    render(<LogoutButton />);
    fireEvent.click(screen.getByText('Logout'));

    expect(mockReplace).toHaveBeenCalledWith('/auth/login');
  });

  it('clears sid cookie when clicked', () => {
    document.cookie = 'sid=test-session-value; path=/';
    
    render(<LogoutButton />);
    fireEvent.click(screen.getByText('Logout'));

    // Check cookie was cleared
    const cookies = document.cookie;
    expect(cookies).not.toContain('sid=test-session-value');
  });

  it('sets cookie with Max-Age=0 to clear it', () => {
    const cookieSetter = vi.spyOn(document, 'cookie', 'set');
    
    render(<LogoutButton />);
    fireEvent.click(screen.getByText('Logout'));

    expect(cookieSetter).toHaveBeenCalledWith('sid=; Max-Age=0; path=/;');
  });

  it('sets cookie with correct path', () => {
    const cookieSetter = vi.spyOn(document, 'cookie', 'set');
    
    render(<LogoutButton />);
    fireEvent.click(screen.getByText('Logout'));

    const cookieValue = cookieSetter.mock.calls[0][0];
    expect(cookieValue).toContain('path=/');
  });

  it('performs logout actions in correct order', () => {
    const callOrder: string[] = [];

    const cookieSetter = vi.spyOn(document, 'cookie', 'set');
    cookieSetter.mockImplementation((value) => {
      if (value.includes('Max-Age=0')) {
        callOrder.push('cookie-cleared');
      }
      return true;
    });

    mockNotificationsShow.mockImplementation(() => {
      callOrder.push('notification-shown');
    });

    mockReplace.mockImplementation(() => {
      callOrder.push('redirected');
    });

    render(<LogoutButton />);
    fireEvent.click(screen.getByText('Logout'));

    expect(callOrder).toEqual([
      'cookie-cleared',
      'notification-shown',
      'redirected',
    ]);
  });

  it('handles multiple clicks correctly', () => {
    render(<LogoutButton />);
    const button = screen.getByText('Logout');
    
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    expect(mockNotificationsShow).toHaveBeenCalledTimes(3);
    expect(mockReplace).toHaveBeenCalledTimes(3);
  });

  it('handles click without errors', () => {
    render(<LogoutButton />);
    
    expect(() => {
      fireEvent.click(screen.getByText('Logout'));
    }).not.toThrow();
  });

  it('calls all logout actions on single click', () => {
    const cookieSetter = vi.spyOn(document, 'cookie', 'set');
    
    render(<LogoutButton />);
    fireEvent.click(screen.getByText('Logout'));

    expect(cookieSetter).toHaveBeenCalled();
    expect(mockNotificationsShow).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalled();
  });

  it('notification call comes after cookie clearing', () => {
    let cookieCleared = false;

    const cookieSetter = vi.spyOn(document, 'cookie', 'set');
    cookieSetter.mockImplementation(() => {
      cookieCleared = true;
      return true;
    });

    mockNotificationsShow.mockImplementation(() => {
      expect(cookieCleared).toBe(true);
    });

    render(<LogoutButton />);
    fireEvent.click(screen.getByText('Logout'));
  });

  it('redirect comes after notification', () => {
    let notificationShown = false;

    mockNotificationsShow.mockImplementation(() => {
      notificationShown = true;
    });

    mockReplace.mockImplementation(() => {
      expect(notificationShown).toBe(true);
    });

    render(<LogoutButton />);
    fireEvent.click(screen.getByText('Logout'));
  });

  it('does not redirect to other pages', () => {
    render(<LogoutButton />);
    fireEvent.click(screen.getByText('Logout'));

    expect(mockReplace).not.toHaveBeenCalledWith('/dashboard');
    expect(mockReplace).not.toHaveBeenCalledWith('/home');
    expect(mockReplace).toHaveBeenCalledWith('/auth/login');
  });

  it('uses Mantine Button component', () => {
    render(<LogoutButton />);
    const button = screen.getByText('Logout');
    
    expect(button).toHaveAttribute('data-variant');
    expect(button).toHaveAttribute('data-color');
    expect(button).toHaveAttribute('data-size');
  });

  it('button has onClick handler', () => {
    render(<LogoutButton />);
    const button = screen.getByText('Logout');
    
    expect(button).toHaveProperty('onclick');
  });

  it('clears only sid cookie, not all cookies', () => {
    document.cookie = 'sid=session123; path=/';
    document.cookie = 'other=value; path=/';
    
    const cookieSetter = vi.spyOn(document, 'cookie', 'set');
    
    render(<LogoutButton />);
    fireEvent.click(screen.getByText('Logout'));

    expect(cookieSetter).toHaveBeenCalledWith('sid=; Max-Age=0; path=/;');
    expect(cookieSetter).not.toHaveBeenCalledWith('other=; Max-Age=0; path=/;');
  });

  it('handleLogout is called on button click', () => {
    render(<LogoutButton />);
    
    mockReplace.mockClear();
    mockNotificationsShow.mockClear();
    
    fireEvent.click(screen.getByText('Logout'));

    expect(mockReplace).toHaveBeenCalled();
    expect(mockNotificationsShow).toHaveBeenCalled();
  });

  it('renders as a client component', () => {
    expect(() => {
      render(<LogoutButton />);
    }).not.toThrow();
  });

  it('notification has exactly three properties', () => {
    render(<LogoutButton />);
    fireEvent.click(screen.getByText('Logout'));

    const callArgs = mockNotificationsShow.mock.calls[0][0];
    const keys = Object.keys(callArgs);
    
    expect(keys).toHaveLength(3);
    expect(keys).toContain('title');
    expect(keys).toContain('message');
    expect(keys).toContain('color');
  });

  it('preserves button functionality after multiple renders', () => {
    const { rerender } = render(<LogoutButton />);
    
    fireEvent.click(screen.getByText('Logout'));
    expect(mockReplace).toHaveBeenCalledTimes(1);
    
    mockReplace.mockClear();
    rerender(<LogoutButton />);
    
    fireEvent.click(screen.getByText('Logout'));
    expect(mockReplace).toHaveBeenCalledTimes(1);
  });
});