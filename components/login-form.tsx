'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Flex, Alert } from '@mantine/core';
import { Info, AlertCircle } from 'lucide-react';

export function LoginForm() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const pendingSignup = searchParams.get('pending') === '1';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const userId = authData.user.id;

      const { data: residentRow, error: fetchErr } = await supabase
        .from('users')
        .select('status, community_id, role')
        .eq('id', userId)
        .single();

      if (fetchErr) throw fetchErr;

      if (residentRow.status === 'pending') {
        await supabase.auth.signOut();
        setError('Your registration is under review by your community administrator.');
        return;
      }

      if (residentRow.status === 'rejected') {
        await supabase.from('users').delete().eq('id', userId);
        await supabase.auth.admin.deleteUser(userId);
        setError('Your account was rejected. Please reach out to the administrator of your community.');
        return;
      }

      if (residentRow.status === 'approved') {
        if (residentRow.role === 'resident') {
          router.push('/protected/Resident/Notices');
        } else {
          router.push('/protected/Admin/Notices');
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-20">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Access your account</CardDescription>
      </CardHeader>
      <CardContent>
        {pendingSignup && (
          <Alert icon={<Info size={18} />} color="blue" variant="light" radius="md" mb="md">
            Your registration was submitted. Please wait for admin approval.
          </Alert>
        )}

        {error && (
          <Alert icon={<AlertCircle size={18} />} color="red" variant="light" radius="md" mb="md">
            {error}
          </Alert>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <Flex justify="space-between" align="center" w="100%">
              <Label htmlFor="password">Password</Label>
              <Link href="/auth/forgot-password" className="text-xs text-gray-500 hover:underline">
                Forgot password?
              </Link>
            </Flex>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          Not a member?{' '}
          <Link href="/auth/sign-up" className="underline">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
