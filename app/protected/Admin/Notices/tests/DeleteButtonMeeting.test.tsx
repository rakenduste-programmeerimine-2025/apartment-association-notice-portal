import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeleteButtonMeeting from '../components/DeleteButtonMeeting';


vi.mock('@/app/protected/Admin/Notices/actions', () => ({
  deleteMeeting: vi.fn(),
}));

vi.mock('@mantine/core', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/ConfirmModal', () => ({
  default: ({ opened, onClose, onConfirm, loading, title, message }: any) => {
    if (!opened) return null;
    return (
      <div data-testid="confirm-modal">
        <h3>{title}</h3>
        <p>{message}</p>
        <button onClick={onClose} data-testid="cancel-button">
          Cancel
        </button>
        <button 
          onClick={onConfirm} 
          data-testid="confirm-button"
          disabled={loading}
        >
          {loading ? 'Deleting...' : 'Confirm'}
        </button>
      </div>
    );
  },
}));

describe('DeleteButtonMeeting', () => {
  const mockId = 'test-id-123';
  const mockOnClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders delete button with correct text and icon', () => {
    render(<DeleteButtonMeeting id={mockId} />);
    
    const button = screen.getByRole('button', { name: /delete/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Delete');
  });

  it('opens confirmation modal when delete button is clicked', async () => {
    render(<DeleteButtonMeeting id={mockId} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await userEvent.click(deleteButton);
    
    expect(screen.getByTestId('confirm-modal')).toBeInTheDocument();
    expect(screen.getByText('Delete meeting')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete this meeting?')).toBeInTheDocument();
  });

  it('closes modal when cancel button is clicked', async () => {
    render(<DeleteButtonMeeting id={mockId} />);
    
    // 
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await userEvent.click(deleteButton);
    
    // 
    expect(screen.getByTestId('confirm-modal')).toBeInTheDocument();
    
    //
    const cancelButton = screen.getByTestId('cancel-button');
    await userEvent.click(cancelButton);
    
    // 
    expect(screen.queryByTestId('confirm-modal')).not.toBeInTheDocument();
  });

  it('calls deleteMeeting and onClick when confirmed', async () => {
    const { deleteMeeting } = await import('@/app/protected/Admin/Notices/actions');
    
    render(<DeleteButtonMeeting id={mockId} onClick={mockOnClick} />);
    
    // 
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await userEvent.click(deleteButton);
    
    // 
    const confirmButton = screen.getByTestId('confirm-button');
    await userEvent.click(confirmButton);
    
    // 
    await waitFor(() => {
      expect(deleteMeeting).toHaveBeenCalledWith(mockId);
      expect(mockOnClick).toHaveBeenCalled();
    });
  });

  it('shows loading state during deletion', async () => {
    const { deleteMeeting } = await import('@/app/protected/Admin/Notices/actions');
    
    // 
    deleteMeeting.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<DeleteButtonMeeting id={mockId} />);
    
    // 
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await userEvent.click(deleteButton);
    
    const confirmButton = screen.getByTestId('confirm-button');
    await userEvent.click(confirmButton);
    
    // 
    expect(confirmButton).toBeDisabled();
    expect(confirmButton).toHaveTextContent('Deleting...');
  });

  it('closes modal after successful deletion', async () => {
    const { deleteMeeting } = await import('@/app/protected/Admin/Notices/actions');
    
    render(<DeleteButtonMeeting id={mockId} />);
    
    // 
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await userEvent.click(deleteButton);
    
    //
    const confirmButton = screen.getByTestId('confirm-button');
    await userEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(screen.queryByTestId('confirm-modal')).not.toBeInTheDocument();
    });
  });

  it('renders without onClick callback', () => {
    render(<DeleteButtonMeeting id={mockId} />);
    
    const button = screen.getByRole('button', { name: /delete/i });
    expect(button).toBeInTheDocument();
    
    expect(() => userEvent.click(button)).not.toThrow();
  });
});