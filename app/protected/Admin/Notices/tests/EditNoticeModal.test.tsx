// EditNoticeModal.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditNoticeModal from '../components/EditNoticeModal';

// Mock Mantine components
vi.mock('@mantine/core', () => ({
  Modal: ({ children, opened, onClose, title, size, centered }: any) => {
    if (!opened) return null;
    return (
      <div data-testid="modal">
        <h2>{title}</h2>
        <button data-testid="modal-close" onClick={onClose}>
          Close
        </button>
        <div>{children}</div>
      </div>
    );
  },
  TextInput: ({ 
    label, 
    leftSection, 
    value, 
    onChange, 
    onKeyDown 
  }: any) => (
    <div data-testid="text-input">
      <label>{label}</label>
      {leftSection}
      <input
        type="text"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        data-testid={`input-${label.toLowerCase()}`}
        aria-label={label}
      />
    </div>
  ),
  Textarea: ({ 
    label, 
    leftSection, 
    value, 
    onChange, 
    autosize,
    minRows,
    maxRows 
  }: any) => (
    <div data-testid="textarea">
      <label>{label}</label>
      {leftSection}
      <textarea
        value={value}
        onChange={onChange}
        data-testid="textarea-content"
        aria-label={label}
      />
    </div>
  ),
  Select: ({ 
    label, 
    leftSection,
    data, 
    value, 
    onChange, 
    onKeyDown 
  }: any) => (
    <div data-testid="select">
      <label>{label}</label>
      {leftSection}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        data-testid="select-category"
        aria-label={label}
      >
        <option value="">Select...</option>
        {data?.map((item: string) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </div>
  ),
  Stack: ({ children, gap }: any) => (
    <div data-testid="stack" style={{ gap }}>
      {children}
    </div>
  ),
  Group: ({ children, justify, mt }: any) => (
    <div data-testid="group" style={{ marginTop: mt, justifyContent: justify }}>
      {children}
    </div>
  ),
  Button: ({ children, onClick, variant, color, leftSection, disabled }: any) => (
    <button
      onClick={onClick}
      data-testid={`button-${variant || 'default'}`}
      disabled={disabled}
      style={{ color }}
    >
      {leftSection}
      {children}
    </button>
  ),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Type: () => <span data-testid="type-icon">📝</span>,
  FileText: () => <span data-testid="filetext-icon">📄</span>,
  Tags: () => <span data-testid="tags-icon">🏷️</span>,
  Check: () => <span data-testid="check-icon">✓</span>,
}));

// Notice type for testing - updated to match actual Notice type
interface Notice {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  updated_at?: string;
  user_id?: string;
}

describe('EditNoticeModal', () => {
  const mockNotice: Notice = {
    id: 'notice-123',
    title: 'Test Notice',
    content: 'This is a test notice content',
    category: 'General',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-16T10:30:00Z',
    user_id: 'user-123'
  };

  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
  const mockOnAfterSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test 1: Modal should not render when closed
  it('should not render when opened is false', () => {
    render(
      <EditNoticeModal
        opened={false}
        onClose={mockOnClose}
        notice={mockNotice}
        onSubmit={mockOnSubmit}
      />
    );
    
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  // Test 2: Modal should render when opened is true
  it('should render when opened is true', () => {
    render(
      <EditNoticeModal
        opened={true}
        onClose={mockOnClose}
        notice={mockNotice}
        onSubmit={mockOnSubmit}
      />
    );
    
    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.getByText('Edit Notice')).toBeInTheDocument();
  });

  // Test 3: Should display notice data in form fields
  it('should display notice data in form fields', () => {
    render(
      <EditNoticeModal
        opened={true}
        onClose={mockOnClose}
        notice={mockNotice}
        onSubmit={mockOnSubmit}
      />
    );
    
    // Kontrollime, et vormiväljad sisaldavad õigeid andmeid / Check that form fields contain correct data
    const titleInput = screen.getByTestId('input-title');
    const contentTextarea = screen.getByTestId('textarea-content');
    const categorySelect = screen.getByTestId('select-category');
    
    expect(titleInput).toHaveValue('Test Notice');
    expect(contentTextarea).toHaveValue('This is a test notice content');
    expect(categorySelect).toHaveValue('General');
  });

  // Test 4: Should update form values when user types
  it('should update form values when user types', async () => {
    render(
      <EditNoticeModal
        opened={true}
        onClose={mockOnClose}
        notice={mockNotice}
        onSubmit={mockOnSubmit}
      />
    );
    
    const titleInput = screen.getByTestId('input-title');
    const contentTextarea = screen.getByTestId('textarea-content');
    
    // Muudame pealkirja / Change title
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'Updated Notice Title');
    
    // Muudame sisu / Change content
    await userEvent.clear(contentTextarea);
    await userEvent.type(contentTextarea, 'Updated content text');
    
    expect(titleInput).toHaveValue('Updated Notice Title');
    expect(contentTextarea).toHaveValue('Updated content text');
  });

  // Test 5: Should update category when selected
  it('should update category when selected', async () => {
    render(
      <EditNoticeModal
        opened={true}
        onClose={mockOnClose}
        notice={mockNotice}
        onSubmit={mockOnSubmit}
      />
    );
    
    const categorySelect = screen.getByTestId('select-category');
    
    // Valime teise kategooria / Select different category
    await userEvent.selectOptions(categorySelect, 'Safety');
    
    expect(categorySelect).toHaveValue('Safety');
  });

  // Test 6: Should show all category options
  it('should show all category options', () => {
    render(
      <EditNoticeModal
        opened={true}
        onClose={mockOnClose}
        notice={mockNotice}
        onSubmit={mockOnSubmit}
      />
    );
    
    const categorySelect = screen.getByTestId('select-category');
    const options = Array.from(categorySelect.querySelectorAll('option'));
    
    // Peaks olema 4 valikut (placeholder + 3 kategooriat) / Should have 4 options (placeholder + 3 categories)
    expect(options).toHaveLength(4);
    
    // Kontrollime, et kõik kategooriad on olemas / Check that all categories are present
    const optionValues = options.map(opt => opt.value);
    expect(optionValues).toEqual(
      expect.arrayContaining(['', 'General', 'Maintenance', 'Safety'])
    );
  });

  // Test 7: Save button should be always enabled (no validation required)
  it('save button should be always enabled', () => {
    render(
      <EditNoticeModal
        opened={true}
        onClose={mockOnClose}
        notice={mockNotice}
        onSubmit={mockOnSubmit}
      />
    );
    
    const saveButton = screen.getByTestId('button-default');
    expect(saveButton).not.toBeDisabled();
  });

  // Test 8: Should call onSubmit with correct data when save is clicked
  it('should call onSubmit with correct data when save is clicked', async () => {
    render(
      <EditNoticeModal
        opened={true}
        onClose={mockOnClose}
        notice={mockNotice}
        onSubmit={mockOnSubmit}
      />
    );
    
    const titleInput = screen.getByTestId('input-title');
    const saveButton = screen.getByTestId('button-default');
    
    // Update title
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'New Notice Title');
    
    // Update category
    const categorySelect = screen.getByTestId('select-category');
    await userEvent.selectOptions(categorySelect, 'Maintenance');
    
    // Click save
    await userEvent.click(saveButton);
    
    // Kontrollime, et onSubmit kutsuti õigete andmetega / Check that onSubmit was called with correct data
    expect(mockOnSubmit).toHaveBeenCalledWith({
      title: 'New Notice Title',
      content: 'This is a test notice content',
      category: 'Maintenance'
    });
    
    // Should also call onClose
    expect(mockOnClose).toHaveBeenCalled();
  });

  // Test 9: Should call onAfterSave when provided and after save
  it('should call onAfterSave when provided and after save', async () => {
    render(
      <EditNoticeModal
        opened={true}
        onClose={mockOnClose}
        notice={mockNotice}
        onSubmit={mockOnSubmit}
        onAfterSave={mockOnAfterSave}
      />
    );
    
    const saveButton = screen.getByTestId('button-default');
    await userEvent.click(saveButton);
    
    // Should call onAfterSave
    expect(mockOnAfterSave).toHaveBeenCalled();
  });

  // Test 10: Should not call onAfterSave when not provided
  it('should not call onAfterSave when not provided', async () => {
    render(
      <EditNoticeModal
        opened={true}
        onClose={mockOnClose}
        notice={mockNotice}
        onSubmit={mockOnSubmit}
      />
    );
    
    const saveButton = screen.getByTestId('button-default');
    await userEvent.click(saveButton);
    
    // Should not call onAfterSave (it wasn't provided)
    expect(mockOnAfterSave).not.toHaveBeenCalled();
  });

  // Test 11: Should call onClose when cancel button is clicked
  it('should call onClose when cancel button is clicked', async () => {
    render(
      <EditNoticeModal
        opened={true}
        onClose={mockOnClose}
        notice={mockNotice}
        onSubmit={mockOnSubmit}
      />
    );
    
    const cancelButton = screen.getByTestId('button-light');
    await userEvent.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  // Test 12: Should call onClose when modal close button is clicked
  it('should call onClose when modal close button is clicked', async () => {
    render(
      <EditNoticeModal
        opened={true}
        onClose={mockOnClose}
        notice={mockNotice}
        onSubmit={mockOnSubmit}
      />
    );
    
    const modalCloseButton = screen.getByTestId('modal-close');
    await userEvent.click(modalCloseButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  // Test 13: Should handle Enter key press in text inputs
  it('should handle Enter key press in text inputs', async () => {
    mockOnSubmit.mockClear();
    
    render(
      <EditNoticeModal
        opened={true}
        onClose={mockOnClose}
        notice={mockNotice}
        onSubmit={mockOnSubmit}
      />
    );
    
    const titleInput = screen.getByTestId('input-title');
    
    // Press Enter key
    fireEvent.keyDown(titleInput, { key: 'Enter' });
    
    // Should call onSubmit when Enter is pressed
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  // Test 14: Should handle Enter key press in select
  it('should handle Enter key press in select', async () => {
    mockOnSubmit.mockClear();
    
    render(
      <EditNoticeModal
        opened={true}
        onClose={mockOnClose}
        notice={mockNotice}
        onSubmit={mockOnSubmit}
      />
    );
    
    const categorySelect = screen.getByTestId('select-category');
    
    // Press Enter key on select
    fireEvent.keyDown(categorySelect, { key: 'Enter' });
    
    // Should call onSubmit when Enter is pressed
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  // Test 15: Should display all required icons
  it('should display all required icons', () => {
    render(
      <EditNoticeModal
        opened={true}
        onClose={mockOnClose}
        notice={mockNotice}
        onSubmit={mockOnSubmit}
      />
    );
    
    expect(screen.getByTestId('type-icon')).toBeInTheDocument();
    expect(screen.getByTestId('filetext-icon')).toBeInTheDocument();
    expect(screen.getByTestId('tags-icon')).toBeInTheDocument();
    expect(screen.getByTestId('check-icon')).toBeInTheDocument();
  });

  // Test 16: Should work with empty content
  it('should work with empty content', async () => {
    const noticeWithEmptyContent = {
      ...mockNotice,
      content: ''
    };
    
    render(
      <EditNoticeModal
        opened={true}
        onClose={mockOnClose}
        notice={noticeWithEmptyContent}
        onSubmit={mockOnSubmit}
      />
    );
    
    const contentTextarea = screen.getByTestId('textarea-content');
    expect(contentTextarea).toHaveValue('');
    
    // Should still be able to save
    const saveButton = screen.getByTestId('button-default');
    expect(saveButton).not.toBeDisabled();
  });

  // Test 17: Should work with minimal notice data
  it('should work with minimal notice data', () => {
    const minimalNotice = {
      id: 'notice-minimal',
      title: 'Minimal Notice',
      content: 'Minimal content',
      category: 'General',
      created_at: '2024-01-01T00:00:00Z'
    };
    
    render(
      <EditNoticeModal
        opened={true}
        onClose={mockOnClose}
        notice={minimalNotice}
        onSubmit={mockOnSubmit}
      />
    );
    
    const titleInput = screen.getByTestId('input-title');
    const contentTextarea = screen.getByTestId('textarea-content');
    const categorySelect = screen.getByTestId('select-category');
    
    expect(titleInput).toHaveValue('Minimal Notice');
    expect(contentTextarea).toHaveValue('Minimal content');
    expect(categorySelect).toHaveValue('General');
  });

  // Test 18: Should maintain form state when changing multiple fields
  it('should maintain form state when changing multiple fields', async () => {
    render(
      <EditNoticeModal
        opened={true}
        onClose={mockOnClose}
        notice={mockNotice}
        onSubmit={mockOnSubmit}
      />
    );
    
    const titleInput = screen.getByTestId('input-title');
    const contentTextarea = screen.getByTestId('textarea-content');
    const categorySelect = screen.getByTestId('select-category');
    
    // Change all fields
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'Final Title');
    
    await userEvent.clear(contentTextarea);
    await userEvent.type(contentTextarea, 'Final content');
    
    await userEvent.selectOptions(categorySelect, 'Safety');
    
    // Verify all changes are maintained
    expect(titleInput).toHaveValue('Final Title');
    expect(contentTextarea).toHaveValue('Final content');
    expect(categorySelect).toHaveValue('Safety');
  });

  // Test 19: Save button should have correct text and icon
  it('save button should have correct text and icon', () => {
    render(
      <EditNoticeModal
        opened={true}
        onClose={mockOnClose}
        notice={mockNotice}
        onSubmit={mockOnSubmit}
      />
    );
    
    const saveButton = screen.getByTestId('button-default');
    
    // Should contain "Save" text
    expect(saveButton).toHaveTextContent('Save');
    
    // Should contain check icon
    expect(saveButton.innerHTML).toContain('✓');
  });

  // Test 20: Cancel button should have correct styling
  it('cancel button should have correct styling', () => {
    render(
      <EditNoticeModal
        opened={true}
        onClose={mockOnClose}
        notice={mockNotice}
        onSubmit={mockOnSubmit}
      />
    );
    
    const cancelButton = screen.getByTestId('button-light');
    
    // Should contain "Cancel" text
    expect(cancelButton).toHaveTextContent('Cancel');
    
    // Should have light variant (data-testid contains "light")
    expect(cancelButton.getAttribute('data-testid')).toContain('light');
  });

  // Test 21: Should ignore unused notice fields (created_at, updated_at, user_id)
  it('should ignore unused notice fields', () => {
    const noticeWithExtraFields = {
      ...mockNotice,
      extraField: 'should be ignored',
      anotherField: 123
    };
    
    // Should render without errors even with extra fields
    expect(() => {
      render(
        <EditNoticeModal
          opened={true}
          onClose={mockOnClose}
          notice={noticeWithExtraFields as any}
          onSubmit={mockOnSubmit}
        />
      );
    }).not.toThrow();
    
    // Form should still show correct data
    const titleInput = screen.getByTestId('input-title');
    expect(titleInput).toHaveValue('Test Notice');
  });
});