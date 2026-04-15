"use client";

import { useState, use, useEffect } from "react";
import { Settings, MapPin, Calendar, Link as LinkIcon, Play, Heart, Eye, Grid, List, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

const API = "http://localhost:5000/api/v1";

function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("token") : null;
}

function getMyId(): string | null {
  const token = getToken();
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split(".")[1])).id;
  } catch {
    return null;
  }
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function formatCount(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const myId = getMyId();
  const isOwn = id === "1" || myId === id;
  const targetId = id === "1" && myId ? myId : id;

  const [user, setUser] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [userRes, videosRes] = await Promise.all([
          fetch(`${API}/users/${targetId}`),
          fetch(`${API}/users/${targetId}/videos`),
        ]);

        if (!userRes.ok) throw new Error("User not found");
        const userData = await userRes.json();
        setUser(userData.data);

        if (videosRes.ok) {
          const videosData = await videosRes.json();
          setVideos(videosData.data.videos ?? []);
        }

        // Check if current user follows this profile
        if (myId && !isOwn) {
          const followersRes = await fetch(`${API}/users/${targetId}/followers`);
          if (followersRes.ok) {
            const followersData = await followersRes.json();
            const following = followersData.data?.followers?.some((f: any) => f.id === myId || f._id === myId);
            setIsFollowing(!!following);
          }
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleFollow = async () => {
    if (!myId) return;
    setFollowLoading(true);
    try {
      const method = isFollowing ? "DELETE" : "POST";
      const endpoint = isFollowing ? `${API}/users/${targetId}/unfollow` : `${API}/users/${targetId}/follow`;
      const res = await fetch(endpoint, { method, headers: authHeaders() });
      if (res.ok) setIsFollowing(!isFollowing);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-zinc-400">{error || "User not found"}</p>
      </div>
    );
  }

  const joinedDate = new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="min-h-screen">
      {/* Cover */}
      <div className="relative h-48 md:h-64 bg-gradient-to-br from-violet-900 via-zinc-900 to-zinc-950" />

      <div className="max-w-6xl mx-auto px-4 -mt-16 relative z-10">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <Avatar className="w-28 h-28 md:w-36 md:h-36 ring-4 ring-zinc-950">
            {user.avatarKey ? (
              <AvatarImage src={`http://localhost:9000/clipsphere/${user.avatarKey}`} />
            ) : null}
            <AvatarFallback className="text-3xl bg-violet-800 text-white">
              {(user.name ?? user.username)?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">{user.name ?? user.username}</h1>
                <p className="text-lg text-zinc-400">@{user.username}</p>
              </div>
              <div className="flex gap-3">
                {isOwn ? (
                  <Link href="/settings">
                    <Button size="lg" variant="outline" className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800">
                      <Settings className="w-5 h-5 mr-2" />
                      Edit Profile
                    </Button>
                  </Link>
                ) : (
                  myId && (
                    <Button
                      size="lg"
                      className={isFollowing ? "bg-zinc-800 hover:bg-zinc-700 text-white" : "bg-violet-600 hover:bg-violet-700"}
                      onClick={handleFollow}
                      disabled={followLoading}
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </Button>
                  )
                )}
              </div>
            </div>

            {user.bio && <p className="text-zinc-300 mb-4 max-w-2xl">{user.bio}</p>}

            <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Joined {joinedDate}
              </div>
              <div className="flex items-center gap-1">
                <UserCircle className="w-4 h-4" />
                <span className={`capitalize px-2 py-0.5 rounded-full text-xs font-medium ${user.role === "admin" ? "bg-violet-500/20 text-violet-400" : "bg-zinc-800 text-zinc-400"}`}>
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-4 bg-zinc-900 border-zinc-800 text-center">
            <p className="text-2xl font-bold text-white mb-1">{videos.length}</p>
            <p className="text-sm text-zinc-400">Videos</p>
          </Card>
          <Card className="p-4 bg-zinc-900 border-zinc-800 text-center">
            <p className="text-2xl font-bold text-white mb-1">
              {formatCount(videos.reduce((s: number, v: any) => s + (v.viewsCount ?? 0), 0))}
            </p>
            <p className="text-sm text-zinc-400">Total Views</p>
          </Card>
          <Card className="p-4 bg-zinc-900 border-zinc-800 text-center">
            <p className="text-2xl font-bold text-white mb-1">
              {formatCount(videos.reduce((s: number, v: any) => s + (v.avgRating ?? 0), 0))}
            </p>
            <p className="text-sm text-zinc-400">Total Ratings</p>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="videos" className="space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800">
            <TabsList className="bg-transparent border-0">
              <TabsTrigger value="videos" className="data-[state=active]:border-b-2 data-[state=active]:border-violet-500 rounded-none">
                Videos
              </TabsTrigger>
              <TabsTrigger value="about" className="data-[state=active]:border-b-2 data-[state=active]:border-violet-500 rounded-none">
                About
              </TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <Button size="sm" variant={viewMode === "grid" ? "secondary" : "ghost"}
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "bg-violet-600/20 text-violet-500" : "text-zinc-400"}>
                <Grid className="w-4 h-4" />
              </Button>
              <Button size="sm" variant={viewMode === "list" ? "secondary" : "ghost"}
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-violet-600/20 text-violet-500" : "text-zinc-400"}>
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <TabsContent value="videos" className="mt-6">
            {videos.length === 0 ? (
              <p className="text-center text-zinc-400 py-12">No videos yet</p>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video: any) => (
                  <Link key={video._id} href={`/video/${video._id}`}>
                    <Card className="group overflow-hidden bg-zinc-900 border-zinc-800 hover:border-violet-500/50 transition-all">
                      <div className="relative aspect-video bg-zinc-800 flex items-center justify-center">
                        <Play className="w-10 h-10 text-zinc-600 group-hover:text-violet-500 transition-colors" />
                        <Badge className="absolute top-2 right-2 bg-zinc-950/90 text-white border-0">
                          {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, "0")}
                        </Badge>
                        <div className="absolute bottom-2 left-2 right-2 flex items-center gap-3 text-white text-xs">
                          <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{formatCount(video.viewsCount ?? 0)}</span>
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold text-white text-sm line-clamp-2">{video.title}</h3>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {videos.map((video: any) => (
                  <Link key={video._id} href={`/video/${video._id}`}>
                    <Card className="p-4 bg-zinc-900 border-zinc-800 hover:border-violet-500/50 transition-all">
                      <div className="flex gap-4">
                        <div className="w-40 h-24 shrink-0 rounded-lg bg-zinc-800 flex items-center justify-center">
                          <Play className="w-8 h-8 text-zinc-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-semibold mb-2">{video.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-zinc-400">
                            <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{formatCount(video.viewsCount ?? 0)} views</span>
                            <span className="flex items-center gap-1"><Heart className="w-4 h-4" />{video.avgRating?.toFixed(1) ?? "0"} rating</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="about">
            <Card className="p-6 bg-zinc-900 border-zinc-800">
              <h3 className="text-xl font-bold text-white mb-4">About</h3>
              <div className="space-y-4 text-zinc-300">
                <p>{user.bio || "No bio yet."}</p>
                <div className="pt-4 border-t border-zinc-800 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-zinc-400 mb-1">Username</p>
                    <p className="text-white">@{user.username}</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400 mb-1">Joined</p>
                    <p className="text-white">{joinedDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400 mb-1">Role</p>
                    <p className="text-white capitalize">{user.role}</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400 mb-1">Status</p>
                    <p className="text-white capitalize">{user.accountStatus}</p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
