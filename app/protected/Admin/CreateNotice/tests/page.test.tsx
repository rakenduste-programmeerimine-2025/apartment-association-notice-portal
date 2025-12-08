import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CreateNoticePage from '../page';

vi.mock('@mantine/core', async () => {
  const actual = await vi.importActual<any>('@mantine/core');
  return {
    ...actual,
    Flex: ({ children, ...props }: any) => (
      <div data-testid="mantine-flex" {...props}>
        {children}
      </div>
    ),
  };
});

vi.mock('../components/CreateNoticeForm', () => ({
  __esModule: true,
  default: () => <div data-testid="create-notice-form" />,
}));

describe('CreateNoticePage', () => {
  it('renders without crashing', () => {
    render(<CreateNoticePage />);
    expect(screen.getByTestId('mantine-flex')).toBeTruthy();
  });

  it('renders the CreateNoticeForm component', () => {
    render(<CreateNoticePage />);
    expect(screen.getByTestId('create-notice-form')).toBeTruthy();
  });

  it('wraps CreateNoticeForm inside Flex', () => {
    render(<CreateNoticePage />);

    const flex = screen.getByTestId('mantine-flex');
    const form = screen.getByTestId('create-notice-form');

    expect(flex.contains(form)).toBe(true);
  });

  it('applies correct Flex layout props', () => {
    render(<CreateNoticePage />);
    const flex = screen.getByTestId('mantine-flex');

    expect(flex.getAttribute('justify')).toBe('center');
    expect(flex.style.paddingTop).toBe('3rem');
  });
});
