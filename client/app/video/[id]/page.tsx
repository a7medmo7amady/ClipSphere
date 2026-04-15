"use client";

import { useState, use } from "react";
import { Heart, Share2, Flag, DollarSign, MessageCircle, Send, Star, MoreVertical, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function VideoPlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [liked, setLiked] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  // Mock video data
  const video = {
    id: id,
    title: "Amazing Sunset Timelapse in 4K",
    description: "Captured this beautiful sunset over 4 hours. Shot in 4K with my new camera setup. Hope you enjoy!",
    videoUrl: "https://videos.unsplash.com/video/1511379938547-c1f69419868d?w=1920&h=1080",
    thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop",
    creator: {
      id: "2",
      name: "Sarah Kim",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
      followers: 125000,
      isFollowing: false,
    },
    views: 125430,
    likes: 8945,
    duration: "4:32",
    uploadedAt: "2 days ago",
    rating: 4.8,
    totalReviews: 234,
  };

  const comments = [
    { id: "1", user: "Marcus Lee", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop", text: "This is absolutely stunning! What camera did you use?", time: "3 hours ago", likes: 24 },
    { id: "2", user: "Nina Patel", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop", text: "The colors are incredible 🌅", time: "5 hours ago", likes: 18 },
    { id: "3", user: "Alex Chen", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop", text: "Great work! Inspired me to try timelapse photography.", time: "1 day ago", likes: 32 },
  ];

  const relatedVideos = [
    { id: "2", title: "Mountain Sunrise", thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop", views: "98K", duration: "3:45" },
    { id: "3", title: "City Lights", thumbnail: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400&h=600&fit=crop", views: "156K", duration: "4:20" },
    { id: "4", title: "Ocean Waves", thumbnail: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&h=600&fit=crop", views: "234K", duration: "5:00" },
  ];

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <Card className="overflow-hidden bg-zinc-900 border-zinc-800">
              <div className="relative aspect-video bg-zinc-950">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button size="lg" className="w-20 h-20 rounded-full bg-violet-600/90 hover:bg-violet-700">
                    <svg className="w-10 h-10 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </Button>
                </div>
              </div>
            </Card>

            {/* Video Info */}
            <Card className="p-6 bg-zinc-900 border-zinc-800">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-white mb-2">{video.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-zinc-400">
                    <span>{video.views.toLocaleString()} views</span>
                    <span>•</span>
                    <span>{video.uploadedAt}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-white">{video.rating}</span>
                      <span>({video.totalReviews})</span>
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" className="text-zinc-400 hover:text-white">
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-zinc-800 border-zinc-700">
                    <DropdownMenuItem className="text-white hover:bg-zinc-700">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Video
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-500 hover:bg-zinc-700">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Video
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 mb-6">
                <Button
                  variant={liked ? "default" : "outline"}
                  className={liked ? "bg-red-600 hover:bg-red-700" : "border-zinc-700 text-zinc-400 hover:text-white"}
                  onClick={() => setLiked(!liked)}
                >
                  <Heart className={`w-5 h-5 mr-2 ${liked ? "fill-current" : ""}`} />
                  {liked ? "Liked" : "Like"} ({video.likes.toLocaleString()})
                </Button>
                <Button variant="outline" className="border-zinc-700 text-zinc-400 hover:text-white">
                  <Share2 className="w-5 h-5 mr-2" />
                  Share
                </Button>
                <Button variant="outline" className="border-zinc-700 text-zinc-400 hover:text-white">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Send Tip
                </Button>
                <Button variant="ghost" size="icon" className="ml-auto text-zinc-400 hover:text-white">
                  <Flag className="w-5 h-5" />
                </Button>
              </div>

              <Separator className="bg-zinc-800 my-6" />

              {/* Creator Info */}
              <div className="flex items-center justify-between">
                <Link href={`/profile/${video.creator.id}`} className="flex items-center gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={video.creator.avatar} />
                    <AvatarFallback>{video.creator.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-white hover:text-violet-400 transition-colors">
                      {video.creator.name}
                    </p>
                    <p className="text-sm text-zinc-400">
                      {video.creator.followers.toLocaleString()} followers
                    </p>
                  </div>
                </Link>
                <Button className="bg-violet-600 hover:bg-violet-700">
                  {video.creator.isFollowing ? "Following" : "Follow"}
                </Button>
              </div>

              {/* Description */}
              <div className="mt-6">
                <p className="text-zinc-300 leading-relaxed">{video.description}</p>
              </div>
            </Card>

            {/* Rating Section */}
            <Card className="p-6 bg-zinc-900 border-zinc-800">
              <h3 className="text-lg font-bold text-white mb-4">Rate This Video</h3>
              <div className="flex items-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    title={`Rate ${star} stars`}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= rating ? "text-yellow-500 fill-yellow-500" : "text-zinc-600"
                      }`}
                    />
                  </button>
                ))}
                {rating > 0 && <span className="text-white ml-2">({rating} stars)</span>}
              </div>
              <Textarea
                placeholder="Share your thoughts about this video..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white mb-4"
                rows={3}
              />
              <Button className="bg-violet-600 hover:bg-violet-700" disabled={rating === 0}>
                <Send className="w-4 h-4 mr-2" />
                Submit Review
              </Button>
            </Card>

            {/* Comments Section */}
            <Card className="p-6 bg-zinc-900 border-zinc-800">
              <h3 className="text-lg font-bold text-white mb-6">
                Comments <Badge className="ml-2 bg-zinc-800">{comments.length}</Badge>
              </h3>
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-4">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={comment.avatar} />
                      <AvatarFallback>{comment.user[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white">{comment.user}</span>
                        <span className="text-sm text-zinc-500">{comment.time}</span>
                      </div>
                      <p className="text-zinc-300 mb-2">{comment.text}</p>
                      <div className="flex items-center gap-4">
                        <Button size="sm" variant="ghost" className="text-zinc-400 hover:text-white px-0">
                          <Heart className="w-4 h-4 mr-1" />
                          {comment.likes}
                        </Button>
                        <Button size="sm" variant="ghost" className="text-zinc-400 hover:text-white px-0">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar - Related Videos */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Related Videos</h3>
            {relatedVideos.map((relatedVideo) => (
              <Link key={relatedVideo.id} href={`/video/${relatedVideo.id}`}>
                <Card className="overflow-hidden bg-zinc-900 border-zinc-800 hover:border-violet-500/50 transition-all group">
                  <div className="flex gap-3">
                    <div className="relative w-40 h-28 shrink-0">
                      <img
                        src={relatedVideo.thumbnail}
                        alt={relatedVideo.title}
                        className="w-full h-full object-cover"
                      />
                      <Badge className="absolute bottom-2 right-2 bg-zinc-950/90 text-white border-0 text-xs">
                        {relatedVideo.duration}
                      </Badge>
                    </div>
                    <div className="flex-1 p-3 min-w-0">
                      <h4 className="font-medium text-white line-clamp-2 mb-2 group-hover:text-violet-400 transition-colors">
                        {relatedVideo.title}
                      </h4>
                      <p className="text-sm text-zinc-400">{relatedVideo.views} views</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
