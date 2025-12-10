// components/ui/tests/ConfirmModal.test.tsx
import React from 'react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import ConfirmModal from '../ConfirmModal';

// --- Mantine / browser API mocks ---
beforeAll(() => {
  // matchMedia mock (needed for MantineProvider color scheme)
  if (!window.matchMedia) {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  }
});

// Helper to render ConfirmModal with MantineProvider
const renderWithMantine = (props: Partial<React.ComponentProps<typeof ConfirmModal>> = {}) => {
  const defaultProps: React.ComponentProps<typeof ConfirmModal> = {
    opened: true,
    title: 'Delete item',
    message: 'Are you sure?',
    loading: false,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
  };

  const merged = { ...defaultProps, ...props };

  return render(
    <MantineProvider>
      <ConfirmModal {...merged} />
    </MantineProvider>
  );
};

describe('ConfirmModal', () => {
  it('renders title and message when opened', () => {
    renderWithMantine();

    expect(screen.getByText('Delete item')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', () => {
    const onConfirm = vi.fn();

    renderWithMantine({ onConfirm });

    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmButton);

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when cancel button is clicked', () => {
    const onClose = vi.fn();

    renderWithMantine({ onClose });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('disables confirm button when loading is true', () => {
    renderWithMantine({ loading: true });

    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    expect(confirmButton).toBeDisabled();
  });

  it('does not render content when opened is false', () => {
    renderWithMantine({ opened: false });

    expect(screen.queryByText('Delete item')).not.toBeInTheDocument();
    expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument();
  });
});
