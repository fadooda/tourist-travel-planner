"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const j = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErr(j.error || "Registration failed.");
        return;
      }

      // ✅ auto sign in after successful register
      const login = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/app",
      });

      if (!login || login.error) {
        // account created, but login failed → fallback to login page
        router.push("/auth/login");
        return;
      }

      router.push(login.url ?? "/app");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-semibold">Create account</h1>
      <p className="mt-2 text-slate-600">Save trips and build itineraries.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <input
          className="w-full rounded-xl border border-slate-200 px-4 py-3"
          placeholder="Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="w-full rounded-xl border border-slate-200 px-4 py-3"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full rounded-xl border border-slate-200 px-4 py-3"
          placeholder="Password (min 6 chars)"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {err && <p className="text-sm text-red-600">{err}</p>}

        <Button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl py-6"
        >
          {loading ? "Creating..." : "Create account"}
        </Button>

        <p className="text-center text-sm text-slate-600">
          Already have an account?{" "}
          <a className="underline" href="/auth/login">
            Sign in
          </a>
        </p>
      </form>
    </main>
  );
}
