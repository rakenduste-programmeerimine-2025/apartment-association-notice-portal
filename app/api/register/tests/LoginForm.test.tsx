import '@testing-library/jest-dom';
import '@/app/api/register/tests/mocks';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LoginForm } from '@/components/login-form';
import { MantineProvider } from '@mantine/core';

describe('LoginForm', () => {
  it('shows error from supabase login', async () => {
    render(
      <MantineProvider>
        <LoginForm />
      </MantineProvider>
    );

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: '123456' } });
    fireEvent.submit(screen.getByRole('button', { name: /Login/i }));

    expect(await screen.findByText(/An error occurred|Invalid login/)).toBeInTheDocument();
  });
});
