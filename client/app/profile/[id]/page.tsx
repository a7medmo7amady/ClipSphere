"use client";

import { useState, use } from "react";
import { Settings, MapPin, Calendar, Link as LinkIcon, Play, Heart, Eye, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [isFollowing, setIsFollowing] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Mock user data
  const user = {
    id: id,
    name: "Alex Chen",
    username: "@alexchen",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1557683316-973673baf926?w=2000&h=600&fit=crop",
    bio: "Creative filmmaker & content creator. Sharing my journey through visual storytelling. 📹✨",
    location: "San Francisco, CA",
    website: "alexchen.com",
    joinedDate: "January 2025",
    stats: {
      videos: 342,
      followers: 125400,
      following: 234,
      totalViews: 2450000,
      totalLikes: 189000,
    },
  };

  const videos = [
    { id: "1", title: "City Lights", thumbnail: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=1200&fit=crop", views: 234000, likes: 18900, duration: "5:00" },
    { id: "2", title: "Mountain Adventure", thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=1200&fit=crop", views: 156000, likes: 12400, duration: "4:32" },
    { id: "3", title: "Studio Setup Tour", thumbnail: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&h=1200&fit=crop", views: 98000, likes: 7200, duration: "3:45" },
    { id: "4", title: "Street Photography", thumbnail: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&h=1200&fit=crop", views: 145000, likes: 11200, duration: "4:12" },
    { id: "5", title: "Morning Routine", thumbnail: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=1200&fit=crop", views: 87000, likes: 6100, duration: "3:28" },
    { id: "6", title: "Cooking Pasta", thumbnail: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&h=1200&fit=crop", views: 123000, likes: 9800, duration: "4:58" },
  ];

  return (
    <div className="min-h-screen">
      {/* Cover Image */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img
          src={user.coverImage}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-zinc-950" />
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-20 relative z-10">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <Avatar className="w-32 h-32 md:w-40 md:h-40 ring-4 ring-zinc-950">
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="text-3xl">{user.name[0]}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">{user.name}</h1>
                <p className="text-lg text-zinc-400">{user.username}</p>
              </div>
              <div className="flex gap-3">
                <Button
                  size="lg"
                  className={isFollowing ? "bg-zinc-800 hover:bg-zinc-700 text-white" : "bg-violet-600 hover:bg-violet-700"}
                  onClick={() => setIsFollowing(!isFollowing)}
                >
                  {isFollowing ? "Following" : "Follow"}
                </Button>
                <Link href="/settings">
                  <Button size="lg" variant="outline" className="border-zinc-700 text-zinc-400 hover:text-white">
                    <Settings className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>

            <p className="text-zinc-300 mb-4 max-w-2xl">{user.bio}</p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {user.location}
              </div>
              <div className="flex items-center gap-1">
                <LinkIcon className="w-4 h-4" />
                <a href={`https://${user.website}`} className="text-violet-400 hover:underline">
                  {user.website}
                </a>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Joined {user.joinedDate}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="p-4 bg-zinc-900 border-zinc-800 text-center">
            <p className="text-2xl font-bold text-white mb-1">{user.stats.videos}</p>
            <p className="text-sm text-zinc-400">Videos</p>
          </Card>
          <Card className="p-4 bg-zinc-900 border-zinc-800 text-center">
            <p className="text-2xl font-bold text-white mb-1">{(user.stats.followers / 1000).toFixed(1)}K</p>
            <p className="text-sm text-zinc-400">Followers</p>
          </Card>
          <Card className="p-4 bg-zinc-900 border-zinc-800 text-center">
            <p className="text-2xl font-bold text-white mb-1">{user.stats.following}</p>
            <p className="text-sm text-zinc-400">Following</p>
          </Card>
          <Card className="p-4 bg-zinc-900 border-zinc-800 text-center">
            <p className="text-2xl font-bold text-white mb-1">{(user.stats.totalViews / 1000000).toFixed(1)}M</p>
            <p className="text-sm text-zinc-400">Total Views</p>
          </Card>
          <Card className="p-4 bg-zinc-900 border-zinc-800 text-center">
            <p className="text-2xl font-bold text-white mb-1">{(user.stats.totalLikes / 1000).toFixed(0)}K</p>
            <p className="text-sm text-zinc-400">Total Likes</p>
          </Card>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="videos" className="space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800">
            <TabsList className="bg-transparent border-0">
              <TabsTrigger value="videos" className="data-[state=active]:border-b-2 data-[state=active]:border-violet-500 rounded-none">
                Videos
              </TabsTrigger>
              <TabsTrigger value="liked" className="data-[state=active]:border-b-2 data-[state=active]:border-violet-500 rounded-none">
                Liked
              </TabsTrigger>
              <TabsTrigger value="about" className="data-[state=active]:border-b-2 data-[state=active]:border-violet-500 rounded-none">
                About
              </TabsTrigger>
            </TabsList>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "bg-violet-600/20 text-violet-500" : "text-zinc-400"}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={viewMode === "list" ? "secondary" : "ghost"}
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-violet-600/20 text-violet-500" : "text-zinc-400"}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <TabsContent value="videos" className="mt-6">
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video) => (
                  <Link key={video.id} href={`/video/${video.id}`}>
                    <Card className="group overflow-hidden bg-zinc-900 border-zinc-800 hover:border-violet-500/50 transition-all">
                      <div className="relative aspect-9/16 rounded-xl overflow-hidden mb-3 group">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-zinc-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-16 h-16 rounded-full bg-violet-600/90 backdrop-blur-sm flex items-center justify-center">
                            <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
                          </div>
                        </div>
                        <Badge className="absolute top-3 right-3 bg-zinc-950/90 text-white border-0">
                          {video.duration}
                        </Badge>
                        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-3 text-white text-sm">
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {(video.views / 1000).toFixed(0)}K
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            {(video.likes / 1000).toFixed(1)}K
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-white line-clamp-2">{video.title}</h3>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {videos.map((video) => (
                  <Link key={video.id} href={`/video/${video.id}`}>
                    <Card className="p-4 bg-zinc-900 border-zinc-800 hover:border-violet-500/50 transition-all">
                      <div className="flex gap-4">
                        <div className="relative w-48 h-32 shrink-0 rounded-lg overflow-hidden">
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                          <Badge className="absolute bottom-2 right-2 bg-zinc-950/90 text-white border-0">
                            {video.duration}
                          </Badge>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-2">{video.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-zinc-400">
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {video.views.toLocaleString()} views
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="w-4 h-4" />
                              {video.likes.toLocaleString()} likes
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="liked">
            <p className="text-center text-zinc-400 py-12">No liked videos yet</p>
          </TabsContent>

          <TabsContent value="about">
            <Card className="p-6 bg-zinc-900 border-zinc-800">
              <h3 className="text-xl font-bold text-white mb-4">About</h3>
              <div className="space-y-4 text-zinc-300">
                <p>{user.bio}</p>
                <div className="pt-4 border-t border-zinc-800">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-zinc-400 mb-1">Location</p>
                      <p className="text-white">{user.location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400 mb-1">Website</p>
                      <a href={`https://${user.website}`} className="text-violet-400 hover:underline">
                        {user.website}
                      </a>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400 mb-1">Joined</p>
                      <p className="text-white">{user.joinedDate}</p>
                    </div>
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
