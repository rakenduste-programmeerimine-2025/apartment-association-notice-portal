'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { EstonianAddress, EstonianAddressData } from '@/components/estonian-address';

export function SignUpForm() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [flatNumber, setFlatNumber] = useState('');
  const [selectedAddress, setSelectedAddress] = useState<EstonianAddressData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedAddress) {
      setError('Please select your address');
      return;
    }

    if (password !== repeatPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8 || !/\d/.test(password) || !/[A-Za-z]/.test(password)) {
      setError('Password must be at least 8 characters and contain letters and numbers');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          fullName,
          flatNumber,
          ads_oid: selectedAddress.ads_oid,
          full_address: selectedAddress.full_address,
          streetName: selectedAddress.streetName,
          houseNumber: selectedAddress.houseNumber,
          city: selectedAddress.city,
          country: selectedAddress.country,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Registration failed');
      router.push('/auth/login?pending=1');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-20">
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>Create a new account (Resident only)</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignUp} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <div>
            <Label htmlFor="repeatPassword">Repeat Password</Label>
            <Input id="repeatPassword" type="password" value={repeatPassword} onChange={(e) => setRepeatPassword(e.target.value)} required />
          </div>

          <div className="relative z-10">
            <Label htmlFor="address">Select your address</Label>
            <EstonianAddress onSelect={setSelectedAddress} />
          </div>

          <div>
            <Label htmlFor="flatNumber">Flat Number</Label>
            <Input id="flatNumber" value={flatNumber} onChange={(e) => setFlatNumber(e.target.value)} required />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button type="submit" disabled={isLoading || !selectedAddress}>
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Link href="/auth/login" className="underline">
            Log in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
