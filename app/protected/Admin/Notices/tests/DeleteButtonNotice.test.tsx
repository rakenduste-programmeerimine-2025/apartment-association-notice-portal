import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeleteButtonNotice from '../components/DeleteButtonNotice';

// 
vi.mock('@/app/protected/Admin/Notices/actions', () => ({
  deleteNotice: vi.fn(),
}));

// 
vi.mock('@mantine/core', () => ({
  Button: ({ children, onClick, leftSection, ...props }: any) => {

    const { color, radius, variant, size, ...cleanProps } = props;
    return (
      <button onClick={onClick} {...cleanProps}>
        {leftSection}
        {children}
      </button>
    );
  },
}));

// ConfirmModal
vi.mock('@/components/ui/ConfirmModal', () => ({
  default: ({ opened, onClose, onConfirm, loading, title, message }: any) => {
    if (!opened) return null;
    return (
      <div data-testid="confirm-modal">
        <h3 data-testid="modal-title">{title}</h3>
        <p data-testid="modal-message">{message}</p>
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

// lucide-react icons
vi.mock('lucide-react', () => ({
  Trash: () => <span data-testid="trash-icon">🗑️</span>,
}));

describe('DeleteButtonNotice', () => {
  const mockId = 'notice-id-456';
  const mockOnClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders delete button with correct text', () => {
    render(<DeleteButtonNotice id={mockId} />);
    
    const button = screen.getByRole('button', { name: /delete/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Delete');
    
    // Check if icon is present
    expect(screen.getByTestId('trash-icon')).toBeInTheDocument();
  });

  it('opens confirmation modal when delete button is clicked', async () => {
    render(<DeleteButtonNotice id={mockId} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await userEvent.click(deleteButton);
    
    expect(screen.getByTestId('confirm-modal')).toBeInTheDocument();
    expect(screen.getByTestId('modal-title')).toHaveTextContent('Delete notice');
    expect(screen.getByTestId('modal-message')).toHaveTextContent(
      'Are you sure you want to delete this notice?'
    );
  });

  it('closes modal when cancel button is clicked', async () => {
    render(<DeleteButtonNotice id={mockId} />);
    
    // Open modal
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await userEvent.click(deleteButton);
    
    // Verify modal is open
    expect(screen.getByTestId('confirm-modal')).toBeInTheDocument();
    
    // Click cancel
    const cancelButton = screen.getByTestId('cancel-button');
    await userEvent.click(cancelButton);
    
    // Verify modal is closed
    expect(screen.queryByTestId('confirm-modal')).not.toBeInTheDocument();
  });

  it('calls deleteNotice and onClick when confirmed', async () => {
    const { deleteNotice } = await import('@/app/protected/Admin/Notices/actions');
    deleteNotice.mockResolvedValueOnce(undefined);
    
    render(<DeleteButtonNotice id={mockId} onClick={mockOnClick} />);
    
    // Open modal
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await userEvent.click(deleteButton);
    
    // Confirm deletion
    const confirmButton = screen.getByTestId('confirm-button');
    await userEvent.click(confirmButton);
    
    // Verify calls
    await waitFor(() => {
      expect(deleteNotice).toHaveBeenCalledWith(mockId);
      expect(mockOnClick).toHaveBeenCalled();
    });
  });

  it('closes modal after successful deletion', async () => {
    const { deleteNotice } = await import('@/app/protected/Admin/Notices/actions');
    deleteNotice.mockResolvedValueOnce(undefined);
    
    render(<DeleteButtonNotice id={mockId} />);
    
    // Open modal
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await userEvent.click(deleteButton);
    
    // Confirm
    const confirmButton = screen.getByTestId('confirm-button');
    await userEvent.click(confirmButton);
    
    // Verify modal is closed
    await waitFor(() => {
      expect(screen.queryByTestId('confirm-modal')).not.toBeInTheDocument();
    });
  });

  it('works without optional onClick callback', async () => {
    const { deleteNotice } = await import('@/app/protected/Admin/Notices/actions');
    deleteNotice.mockResolvedValueOnce(undefined);
    
    render(<DeleteButtonNotice id={mockId} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await userEvent.click(deleteButton);
    
    const confirmButton = screen.getByTestId('confirm-button');
    await userEvent.click(confirmButton);
    
    // Verify deleteNotice was called but onClick wasn't
    await waitFor(() => {
      expect(deleteNotice).toHaveBeenCalledWith(mockId);
    });
  });

  it('does not call deleteNotice if modal is closed without confirmation', async () => {
    const { deleteNotice } = await import('@/app/protected/Admin/Notices/actions');
    
    render(<DeleteButtonNotice id={mockId} onClick={mockOnClick} />);
    
    // Open and close modal without confirmation
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await userEvent.click(deleteButton);
    
    const cancelButton = screen.getByTestId('cancel-button');
    await userEvent.click(cancelButton);
    
    // Verify functions were not called
    expect(deleteNotice).not.toHaveBeenCalled();
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  // Lisa testimine: kontrollime, et kõik prop-sid on korrektsed
  it('should have correct props structure', () => {
    render(<DeleteButtonNotice id={mockId} onClick={mockOnClick} />);
    
    const button = screen.getByRole('button', { name: /delete/i });
    
    // Nupp peaks olema klikatav
    expect(button).not.toBeDisabled();
    
    // Ikoni peaks olema näha
    expect(screen.getByTestId('trash-icon')).toBeInTheDocument();
  });

  // Lisa testimine: mitmekordsed kustutamised
  it('should handle multiple deletions correctly', async () => {
    const { deleteNotice } = await import('@/app/protected/Admin/Notices/actions');
    deleteNotice.mockResolvedValue(undefined);
    
    render(<DeleteButtonNotice id={mockId} onClick={mockOnClick} />);
    
    // Esimene kustutamine
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await userEvent.click(deleteButton);
    
    let confirmButton = screen.getByTestId('confirm-button');
    await userEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(deleteNotice).toHaveBeenCalledTimes(1);
    });
    
    // Teine kustutamine (modal peaks uuesti avanelema)
    await userEvent.click(deleteButton);
    confirmButton = screen.getByTestId('confirm-button');
    await userEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(deleteNotice).toHaveBeenCalledTimes(2);
    });
  });

  // Uus test: kontrollib loading state'i (lihtsam versioon)
  it('shows loading text when deleting', async () => {
    const { deleteNotice } = await import('@/app/protected/Admin/Notices/actions');
    
    // Create a promise that doesn't resolve immediately
    deleteNotice.mockImplementationOnce(() => new Promise(() => {}));
    
    render(<DeleteButtonNotice id={mockId} />);
    
    // Open modal
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await userEvent.click(deleteButton);
    
    // Click confirm
    const confirmButton = screen.getByTestId('confirm-button');
    await userEvent.click(confirmButton);
    
    // Verify loading state appears
    expect(confirmButton).toBeDisabled();
    expect(confirmButton).toHaveTextContent('Deleting...');
  });
});