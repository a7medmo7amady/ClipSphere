"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Upload, User, Settings, BarChart3, Bell, Search } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;
  
  const { user, isLoading } = useAuth();
  const isAuthPage = pathname === "/auth" || pathname === "/oauth";

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-zinc-950">
        {children}
      </div>
    );
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

          {/* Right Section */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative text-zinc-400 hover:text-gray-300">
              <Bell className="w-5 h-5" />
            </Button>
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
              <Link href={`/profile/1`}>
                <Avatar className="w-9 h-9 cursor-pointer ring-2 ring-[#663399]/20 hover:ring-[#663399]/50 transition-all">
                  <AvatarImage src={user.avatar || ""} />
                  <AvatarFallback>{(user.name || user.username).substring(0, 2).toUpperCase()}</AvatarFallback>
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

      {/* Main Content */}
      <main className="pt-16 md:pt-16 md:pl-64 pb-20 md:pb-0">
        {children}
      </main>

      {/* Bottom Navigation - Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-900/95 backdrop-blur-xl border-t border-zinc-800">
        <div className="flex items-center justify-around h-16 px-2">
          <Link href="/" className="flex-1">
            <Button
              variant="ghost"
              size="sm"
              className={`w-full flex flex-col items-center gap-1 h-auto py-2 ${
                isActive("/") ? "text-[#663399]" : "text-zinc-400 hover:text-[#7d3fb8]"
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-xs">Home</span>
            </Button>
          </Link>
          <Link href="/discover" className="flex-1">
            <Button
              variant="ghost"
              size="sm"
              className={`w-full flex flex-col items-center gap-1 h-auto py-2 ${
                isActive("/discover") ? "text-[#663399]" : "text-zinc-400 hover:text-[#7d3fb8]"
              }`}
            >
              <Compass className="w-5 h-5" />
              <span className="text-xs">Discover</span>
            </Button>
          </Link>
          <Link href="/upload" className="flex-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-full flex flex-col items-center gap-1 h-auto py-2 text-zinc-400"
            >
              <div className="w-8 h-8 rounded-full bg-[#663399] flex items-center justify-center -mt-1">
                <Upload className="w-4 h-4 text-white" />
              </div>
            </Button>
          </Link>
          {user?.role === "admin" && (
            <Link href="/admin" className="flex-1">
              <Button
                variant="ghost"
                size="sm"
                className={`w-full flex flex-col items-center gap-1 h-auto py-2 ${
                  isActive("/admin") ? "text-[#663399]" : "text-zinc-400 hover:text-[#7d3fb8]"
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span className="text-xs">Admin</span>
              </Button>
            </Link>
          )}
          <Link href={user ? `/profile/1` : "/auth"} className="flex-1">
            <Button
              variant="ghost"
              size="sm"
              className={`w-full flex flex-col items-center gap-1 h-auto py-2 ${
                pathname && pathname.includes("/profile") ? "text-[#663399]" : "text-zinc-400 hover:text-[#7d3fb8]"
              }`}
            >
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
            <Button
              variant={isActive("/") ? "secondary" : "ghost"}
              className={`w-full justify-start ${
                isActive("/") ? "bg-[#663399]/20 text-[#663399] hover:bg-[#663399]/30" : "text-gray-400 hover:text-[#7d3fb8]"
              }`}
            >
              <Home className="w-5 h-5 mr-3" />
              Home
            </Button>
          </Link>
          <Link href="/discover">
            <Button
              variant={isActive("/discover") ? "secondary" : "ghost"}
              className={`w-full justify-start ${
                isActive("/discover") ? "bg-[#663399]/20 text-[#663399] hover:bg-[#663399]/30" : "text-gray-400 hover:text-[#7d3fb8]"
              }`}
            >
              <Compass className="w-5 h-5 mr-3" />
              Discover
            </Button>
          </Link>
          {user?.role === "admin" && (
            <Link href="/admin">
              <Button
                variant={isActive("/admin") ? "secondary" : "ghost"}
                className={`w-full justify-start ${
                  isActive("/admin") ? "bg-[#663399]/20 text-[#663399] hover:bg-[#663399]/30" : "text-gray-400 hover:text-[#7d3fb8]"
                }`}
              >
                <BarChart3 className="w-5 h-5 mr-3" />
                Admin Dashboard
              </Button>
            </Link>
          )}
          <Link href="/settings">
            <Button
              variant={isActive("/settings") ? "secondary" : "ghost"}
              className={`w-full justify-start ${
                isActive("/settings") ? "bg-[#663399]/20 text-[#663399] hover:bg-[#663399]/30" : "text-gray-400 hover:text-[#7d3fb8]"
              }`}
            >
              <Settings className="w-5 h-5 mr-3" />
              Settings
            </Button>
          </Link>
        </div>

        {/* Trending Creators */}
        <div className="p-4 mt-8">
          <h3 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider">
            Trending Creators
          </h3>
          <div className="space-y-3">
            {[
              { name: "Sarah Kim", followers: "1.2M", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop" },
              { name: "Marcus Lee", followers: "890K", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop" },
              { name: "Nina Patel", followers: "650K", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop" },
            ].map((creator, idx) => (
              <Link key={idx} href={`/profile/${idx + 2}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800 transition-colors">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={creator.avatar} />
                  <AvatarFallback>{creator.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{creator.name}</p>
                  <p className="text-xs text-zinc-400">{creator.followers} followers</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}