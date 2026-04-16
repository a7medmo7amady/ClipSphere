"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Upload, User, Settings, BarChart3, Bell, Search } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const API = "http://localhost:5000/api/v1";

function useUnreadCount(userId: string | undefined) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!userId) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    // Fetch initial count
    fetch(`${API}/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setCount(data.data.count ?? 0))
      .catch(() => {});

    // Real-time updates via Socket.IO
    const socket = io("http://localhost:5000", { auth: { token } });

    socket.on("notification", () => {
      setCount((prev) => prev + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  return [count, () => setCount(0)] as const;
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  const { user, isLoading } = useAuth();
  const [unreadCount, resetUnreadCount] = useUnreadCount(user?.id);
  const isAuthPage = pathname === "/auth" || pathname === "/oauth" || pathname === "/verify";
  const avatarSrc = user?.avatarKey ? `http://localhost:9000/clipsphere/${user.avatarKey}` : "";
  const avatarFallback = (user?.name ?? user?.username ?? "?").substring(0, 2).toUpperCase();

  if (isAuthPage) {
    return <div className="min-h-screen bg-zinc-950">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#663399] flex items-center justify-center">
              <span className="text-white font-bold text-xl">CS</span>
            </div>
            <span className="text-xl font-bold text-gray-300">ClipSphere</span>
          </Link>

          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input
                placeholder="Search videos, creators..."
                title="Search videos and creators"
                className="pl-10 bg-zinc-800 border-zinc-700 text-gray-300 placeholder:text-zinc-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <Link href="/notifications" onClick={resetUnreadCount}>
                <Button variant="ghost" size="icon" className="relative text-zinc-400 hover:text-gray-300">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-violet-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Button>
              </Link>
            )}
            <Link href="/upload">
              <Button className="bg-[#663399] hover:bg-[#7d3fb8]">
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
            </Link>
            {isLoading ? (
              <div className="w-9 h-9 flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-[#663399]" />
              </div>
            ) : user ? (
              <Link href="/profile/1">
                <Avatar className="w-9 h-9 cursor-pointer ring-2 ring-[#663399]/20 hover:ring-[#663399]/50 transition-all">
                  <AvatarImage src={avatarSrc} />
                  <AvatarFallback>{avatarFallback}</AvatarFallback>
                </Avatar>
              </Link>
            ) : (
              <Link href="/auth">
                <Button variant="secondary" size="sm">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Search */}
      <div className="md:hidden fixed top-16 left-0 right-0 z-40 px-4 py-3 bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            placeholder="Search..."
            title="Search"
            className="pl-10 bg-zinc-800 border-zinc-700 text-gray-300 placeholder:text-zinc-400"
          />
        </div>
      </div>

      <main className="pt-16 md:pt-16 md:pl-64 pb-20 md:pb-0">
        {children}
      </main>

      {/* Bottom Navigation - Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-900/95 backdrop-blur-xl border-t border-zinc-800">
        <div className="flex items-center justify-around h-16 px-2">
          <Link href="/" className="flex-1">
            <Button variant="ghost" size="sm" className={`w-full flex flex-col items-center gap-1 h-auto py-2 ${isActive("/") ? "text-[#663399]" : "text-zinc-400 hover:text-[#7d3fb8]"}`}>
              <Home className="w-5 h-5" />
              <span className="text-xs">Home</span>
            </Button>
          </Link>
          <Link href="/discover" className="flex-1">
            <Button variant="ghost" size="sm" className={`w-full flex flex-col items-center gap-1 h-auto py-2 ${isActive("/discover") ? "text-[#663399]" : "text-zinc-400 hover:text-[#7d3fb8]"}`}>
              <Compass className="w-5 h-5" />
              <span className="text-xs">Discover</span>
            </Button>
          </Link>
          <Link href="/upload" className="flex-1">
            <Button variant="ghost" size="sm" className="w-full flex flex-col items-center gap-1 h-auto py-2 text-zinc-400">
              <div className="w-8 h-8 rounded-full bg-[#663399] flex items-center justify-center -mt-1">
                <Upload className="w-4 h-4 text-white" />
              </div>
            </Button>
          </Link>
          {user?.role === "admin" && (
            <Link href="/admin" className="flex-1">
              <Button variant="ghost" size="sm" className={`w-full flex flex-col items-center gap-1 h-auto py-2 ${isActive("/admin") ? "text-[#663399]" : "text-zinc-400 hover:text-[#7d3fb8]"}`}>
                <BarChart3 className="w-5 h-5" />
                <span className="text-xs">Admin</span>
              </Button>
            </Link>
          )}
          <Link href={user ? "/profile/1" : "/auth"} className="flex-1">
            <Button variant="ghost" size="sm" className={`w-full flex flex-col items-center gap-1 h-auto py-2 ${pathname?.includes("/profile") ? "text-[#663399]" : "text-zinc-400 hover:text-[#7d3fb8]"}`}>
              <User className="w-5 h-5" />
              <span className="text-xs">Profile</span>
            </Button>
          </Link>
        </div>
      </nav>

      {/* Side Navigation - Desktop */}
      <nav className="hidden md:block fixed left-0 top-16 bottom-0 w-64 bg-zinc-900 border-r border-zinc-800 overflow-y-auto">
        <div className="p-4 space-y-2">
          <Link href="/">
            <Button variant={isActive("/") ? "secondary" : "ghost"} className={`w-full justify-start ${isActive("/") ? "bg-[#663399]/20 text-[#663399] hover:bg-[#663399]/30" : "text-gray-400 hover:text-[#7d3fb8]"}`}>
              <Home className="w-5 h-5 mr-3" />Home
            </Button>
          </Link>
          <Link href="/discover">
            <Button variant={isActive("/discover") ? "secondary" : "ghost"} className={`w-full justify-start ${isActive("/discover") ? "bg-[#663399]/20 text-[#663399] hover:bg-[#663399]/30" : "text-gray-400 hover:text-[#7d3fb8]"}`}>
              <Compass className="w-5 h-5 mr-3" />Discover
            </Button>
          </Link>
          {user && (
            <Link href="/notifications" onClick={resetUnreadCount}>
              <Button variant={isActive("/notifications") ? "secondary" : "ghost"} className={`w-full justify-start ${isActive("/notifications") ? "bg-[#663399]/20 text-[#663399] hover:bg-[#663399]/30" : "text-gray-400 hover:text-[#7d3fb8]"}`}>
                <span className="relative mr-3">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-violet-600 text-white text-[9px] font-bold flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </span>
                Notifications
              </Button>
            </Link>
          )}
          {user?.role === "admin" && (
            <Link href="/admin">
              <Button variant={isActive("/admin") ? "secondary" : "ghost"} className={`w-full justify-start ${isActive("/admin") ? "bg-[#663399]/20 text-[#663399] hover:bg-[#663399]/30" : "text-gray-400 hover:text-[#7d3fb8]"}`}>
                <BarChart3 className="w-5 h-5 mr-3" />Admin Dashboard
              </Button>
            </Link>
          )}
          <Link href="/settings">
            <Button variant={isActive("/settings") ? "secondary" : "ghost"} className={`w-full justify-start ${isActive("/settings") ? "bg-[#663399]/20 text-[#663399] hover:bg-[#663399]/30" : "text-gray-400 hover:text-[#7d3fb8]"}`}>
              <Settings className="w-5 h-5 mr-3" />Settings
            </Button>
          </Link>
        </div>
      </nav>
    </div>
  );
}
