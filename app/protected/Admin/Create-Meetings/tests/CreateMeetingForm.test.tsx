import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateMeetingForm from '../components/CreateMeetingForm';
import { createMeeting } from '../actions';
import { notifications } from '@mantine/notifications';
import { createPortal } from 'react-dom';

vi.mock('../actions', () => ({
  createMeeting: vi.fn(),
}));

vi.mock('@mantine/notifications', () => ({
  notifications: {
    show: vi.fn(),
  },
}));

vi.mock('lucide-react', () => ({
  FileText: () => null,
  Calendar: () => null,
  Clock: () => null,
}));

vi.mock('@mantine/core', async () => {
  const actual = await vi.importActual('@mantine/core');
  return {
    ...actual,
    TextInput: ({ label, value, onChange, name, ...props }: any) => (
      <input
        aria-label={label}
        name={name}
        value={value}
        onChange={onChange}
        data-testid={`textinput-${name}`}
        {...props}
      />
    ),
    Textarea: ({ label, value, onChange, name, ...props }: any) => (
      <textarea
        aria-label={label}
        name={name}
        value={value}
        onChange={onChange}
        data-testid={`textarea-${name}`}
        {...props}
      />
    ),
    Button: ({ children, type, ...props }: any) => (
      <button type={type} {...props}>
        {children}
      </button>
    ),
    Card: ({ children }: any) => <div data-testid="card">{children}</div>,
    Title: ({ children }: any) => <h2>{children}</h2>,
    Text: ({ children, c }: any) => <span data-testid={c ? `text-${c}` : 'text'}>{children}</span>,
    Group: ({ children }: any) => <div data-testid="group">{children}</div>,
    Stack: ({ children }: any) => <div data-testid="stack">{children}</div>,
    LoadingOverlay: ({ visible }: any) =>
      visible ? <div data-testid="loading-overlay">Loading...</div> : null,
    Select: ({ label, name, value, onChange, data }: any) => (
      <select
        aria-label={label}
        name={name}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        data-testid={`select-${name}`}
      >
        <option value="">Select</option>
        {data?.map((item: any) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    ),
  };
});

vi.mock('@mantine/dates', () => ({
  DatePickerInput: ({ label, name, value, onChange }: any) => (
    <input
      aria-label={label}
      name={name}
      type="date"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      data-testid={`datepicker-${name}`}
    />
  ),
  TimeInput: ({ label, name, value, onChange }: any) => (
    <input
      aria-label={label}
      name={name}
      type="time"
      value={value}
      onChange={onChange}
      data-testid={`timeinput-${name}`}
    />
  ),
}));

vi.mock('react-dom', () => ({
  ...vi.importActual('react-dom'),
  createPortal: (el: any) => el,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('CreateMeetingForm', () => {
  describe('Form Validation', () => {
    it('prevents submission when title is missing', async () => {
      render(<CreateMeetingForm />);

      fireEvent.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(createMeeting).not.toHaveBeenCalled();
      });
    });

    it('prevents submission when description is missing', async () => {
      render(<CreateMeetingForm />);

      fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Meeting Title' } });
      fireEvent.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(createMeeting).not.toHaveBeenCalled();
      });
    });

    it('shows validation error when title exceeds 200 characters', async () => {
      render(<CreateMeetingForm />);

      const longTitle = 'a'.repeat(201);
      fireEvent.change(screen.getByLabelText('Title'), { target: { value: longTitle } });
      fireEvent.change(screen.getByLabelText('Description'), {
        target: { value: 'Valid description' },
      });
      fireEvent.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(screen.getByTestId('text-red')).toHaveTextContent('Title is too long.');
      });
      expect(createMeeting).not.toHaveBeenCalled();
    });

    it('shows validation error when date is not selected', async () => {
      render(<CreateMeetingForm />);

      fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Meeting Title' } });
      fireEvent.change(screen.getByLabelText('Description'), {
        target: { value: 'Valid description' },
      });
      fireEvent.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(screen.getByTestId('text-red')).toHaveTextContent('Select a date.');
      });
      expect(createMeeting).not.toHaveBeenCalled();
    });

    it('shows validation error when time is not selected', async () => {
      render(<CreateMeetingForm />);

      fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Meeting Title' } });
      fireEvent.change(screen.getByLabelText('Description'), {
        target: { value: 'Valid description' },
      });

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      fireEvent.change(screen.getByLabelText('Select date'), {
        target: { value: tomorrow.toISOString().slice(0, 10) },
      });

      fireEvent.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(screen.getByTestId('text-red')).toHaveTextContent('Select a time.');
      });
      expect(createMeeting).not.toHaveBeenCalled();
    });

    it('shows validation error when duration is not selected', async () => {
      render(<CreateMeetingForm />);

      fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Meeting Title' } });
      fireEvent.change(screen.getByLabelText('Description'), {
        target: { value: 'Valid description' },
      });

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      fireEvent.change(screen.getByLabelText('Select date'), {
        target: { value: tomorrow.toISOString().slice(0, 10) },
      });

      fireEvent.change(screen.getByLabelText('Choose a start time'), {
        target: { value: '10:00' },
      });

      fireEvent.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(screen.getByTestId('text-red')).toHaveTextContent('Select a duration.');
      });
      expect(createMeeting).not.toHaveBeenCalled();
    });

    it('shows validation error when meeting is scheduled in the past', async () => {
      render(<CreateMeetingForm />);

      fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Meeting Title' } });
      fireEvent.change(screen.getByLabelText('Description'), {
        target: { value: 'Valid description' },
      });

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      fireEvent.change(screen.getByLabelText('Select date'), {
        target: { value: yesterday.toISOString().slice(0, 10) },
      });

      fireEvent.change(screen.getByLabelText('Choose a start time'), {
        target: { value: '10:00' },
      });
      fireEvent.change(screen.getByLabelText('Duration'), { target: { value: '1 hour' } });

      fireEvent.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(screen.getByTestId('text-red')).toHaveTextContent(
          'Meeting must be scheduled in the future.'
        );
      });
      expect(createMeeting).not.toHaveBeenCalled();
    });

    it('prevents submission with invalid time format', async () => {
      render(<CreateMeetingForm />);

      fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Meeting Title' } });
      fireEvent.change(screen.getByLabelText('Description'), {
        target: { value: 'Valid description' },
      });

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      fireEvent.change(screen.getByLabelText('Select date'), {
        target: { value: tomorrow.toISOString().slice(0, 10) },
      });

      fireEvent.change(screen.getByLabelText('Choose a start time'), {
        target: { value: 'invalid' },
      });
      fireEvent.change(screen.getByLabelText('Duration'), { target: { value: '1 hour' } });

      fireEvent.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(createMeeting).not.toHaveBeenCalled();
      });
    });
  });

  describe('Form Submission', () => {
    it('submits successfully when all fields are valid', async () => {
      (createMeeting as any).mockResolvedValueOnce({});

      render(<CreateMeetingForm />);

      fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Team Standup' } });
      fireEvent.change(screen.getByLabelText('Description'), {
        target: { value: 'Daily standup meeting' },
      });

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      fireEvent.change(screen.getByLabelText('Select date'), {
        target: { value: tomorrow.toISOString().slice(0, 10) },
      });

      fireEvent.change(screen.getByLabelText('Choose a start time'), {
        target: { value: '10:00' },
      });
      fireEvent.change(screen.getByLabelText('Duration'), { target: { value: '1 hour' } });

      fireEvent.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(createMeeting).toHaveBeenCalled();
      });

      expect(notifications.show).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Meeting Created',
          message: 'Your meeting has been successfully created!',
          color: 'green',
        })
      );
    });

    it('resets form after successful submission', async () => {
      (createMeeting as any).mockResolvedValueOnce({});

      render(<CreateMeetingForm />);

      const titleInput = screen.getByLabelText('Title') as HTMLInputElement;
      const descriptionInput = screen.getByLabelText('Description') as HTMLTextAreaElement;
      const dateInput = screen.getByLabelText('Select date') as HTMLInputElement;
      const timeInput = screen.getByLabelText('Choose a start time') as HTMLInputElement;
      const durationSelect = screen.getByLabelText('Duration') as HTMLSelectElement;

      fireEvent.change(titleInput, { target: { value: 'Meeting Title' } });
      fireEvent.change(descriptionInput, { target: { value: 'Description' } });

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      fireEvent.change(dateInput, {
        target: { value: tomorrow.toISOString().slice(0, 10) },
      });

      fireEvent.change(timeInput, { target: { value: '10:00' } });
      fireEvent.change(durationSelect, { target: { value: '1 hour' } });

      fireEvent.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(createMeeting).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(titleInput.value).toBe('');
        expect(descriptionInput.value).toBe('');
        expect(dateInput.value).toBe('');
        expect(timeInput.value).toBe('');
      });
    });
  });

  describe('Error Handling', () => {
    it('handles ERROR_NO_TITLE error from server', async () => {
      (createMeeting as any).mockRejectedValueOnce(new Error('ERROR_NO_TITLE'));

      render(<CreateMeetingForm />);

      fillFormWithValidData();

      fireEvent.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(notifications.show).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Error',
            message: 'Title is required.',
            color: 'red',
          })
        );
      });
    });

    it('handles ERROR_TITLE_TOO_LONG error from server', async () => {
      (createMeeting as any).mockRejectedValueOnce(new Error('ERROR_TITLE_TOO_LONG'));

      render(<CreateMeetingForm />);
      fillFormWithValidData();

      fireEvent.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(notifications.show).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Error',
            message: 'Title is too long.',
            color: 'red',
          })
        );
      });
    });

    it('handles ERROR_DESCRIPTION_TOO_LONG error from server', async () => {
      (createMeeting as any).mockRejectedValueOnce(new Error('ERROR_DESCRIPTION_TOO_LONG'));

      render(<CreateMeetingForm />);
      fillFormWithValidData();

      fireEvent.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(notifications.show).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Error',
            message: 'Description is too long.',
            color: 'red',
          })
        );
      });
    });

    it('handles ERROR_INVALID_DATE error from server', async () => {
      (createMeeting as any).mockRejectedValueOnce(new Error('ERROR_INVALID_DATE'));

      render(<CreateMeetingForm />);
      fillFormWithValidData();

      fireEvent.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(notifications.show).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Error',
            message: 'Invalid date.',
            color: 'red',
          })
        );
      });
    });

    it('handles ERROR_MISSING_DATE error from server', async () => {
      (createMeeting as any).mockRejectedValueOnce(new Error('ERROR_MISSING_DATE'));

      render(<CreateMeetingForm />);
      fillFormWithValidData();

      fireEvent.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(notifications.show).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Error',
            message: 'Please select a date.',
            color: 'red',
          })
        );
      });
    });

    it('handles ERROR_INVALID_TIME error from server', async () => {
      (createMeeting as any).mockRejectedValueOnce(new Error('ERROR_INVALID_TIME'));

      render(<CreateMeetingForm />);
      fillFormWithValidData();

      fireEvent.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(notifications.show).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Error',
            message: 'Invalid time.',
            color: 'red',
          })
        );
      });
    });

    it('handles ERROR_MISSING_TIME error from server', async () => {
      (createMeeting as any).mockRejectedValueOnce(new Error('ERROR_MISSING_TIME'));

      render(<CreateMeetingForm />);
      fillFormWithValidData();

      fireEvent.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(notifications.show).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Error',
            message: 'Please choose a time.',
            color: 'red',
          })
        );
      });
    });

    it('handles ERROR_CANNOT_CREATE_MEETING_IN_THE_PAST error from server', async () => {
      (createMeeting as any).mockRejectedValueOnce(
        new Error('ERROR_CANNOT_CREATE_MEETING_IN_THE_PAST')
      );

      render(<CreateMeetingForm />);
      fillFormWithValidData();

      fireEvent.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(notifications.show).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Error',
            message: 'Meeting must be in the future.',
            color: 'red',
          })
        );
      });
    });

    it('handles ERROR_UNAUTHORIZED error from server', async () => {
      (createMeeting as any).mockRejectedValueOnce(new Error('ERROR_UNAUTHORIZED'));

      render(<CreateMeetingForm />);
      fillFormWithValidData();

      fireEvent.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(notifications.show).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Error',
            message: 'You are not authorized.',
            color: 'red',
          })
        );
      });
    });

    it('handles ERROR_USER_HAS_NO_COMMUNITY error from server', async () => {
      (createMeeting as any).mockRejectedValueOnce(new Error('ERROR_USER_HAS_NO_COMMUNITY'));

      render(<CreateMeetingForm />);
      fillFormWithValidData();

      fireEvent.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(notifications.show).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Error',
            message: 'You are not assigned to a community.',
            color: 'red',
          })
        );
      });
    });

    it('handles ERROR_DB_INSERT_FAILED error from server', async () => {
      (createMeeting as any).mockRejectedValueOnce(new Error('ERROR_DB_INSERT_FAILED'));

      render(<CreateMeetingForm />);
      fillFormWithValidData();

      fireEvent.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(notifications.show).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Error',
            message: 'Failed to save the meeting.',
            color: 'red',
          })
        );
      });
    });

    it('handles ERROR_FETCHING_PROFILE error from server', async () => {
      (createMeeting as any).mockRejectedValueOnce(new Error('ERROR_FETCHING_PROFILE'));

      render(<CreateMeetingForm />);
      fillFormWithValidData();

      fireEvent.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(notifications.show).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Error',
            message: 'Cannot load user profile.',
            color: 'red',
          })
        );
      });
    });

    it('handles ERROR_UNKNOWN error from server', async () => {
      (createMeeting as any).mockRejectedValueOnce(new Error('ERROR_UNKNOWN'));

      render(<CreateMeetingForm />);
      fillFormWithValidData();

      fireEvent.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(notifications.show).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Error',
            message: 'Unexpected server error.',
            color: 'red',
          })
        );
      });
    });

    it('handles non-Error exceptions gracefully', async () => {
      (createMeeting as any).mockRejectedValueOnce('Some string error');

      render(<CreateMeetingForm />);
      fillFormWithValidData();

      fireEvent.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(notifications.show).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Error',
            message: 'An unexpected error occurred. Please try again later.',
            color: 'red',
          })
        );
      });
    });

    it('handles unknown error codes with fallback message', async () => {
      (createMeeting as any).mockRejectedValueOnce(new Error('UNKNOWN_ERROR_CODE'));

      render(<CreateMeetingForm />);
      fillFormWithValidData();

      fireEvent.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(notifications.show).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Error',
            message: 'Unexpected server error.',
            color: 'red',
          })
        );
      });
    });
  });

  describe('UI Rendering', () => {
    it('renders form with all required fields', () => {
      render(<CreateMeetingForm />);

      expect(screen.getByText('Create a Meeting')).toBeTruthy();
      expect(screen.getByLabelText('Title')).toBeTruthy();
      expect(screen.getByLabelText('Description')).toBeTruthy();
      expect(screen.getByLabelText('Select date')).toBeTruthy();
      expect(screen.getByLabelText('Choose a start time')).toBeTruthy();
      expect(screen.getByLabelText('Duration')).toBeTruthy();
    });

    it('renders submit button', () => {
      render(<CreateMeetingForm />);

      const submitButton = screen.getByRole('button', { name: /create/i }) as HTMLButtonElement;
      expect(submitButton).toBeTruthy();
      expect(submitButton.type).toBe('submit');
    });

    it('allows submission when validation passes after initial failure', async () => {
      (createMeeting as any).mockResolvedValueOnce({});

      render(<CreateMeetingForm />);

      fireEvent.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(createMeeting).not.toHaveBeenCalled();
      });

      fillFormWithValidData();

      fireEvent.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(createMeeting).toHaveBeenCalled();
      });
    });

    it('renders loading overlay when form is submitting', async () => {
      let resolveSubmit: () => void = () => {};
      const submitPromise = new Promise<void>((resolve) => {
        resolveSubmit = resolve;
      });

      (createMeeting as any).mockReturnValueOnce(submitPromise);

      render(<CreateMeetingForm />);
      fillFormWithValidData();

      fireEvent.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(screen.getByTestId('loading-overlay')).toBeTruthy();
      });

      resolveSubmit();
    });

    it('renders title input field correctly', () => {
      render(<CreateMeetingForm />);

      const titleInput = screen.getByLabelText('Title') as HTMLInputElement;
      expect(titleInput).toBeTruthy();
      expect(titleInput.type).toBe('text');
      expect(titleInput.name).toBe('title');
    });

    it('renders description textarea field correctly', () => {
      render(<CreateMeetingForm />);

      const descriptionInput = screen.getByLabelText('Description') as HTMLTextAreaElement;
      expect(descriptionInput).toBeTruthy();
      expect(descriptionInput.tagName).toBe('TEXTAREA');
      expect(descriptionInput.name).toBe('description');
    });

    it('renders date picker input correctly', () => {
      render(<CreateMeetingForm />);

      const dateInput = screen.getByLabelText('Select date') as HTMLInputElement;
      expect(dateInput).toBeTruthy();
      expect(dateInput.type).toBe('date');
      expect(dateInput.name).toBe('date');
    });

    it('renders time input field correctly', () => {
      render(<CreateMeetingForm />);

      const timeInput = screen.getByLabelText('Choose a start time') as HTMLInputElement;
      expect(timeInput).toBeTruthy();
      expect(timeInput.type).toBe('time');
      expect(timeInput.name).toBe('time');
    });

    it('renders duration select field with all options', () => {
      render(<CreateMeetingForm />);

      const durationSelect = screen.getByLabelText('Duration') as HTMLSelectElement;
      expect(durationSelect).toBeTruthy();
      expect(durationSelect.name).toBe('duration');
      expect(durationSelect.tagName).toBe('SELECT');

      const optionValues = Array.from(durationSelect.options).map((opt) => opt.value);
      const optionLabels = Array.from(durationSelect.options).map((opt) => opt.textContent);

      expect(optionValues).toEqual(['', '1 hour', '1.5 hours', '2 hours', '2.5 hours']);
      expect(optionLabels).toContain('Select');
      expect(optionLabels).toContain('1 hour');
      expect(optionLabels).toContain('1.5 hours');
      expect(optionLabels).toContain('2 hours');
      expect(optionLabels).toContain('2.5 hours');
    });

    it('hides loading overlay after form submission completes', async () => {
      let resolveSubmit: () => void = () => {};
      const submitPromise = new Promise<void>((resolve) => {
        resolveSubmit = resolve;
      });

      (createMeeting as any).mockReturnValueOnce(submitPromise);

      render(<CreateMeetingForm />);
      fillFormWithValidData();

      fireEvent.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(screen.getByTestId('loading-overlay')).toBeTruthy();
      });

      resolveSubmit();

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).toBeNull();
      });
    });
  });

  describe('Input Handling', () => {
    it('updates title input when user types', () => {
      render(<CreateMeetingForm />);

      const titleInput = screen.getByLabelText('Title') as HTMLInputElement;
      fireEvent.change(titleInput, { target: { value: 'New Title' } });

      expect(titleInput.value).toBe('New Title');
    });

    it('updates description input when user types', () => {
      render(<CreateMeetingForm />);

      const descriptionInput = screen.getByLabelText('Description') as HTMLTextAreaElement;
      fireEvent.change(descriptionInput, { target: { value: 'New Description' } });

      expect(descriptionInput.value).toBe('New Description');
    });

    it('updates date when user selects date', () => {
      render(<CreateMeetingForm />);

      const dateInput = screen.getByLabelText('Select date') as HTMLInputElement;
      fireEvent.change(dateInput, { target: { value: '2025-12-20' } });

      expect(dateInput.value).toBe('2025-12-20');
    });

    it('updates time when user selects time', () => {
      render(<CreateMeetingForm />);

      const timeInput = screen.getByLabelText('Choose a start time') as HTMLInputElement;
      fireEvent.change(timeInput, { target: { value: '14:30' } });

      expect(timeInput.value).toBe('14:30');
    });

    it('updates duration when user selects duration', () => {
      render(<CreateMeetingForm />);

      const durationSelect = screen.getByLabelText('Duration') as HTMLSelectElement;
      fireEvent.change(durationSelect, { target: { value: '2 hours' } });

      expect(durationSelect.value).toBe('2 hours');
    });
  });
});

function fillFormWithValidData() {
  fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Valid Meeting' } });
  fireEvent.change(screen.getByLabelText('Description'), {
    target: { value: 'Valid description' },
  });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  fireEvent.change(screen.getByLabelText('Select date'), {
    target: { value: tomorrow.toISOString().slice(0, 10) },
  });

  fireEvent.change(screen.getByLabelText('Choose a start time'), { target: { value: '10:00' } });
  fireEvent.change(screen.getByLabelText('Duration'), { target: { value: '1 hour' } });
}
