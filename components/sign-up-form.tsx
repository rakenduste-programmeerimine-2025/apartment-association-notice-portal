"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export function SignUpForm() {
  const supabase = createClient();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [flatNumber, setFlatNumber] = useState("");
  const [communityId, setCommunityId] = useState<string | null>(null);
  const [communities, setCommunities] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

 
  useEffect(() => {
    const fetchCommunities = async () => {
      const { data, error } = await supabase.from("communities").select("id, name");
      if (error) setError(error.message);
      else setCommunities(data || []);
    };
    fetchCommunities();
  }, [supabase]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // validation
    if (password !== repeatPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (!/\d/.test(password) || !/[A-Za-z]/.test(password)) {
      setError("Password must contain letters and numbers");
      return;
    }
    if (!communityId) {
      setError("Please select a community");
      return;
    }

    setIsLoading(true);

    try {
      
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: "resident", 
          },
        },
      });
      if (signUpError) throw signUpError;

      if (!signUpData.user) throw new Error("User not created");

      const { error: insertError } = await supabase.from("users").insert({ //tabelisse users
        id: signUpData.user.id,
        email,
        full_name: fullName,
        flat_number: flatNumber,
        community_id: communityId,
        role: "resident",
      });
      if (insertError) throw insertError;

      // automaatselt logime
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (loginError) throw loginError;

      // redirect useriks
      router.push("/protected/Resident/Notices");

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
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
            <Label>Full Name</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label>Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div>
            <Label>Repeat Password</Label>
            <Input type="password" value={repeatPassword} onChange={(e) => setRepeatPassword(e.target.value)} required />
          </div>
          <div>
            <Label>Select Community</Label>
            <select
              value={communityId ?? ""}
              onChange={(e) => setCommunityId(e.target.value)}
              required
              className="border rounded p-2 w-full"
            >
              <option value="" disabled>Select your community</option>
              {communities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Flat Number</Label>
            <Input value={flatNumber} onChange={(e) => setFlatNumber(e.target.value)} required />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Sign Up"}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link href="/auth/login" className="underline">Log in</Link>
        </div>
      </CardContent>
    </Card>
  );
}
