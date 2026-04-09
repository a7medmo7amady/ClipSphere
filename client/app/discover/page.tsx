"use client";

import { useState } from "react";
import { Play, Heart, MessageCircle, Share2, Eye, Clock, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function Discover() {
  const [activeTab, setActiveTab] = useState("trending");

  // Mock video data
  const videos = [
    {
      id: "1",
      title: "Amazing Sunset Timelapse in 4K",
      thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=1200&fit=crop",
      creator: { name: "Sarah Kim", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop", id: "2" },
      views: 125000,
      likes: 8900,
      comments: 432,
      duration: "4:32",
      rating: 4.8,
    },
    {
      id: "2",
      title: "Quick Morning Workout Routine",
      thumbnail: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=1200&fit=crop",
      creator: { name: "Marcus Lee", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop", id: "3" },
      views: 98000,
      likes: 7200,
      comments: 289,
      duration: "3:45",
      rating: 4.6,
    },
    {
      id: "3",
      title: "Cooking the Perfect Pasta Carbonara",
      thumbnail: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&h=1200&fit=crop",
      creator: { name: "Nina Patel", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop", id: "4" },
      views: 156000,
      likes: 12400,
      comments: 876,
      duration: "4:58",
      rating: 4.9,
    },
    {
      id: "4",
      title: "Late Night City Drive - Cyberpunk Vibes",
      thumbnail: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=1200&fit=crop",
      creator: { name: "Alex Chen", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop", id: "1" },
      views: 234000,
      likes: 18900,
      comments: 1203,
      duration: "5:00",
      rating: 4.7,
    },
    {
      id: "5",
      title: "DIY Home Studio Setup Under $500",
      thumbnail: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&h=1200&fit=crop",
      creator: { name: "Sarah Kim", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop", id: "2" },
      views: 87000,
      likes: 6100,
      comments: 398,
      duration: "4:12",
      rating: 4.5,
    },
    {
      id: "6",
      title: "Street Photography Tips for Beginners",
      thumbnail: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&h=1200&fit=crop",
      creator: { name: "Marcus Lee", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop", id: "3" },
      views: 145000,
      likes: 11200,
      comments: 654,
      duration: "3:28",
      rating: 4.8,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-16 md:top-16 z-30 bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800 px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-4">Discover</h1>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full md:w-auto bg-zinc-900 border border-zinc-800">
              <TabsTrigger value="trending" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Trending
              </TabsTrigger>
              <TabsTrigger value="following" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Following
              </TabsTrigger>
              <TabsTrigger value="recent" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Recent
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Video Grid */}
      <div className="px-4 py-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <Card key={video.id} className="group bg-zinc-900 border-zinc-800 overflow-hidden hover:border-violet-500/50 transition-all">
              {/* Thumbnail */}
              <Link href={`/video/${video.id}`} className="relative aspect-9/16 rounded-xl overflow-hidden mb-3 group">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-linear-to-t from-zinc-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 rounded-full bg-violet-600/90 backdrop-blur-sm flex items-center justify-center">
                    <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
                  </div>
                </div>
                {/* Duration Badge */}
                <Badge className="absolute top-3 right-3 bg-zinc-950/90 text-white border-0">
                  {video.duration}
                </Badge>
                {/* Stats Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform">
                  <div className="flex items-center gap-4 text-white text-sm">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {(video.views / 1000).toFixed(0)}K
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      {(video.likes / 1000).toFixed(1)}K
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      {video.comments}
                    </span>
                  </div>
                </div>
              </Link>

              {/* Video Info */}
              <div className="p-4">
                <Link href={`/video/${video.id}`}>
                  <h3 className="font-semibold text-white mb-3 line-clamp-2 hover:text-violet-400 transition-colors">
                    {video.title}
                  </h3>
                </Link>

                {/* Creator Info */}
                <div className="flex items-center justify-between">
                  <Link href={`/profile/${video.creator.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={video.creator.avatar} />
                      <AvatarFallback>{video.creator.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-zinc-400 hover:text-white transition-colors truncate">
                      {video.creator.name}
                    </span>
                  </Link>

                  {/* Rating */}
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-yellow-500">★</span>
                    <span className="text-white font-medium">{video.rating}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 mt-4">
                  <Button size="sm" variant="outline" className="flex-1 border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800">
                    <Heart className="w-4 h-4 mr-1" />
                    Like
                  </Button>
                  <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button size="lg" variant="outline" className="border-zinc-700 text-white hover:bg-zinc-800">
            Load More Videos
          </Button>
        </div>
      </div>
    </div>
  );
}
