"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, LogIn, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

type AuthMode = "login" | "register";

export function AuthScreen() {
  const router = useRouter();
  const { login, register } = useAuth();

  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const clearFeedback = () => {
    setError(null);
    setSuccess(null);
  };

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    clearFeedback();
  };

  const handleLogin = async () => {
    await login({ email, password });
    router.push("/");
  };

  const handleRegister = async () => {
    await register({ name, email, password });
    setSuccess("Account created. Please sign in.");
    setMode("login");
    setPassword("");
    setConfirmPassword("");
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearFeedback();

    if (!email || !password || (mode === "register" && !name)) {
      setError("Please complete all required fields.");
      return;
    }

    if (mode === "register" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "login") {
        await handleLogin();
      } else {
        await handleRegister();
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Authentication error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-md px-4 py-10">
      <Link href="/" className="mb-5 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
        <ArrowLeft size={16} /> Back to home
      </Link>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-extrabold text-slate-900">
          {mode === "login" ? "Sign in" : "Create account"}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {mode === "login"
            ? "Sign in to BrainLead."
            : "Create your account to access the platform."}
        </p>

        <div className="mt-4 flex gap-4 text-sm">
          <button
            type="button"
            onClick={() => switchMode("login")}
            className={mode === "login" ? "font-semibold text-slate-900" : "text-slate-500 hover:text-slate-800"}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => switchMode("register")}
            className={mode === "register" ? "font-semibold text-slate-900" : "text-slate-500 hover:text-slate-800"}
          >
            Register
          </button>
        </div>

        <form className="mt-5 space-y-4" onSubmit={submit}>
          {mode === "register" && (
            <label className="block text-sm">
              <span className="mb-1 block text-slate-700">Full name</span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Jordan Lee"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-blue-700/20 focus:border-blue-500 focus:ring"
              />
            </label>
          )}

          <label className="block text-sm">
            <span className="mb-1 block text-slate-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@company.com"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-blue-700/20 focus:border-blue-500 focus:ring"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block text-slate-700">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-blue-700/20 focus:border-blue-500 focus:ring"
            />
          </label>

          {mode === "register" && (
            <label className="block text-sm">
              <span className="mb-1 block text-slate-700">Confirm password</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Repeat password"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-blue-700/20 focus:border-blue-500 focus:ring"
              />
            </label>
          )}

          {error && <p className="text-sm text-rose-700">{error}</p>}
          {success && <p className="text-sm text-emerald-700">{success}</p>}

          <button
            type="submit"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900 disabled:text-slate-400"
            disabled={loading}
          >
            {mode === "login" ? <LogIn size={16} /> : <UserPlus size={16} />}
            {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>
      </div>
    </section>
  );
}
