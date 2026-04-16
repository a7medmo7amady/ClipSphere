"use client";

import { useState, use, useEffect } from "react";
import { Heart, Share2, Flag, DollarSign, MessageCircle, Send, Star, MoreVertical, Edit, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const API = "http://localhost:5000/api/v1";

export default function VideoPlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  
  const [liked, setLiked] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [reviews, setReviews] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  
  const [shareText, setShareText] = useState("Share");

  function authHeaders(): Record<string, string> {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  }

  useEffect(() => {
    async function fetchAll() {
      try {
        const [videoRes, reviewsRes] = await Promise.all([
          fetch(`${API}/videos/${id}`),
          fetch(`${API}/videos/${id}/reviews`)
        ]);
        
        if (!videoRes.ok) throw new Error("Video not found");
        const videoData = await videoRes.json();
        setVideo(videoData.data.video);
        
        const viewKey = `viewTriggered_${id}`;
        if (!sessionStorage.getItem(viewKey)) {
          fetch(`${API}/videos/${id}/view`, { method: "POST" })
            .then(res => {
              if (res.ok) {
                sessionStorage.setItem(viewKey, "true");
                setVideo((prev: any) => ({ ...prev, viewsCount: (prev.viewsCount || 0) + 1 }));
              }
            })
            .catch(err => console.error("Failed to register view", err));
        }
        
        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          setReviews(reviewsData.data.reviews || []);
        }

        const ownerId = videoData.data.video.owner?._id || videoData.data.video.owner?.id;
        if (ownerId && user) {
          const [followRes, likeRes] = await Promise.all([
            fetch(`${API}/users/${ownerId}/followers`),
            fetch(`${API}/videos/${id}/like/status`, { headers: authHeaders() })
          ]);
          
          if (followRes.ok) {
            const followData = await followRes.json();
            const follows = followData.data.followers.some((f: any) => f._id === user.id || f.id === user.id);
            setIsFollowing(follows);
          }
          if (likeRes.ok) {
            const likeData = await likeRes.json();
            setLiked(likeData.data.hasLiked);
          }
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, [id, user]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareText("Copied!");
      setTimeout(() => setShareText("Share"), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLike = async () => {
    if (!user) return alert("Please log in to like this video");

    // Optimistically update
    setLiked(!liked);
    setVideo((prev: any) => ({
      ...prev,
      likesCount: (prev.likesCount || 0) + (liked ? -1 : 1)
    }));

    try {
      const method = liked ? "DELETE" : "POST";
      const res = await fetch(`${API}/videos/${id}/like`, { method, headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to process like");
    } catch (err) {
      console.error(err);
      // Revert if API call fails
      setLiked(liked);
      setVideo((prev: any) => ({
        ...prev,
        likesCount: (prev.likesCount || 0) + (liked ? 1 : -1)
      }));
    }
  };

  const handleFollow = async () => {
    if (!user) return alert("Please log in to follow");
    const ownerId = video?.owner?._id || video?.owner?.id;
    if (!ownerId || ownerId === user.id) return;
    
    setFollowLoading(true);
    try {
      const method = isFollowing ? "DELETE" : "POST";
      const endpoint = isFollowing ? `${API}/users/${ownerId}/unfollow` : `${API}/users/${ownerId}/follow`;
      const res = await fetch(endpoint, { method, headers: authHeaders() });
      if (res.ok) {
        setIsFollowing(!isFollowing);
      }
    } finally {
      setFollowLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!user) return alert("Please log in to leave a review");
    if (rating === 0) return setReviewError("Please select a rating");
    if (!comment.trim()) return setReviewError("Please enter a comment");
    if (comment.trim().length < 10) return setReviewError("Comment must be at least 10 characters long");
    
    setReviewLoading(true);
    setReviewError("");
    
    try {
      const res = await fetch(`${API}/videos/${id}/reviews`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ rating, comment }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to submit review");
      }
      
      const newReview = data.data.review;
      newReview.user = { _id: user.id, username: user.username, name: user.name, avatarKey: user.avatarKey };
      
      setReviews([newReview, ...reviews]);
      setComment("");
      setRating(0);
      
      setVideo((prev: any) => ({
        ...prev,
        reviewsCount: (prev.reviewsCount || 0) + 1
      }));
    } catch (err: any) {
      setReviewError(err.message);
    } finally {
      setReviewLoading(false);
    }
  };

  const relatedVideos = [
    { id: "2", title: "Mountain Sunrise", thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop", views: "98K", duration: "3:45" },
    { id: "3", title: "City Lights", thumbnail: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400&h=600&fit=crop", views: "156K", duration: "4:20" },
    { id: "4", title: "Ocean Waves", thumbnail: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&h=600&fit=crop", views: "234K", duration: "5:00" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-zinc-400">{error || "Video not found"}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            <Card className="overflow-hidden bg-zinc-900 border-zinc-800">
              <div className="relative aspect-video bg-zinc-950 flex items-center justify-center max-h-[80vh]">
                <video
                  src={video.videoURL}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              </div>
            </Card>

            <Card className="p-6 bg-zinc-900 border-zinc-800">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-white mb-2">{video.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-zinc-400">
                    <span>{video.viewsCount?.toLocaleString() || 0} views</span>
                    <span>•</span>
                    <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-white">{video.avgRating?.toFixed(1) || 0}</span>
                      <span>({video.reviewsCount || 0})</span>
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
                  onClick={handleLike}
                >
                  <Heart className={`w-5 h-5 mr-2 ${liked ? "fill-current" : ""}`} />
                  {liked ? "Liked" : "Like"} ({video.likesCount?.toLocaleString() || 0})
                </Button>
                <Button variant="outline" className="border-zinc-700 text-zinc-400 hover:text-white" onClick={handleShare}>
                  {shareText === "Copied!" ? <Check className="w-5 h-5 mr-2 text-green-400" /> : <Share2 className="w-5 h-5 mr-2" />}
                  {shareText}
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
                <Link href={`/profile/${video.owner?._id || video.owner?.id}`} className="flex items-center gap-4">
                  <Avatar className="w-12 h-12 ring-2 ring-violet-500/20 hover:ring-violet-500/50 transition-all">
                    {video.owner?.avatarKey && (
                      <AvatarImage src={`http://localhost:9000/clipsphere/${video.owner.avatarKey}`} />
                    )}
                    <AvatarFallback className="bg-violet-600">{(video.owner?.name || video.owner?.username || "U")[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-white hover:text-violet-400 transition-colors">
                      {video.owner?.name || video.owner?.username}
                    </p>
                    <p className="text-sm text-zinc-400">@{video.owner?.username}</p>
                  </div>
                </Link>
                <Button 
                  className={isFollowing ? "bg-zinc-700 hover:bg-zinc-600" : "bg-violet-600 hover:bg-violet-700"}
                  onClick={handleFollow}
                  disabled={followLoading || !!(user && user.id === (video.owner?._id || video.owner?.id))}
                >
                  {followLoading ? "..." : isFollowing ? "Following" : "Follow"}
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
              {reviewError && <p className="text-red-500 text-sm mb-4">{reviewError}</p>}
              <Button 
                className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50" 
                disabled={rating === 0 || reviewLoading || !comment.trim()}
                onClick={handleSubmitReview}
              >
                <Send className="w-4 h-4 mr-2" />
                {reviewLoading ? "Submitting..." : "Submit Review"}
              </Button>
            </Card>

            {/* Comments Section */}
            <Card className="p-6 bg-zinc-900 border-zinc-800">
              <h3 className="text-lg font-bold text-white mb-6">
                Comments <Badge className="ml-2 bg-zinc-800">{video.reviewsCount || 0}</Badge>
              </h3>
              <div className="space-y-6">
                {reviews.length === 0 ? (
                  <p className="text-zinc-500">No reviews yet. Be the first to review!</p>
                ) : (
                  reviews.map((review: any) => (
                    <div key={review._id} className="flex gap-4">
                      <Avatar className="w-10 h-10 ring-1 ring-zinc-700">
                        {review.user?.avatarKey && (
                          <AvatarImage src={`http://localhost:9000/clipsphere/${review.user.avatarKey}`} />
                        )}
                        <AvatarFallback className="bg-zinc-800">{(review.user?.name || review.user?.username || "U")[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-white">{review.user?.name || review.user?.username}</span>
                          <span className="text-sm text-zinc-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                          <div className="flex items-center ml-3">
                             <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 mr-1" />
                             <span className="text-xs text-zinc-400">{review.rating}</span>
                          </div>
                        </div>
                        <p className="text-zinc-300 mb-2">{review.comment}</p>
                      </div>
                    </div>
                  ))
                )}
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
