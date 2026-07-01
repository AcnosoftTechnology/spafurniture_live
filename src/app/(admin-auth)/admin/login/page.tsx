"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function resolveCallbackUrl(raw: string | null): string {
  const fallback = "/admin/dashboard/";
  if (!raw) return fallback;

  if (!raw.startsWith("/") || raw.startsWith("//")) return fallback;

  try {
    const path = raw.split("?")[0]?.split("#")[0] ?? "";
    if (!path.startsWith("/admin/")) return fallback;
    return path.endsWith("/") ? path : `${path}/`;
  } catch {
    return fallback;
  }
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("Invalid email or password");
      return;
    }
    window.location.href = resolveCallbackUrl(searchParams.get("callbackUrl"));
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-100 p-4 dark:bg-stone-950">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="font-display text-xl">Admin Sign In</CardTitle>
          <CardDescription>Esthetica Spa Furniture CMS</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
            <Link href="/admin/forgot-password/" className="block text-center text-xs text-stone-500 hover:underline">
              Forgot password?
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
