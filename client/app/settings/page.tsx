"use client";

import { useEffect, useState } from "react";
import { Bell, Lock, User as UserIcon, Shield, CheckCircle2, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const API = "http://localhost:5000/api/v1";

function authHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function StatusMsg({ msg }: { msg: { text: string; ok: boolean } | null }) {
  if (!msg) return null;
  return (
    <div className={`flex items-center gap-2 p-3 rounded-md text-sm ${msg.ok ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border border-red-500/20 text-red-400"}`}>
      {msg.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
      {msg.text}
    </div>
  );
}

export default function Settings() {
  // User data
  const [user, setUser] = useState<any>(null);

  // Profile tab
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [profileMsg, setProfileMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Account tab
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Notifications tab
  const [prefs, setPrefs] = useState({
    inApp: { followers: true, comments: true, likes: true, tips: true },
    email: { followers: true, comments: false, likes: false, tips: true },
  });
  const [notifMsg, setNotifMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [notifLoading, setNotifLoading] = useState(false);

  useEffect(() => {
    async function loadMe() {
      try {
        const res = await fetch(`${API}/users/me`, { headers: authHeaders() });
        if (!res.ok) return;
        const data = await res.json();
        const u = data.data.user;
        setUser(u);
        setName(u.name ?? "");
        setBio(u.bio ?? "");
        if (u.preferences) setPrefs(u.preferences);
      } catch {
        // silently fail
      }
    }
    loadMe();
  }, []);

  const saveProfile = async () => {
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      const res = await fetch(`${API}/users/updateMe`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ name: name.trim() || undefined, bio: bio.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save.");
      setUser(data.data.user);
      setProfileMsg({ text: "Profile updated successfully.", ok: true });
    } catch (err: any) {
      setProfileMsg({ text: err.message, ok: false });
    } finally {
      setProfileLoading(false);
    }
  };

  const changePassword = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: "New passwords do not match.", ok: false });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMsg({ text: "New password must be at least 8 characters.", ok: false });
      return;
    }
    setPasswordLoading(true);
    setPasswordMsg(null);
    try {
      const res = await fetch(`${API}/auth/change-password`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to change password.");
      setPasswordMsg({ text: "Password changed successfully.", ok: true });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordMsg({ text: err.message, ok: false });
    } finally {
      setPasswordLoading(false);
    }
  };

  const saveNotifications = async () => {
    setNotifLoading(true);
    setNotifMsg(null);
    try {
      const res = await fetch(`${API}/users/me/preferences`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify(prefs),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save preferences.");
      setNotifMsg({ text: "Notification preferences saved.", ok: true });
    } catch (err: any) {
      setNotifMsg({ text: err.message, ok: false });
    } finally {
      setNotifLoading(false);
    }
  };

  const togglePref = (group: "inApp" | "email", key: string) => {
    setPrefs((prev) => ({
      ...prev,
      [group]: { ...prev[group], [key]: !prev[group][key as keyof typeof prev.inApp] },
    }));
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-zinc-400">Manage your account settings and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-zinc-900 border border-zinc-800">
            <TabsTrigger value="profile">
              <UserIcon className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="account">
              <Shield className="w-4 h-4 mr-2" />
              Account
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
          </TabsList>

          {/* Profile */}
          <TabsContent value="profile">
            <Card className="p-6 bg-zinc-900 border-zinc-800">
              <h3 className="text-xl font-bold text-white mb-6">Profile Information</h3>
              <div className="space-y-6">
                <div>
                  <Label className="text-zinc-300">Username</Label>
                  <Input
                    value={user?.username ?? ""}
                    disabled
                    className="mt-1.5 bg-zinc-800 border-zinc-700 text-zinc-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-zinc-500 mt-1">Username cannot be changed.</p>
                </div>

                <div>
                  <Label htmlFor="name" className="text-zinc-300">Display Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={80}
                    placeholder="Your display name"
                    className="mt-1.5 bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="bio" className="text-zinc-300">Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={240}
                    rows={4}
                    placeholder="Tell people about yourself..."
                    className="mt-1.5 bg-zinc-800 border-zinc-700 text-white resize-none"
                  />
                  <p className="text-xs text-zinc-500 mt-1">{bio.length}/240</p>
                </div>

                <StatusMsg msg={profileMsg} />

                <Button
                  className="bg-violet-600 hover:bg-violet-700"
                  onClick={saveProfile}
                  disabled={profileLoading}
                >
                  {profileLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Account */}
          <TabsContent value="account">
            <div className="space-y-6">
              <Card className="p-6 bg-zinc-900 border-zinc-800">
                <h3 className="text-xl font-bold text-white mb-6">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="current-password" className="text-zinc-300">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="mt-1.5 bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                  <Separator className="bg-zinc-800" />
                  <div>
                    <Label htmlFor="new-password" className="text-zinc-300">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      className="mt-1.5 bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirm-password" className="text-zinc-300">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="mt-1.5 bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>

                  <StatusMsg msg={passwordMsg} />

                  <Button
                    className="bg-violet-600 hover:bg-violet-700"
                    onClick={changePassword}
                    disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
                  >
                    {passwordLoading ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </Card>

              <Card className="p-6 bg-zinc-900 border-zinc-800">
                <h3 className="text-xl font-bold text-white mb-4">Account Status</h3>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-white font-medium">Status</p>
                    <p className="text-sm text-zinc-400">Your account is currently active</p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-500 text-sm font-medium capitalize">
                    {user?.accountStatus ?? "active"}
                  </div>
                </div>
                <Separator className="bg-zinc-800 my-4" />
                <div>
                  <p className="text-white font-medium mb-2">Role</p>
                  <div className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-500 text-sm font-medium inline-block capitalize">
                    {user?.role ?? "user"}
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <Card className="p-6 bg-zinc-900 border-zinc-800">
              <h3 className="text-xl font-bold text-white mb-6">Notification Preferences</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">In-App</h4>
                  <div className="space-y-4">
                    {(["followers", "comments", "likes", "tips"] as const).map((key) => (
                      <div key={key} className="flex items-center justify-between py-2">
                        <div>
                          <p className="text-white font-medium capitalize">{key}</p>
                          <p className="text-sm text-zinc-400">Get notified about new {key}</p>
                        </div>
                        <Switch
                          checked={prefs.inApp[key]}
                          onCheckedChange={() => togglePref("inApp", key)}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="bg-zinc-800" />

                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Email</h4>
                  <div className="space-y-4">
                    {(["followers", "comments", "likes", "tips"] as const).map((key) => (
                      <div key={key} className="flex items-center justify-between py-2">
                        <div>
                          <p className="text-white font-medium capitalize">{key}</p>
                          <p className="text-sm text-zinc-400">Receive email for new {key}</p>
                        </div>
                        <Switch
                          checked={prefs.email[key]}
                          onCheckedChange={() => togglePref("email", key)}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <StatusMsg msg={notifMsg} />

                <Button
                  className="bg-violet-600 hover:bg-violet-700"
                  onClick={saveNotifications}
                  disabled={notifLoading}
                >
                  {notifLoading ? "Saving..." : "Save Preferences"}
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
