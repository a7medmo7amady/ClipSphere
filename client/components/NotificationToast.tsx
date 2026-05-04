"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSocket } from "@/contexts/SocketContext";
import { Heart, X, Star, UserPlus } from "lucide-react";

interface LikeNotification {
  likerName?: string;
  videoTitle?: string;
  message?: string;
  type?: "like" | "review" | "follow";
  id: number;
}

export function NotificationToast() {
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState<LikeNotification[]>([]);

  useEffect(() => {
    if (!socket) return;

    const handleToast = (data: any) => {
      const id = Date.now();
      setNotifications((prev) => [...prev, { ...data, id }]);
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 6000);
    };

    socket.on("toast-notification", handleToast);
    socket.on("new-like", handleToast);
    socket.on("notification", handleToast);

    return () => {
      socket.off("toast-notification", handleToast);
      socket.off("new-like", handleToast);
      socket.off("notification", handleToast);
    };
  }, [socket]);

  return (
    <div className="fixed top-6 right-6 z-[999] flex flex-col gap-4 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map((n) => {
          const isLike = n.type === "like" || !n.type;
          const isReview = n.type === "review";
          const isFollow = n.type === "follow";

          return (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 100, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, x: 20, transition: { duration: 0.2 } }}
              layout
              className="pointer-events-auto bg-zinc-900/95 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-2xl p-4 flex items-center gap-4 min-w-[340px] backdrop-blur-2xl ring-1 ring-white/20"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                isLike ? "bg-rose-500/20 border-rose-500/30" : 
                isReview ? "bg-amber-500/20 border-amber-500/30" : 
                "bg-violet-500/20 border-violet-500/30"
              }`}>
                {isLike && <Heart className="w-6 h-6 text-rose-400 fill-rose-400" />}
                {isReview && <Star className="w-6 h-6 text-amber-400 fill-amber-400" />}
                {isFollow && <UserPlus className="w-6 h-6 text-violet-400 fill-violet-400" />}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-white">
                    {n.likerName || "Someone"}
                  </p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium border ${
                    isLike ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                    isReview ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                    "bg-violet-500/10 text-violet-400 border-violet-500/20"
                  }`}>
                    {isLike ? "NEW LIKE" : isReview ? "NEW REVIEW" : "NEW FOLLOWER"}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 truncate mt-0.5">
                  {n.message || (isLike ? `liked your video "${n.videoTitle}"` : "interacted with you")}
                </p>
              </div>
              <button 
                onClick={() => setNotifications((prev) => prev.filter((item) => item.id !== n.id))}
                className="p-1.5 rounded-xl text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
