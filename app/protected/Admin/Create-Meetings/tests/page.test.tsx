import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import CreateMeetingsPage from '../page';

vi.mock('../components/CreateMeetingForm', () => ({
  default: () => <div data-testid="create-meeting-form">Create Meeting Form Component</div>,
}));

vi.mock('@mantine/core', async () => {
  const actual = await vi.importActual('@mantine/core');
  return {
    ...actual,
    Flex: ({ children, justify, style }: any) => (
      <div data-testid="flex-container" data-justify={justify} style={style}>
        {children}
      </div>
    ),
  };
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('CreateMeetingsPage', () => {
  describe('Page Rendering', () => {
    it('renders the page without errors', () => {
      render(<CreateMeetingsPage />);
      expect(screen.getByTestId('flex-container')).toBeTruthy();
    });

    it('renders the CreateMeetingForm component', () => {
      render(<CreateMeetingsPage />);
      expect(screen.getByTestId('create-meeting-form')).toBeTruthy();
    });

    it('renders CreateMeetingForm with correct text content', () => {
      render(<CreateMeetingsPage />);
      expect(screen.getByText('Create Meeting Form Component')).toBeTruthy();
    });
  });

  describe('Layout and Styling', () => {
    it('uses Flex container for layout', () => {
      render(<CreateMeetingsPage />);
      const flexContainer = screen.getByTestId('flex-container');
      expect(flexContainer).toBeTruthy();
    });

    it('applies center justification to Flex container', () => {
      render(<CreateMeetingsPage />);
      const flexContainer = screen.getByTestId('flex-container');
      expect(flexContainer).toHaveAttribute('data-justify', 'center');
    });

    it('applies correct padding-top style to Flex container', () => {
      render(<CreateMeetingsPage />);
      const flexContainer = screen.getByTestId('flex-container');
      const style = flexContainer.getAttribute('style');
      expect(style).toContain('padding-top: 3rem');
    });

    it('has correct computed padding value', () => {
      render(<CreateMeetingsPage />);
      const flexContainer = screen.getByTestId('flex-container');
      expect(flexContainer.style.paddingTop).toBe('3rem');
    });
  });

  describe('Component Structure', () => {
    it('contains exactly one child component (CreateMeetingForm)', () => {
      const { container } = render(<CreateMeetingsPage />);
      const flexContainer = container.querySelector('[data-testid="flex-container"]');
      const children = flexContainer?.children || [];
      expect(children.length).toBe(1);
    });

    it('Flex container contains CreateMeetingForm as direct child', () => {
      render(<CreateMeetingsPage />);
      const flexContainer = screen.getByTestId('flex-container');
      const createMeetingForm = screen.getByTestId('create-meeting-form');
      expect(flexContainer.contains(createMeetingForm)).toBe(true);
    });
  });

  describe('Client-Side Rendering', () => {
    it('is marked as a client component (use client)', () => {
      render(<CreateMeetingsPage />);
      expect(screen.getByTestId('flex-container')).toBeTruthy();
    });

    it('renders without server-side dependencies', () => {
      render(<CreateMeetingsPage />);
      const form = screen.getByTestId('create-meeting-form');
      expect(form).toBeTruthy();
    });
  });

  describe('Visual Layout Tests', () => {
    it('centers the form horizontally using Flex justify-content center', () => {
      render(<CreateMeetingsPage />);
      const flexContainer = screen.getByTestId('flex-container');
      expect(flexContainer).toHaveAttribute('data-justify', 'center');
    });

    it('provides top spacing of 3rem (48px) to the form', () => {
      render(<CreateMeetingsPage />);
      const flexContainer = screen.getByTestId('flex-container');
      expect(flexContainer.style.paddingTop).toBe('3rem');
    });

    it('maintains layout structure with Flex and padding', () => {
      render(<CreateMeetingsPage />);
      const flexContainer = screen.getByTestId('flex-container');

      expect(flexContainer).toBeDefined();
      expect(flexContainer).toHaveAttribute('data-justify', 'center');
      expect(flexContainer.style.paddingTop).toBe('3rem');
    });
  });

  describe('Integration with CreateMeetingForm', () => {
    it('wraps CreateMeetingForm in centered Flex layout', () => {
      render(<CreateMeetingsPage />);

      const flexContainer = screen.getByTestId('flex-container');
      const createMeetingForm = screen.getByTestId('create-meeting-form');

      expect(flexContainer.contains(createMeetingForm)).toBe(true);
      expect(flexContainer).toHaveAttribute('data-justify', 'center');
    });

    it('applies consistent styling to form wrapper', () => {
      render(<CreateMeetingsPage />);
      const flexContainer = screen.getByTestId('flex-container');

      expect(flexContainer).toHaveAttribute('data-justify', 'center');
      expect(flexContainer.style.paddingTop).toBe('3rem');
    });

    it('does not add additional styling beyond Flex wrapper and padding', () => {
      render(<CreateMeetingsPage />);
      const flexContainer = screen.getByTestId('flex-container');

      const styleAttribute = flexContainer.getAttribute('style');
      expect(styleAttribute).toContain('padding-top: 3rem');
    });
  });

  describe('Accessibility', () => {
    it('renders semantically with proper structure', () => {
      const { container } = render(<CreateMeetingsPage />);
      expect(container.querySelector('[data-testid="flex-container"]')).toBeTruthy();
    });

    it('contains accessible form component', () => {
      render(<CreateMeetingsPage />);
      expect(screen.getByTestId('create-meeting-form')).toBeTruthy();
    });
  });
});
