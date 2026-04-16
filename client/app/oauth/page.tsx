"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function OAuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("token", token);
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        router.push("/profile/1");
      } catch {
        router.push("/");
      }
    } else {
      setError("No authentication token received");
      setTimeout(() => {
        router.push("/auth");
      }, 3000);
    }
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-zinc-950 text-white">
        <div className="p-4 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm max-w-sm text-center">
          {error}
          <div className="mt-2 text-zinc-400">Redirecting to login...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-zinc-950 text-white">
      <Loader2 className="w-8 h-8 animate-spin text-[#663399] mb-4" />
      <p className="text-zinc-400">Completing authentication...</p>
    </div>
  );
}
