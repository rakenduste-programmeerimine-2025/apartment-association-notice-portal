// EditMeetingModal.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditMeetingModal from '../components/EditMeetingModal';

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
    onKeyDown, 
    type,
    error 
  }: any) => (
    <div data-testid="text-input">
      <label>{label}</label>
      {leftSection}
      <input
        type={type || 'text'}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        data-testid={`input-${label.toLowerCase().replace(' ', '-')}`}
        aria-label={label}
      />
      {error && <span data-testid="error-message">{error}</span>}
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
        data-testid="textarea-description"
        aria-label={label}
      />
    </div>
  ),
  Select: ({ 
    label, 
    placeholder, 
    data, 
    value, 
    onChange, 
    required 
  }: any) => (
    <div data-testid="select">
      <label>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-testid="select-duration"
        aria-label={label}
      >
        <option value="">{placeholder}</option>
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
  CalendarClock: () => <span data-testid="calendar-icon">📅</span>,
  Check: () => <span data-testid="check-icon">✓</span>,
}));

// Meeting type for testing
interface Meeting {
  id: string;
  title: string;
  description: string;
  meeting_date: string;
  duration: string;
}

// Helper function to get local time from UTC for testing
const getLocalDateTimeFromUTC = (utcString: string): string => {
  const date = new Date(utcString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

describe('EditMeetingModal', () => {
  const mockMeeting: Meeting = {
    id: 'meeting-123',
    title: 'Test Meeting',
    description: 'This is a test meeting description',
    meeting_date: '2024-01-15T10:30:00Z',
    duration: '1 hour'
  };

  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test 1: Modal should not render when closed
  it('should not render when opened is false', () => {
    render(
      <EditMeetingModal
        opened={false}
        onClose={mockOnClose}
        meeting={mockMeeting}
        onSubmit={mockOnSubmit}
      />
    );
    
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  // Test 2: Modal should render when opened is true
  it('should render when opened is true', () => {
    render(
      <EditMeetingModal
        opened={true}
        onClose={mockOnClose}
        meeting={mockMeeting}
        onSubmit={mockOnSubmit}
      />
    );
    
    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.getByText('Edit Meeting')).toBeInTheDocument();
  });

  // Test 3: Should display meeting data in form fields
  it('should display meeting data in form fields', () => {
    render(
      <EditMeetingModal
        opened={true}
        onClose={mockOnClose}
        meeting={mockMeeting}
        onSubmit={mockOnSubmit}
      />
    );
    
    // Kontrollime, et vormiväljad sisaldavad õigeid andmeid / Check that form fields contain correct data
    const titleInput = screen.getByTestId('input-title');
    const descriptionTextarea = screen.getByTestId('textarea-description');
    const dateInput = screen.getByTestId('input-meeting-date');
    const durationSelect = screen.getByTestId('select-duration');
    
    // Get local time from UTC for comparison
    const localDateTime = getLocalDateTimeFromUTC(mockMeeting.meeting_date);
    
    expect(titleInput).toHaveValue('Test Meeting');
    expect(descriptionTextarea).toHaveValue('This is a test meeting description');
    expect(dateInput).toHaveValue(localDateTime); // Local time
    expect(durationSelect).toHaveValue('1 hour');
  });

  // Test 4: Should update form values when user types
  it('should update form values when user types', async () => {
    render(
      <EditMeetingModal
        opened={true}
        onClose={mockOnClose}
        meeting={mockMeeting}
        onSubmit={mockOnSubmit}
      />
    );
    
    const titleInput = screen.getByTestId('input-title');
    const descriptionTextarea = screen.getByTestId('textarea-description');
    
    // Muudame pealkirja / Change title
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'Updated Meeting Title');
    
    // Muudame kirjeldust / Change description
    await userEvent.clear(descriptionTextarea);
    await userEvent.type(descriptionTextarea, 'Updated description text');
    
    expect(titleInput).toHaveValue('Updated Meeting Title');
    expect(descriptionTextarea).toHaveValue('Updated description text');
  });

  // Test 5: Should show error for invalid date
  it('should show error for invalid date', async () => {
    render(
      <EditMeetingModal
        opened={true}
        onClose={mockOnClose}
        meeting={mockMeeting}
        onSubmit={mockOnSubmit}
      />
    );
    
    const dateInput = screen.getByTestId('input-meeting-date');
    
    // Sisestame sobimatu kuupäeva / Enter invalid date
    await userEvent.clear(dateInput);
    await userEvent.type(dateInput, 'invalid-date');
    
    // Error message should appear
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Invalid date');
    });
  });

  // Test 6: Save button should be disabled when form is invalid
  it('should disable save button when form is invalid', async () => {
    render(
      <EditMeetingModal
        opened={true}
        onClose={mockOnClose}
        meeting={mockMeeting}
        onSubmit={mockOnSubmit}
      />
    );
    
    const titleInput = screen.getByTestId('input-title');
    const saveButton = screen.getByTestId('button-default');
    
    // Tühjendame pealkirja, et vorm muutuks kehtetuks / Clear title to make form invalid
    await userEvent.clear(titleInput);
    
    expect(saveButton).toBeDisabled();
  });

  // Test 7: Save button should be enabled when form is valid
  it('should enable save button when form is valid', () => {
    render(
      <EditMeetingModal
        opened={true}
        onClose={mockOnClose}
        meeting={mockMeeting}
        onSubmit={mockOnSubmit}
      />
    );
    
    const saveButton = screen.getByTestId('button-default');
    expect(saveButton).not.toBeDisabled();
  });

  // Test 8: Should call onSubmit with correct data when save is clicked
  it('should call onSubmit with correct data when save is clicked', async () => {
    render(
      <EditMeetingModal
        opened={true}
        onClose={mockOnClose}
        meeting={mockMeeting}
        onSubmit={mockOnSubmit}
      />
    );
    
    const titleInput = screen.getByTestId('input-title');
    const saveButton = screen.getByTestId('button-default');
    
    // Update title
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'New Meeting Title');
    
    // Click save
    await userEvent.click(saveButton);
    
    // Get the actual value from the date input
    const dateInput = screen.getByTestId('input-meeting-date');
    const actualDateValue = (dateInput as HTMLInputElement).value;
    
    // Kontrollime, et onSubmit kutsuti õigete andmetega / Check that onSubmit was called with correct data
    expect(mockOnSubmit).toHaveBeenCalledWith({
      title: 'New Meeting Title',
      description: 'This is a test meeting description',
      meeting_date: actualDateValue, // Use actual value from input
      duration: '1 hour'
    });
    
    // Should also call onClose
    expect(mockOnClose).toHaveBeenCalled();
  });

  // Test 9: Should call onClose when cancel button is clicked
  it('should call onClose when cancel button is clicked', async () => {
    render(
      <EditMeetingModal
        opened={true}
        onClose={mockOnClose}
        meeting={mockMeeting}
        onSubmit={mockOnSubmit}
      />
    );
    
    const cancelButton = screen.getByTestId('button-light');
    await userEvent.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  // Test 10: Should call onClose when modal close button is clicked
  it('should call onClose when modal close button is clicked', async () => {
    render(
      <EditMeetingModal
        opened={true}
        onClose={mockOnClose}
        meeting={mockMeeting}
        onSubmit={mockOnSubmit}
      />
    );
    
    const modalCloseButton = screen.getByTestId('modal-close');
    await userEvent.click(modalCloseButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  // Test 11: Should handle Enter key press in text inputs
  it('should handle Enter key press in text inputs', async () => {
    mockOnSubmit.mockClear();
    
    render(
      <EditMeetingModal
        opened={true}
        onClose={mockOnClose}
        meeting={mockMeeting}
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

  // Test 12: Should show all duration options in select
  it('should show all duration options in select', () => {
    render(
      <EditMeetingModal
        opened={true}
        onClose={mockOnClose}
        meeting={mockMeeting}
        onSubmit={mockOnSubmit}
      />
    );
    
    const durationSelect = screen.getByTestId('select-duration');
    const options = Array.from(durationSelect.querySelectorAll('option'));
    
    // Peaks olema 5 valikut (placeholder + 4 kestuse valikut) / Should have 5 options (placeholder + 4 duration options)
    expect(options).toHaveLength(5);
    
    // Kontrollime, et kõik kestuse valikud on olemas / Check that all duration options are present
    const optionValues = options.map(opt => opt.value);
    expect(optionValues).toEqual(
      expect.arrayContaining(['', '1 hour', '1.5 hours', '2 hours', '2.5 hours'])
    );
  });

  // Test 13: Should update duration when selected
  it('should update duration when selected', async () => {
    render(
      <EditMeetingModal
        opened={true}
        onClose={mockOnClose}
        meeting={mockMeeting}
        onSubmit={mockOnSubmit}
      />
    );
    
    const durationSelect = screen.getByTestId('select-duration');
    
    // Valime teise kestuse / Select different duration
    await userEvent.selectOptions(durationSelect, '2 hours');
    
    expect(durationSelect).toHaveValue('2 hours');
  });

  // Test 14: Should display all required icons
  it('should display all required icons', () => {
    render(
      <EditMeetingModal
        opened={true}
        onClose={mockOnClose}
        meeting={mockMeeting}
        onSubmit={mockOnSubmit}
      />
    );
    
    expect(screen.getByTestId('type-icon')).toBeInTheDocument();
    expect(screen.getByTestId('filetext-icon')).toBeInTheDocument();
    expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
    expect(screen.getByTestId('check-icon')).toBeInTheDocument();
  });

  // Test 15: Should format date correctly
  it('should format date correctly from ISO string', () => {
    const testMeeting = {
      ...mockMeeting,
      meeting_date: '2024-12-25T15:45:00Z'
    };
    
    render(
      <EditMeetingModal
        opened={true}
        onClose={mockOnClose}
        meeting={testMeeting}
        onSubmit={mockOnSubmit}
      />
    );
    
    const dateInput = screen.getByTestId('input-meeting-date');
    
    // Get local time from UTC for comparison
    const localDateTime = getLocalDateTimeFromUTC(testMeeting.meeting_date);
    expect(dateInput).toHaveValue(localDateTime);
  });

  // Test 16: Should handle empty date gracefully
  it('should handle empty date gracefully', async () => {
    const meetingWithEmptyDate = {
      ...mockMeeting,
      meeting_date: ''
    };
    
    render(
      <EditMeetingModal
        opened={true}
        onClose={mockOnClose}
        meeting={meetingWithEmptyDate}
        onSubmit={mockOnSubmit}
      />
    );
    
    const dateInput = screen.getByTestId('input-meeting-date');
    expect(dateInput).toHaveValue('');
    
    // Save button should be disabled because date is required
    const saveButton = screen.getByTestId('button-default');
    expect(saveButton).toBeDisabled();
  });

  // Test 17: Should maintain date when only other fields change
  it('should maintain date when only other fields change', async () => {
    render(
      <EditMeetingModal
        opened={true}
        onClose={mockOnClose}
        meeting={mockMeeting}
        onSubmit={mockOnSubmit}
      />
    );
    
    const dateInput = screen.getByTestId('input-meeting-date');
    const initialDateValue = (dateInput as HTMLInputElement).value;
    
    // Change title
    const titleInput = screen.getByTestId('input-title');
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'Changed Title');
    
    // Date should remain the same
    expect(dateInput).toHaveValue(initialDateValue);
  });
});