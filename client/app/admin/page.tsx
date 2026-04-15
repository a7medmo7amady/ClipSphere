"use client";

import { Users, Video, DollarSign, TrendingUp, AlertTriangle, Clock, Eye, Star, Bell, UserPlus, UserMinus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AdminDashboard() {
  // Mock system stats from GET /api/v1/admin/stats
  const systemStats = {
    totalUsers: 254789,
    totalVideos: 1234567,
    totalTips: 892450,
    activeUsers: 45823,
  };

  // Mock most active users
  const topUsers = [
    { name: "Sarah Kim", videos: 342, views: "2.4M", tips: "$12,450", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop" },
    { name: "Marcus Lee", videos: 289, views: "1.8M", tips: "$9,230", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop" },
    { name: "Nina Patel", videos: 256, views: "1.6M", tips: "$8,120", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop" },
    { name: "Alex Chen", videos: 234, views: "1.4M", tips: "$7,890", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop" },
  ];

  // Mock flagged content from GET /api/v1/admin/moderation
  const flaggedVideos = [
    { id: "1", title: "Controversial Content Warning", creator: "User123", reports: 12, rating: 2.1, status: "pending" },
    { id: "2", title: "Spam Video Detected", creator: "SpamBot456", reports: 8, rating: 1.8, status: "pending" },
    { id: "3", title: "Low Quality Upload", creator: "Newbie789", reports: 5, rating: 2.5, status: "reviewing" },
  ];

  // Mock user management data
  const recentUsers = [
    { id: "1", name: "John Doe", email: "john@example.com", role: "user", status: "active", joined: "2026-03-01" },
    { id: "2", name: "Jane Smith", email: "jane@example.com", role: "user", status: "active", joined: "2026-03-02" },
    { id: "3", name: "Mike Wilson", email: "mike@example.com", role: "user", status: "inactive", joined: "2026-02-28" },
  ];

  // Mock following list
  const followingList = [
    { id: "1", name: "Sarah Kim", username: "@sarahk", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop", followers: "1.2M", videos: 342, followedAt: "2026-02-15" },
    { id: "2", name: "Marcus Lee", username: "@marcusl", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop", followers: "890K", videos: 289, followedAt: "2026-02-20" },
    { id: "3", name: "Nina Patel", username: "@ninap", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop", followers: "650K", videos: 256, followedAt: "2026-02-25" },
    { id: "4", name: "James Wilson", username: "@jamesr", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop", followers: "523K", videos: 198, followedAt: "2026-03-01" },
  ];

  // Mock followers list
  const followersList = [
    { id: "1", name: "Emma Davis", username: "@emmad", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop", followers: "234K", videos: 156, followedAt: "2026-02-10" },
    { id: "2", name: "Oliver Brown", username: "@oliverb", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop", followers: "189K", videos: 123, followedAt: "2026-02-18" },
    { id: "3", name: "Sophia Taylor", username: "@sophiat", avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop", followers: "312K", videos: 201, followedAt: "2026-02-22" },
    { id: "4", name: "Liam Johnson", username: "@liamj", avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=400&fit=crop", followers: "445K", videos: 267, followedAt: "2026-02-28" },
    { id: "5", name: "Ava Martinez", username: "@avam", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop", followers: "567K", videos: 298, followedAt: "2026-03-03" },
  ];

  // Mock notifications list
  const notificationsList = [
    { id: "1", type: "follow", user: "Emma Davis", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop", message: "started following you", time: "2 hours ago", read: false },
    { id: "2", type: "like", user: "Oliver Brown", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop", message: "liked your video \"City Lights\"", time: "5 hours ago", read: false },
    { id: "3", type: "comment", user: "Sophia Taylor", avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop", message: "commented on \"Mountain Adventure\"", time: "1 day ago", read: true },
    { id: "4", type: "tip", user: "Liam Johnson", avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=400&fit=crop", message: "sent you a $25 tip", time: "1 day ago", read: true },
    { id: "5", type: "follow", user: "Ava Martinez", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop", message: "started following you", time: "2 days ago", read: true },
    { id: "6", type: "like", user: "Sarah Kim", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop", message: "liked your video \"Studio Tour\"", time: "3 days ago", read: true },
  ];

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-300 mb-2">Admin Dashboard</h1>
          <p className="text-zinc-400">Platform overview and management tools</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-zinc-900 border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#663399]/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-[#663399]" />
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-500 border-0">+12.5%</Badge>
            </div>
            <p className="text-zinc-400 text-sm mb-1">Total Users</p>
            <p className="text-3xl font-bold text-gray-300">{systemStats.totalUsers.toLocaleString()}</p>
          </Card>

          <Card className="p-6 bg-zinc-900 border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#663399]/20 flex items-center justify-center">
                <Video className="w-6 h-6 text-[#663399]" />
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-500 border-0">+8.3%</Badge>
            </div>
            <p className="text-zinc-400 text-sm mb-1">Total Videos</p>
            <p className="text-3xl font-bold text-gray-300">{systemStats.totalVideos.toLocaleString()}</p>
          </Card>

          <Card className="p-6 bg-zinc-900 border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#663399]/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-[#663399]" />
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-500 border-0">+15.7%</Badge>
            </div>
            <p className="text-zinc-400 text-sm mb-1">Tips Processed</p>
            <p className="text-3xl font-bold text-gray-300">${systemStats.totalTips.toLocaleString()}</p>
          </Card>

          <Card className="p-6 bg-zinc-900 border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#663399]/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#663399]" />
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-500 border-0">+22.1%</Badge>
            </div>
            <p className="text-zinc-400 text-sm mb-1">Growth Rate</p>
            <p className="text-3xl font-bold text-gray-300">+34.2%</p>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="bg-zinc-900 border border-zinc-800">
            <TabsTrigger value="analytics" className="data-[state=active]:bg-[#663399]/20 data-[state=active]:text-[#663399]">
              <TrendingUp className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="moderation" className="data-[state=active]:bg-[#663399]/20 data-[state=active]:text-[#663399]">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Moderation
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-[#663399]/20 data-[state=active]:text-[#663399]">
              <Users className="w-4 h-4 mr-2" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="following" className="data-[state=active]:bg-[#663399]/20 data-[state=active]:text-[#663399]">
              <UserPlus className="w-4 h-4 mr-2" />
              Following
            </TabsTrigger>
            <TabsTrigger value="followers" className="data-[state=active]:bg-[#663399]/20 data-[state=active]:text-[#663399]">
              <UserMinus className="w-4 h-4 mr-2" />
              Followers
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-[#663399]/20 data-[state=active]:text-[#663399]">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card className="p-6 bg-zinc-900 border-zinc-800">
              <h3 className="text-xl font-bold text-gray-300 mb-6">Most Active Creators This Week</h3>
              <div className="space-y-4">
                {topUsers.map((user, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors">
                    <div className="text-2xl font-bold text-zinc-600 w-8">#{idx + 1}</div>
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-300">{user.name}</p>
                      <p className="text-sm text-zinc-400">{user.videos} videos</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-300 font-medium flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {user.views}
                      </p>
                      <p className="text-sm text-emerald-500">{user.tips} tips</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Moderation Tab */}
          <TabsContent value="moderation" className="space-y-6">
            <Card className="p-6 bg-zinc-900 border-zinc-800">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-300">Flagged Content Queue</h3>
                <Badge className="bg-red-500/20 text-red-500 border-0">
                  {flaggedVideos.length} items
                </Badge>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800">
                    <TableHead className="text-zinc-400">Video Title</TableHead>
                    <TableHead className="text-zinc-400">Creator</TableHead>
                    <TableHead className="text-zinc-400">Reports</TableHead>
                    <TableHead className="text-zinc-400">Rating</TableHead>
                    <TableHead className="text-zinc-400">Status</TableHead>
                    <TableHead className="text-zinc-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flaggedVideos.map((video) => (
                    <TableRow key={video.id} className="border-zinc-800">
                      <TableCell className="text-gray-300 font-medium">{video.title}</TableCell>
                      <TableCell className="text-zinc-400">{video.creator}</TableCell>
                      <TableCell>
                        <Badge className="bg-red-500/20 text-red-500 border-0">
                          {video.reports} reports
                        </Badge>
                      </TableCell>
                      <TableCell className="text-zinc-400 flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        {video.rating}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-yellow-500/20 text-yellow-500 border-0">
                          {video.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="border-zinc-700 text-gray-400 hover:text-[#7d3fb8]">
                            Review
                          </Button>
                          <Button size="sm" variant="outline" className="border-red-500/50 text-red-500 hover:bg-red-500/10">
                            Remove
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="p-6 bg-zinc-900 border-zinc-800">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-300">Recent Users</h3>
                <Button size="sm" className="bg-[#663399] hover:bg-[#7d3fb8]">
                  Export CSV
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800">
                    <TableHead className="text-zinc-400">Name</TableHead>
                    <TableHead className="text-zinc-400">Email</TableHead>
                    <TableHead className="text-zinc-400">Role</TableHead>
                    <TableHead className="text-zinc-400">Status</TableHead>
                    <TableHead className="text-zinc-400">Joined</TableHead>
                    <TableHead className="text-zinc-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentUsers.map((user) => (
                    <TableRow key={user.id} className="border-zinc-800">
                      <TableCell className="text-gray-300 font-medium">{user.name}</TableCell>
                      <TableCell className="text-zinc-400">{user.email}</TableCell>
                      <TableCell>
                        <Badge className="bg-[#663399]/20 text-[#663399] border-0">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={user.status === "active" ? "bg-emerald-500/20 text-emerald-500 border-0" : "bg-zinc-700 text-zinc-400 border-0"}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-zinc-400 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {user.joined}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="border-zinc-700 text-gray-400 hover:text-[#7d3fb8]">
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" className="border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10">
                            {user.status === "active" ? "Deactivate" : "Activate"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Following Tab */}
          <TabsContent value="following" className="space-y-6">
            <Card className="p-6 bg-zinc-900 border-zinc-800">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-300">Following ({followingList.length})</h3>
                <Button size="sm" variant="outline" className="border-zinc-700 text-gray-400 hover:text-[#7d3fb8]">
                  Manage All
                </Button>
              </div>
              <div className="space-y-4">
                {followingList.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-14 h-14">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-gray-300">{user.name}</p>
                        <p className="text-sm text-zinc-400">{user.username}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                           <span>{user.followers} followers</span>
                           <span>•</span>
                           <span>{user.videos} videos</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-zinc-500">Since {user.followedAt}</span>
                      <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-400 hover:text-red-500 hover:border-red-500/50">
                        Unfollow
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Followers Tab */}
          <TabsContent value="followers" className="space-y-6">
            <Card className="p-6 bg-zinc-900 border-zinc-800">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-300">Followers ({followersList.length})</h3>
                <Button size="sm" variant="outline" className="border-zinc-700 text-gray-400 hover:text-[#7d3fb8]">
                  View All
                </Button>
              </div>
              <div className="space-y-4">
                {followersList.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-14 h-14">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-gray-300">{user.name}</p>
                        <p className="text-sm text-zinc-400">{user.username}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                          <span>{user.followers} followers</span>
                          <span>•</span>
                          <span>{user.videos} videos</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-zinc-500">Followed {user.followedAt}</span>
                      <Button size="sm" className="bg-[#663399] hover:bg-[#7d3fb8]">
                        Follow Back
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="p-6 bg-zinc-900 border-zinc-800">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-300">Notifications</h3>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="border-zinc-700 text-gray-400 hover:text-[#7d3fb8]">
                    Mark All Read
                  </Button>
                  <Button size="sm" variant="outline" className="border-zinc-700 text-gray-400 hover:text-[#7d3fb8]">
                    Clear All
                  </Button>
                </div>
              </div>
              <div className="space-y-3">
                {notificationsList.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                      !notification.read ? "bg-[#663399]/10 border border-[#663399]/20" : "bg-zinc-800/50 hover:bg-zinc-800"
                    }`}
                  >
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={notification.avatar} />
                      <AvatarFallback>{notification.user[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-gray-300">
                        <span className="font-semibold">{notification.user}</span>{" "}
                        <span className="text-zinc-400">{notification.message}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-zinc-500">{notification.time}</span>
                        {!notification.read && (
                          <Badge className="bg-[#663399] text-white border-0 text-xs">New</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {notification.type === "follow" && <UserPlus className="w-5 h-5 text-[#663399]" />}
                      {notification.type === "like" && <Eye className="w-5 h-5 text-red-500" />}
                      {notification.type === "comment" && <Bell className="w-5 h-5 text-blue-500" />}
                      {notification.type === "tip" && <DollarSign className="w-5 h-5 text-emerald-500" />}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
