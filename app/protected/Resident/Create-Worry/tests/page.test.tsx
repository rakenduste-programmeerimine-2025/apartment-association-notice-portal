import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CreateWorryPage from '../page';

vi.mock('@mantine/core', async () => {
  const actual = await vi.importActual<any>('@mantine/core');
  return {
    ...actual,
    Flex: ({ children, ...props }: any) => (
      <div data-testid="mantine-flex" {...props}>
        {children}
      </div>
    ),
    Card: ({ children }: any) => <div data-testid="card">{children}</div>,
    Stack: ({ children }: any) => <div data-testid="stack">{children}</div>,
    Group: ({ children }: any) => <div data-testid="group">{children}</div>,
    Title: ({ children }: any) => <h2>{children}</h2>,
    Text: ({ children }: any) => <span>{children}</span>,
    TextInput: ({ label, value, onChange }: any) => (
      <input aria-label={label} value={value ?? ''} onChange={onChange} />
    ),
    Textarea: ({ label, value, onChange }: any) => (
      <textarea aria-label={label} value={value ?? ''} onChange={onChange} />
    ),
    Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    LoadingOverlay: ({ visible }: any) => (visible ? <div data-testid="loading-overlay" /> : null),
  };
});

vi.mock('../components/CreateWorryForm', () => ({
  __esModule: true,
  default: () => <div data-testid="create-worry-form" />,
}));

describe('CreateWorryPage', () => {
  it('renders without crashing', () => {
    render(<CreateWorryPage />);
    expect(screen.getByTestId('mantine-flex')).toBeTruthy();
  });

  it('includes the CreateWorryForm component', () => {
    render(<CreateWorryPage />);
    expect(screen.getByTestId('create-worry-form')).toBeTruthy();
  });

  it('applies correct Flex props', () => {
    render(<CreateWorryPage />);
    const flex = screen.getByTestId('mantine-flex');

    expect(flex.getAttribute('justify')).toBe('center');
    expect(flex.style.paddingTop).toBe('3rem');
  });
});
