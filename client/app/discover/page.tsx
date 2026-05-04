"use client";

import { useState, useEffect } from "react";
import { Play, Eye, TrendingUp, Users, Clock, Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { VideoThumbnail } from "@/components/VideoThumbnail";
import { useAuth } from "@/contexts/AuthContext";
import {VideoCardSkeleton} from "@/components/VideoCardSkeleton"

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <VideoCardSkeleton key={i} />
            ))}
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
                <Card key={video._id} className="group bg-zinc-900 border-zinc-800/50 overflow-hidden hover:border-violet-500/40 transition-all duration-500 hover:shadow-[0_0_30px_rgba(124,58,237,0.1)]">
                  <Link href={`/video/${video._id}`}>
                    <div className="relative aspect-video bg-zinc-800 flex items-center justify-center overflow-hidden">
                      {video.videoURL ? <VideoThumbnail videoUrl={video.videoURL} className="absolute inset-0 z-0 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" /> : null}
                      <Play className="absolute z-10 w-12 h-12 text-white/20 drop-shadow-2xl group-hover:opacity-0 transition-opacity" />
                      
                      {/* Glassmorphism Overlays */}
                      <div className="absolute inset-0 z-10 bg-linear-to-t from-zinc-950/90 via-zinc-950/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                      
                      <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-100">
                        <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl ring-1 ring-white/30">
                          <Play className="w-8 h-8 text-white ml-1 filter drop-shadow-lg" fill="currentColor" />
                        </div>
                      </div>

                      <div className="absolute z-30 top-3 right-3">
                        <Badge className="bg-zinc-950/40 backdrop-blur-md text-white border border-white/10 text-[10px] font-bold px-2 py-0.5">
                          {formatDuration(video.duration ?? 0)}
                        </Badge>
                      </div>

                      <div className="absolute z-30 bottom-3 left-3 right-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold">
                            <Eye className="w-3.5 h-3.5 text-violet-400" />
                            {formatCount(video.viewsCount ?? 0)}
                          </div>
                          {video.avgRating > 0 && (
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold">
                              <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500/20" />
                              {video.avgRating.toFixed(1)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>

                  <div className="p-4 bg-linear-to-b from-zinc-900 to-zinc-950">
                    <Link href={`/video/${video._id}`}>
                      <h3 className="font-bold text-gray-200 mb-4 line-clamp-2 hover:text-violet-400 transition-colors leading-snug min-h-[2.5rem]">
                        {video.title}
                      </h3>
                    </Link>

                    <div className="flex items-center justify-between">
                      <Link href={`/profile/${owner?._id ?? owner?.id}`} className="flex items-center gap-2.5 flex-1 min-w-0 group/author">
                        <div className="relative">
                          <Avatar className="w-8 h-8 ring-1 ring-white/10 group-hover/author:ring-violet-500/50 transition-all">
                            <AvatarImage src={ownerAvatar} />
                            <AvatarFallback className="text-xs bg-violet-600 text-white font-bold">
                              {ownerName[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <span className="text-sm font-medium text-zinc-400 group-hover/author:text-white transition-colors truncate">
                          {ownerName}
                        </span>
                      </Link>
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
