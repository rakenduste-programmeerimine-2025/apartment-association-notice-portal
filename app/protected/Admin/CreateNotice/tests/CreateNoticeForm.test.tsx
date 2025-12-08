import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateNoticeForm from '../components/CreateNoticeForm';
import { createNotice } from '../actions';
import { notifications } from '@mantine/notifications';

vi.mock('../actions', () => ({
  createNotice: vi.fn()
}));

vi.mock('@mantine/notifications', () => ({
  notifications: {
    show: vi.fn()
  }
}));

vi.mock('@mantine/core', async () => {
  const actual = await vi.importActual('@mantine/core');
  return {
    ...actual,
    TextInput: ({ label, name, value, onChange, ...props }: any) => (
      <input
        aria-label={label}
        name={name}
        value={value}
        onChange={onChange}
        data-testid={`textinput-${name}`}
        {...props}
      />
    ),
    Textarea: ({ label, name, value, onChange, ...props }: any) => (
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
      <button type={type} {...props}>{children}</button>
    ),
    Card: ({ children, ...props }: any) => (
      <div data-testid="card" {...props}>{children}</div>
    ),
    Title: ({ children }: any) => <h2>{children}</h2>,
    Stack: ({ children }: any) => <div data-testid="stack">{children}</div>,
    Text: ({ children, c }: any) => (
      <span data-testid={c ? `text-${c}` : 'text'}>{children}</span>
    ),
    Select: ({ label, name, value, onChange, data }: any) => (
      <select
        aria-label={label}
        name={name}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        data-testid={`select-${name}`}
      >
        {data?.map((item: string) => (
          <option key={item} value={item}>{item}</option>
        ))}
      </select>
    ),
    LoadingOverlay: ({ visible }: any) => visible ? <div data-testid="loading-overlay">Loading...</div> : null,
  };
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('CreateNoticeForm', () => {
  describe('Form Rendering', () => {
    it('renders the form with all fields', () => {
      render(<CreateNoticeForm />);

      expect(screen.getByLabelText('Title')).toBeTruthy();
      expect(screen.getByLabelText('Notice Content')).toBeTruthy();
      expect(screen.getByLabelText('Category')).toBeTruthy();
    });

    it('renders the form title "Create Notice"', () => {
      render(<CreateNoticeForm />);
      expect(screen.getByText('Create Notice')).toBeTruthy();
    });

    it('renders the submit button', () => {
      render(<CreateNoticeForm />);
      expect(screen.getByRole('button', { name: /create/i })).toBeTruthy();
    });

    it('renders Card component as form wrapper', () => {
      render(<CreateNoticeForm />);
      expect(screen.getByTestId('card')).toBeTruthy();
    });
  });

  describe('Form Validation', () => {
    it('prevents submission when title is empty', async () => {
      render(<CreateNoticeForm />);

      const contentInput = screen.getByLabelText('Notice Content') as HTMLTextAreaElement;
      fireEvent.change(contentInput, { target: { value: 'Some content' } });

      const submitButton = screen.getByRole('button', { name: /create/i });
      fireEvent.click(submitButton);

      expect(createNotice).not.toHaveBeenCalled();
    });

    it('prevents submission when content is empty', async () => {
      render(<CreateNoticeForm />);

      const titleInput = screen.getByLabelText('Title') as HTMLInputElement;
      fireEvent.change(titleInput, { target: { value: 'Test Title' } });

      const submitButton = screen.getByRole('button', { name: /create/i });
      fireEvent.click(submitButton);

      expect(createNotice).not.toHaveBeenCalled();
    });

    it('prevents submission when both title and content are empty', async () => {
      render(<CreateNoticeForm />);

      const submitButton = screen.getByRole('button', { name: /create/i });
      fireEvent.click(submitButton);

      expect(createNotice).not.toHaveBeenCalled();
    });

    it('allows submission when both title and content are provided', async () => {
      (createNotice as any).mockResolvedValueOnce({});

      render(<CreateNoticeForm />);

      const titleInput = screen.getByLabelText('Title') as HTMLInputElement;
      const contentInput = screen.getByLabelText('Notice Content') as HTMLTextAreaElement;

      fireEvent.change(titleInput, { target: { value: 'Test Title' } });
      fireEvent.change(contentInput, { target: { value: 'Test Content' } });

      fireEvent.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(createNotice).toHaveBeenCalled();
      });
    });

    it('trims whitespace from title validation', async () => {
      render(<CreateNoticeForm />);

      const titleInput = screen.getByLabelText('Title') as HTMLInputElement;
      const contentInput = screen.getByLabelText('Notice Content') as HTMLTextAreaElement;

      fireEvent.change(titleInput, { target: { value: '   ' } });
      fireEvent.change(contentInput, { target: { value: 'Content' } });

      const submitButton = screen.getByRole('button', { name: /create/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(createNotice).not.toHaveBeenCalled();
      });

      expect(screen.getByText('Title is required.')).toBeTruthy();
    });

    it('trims whitespace from content validation', async () => {
      render(<CreateNoticeForm />);

      const titleInput = screen.getByLabelText('Title') as HTMLInputElement;
      const contentInput = screen.getByLabelText('Notice Content') as HTMLTextAreaElement;

      fireEvent.change(titleInput, { target: { value: 'Title' } });
      fireEvent.change(contentInput, { target: { value: '   ' } });

      const submitButton = screen.getByRole('button', { name: /create/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(createNotice).not.toHaveBeenCalled();
      });

      expect(screen.getByText('Content is required.')).toBeTruthy();
    });
  });

  describe('Form Submission', () => {
    it('calls createNotice with correct FormData on successful submission', async () => {
      (createNotice as any).mockResolvedValueOnce({});

      render(<CreateNoticeForm />);

      const titleInput = screen.getByLabelText('Title') as HTMLInputElement;
      const contentInput = screen.getByLabelText('Notice Content') as HTMLTextAreaElement;
      const categorySelect = screen.getByLabelText('Category') as HTMLSelectElement;

      fireEvent.change(titleInput, { target: { value: 'Notice Title' } });
      fireEvent.change(contentInput, { target: { value: 'Notice Content' } });
      fireEvent.change(categorySelect, { target: { value: 'Maintenance' } });

      fireEvent.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(createNotice).toHaveBeenCalledOnce();
      });
    });

    it('shows success notification on successful submission', async () => {
      (createNotice as any).mockResolvedValueOnce({});

      render(<CreateNoticeForm />);

      const titleInput = screen.getByLabelText('Title') as HTMLInputElement;
      const contentInput = screen.getByLabelText('Notice Content') as HTMLTextAreaElement;

      fireEvent.change(titleInput, { target: { value: 'Test Notice' } });
      fireEvent.change(contentInput, { target: { value: 'Test Content' } });

      fireEvent.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(notifications.show).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Notice created',
            message: 'The notice was successfully created!',
            color: 'green',
          })
        );
      });
    });

    it('resets form fields after successful submission', async () => {
      (createNotice as any).mockResolvedValueOnce({});

      render(<CreateNoticeForm />);

      const titleInput = screen.getByLabelText('Title') as HTMLInputElement;
      const contentInput = screen.getByLabelText('Notice Content') as HTMLTextAreaElement;
      const categorySelect = screen.getByLabelText('Category') as HTMLSelectElement;

      fireEvent.change(titleInput, { target: { value: 'Test Title' } });
      fireEvent.change(contentInput, { target: { value: 'Test Content' } });
      fireEvent.change(categorySelect, { target: { value: 'Maintenance' } });

      fireEvent.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(titleInput.value).toBe('');
        expect(contentInput.value).toBe('');
        expect(categorySelect.value).toBe('General');
      });
    });
  });

  describe('Category Selection', () => {
    it('renders category select with correct options', () => {
      render(<CreateNoticeForm />);

      const categorySelect = screen.getByLabelText('Category') as HTMLSelectElement;
      const options = Array.from(categorySelect.options).map(opt => opt.value);

      expect(options).toContain('General');
      expect(options).toContain('Maintenance');
      expect(options).toContain('Safety');
    });

    it('defaults to "General" category', () => {
      render(<CreateNoticeForm />);

      const categorySelect = screen.getByLabelText('Category') as HTMLSelectElement;
      expect(categorySelect.value).toBe('General');
    });

    it('updates category when user selects different option', () => {
      render(<CreateNoticeForm />);

      const categorySelect = screen.getByLabelText('Category') as HTMLSelectElement;
      fireEvent.change(categorySelect, { target: { value: 'Safety' } });

      expect(categorySelect.value).toBe('Safety');
    });

    it('sends selected category in FormData on submission', async () => {
      (createNotice as any).mockResolvedValueOnce({});

      render(<CreateNoticeForm />);

      const titleInput = screen.getByLabelText('Title') as HTMLInputElement;
      const contentInput = screen.getByLabelText('Notice Content') as HTMLTextAreaElement;
      const categorySelect = screen.getByLabelText('Category') as HTMLSelectElement;

      fireEvent.change(titleInput, { target: { value: 'Test Title' } });
      fireEvent.change(contentInput, { target: { value: 'Test Content' } });
      fireEvent.change(categorySelect, { target: { value: 'Maintenance' } });

      fireEvent.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(createNotice).toHaveBeenCalledOnce();
        const formData = (createNotice as any).mock.calls[0][0] as FormData;
        expect(formData.get('category')).toBe('Maintenance');
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error message when createNotice throws Error', async () => {
      (createNotice as any).mockRejectedValueOnce(new Error('Server error'));

      render(<CreateNoticeForm />);

      const titleInput = screen.getByLabelText('Title') as HTMLInputElement;
      const contentInput = screen.getByLabelText('Notice Content') as HTMLTextAreaElement;

      fireEvent.change(titleInput, { target: { value: 'Title' } });
      fireEvent.change(contentInput, { target: { value: 'Content' } });

      fireEvent.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(screen.getByTestId('text-red')).toHaveTextContent('Server error');
      });
    });

    it('displays "Unknown error" when createNotice throws non-Error', async () => {
      (createNotice as any).mockRejectedValueOnce('Unknown');

      render(<CreateNoticeForm />);

      const titleInput = screen.getByLabelText('Title') as HTMLInputElement;
      const contentInput = screen.getByLabelText('Notice Content') as HTMLTextAreaElement;

      fireEvent.change(titleInput, { target: { value: 'Title' } });
      fireEvent.change(contentInput, { target: { value: 'Content' } });

      fireEvent.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(screen.getByTestId('text-red')).toHaveTextContent('Unknown error');
      });
    });

    it('clears previous error when submitting again', async () => {
      (createNotice as any).mockRejectedValueOnce(new Error('First error'));

      render(<CreateNoticeForm />);

      const titleInput = screen.getByLabelText('Title') as HTMLInputElement;
      const contentInput = screen.getByLabelText('Notice Content') as HTMLTextAreaElement;

      fireEvent.change(titleInput, { target: { value: 'Title' } });
      fireEvent.change(contentInput, { target: { value: 'Content' } });

      fireEvent.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(screen.getByTestId('text-red')).toHaveTextContent('First error');
      });

      (createNotice as any).mockResolvedValueOnce({});

      fireEvent.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(screen.queryByTestId('text-red')).toBeNull();
      });
    });
  });

  describe('Loading State', () => {
    it('shows loading overlay when form is submitting', async () => {
      let resolveSubmit: () => void = () => {};
      const submitPromise = new Promise<void>(resolve => {
        resolveSubmit = resolve;
      });

      (createNotice as any).mockReturnValueOnce(submitPromise);

      render(<CreateNoticeForm />);

      const titleInput = screen.getByLabelText('Title') as HTMLInputElement;
      const contentInput = screen.getByLabelText('Notice Content') as HTMLTextAreaElement;

      fireEvent.change(titleInput, { target: { value: 'Title' } });
      fireEvent.change(contentInput, { target: { value: 'Content' } });

      fireEvent.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(screen.getByTestId('loading-overlay')).toBeTruthy();
      });

      resolveSubmit();
    });

    it('hides loading overlay after submission completes', async () => {
      let resolveSubmit: () => void = () => {};
      const submitPromise = new Promise<void>(resolve => {
        resolveSubmit = resolve;
      });

      (createNotice as any).mockReturnValueOnce(submitPromise);

      render(<CreateNoticeForm />);

      const titleInput = screen.getByLabelText('Title') as HTMLInputElement;
      const contentInput = screen.getByLabelText('Notice Content') as HTMLTextAreaElement;

      fireEvent.change(titleInput, { target: { value: 'Title' } });
      fireEvent.change(contentInput, { target: { value: 'Content' } });

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
      render(<CreateNoticeForm />);

      const titleInput = screen.getByLabelText('Title') as HTMLInputElement;
      fireEvent.change(titleInput, { target: { value: 'New Title' } });

      expect(titleInput.value).toBe('New Title');
    });

    it('updates content input when user types', () => {
      render(<CreateNoticeForm />);

      const contentInput = screen.getByLabelText('Notice Content') as HTMLTextAreaElement;
      fireEvent.change(contentInput, { target: { value: 'New Content' } });

      expect(contentInput.value).toBe('New Content');
    });

    it('allows multi-line content input', () => {
      render(<CreateNoticeForm />);

      const contentInput = screen.getByLabelText('Notice Content') as HTMLTextAreaElement;
      const multilineContent = 'Line 1\nLine 2\nLine 3';
      fireEvent.change(contentInput, { target: { value: multilineContent } });

      expect(contentInput.value).toBe(multilineContent);
    });
  });

  describe('Form Elements', () => {
    it('title input is marked as required', () => {
      render(<CreateNoticeForm />);

      const titleInput = screen.getByLabelText('Title') as HTMLInputElement;
      expect(titleInput).toHaveAttribute('required');
    });

    it('content textarea is marked as required', () => {
      render(<CreateNoticeForm />);

      const contentInput = screen.getByLabelText('Notice Content') as HTMLTextAreaElement;
      expect(contentInput).toHaveAttribute('required');
    });

    it('content textarea has minimum rows set to 3', () => {
      render(<CreateNoticeForm />);

      const contentInput = screen.getByLabelText('Notice Content') as HTMLTextAreaElement;
      expect(contentInput).toHaveAttribute('minrows', '3');
    });
  });

  describe('Form Attributes', () => {
    it('form prevents default submission', () => {
      render(<CreateNoticeForm />);

      const form = screen.getByRole('button', { name: /create/i }).closest('form');
      expect(form).toBeTruthy();
    });

    it('submit button has correct type', () => {
      render(<CreateNoticeForm />);

      const submitButton = screen.getByRole('button', { name: /create/i }) as HTMLButtonElement;
      expect(submitButton.type).toBe('submit');
    });
  });
});
