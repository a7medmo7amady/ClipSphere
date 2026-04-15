"use client";

import { useState } from "react";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Auth() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to login");
      localStorage.setItem("token", data.token);
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length <= 6) {
      setError("Password must be greater than 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to register");
      setError("Registration successful! Check your email to verify.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-950">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[#663399] to-[#7d3fb8] flex items-center justify-center">
              <span className="text-white font-bold text-2xl">CS</span>
            </div>
            <span className="text-2xl font-bold text-white">ClipSphere</span>
          </div>
          <p className="text-zinc-400">Join the next generation of creators</p>
        </div>

        <Card className="p-8 bg-zinc-900 border-zinc-800">
          <Tabs defaultValue="login" className="space-y-6">
            <TabsList className="w-full bg-zinc-800 border border-zinc-700">
              <TabsTrigger value="login" className="flex-1">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="register" className="flex-1">
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-md">
                    {error}
                  </div>
                )}
                <div>
                  <Label htmlFor="login-email" className="text-zinc-300">
                    Email Address
                  </Label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10 bg-zinc-800 border-zinc-700 text-white"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="login-password" className="text-zinc-300">
                    Password
                  </Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      className="pl-10 bg-zinc-800 border-zinc-700 text-white"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-zinc-400 cursor-pointer">
                    <input type="checkbox" className="rounded" />
                    Remember me
                  </label>
                  <a href="#" className="text-[#663399] hover:text-[#7d3fb8]">
                    Forgot password?
                  </a>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#663399] hover:bg-[#7d3fb8]"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>
            </TabsContent>

            {/* Register Form */}
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                {error && (
                  <div className="p-3 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-md">
                    {error}
                  </div>
                )}
                <div>
                  <Label htmlFor="register-username" className="text-zinc-300">
                    Username
                  </Label>
                  <div className="relative mt-1.5">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <Input
                      id="register-username"
                      type="text"
                      placeholder="Choose a username"
                      className="pl-10 bg-zinc-800 border-zinc-700 text-white"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="register-email" className="text-zinc-300">
                    Email Address
                  </Label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10 bg-zinc-800 border-zinc-700 text-white"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="register-password" className="text-zinc-300">
                    Password
                  </Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Create a strong password"
                      className="pl-10 bg-zinc-800 border-zinc-700 text-white"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                </div>

                <div>
                  <Label htmlFor="register-confirm" className="text-zinc-300">
                    Confirm Password
                  </Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <Input
                      id="register-confirm"
                      type="password"
                      placeholder="Confirm your password"
                      className="pl-10 bg-zinc-800 border-zinc-700 text-white"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="text-sm text-zinc-400">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded mt-1" required />
                    <span>
                      I agree to the{" "}
                      <a href="#" className="text-[#663399] hover:text-[#7d3fb8]">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-[#663399] hover:text-[#7d3fb8]">
                        Privacy Policy
                      </a>
                    </span>
                  </label>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#663399] hover:bg-[#7d3fb8]"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Create Account"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <Separator className="my-6 bg-zinc-800" />

          <div className="space-y-3">
            <p className="text-center text-sm text-zinc-400 mb-4">Or continue with</p>
            <Button type="button" onClick={() => window.location.href="http://localhost:5000/api/v1/auth/google"} variant="outline" className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>
          </div>
        </Card>

      </div>
    </div>
  );
}
