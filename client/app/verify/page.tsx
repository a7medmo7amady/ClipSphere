"use client";

import { useRef, useState, useEffect, KeyboardEvent, ClipboardEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function VerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const updateDigit = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = cleaned;
    setDigits(next);
    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = [...digits];
    pasted.split("").forEach((char, i) => {
      if (i < 6) next[i] = char;
    });
    setDigits(next);
    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = async () => {
    const code = digits.join("");
    if (code.length < 6) {
      setError("Please enter the full 6-digit code.");
      return;
    }
    if (!email) {
      setError("Email address is missing. Please register again.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/v1/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Verification failed.");

      localStorage.setItem("token", data.token);
      setSuccess(true);
      setTimeout(() => router.push(`/profile/${data.data.user.id}`), 1500);
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
        </div>

        <Card className="p-8 bg-zinc-900 border-zinc-800">
          {success ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <p className="text-white font-semibold text-lg">Email verified!</p>
              <p className="text-zinc-400 text-sm">Redirecting you to ClipSphere...</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center gap-3 mb-8">
                <div className="w-14 h-14 rounded-full bg-violet-500/10 flex items-center justify-center">
                  <Mail className="w-7 h-7 text-violet-400" />
                </div>
                <h1 className="text-xl font-bold text-white">Check your email</h1>
                <p className="text-zinc-400 text-sm text-center">
                  We sent a 6-digit code to{" "}
                  <span className="text-white font-medium">{email || "your email"}</span>.
                  <br />
                  It expires in 10 minutes.
                </p>
              </div>

              {/* OTP Inputs */}
              <div className="flex justify-center gap-3 mb-6">
                {digits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => updateDigit(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    className="w-12 h-14 text-center text-2xl font-bold rounded-lg bg-zinc-800 border-2 border-zinc-700 text-white focus:border-violet-500 focus:outline-none transition-colors"
                  />
                ))}
              </div>

              {error && (
                <div className="mb-4 p-3 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-md text-center">
                  {error}
                </div>
              )}

              <Button
                className="w-full bg-[#663399] hover:bg-[#7d3fb8]"
                onClick={handleSubmit}
                disabled={isLoading || digits.join("").length < 6}
              >
                {isLoading ? "Verifying..." : "Verify Email"}
              </Button>

              <p className="text-center text-sm text-zinc-500 mt-4">
                Didn&apos;t receive it? Check your spam folder.
              </p>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
