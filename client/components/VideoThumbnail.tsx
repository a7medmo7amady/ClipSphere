"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface VideoThumbnailProps {
  videoUrl: string;
  className?: string;
}

export function VideoThumbnail({ videoUrl, className = "" }: VideoThumbnailProps) {
  const [thumbnailData, setThumbnailData] = useState<string | null>(null);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    if (!videoUrl) return;

    let videoSrc = videoUrl;
    if (!videoSrc.startsWith("http")) {
      videoSrc = `http://localhost:9000/clipsphere/${videoUrl}`;
    }

    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.src = videoSrc;
    video.muted = true;
    video.playsInline = true;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const onLoadedData = () => {
     const targetTime = video.duration ? Math.min(1.5, video.duration * 0.25) : 1;
      video.currentTime = targetTime;
    };

    const onSeeked = () => {
      if (!ctx) return;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 360;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      try {
        const dataUrl = canvas.toDataURL("image/jpeg", 0.6);
        setThumbnailData(dataUrl);
      } catch (err) {
        console.error("Canvas export failed", err);
        setError(true);
      }
    };

    const onError = () => {
      setError(true);
    };

    video.addEventListener("loadeddata", onLoadedData);
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("error", onError);
    
    video.load();

    return () => {
      video.removeEventListener("loadeddata", onLoadedData);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
      video.src = "";
    };
  }, [videoUrl]);

  if (error || !thumbnailData) {
    return (
      <div className={`flex items-center justify-center bg-zinc-900 ${className}`}>
        {error ? <span className="text-xs text-zinc-600">Video</span> : <Loader2 className="w-5 h-5 animate-spin text-zinc-600" />}
      </div>
    );
  }

  return (
    <img 
      src={thumbnailData} 
      alt="Video Thumbnail" 
      className={`object-cover w-full h-full ${className}`} 
    />
  );
}
