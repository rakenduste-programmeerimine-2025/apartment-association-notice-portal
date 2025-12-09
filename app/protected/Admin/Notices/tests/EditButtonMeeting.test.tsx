import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditButtonMeeting from '../components/EditButtonMeeting';

vi.mock('@mantine/core', () => ({
  Button: ({ children, onClick, leftSection, ...props }: any) => {
    // 
    const { color, radius, variant, size, ...cleanProps } = props;
    return (
      <button onClick={onClick} {...cleanProps}>
        {leftSection}
        {children}
      </button>
    );
  },
}));

//  lucide-react
vi.mock('lucide-react', () => ({
  Pencil: () => <span data-testid="pencil-icon">✏️</span>,
}));

describe('EditButtonMeeting', () => {
  const mockId = 'meeting-id-123';
  const mockOnClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render edit button with correct text', () => {
    render(<EditButtonMeeting id={mockId} />);
    
    const button = screen.getByRole('button', { name: /edit/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Edit');
  });

  it('should display pencil icon', () => {
    render(<EditButtonMeeting id={mockId} />);
    
    expect(screen.getByTestId('pencil-icon')).toBeInTheDocument();
    expect(screen.getByTestId('pencil-icon')).toHaveTextContent('✏️');
  });

  it('should call onClick when button is clicked', async () => {
    render(<EditButtonMeeting id={mockId} onClick={mockOnClick} />);
    
    const button = screen.getByRole('button', { name: /edit/i });
    await userEvent.click(button);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should work without onClick prop', () => {
    // 
    // 
    expect(() => {
      render(<EditButtonMeeting id={mockId} />);
    }).not.toThrow();
    
    const button = screen.getByRole('button', { name: /edit/i });
    expect(button).toBeInTheDocument();
    
    expect(button).not.toBeDisabled();
  });

  it('should pass id prop (even though it might not be used directly in render)', () => {
    const { container } = render(<EditButtonMeeting id={mockId} />);
    expect(container).toBeInTheDocument();
    
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
  });

  it('should render with correct button text in Estonian if needed', () => {
    render(<EditButtonMeeting id={mockId} />);
    
    const button = screen.getByRole('button', { name: /edit/i });
    expect(button).toHaveTextContent('Edit');
    expect(button).not.toHaveTextContent('Muuda'); 
  });

  it('should handle multiple clicks correctly', async () => {
    render(<EditButtonMeeting id={mockId} onClick={mockOnClick} />);
    
    const button = screen.getByRole('button', { name: /edit/i });
    
    await userEvent.click(button);
    await userEvent.click(button);
    await userEvent.click(button);
    
    expect(mockOnClick).toHaveBeenCalledTimes(3);
  });

  it('should be accessible with proper role and text', () => {
    render(<EditButtonMeeting id={mockId} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAccessibleName(/edit/i);
    
    // 
    expect(screen.getByTestId('pencil-icon')).toBeInTheDocument();
  });

  it('should not have any console errors when rendered', () => {
    const consoleSpy = vi.spyOn(console, 'error');
    
    render(<EditButtonMeeting id={mockId} />);
    
    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should be enabled by default', () => {
    render(<EditButtonMeeting id={mockId} />);
    
    const button = screen.getByRole('button', { name: /edit/i });
    expect(button).not.toBeDisabled();
    expect(button).toBeEnabled();
  });
});