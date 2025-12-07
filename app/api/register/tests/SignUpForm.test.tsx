// 
import '@testing-library/jest-dom';
import '@/app/api/register/tests/mocks';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SignUpForm } from '@/components/sign-up-form';

describe('SignUpForm', () => {
  it('shows error when passwords do not match', async () => {
    render(<SignUpForm />);

    // mock 
    fireEvent.change(screen.getByLabelText('Select your address'), { target: { value: 'mock' } });

    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Test1234' } });
    fireEvent.change(screen.getByLabelText('Repeat Password'), { target: { value: 'Wrong' } });
    fireEvent.submit(screen.getByRole('button', { name: /Sign Up/i }));

    expect(await screen.findByText('Passwords do not match')).toBeInTheDocument();
  });
});
