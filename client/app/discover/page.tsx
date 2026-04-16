"use client";

import { useState, useEffect } from "react";
import { Play, Eye, TrendingUp, Users, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { VideoThumbnail } from "@/components/VideoThumbnail";
import { useAuth } from "@/contexts/AuthContext";

const API = "http://localhost:5000/api/v1";

function formatCount(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return String(n);
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

export default function Discover() {
  const [activeTab, setActiveTab] = useState("trending");
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  function authHeaders(): Record<string, string> {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  useEffect(() => {
    async function load() {
      if (activeTab === "following" && !user) {
        setVideos([]);
        return;
      }

      setLoading(true);
      try {
        let endpoint: string;
        let options: RequestInit = {};

        if (activeTab === "following") {
          endpoint = `${API}/videos/feed/following`;
          options = { headers: authHeaders() };
        } else if (user) {
          endpoint = `${API}/recommendations/feed`;
          options = { headers: authHeaders() };
        } else {
          endpoint = `${API}/recommendations/trending`;
        }

        const res = await fetch(endpoint, options);
        if (!res.ok) return;
        const data = await res.json();
        setVideos(data.data.videos ?? []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [activeTab, user]);

  const sorted = [...videos].sort((a, b) => {
    if (activeTab === "trending") return (b.score ?? b.trendingScore ?? 0) - (a.score ?? a.trendingScore ?? 0);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-16 z-30 bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800 px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-4">Discover</h1>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full md:w-auto bg-zinc-900 border border-zinc-800">
              <TabsTrigger value="trending" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />Trending
              </TabsTrigger>
              <TabsTrigger value="following" className="flex items-center gap-2">
                <Users className="w-4 h-4" />Following
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="px-4 py-6 max-w-7xl mx-auto">
        {activeTab === "following" && !user ? (
          <div className="text-center py-20 text-zinc-400">
            <p className="mb-4">Log in to see videos from users you follow</p>
            <Link href="/auth">
              <Button className="bg-violet-600 hover:bg-violet-700 text-white">Log In</Button>
            </Link>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-20 text-zinc-400">
            {activeTab === "following" ? "You aren't following anyone with videos yet!" : "No videos yet. Be the first to upload!"}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sorted.map((video: any) => {
              const owner = video.owner;
              const ownerName = owner?.name ?? owner?.username ?? "Unknown";
              const ownerAvatar = owner?.avatarKey ? `http://localhost:9000/clipsphere/${owner.avatarKey}` : "";

              return (
                <Card key={video._id} className="group bg-zinc-900 border-zinc-800 overflow-hidden hover:border-violet-500/50 transition-all">
                  <Link href={`/video/${video._id}`}>
                    <div className="relative aspect-video bg-zinc-800 flex items-center justify-center overflow-hidden">
                      {video.videoURL ? <VideoThumbnail videoUrl={video.videoURL} className="absolute inset-0 z-0 opacity-80 group-hover:opacity-100 transition-opacity duration-500" /> : null}
                      <Play className="absolute z-10 w-12 h-12 text-white/40 drop-shadow-lg group-hover:opacity-0 transition-opacity" />
                      <div className="absolute inset-0 z-10 bg-gradient-to-t from-zinc-950/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-14 h-14 rounded-full bg-violet-600/90 backdrop-blur-sm flex items-center justify-center shadow-xl shadow-violet-900/50">
                          <Play className="w-7 h-7 text-white ml-1" fill="currentColor" />
                        </div>
                      </div>
                      <Badge className="absolute z-20 top-2 right-2 bg-zinc-950/90 text-white border-0 text-xs">
                        {formatDuration(video.duration ?? 0)}
                      </Badge>
                      <div className="absolute z-20 bottom-2 left-2 flex items-center gap-2 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="flex items-center gap-1 font-semibold drop-shadow-md"><Eye className="w-3 h-3" />{formatCount(video.viewsCount ?? 0)}</span>
                      </div>
                    </div>
                  </Link>

                  <div className="p-4">
                    <Link href={`/video/${video._id}`}>
                      <h3 className="font-semibold text-white mb-3 line-clamp-2 hover:text-violet-400 transition-colors">
                        {video.title}
                      </h3>
                    </Link>

                    <div className="flex items-center justify-between">
                      <Link href={`/profile/${owner?._id ?? owner?.id}`} className="flex items-center gap-2 flex-1 min-w-0">
                        <Avatar className="w-7 h-7">
                          <AvatarImage src={ownerAvatar} />
                          <AvatarFallback className="text-xs bg-violet-800 text-white">
                            {ownerName[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-zinc-400 hover:text-white transition-colors truncate">
                          {ownerName}
                        </span>
                      </Link>

                      {video.avgRating > 0 && (
                        <div className="flex items-center gap-1 text-sm shrink-0">
                          <span className="text-yellow-500">★</span>
                          <span className="text-white font-medium">{video.avgRating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
