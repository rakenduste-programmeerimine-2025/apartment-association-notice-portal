import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateWorryForm from '../components/CreateWorryForm';
import { createWorry } from '../actions';
import { notifications } from '@mantine/notifications';

vi.mock('../actions', () => ({
  createWorry: vi.fn(),
}));

vi.mock('@mantine/notifications', () => ({
  notifications: {
    show: vi.fn(),
  },
}));

vi.mock('lucide-react', () => ({
  FileText: () => null,
}));

vi.mock('@mantine/core', async () => {
  const actual = await vi.importActual('@mantine/core');
  return {
    ...actual,
    TextInput: ({ label, name, value, onChange }: any) => (
      <input
        aria-label={label}
        name={name}
        value={value}
        onChange={onChange}
        data-testid={`textinput-${name}`}
      />
    ),
    Textarea: ({ label, name, value, onChange }: any) => (
      <textarea
        aria-label={label}
        name={name}
        value={value}
        onChange={onChange}
        data-testid={`textarea-${name}`}
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
  };
});

vi.mock('react-dom', () => ({
  ...vi.importActual('react-dom'),
  createPortal: (el: any) => el,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('CreateWorryForm', () => {
  describe('Form Validation', () => {
    it('prevents submission when title is empty', async () => {
      render(<CreateWorryForm />);
      fireEvent.click(screen.getByRole('button', { name: /send/i }));

      await waitFor(() => {
        expect(createWorry).not.toHaveBeenCalled();
      });

      expect(notifications.show).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Title is required.',
        })
      );
    });

    it('prevents submission when content is empty', async () => {
      render(<CreateWorryForm />);
      fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Some title' } });

      fireEvent.click(screen.getByRole('button', { name: /send/i }));

      await waitFor(() => {
        expect(createWorry).not.toHaveBeenCalled();
      });

      expect(notifications.show).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Description is required.',
        })
      );
    });

    it('shows validation error when title exceeds 200 characters', async () => {
      render(<CreateWorryForm />);

      const longTitle = 'a'.repeat(201);
      fireEvent.change(screen.getByLabelText('Title'), { target: { value: longTitle } });
      fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Valid text' } });

      fireEvent.click(screen.getByRole('button', { name: /send/i }));

      await waitFor(() => {
        expect(notifications.show).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'Title is too long.',
          })
        );
      });

      expect(createWorry).not.toHaveBeenCalled();
    });
  });

  describe('Form Submission', () => {
    it('submits successfully when all fields are valid', async () => {
      (createWorry as any).mockResolvedValueOnce({});

      render(<CreateWorryForm />);

      fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'My worry' } });
      fireEvent.change(screen.getByLabelText('Description'), {
        target: { value: 'Something worries me' },
      });

      fireEvent.click(screen.getByRole('button', { name: /send/i }));

      await waitFor(() => {
        expect(createWorry).toHaveBeenCalled();
      });

      expect(notifications.show).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Created Worry',
          message: 'Worry created successfully!',
          color: 'green',
        })
      );
    });

    it('resets form fields after successful submission', async () => {
      (createWorry as any).mockResolvedValueOnce({});

      render(<CreateWorryForm />);

      const titleInput = screen.getByLabelText('Title') as HTMLInputElement;
      const contentInput = screen.getByLabelText('Description') as HTMLTextAreaElement;

      fireEvent.change(titleInput, { target: { value: 'Something' } });
      fireEvent.change(contentInput, { target: { value: 'Content text' } });

      fireEvent.click(screen.getByRole('button', { name: /send/i }));

      await waitFor(() => {
        expect(createWorry).toHaveBeenCalled();
      });

      expect(titleInput.value).toBe('');
      expect(contentInput.value).toBe('');
    });
  });

  describe('Error Handling', () => {
    const serverErrorMap = {
      ERROR_NO_TITLE: 'Title is required.',
      ERROR_TITLE_TOO_LONG: 'Title is too long.',
      ERROR_DESCRIPTION_TOO_LONG: 'Description is too long.',
      ERROR_UNAUTHORIZED: 'You are not authorized.',
      ERROR_USER_HAS_NO_COMMUNITY: 'You are not assigned to a community.',
      ERROR_DB_INSERT_FAILED: 'Failed to save the notice.',
      ERROR_FETCHING_PROFILE: 'Cannot load profile.',
      ERROR_UNKNOWN: 'Unexpected server error.',
    };

    for (const [err, msg] of Object.entries(serverErrorMap)) {
      it(`handles ${err} error from server`, async () => {
        (createWorry as any).mockRejectedValueOnce(new Error(err));

        render(<CreateWorryForm />);

        fillForm();

        fireEvent.click(screen.getByRole('button', { name: /send/i }));

        await waitFor(() => {
          expect(notifications.show).toHaveBeenCalledWith(
            expect.objectContaining({
              title: 'Error',
              message: msg,
              color: 'red',
            })
          );
        });
      });
    }

    it('handles non-Error exceptions gracefully', async () => {
      (createWorry as any).mockRejectedValueOnce('weird');

      render(<CreateWorryForm />);
      fillForm();

      fireEvent.click(screen.getByRole('button', { name: /send/i }));

      await waitFor(() => {
        expect(notifications.show).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Unexpected Error',
            message: 'Unexpected server error. Please try again later.',
            color: 'red',
          })
        );
      });
    });

    it('fallbacks on unknown error code', async () => {
      (createWorry as any).mockRejectedValueOnce(new Error('SOME_UNKNOWN_ERROR'));

      render(<CreateWorryForm />);
      fillForm();

      fireEvent.click(screen.getByRole('button', { name: /send/i }));

      await waitFor(() => {
        expect(notifications.show).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'Unexpected server error.',
          })
        );
      });
    });
  });

  describe('UI Rendering', () => {
    it('renders all required fields', () => {
      render(<CreateWorryForm />);

      expect(screen.getByLabelText('Title')).toBeTruthy();
      expect(screen.getByLabelText('Description')).toBeTruthy();
    });

    it('renders submit button', () => {
      render(<CreateWorryForm />);

      const btn = screen.getByRole('button', { name: /send/i }) as HTMLButtonElement;
      expect(btn).toBeTruthy();
      expect(btn.type).toBe('submit');
    });
  });

  describe('Loading Overlay', () => {
    it('shows loading overlay while submitting', async () => {
      let resolveSubmit: any;
      const submitPromise = new Promise((resolve) => (resolveSubmit = resolve));
      (createWorry as any).mockReturnValueOnce(submitPromise);

      render(<CreateWorryForm />);
      fillForm();
      fireEvent.click(screen.getByRole('button', { name: /send/i }));

      await waitFor(() => {
        expect(screen.getByTestId('loading-overlay')).toBeTruthy();
      });

      resolveSubmit();
    });

    it('hides loading overlay after submit completes', async () => {
      let resolveSubmit: any;
      const submitPromise = new Promise((resolve) => (resolveSubmit = resolve));
      (createWorry as any).mockReturnValueOnce(submitPromise);

      render(<CreateWorryForm />);
      fillForm();
      fireEvent.click(screen.getByRole('button', { name: /send/i }));

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
    it('updates title when user types', () => {
      render(<CreateWorryForm />);
      const input = screen.getByLabelText('Title') as HTMLInputElement;

      fireEvent.change(input, { target: { value: 'abc' } });
      expect(input.value).toBe('abc');
    });

    it('updates description when user types', () => {
      render(<CreateWorryForm />);
      const input = screen.getByLabelText('Description') as HTMLTextAreaElement;

      fireEvent.change(input, { target: { value: 'xyz' } });
      expect(input.value).toBe('xyz');
    });
  });
});

function fillForm() {
  fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Worry Title' } });
  fireEvent.change(screen.getByLabelText('Description'), {
    target: { value: 'Something worrying' },
  });
}
