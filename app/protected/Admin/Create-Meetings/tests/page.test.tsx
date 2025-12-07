import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CreateMeetingsPage from '../page';

vi.mock('@mantine/core', async () => {
  const actual = await vi.importActual<any>('@mantine/core');
  return {
    ...actual,
    Flex: ({ children, justify, style }: any) => (
      <div
        data-testid="flex-container"
        data-justify={justify}
        style={style}
      >
        {children}
      </div>
    ),
  };
});

vi.mock('../components/CreateMeetingForm', () => ({
  __esModule: true,
  default: () => <div data-testid="create-meeting-form" />,
}));

describe('CreateMeetingsPage', () => {

  it('renders the page layout', () => {
    render(<CreateMeetingsPage />);
    expect(screen.getByTestId('flex-container')).toBeTruthy();
  });

  it('renders the CreateMeetingForm component', () => {
    render(<CreateMeetingsPage />);
    expect(screen.getByTestId('create-meeting-form')).toBeTruthy();
  });

  it('places CreateMeetingForm inside the Flex wrapper', () => {
    render(<CreateMeetingsPage />);

    const container = screen.getByTestId('flex-container');
    const form = screen.getByTestId('create-meeting-form');

    expect(container.contains(form)).toBe(true);
  });

  it('applies correct Flex properties (justify + padding)', () => {
    render(<CreateMeetingsPage />);

    const flex = screen.getByTestId('flex-container');

    expect(flex.getAttribute('data-justify')).toBe('center');
    expect(flex.style.paddingTop).toBe('3rem');
  });

  it('renders with correct page structure (one direct child)', () => {
    const { container } = render(<CreateMeetingsPage />);

    const flex = container.querySelector('[data-testid="flex-container"]');
    const children = flex?.children || [];

    expect(children.length).toBe(1);
  });
});
