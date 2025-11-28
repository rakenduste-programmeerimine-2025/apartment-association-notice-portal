'use client';

import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Stack, Group } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Eye, EyeOff } from 'lucide-react';

export function UpdatePasswordForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordRepeat, setShowPasswordRepeat] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const validatePassword = () => {
    if (password !== passwordRepeat) return 'Passwords do not match';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/\d/.test(password)) return 'Password must contain at least one number';
    return null;
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    const validationError = validatePassword();
    if (validationError) {
      setIsLoading(false);
      setError(validationError);
      notifications.show({
        title: 'Error',
        message: validationError,
        color: 'red',
      });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      notifications.show({
        title: 'Password Updated',
        message: 'Password updated successfully!',
        color: 'green',
      });

      router.push('/protected/Resident/Notices');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      setError(message);
      notifications.show({
        title: 'Error',
        message,
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    notifications.show({
      title: 'Cancelled',
      message: 'Password update cancelled successfully!',
      color: 'green',
    });
    router.push('/auth/login');
  };

  return (
    <Stack className={cn('gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Reset Your Password</CardTitle>
          <CardDescription>Please enter your new password below.</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleForgotPassword}>
            <Stack gap="md">
              <Stack gap={4}>
                <Label htmlFor="password">New password</Label>
                <Group align="center" gap="sx" wrap="nowrap">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Write your new password.."
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="px-3"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </Button>
                </Group>
              </Stack>
              <Stack gap={4}>
                <Label htmlFor="passwordRepeat">Repeat password</Label>
                <Group align="center" gap="sx" wrap="nowrap">
                  <Input
                    id="passwordRepeat"
                    type={showPasswordRepeat ? 'text' : 'password'}
                    placeholder="Repeat your new password.."
                    required
                    value={passwordRepeat}
                    onChange={(e) => setPasswordRepeat(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="px-3"
                    onClick={() => setShowPasswordRepeat((v) => !v)}
                  >
                    {showPasswordRepeat ? <Eye size={18} /> : <EyeOff size={18} />}
                  </Button>
                </Group>
              </Stack>

              <Group justify="space-between" grow>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save new password'}
                </Button>

                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </Group>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Stack>
  );
}
