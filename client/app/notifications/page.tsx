"use client";

import { useEffect, useState } from "react";
import { Bell, UserPlus, Star, CheckCheck, Loader2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

const API = "http://localhost:5000/api/v1";

function authHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {} as Record<string, string>;
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function NotifIcon({ type }: { type: string }) {
  if (type === "follow") return <UserPlus className="w-4 h-4 text-violet-400" />;
  if (type === "review") return <Star className="w-4 h-4 text-amber-400" />;
  if (type === "like") return <Heart className="w-4 h-4 text-rose-400 fill-rose-400/20" />;
  return <Bell className="w-4 h-4 text-zinc-400" />;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/notifications`, { headers: authHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.data.notifications ?? []);
    } finally {
      setLoading(false);
    }
  }

  async function markOneRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
    await fetch(`${API}/notifications/${id}/read`, {
      method: "PATCH",
      headers: authHeaders(),
    });
  }

  async function markAllRead() {
    setMarkingAll(true);
    await fetch(`${API}/notifications/read-all`, {
      method: "PATCH",
      headers: authHeaders(),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setMarkingAll(false);
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Notifications</h1>
            <p className="text-zinc-400">
              {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800"
              onClick={markAllRead}
              disabled={markingAll}
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              {markingAll ? "Marking..." : "Mark all read"}
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center">
              <Bell className="w-8 h-8 text-zinc-600" />
            </div>
            <p className="text-zinc-400">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notif) => {
              const actor = notif.actor;
              const initials = (actor?.name ?? actor?.username ?? "?")[0]?.toUpperCase();
              return (
                <Link key={notif._id} href={notif.link ?? "#"}>
                  <Card
                    onClick={() => !notif.read && markOneRead(notif._id)}
                    className={`p-4 border-zinc-800 cursor-pointer transition-all hover:border-violet-500/40 ${
                      notif.read ? "bg-zinc-900" : "bg-zinc-800/60 border-violet-500/20"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Actor avatar */}
                      <Avatar className="w-10 h-10 shrink-0">
                        {actor?.avatarKey && (
                          <AvatarImage src={`http://localhost:9000/clipsphere/${actor.avatarKey}`} />
                        )}
                        <AvatarFallback className="bg-violet-800 text-white text-sm">
                          {initials}
                        </AvatarFallback>
                      </Avatar>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white hover:text-violet-400 transition-colors">
                              {actor?.name || actor?.username || "Someone"}
                            </span>
                            <NotifIcon type={notif.type} />
                          </div>
                          <p className="text-zinc-400 text-sm line-clamp-2">
                            {notif.message}
                          </p>
                          <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider font-medium">
                            {timeAgo(notif.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* Unread dot */}
                      {!notif.read && (
                        <div className="w-2 h-2 rounded-full bg-violet-500 shrink-0 mt-1" />
                      )}
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
