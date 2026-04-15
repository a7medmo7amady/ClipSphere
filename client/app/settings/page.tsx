"use client";

import { Bell, Lock, User as UserIcon, Mail, CreditCard, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Settings() {
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
            <TabsTrigger value="payments">
              <CreditCard className="w-4 h-4 mr-2" />
              Payments
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile">
            <Card className="p-6 bg-zinc-900 border-zinc-800">
              <h3 className="text-xl font-bold text-white mb-6">Profile Information</h3>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="username" className="text-zinc-300">
                    Username
                  </Label>
                  <Input
                    id="username"
                    defaultValue="alexchen"
                    className="mt-1.5 bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="bio" className="text-zinc-300">
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    defaultValue="Creative filmmaker & content creator. Sharing my journey through visual storytelling. 📹✨"
                    rows={4}
                    className="mt-1.5 bg-zinc-800 border-zinc-700 text-white resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="location" className="text-zinc-300">
                      Location
                    </Label>
                    <Input
                      id="location"
                      defaultValue="San Francisco, CA"
                      className="mt-1.5 bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="website" className="text-zinc-300">
                      Website
                    </Label>
                    <Input
                      id="website"
                      defaultValue="alexchen.com"
                      className="mt-1.5 bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="avatar" className="text-zinc-300">
                    Avatar (MinIO Object Key)
                  </Label>
                  <Input
                    id="avatar"
                    placeholder="avatar_abc123.jpg"
                    className="mt-1.5 bg-zinc-800 border-zinc-700 text-white"
                  />
                  <p className="text-xs text-zinc-500 mt-1">
                    Upload your avatar and enter the MinIO object key here
                  </p>
                </div>

                <Button className="bg-violet-600 hover:bg-violet-700">
                  Save Changes
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Account Settings */}
          <TabsContent value="account">
            <div className="space-y-6">
              <Card className="p-6 bg-zinc-900 border-zinc-800">
                <h3 className="text-xl font-bold text-white mb-6">Account Security</h3>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="email" className="text-zinc-300">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue="alex@example.com"
                      className="mt-1.5 bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>

                  <Separator className="bg-zinc-800" />

                  <div>
                    <Label htmlFor="current-password" className="text-zinc-300">
                      Current Password
                    </Label>
                    <Input
                      id="current-password"
                      type="password"
                      placeholder="Enter current password"
                      className="mt-1.5 bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="new-password" className="text-zinc-300">
                      New Password
                    </Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Enter new password"
                      className="mt-1.5 bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirm-password" className="text-zinc-300">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm new password"
                      className="mt-1.5 bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>

                  <Button className="bg-violet-600 hover:bg-violet-700">
                    Update Password
                  </Button>
                </div>
              </Card>

              <Card className="p-6 bg-zinc-900 border-zinc-800">
                <h3 className="text-xl font-bold text-white mb-4">Account Status</h3>
                <div className="flex items-center justify-between py-4">
                  <div>
                    <p className="text-white font-medium">Account Status</p>
                    <p className="text-sm text-zinc-400">Your account is currently active</p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-500 text-sm font-medium">
                    Active
                  </div>
                </div>
                <Separator className="bg-zinc-800 my-4" />
                <div>
                  <p className="text-white font-medium mb-2">Role</p>
                  <div className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-500 text-sm font-medium inline-block">
                    Admin
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card className="p-6 bg-zinc-900 border-zinc-800">
              <h3 className="text-xl font-bold text-white mb-6">Notification Preferences</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">In-App Notifications</h4>
                  <div className="space-y-4">
                    {[
                      { label: "New Followers", description: "Get notified when someone follows you" },
                      { label: "New Comments", description: "Get notified when someone comments on your videos" },
                      { label: "New Likes", description: "Get notified when someone likes your videos" },
                      { label: "New Tips", description: "Get notified when you receive a tip" },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-3">
                        <div>
                          <p className="text-white font-medium">{item.label}</p>
                          <p className="text-sm text-zinc-400">{item.description}</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="bg-zinc-800" />

                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Email Notifications</h4>
                  <div className="space-y-4">
                    {[
                      { label: "New Followers", description: "Receive email when someone follows you" },
                      { label: "New Comments", description: "Receive email for new comments" },
                      { label: "New Likes", description: "Receive email for new likes" },
                      { label: "New Tips", description: "Receive email when you get a tip" },
                      { label: "Weekly Summary", description: "Get a weekly summary of your activity" },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-3">
                        <div>
                          <p className="text-white font-medium">{item.label}</p>
                          <p className="text-sm text-zinc-400">{item.description}</p>
                        </div>
                        <Switch defaultChecked={idx < 2} />
                      </div>
                    ))}
                  </div>
                </div>

                <Button className="bg-violet-600 hover:bg-violet-700">
                  Save Preferences
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Payment Settings */}
          <TabsContent value="payments">
            <div className="space-y-6">
              <Card className="p-6 bg-zinc-900 border-zinc-800">
                <h3 className="text-xl font-bold text-white mb-6">Stripe Integration</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-violet-600/20 flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-violet-500" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Stripe Connected</p>
                        <p className="text-sm text-zinc-400">Account ID: acct_1234567890</p>
                      </div>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-500 text-sm font-medium">
                      Active
                    </div>
                  </div>

                  <Separator className="bg-zinc-800" />

                  <div>
                    <h4 className="text-white font-medium mb-4">Earnings Summary</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-zinc-800 rounded-lg">
                        <p className="text-sm text-zinc-400 mb-1">This Month</p>
                        <p className="text-2xl font-bold text-white">$1,245</p>
                      </div>
                      <div className="p-4 bg-zinc-800 rounded-lg">
                        <p className="text-sm text-zinc-400 mb-1">Pending</p>
                        <p className="text-2xl font-bold text-white">$320</p>
                      </div>
                      <div className="p-4 bg-zinc-800 rounded-lg">
                        <p className="text-sm text-zinc-400 mb-1">Total Earned</p>
                        <p className="text-2xl font-bold text-white">$12,450</p>
                      </div>
                    </div>
                  </div>

                  <Button className="bg-violet-600 hover:bg-violet-700">
                    View Detailed Analytics
                  </Button>
                </div>
              </Card>

              <Card className="p-6 bg-zinc-900 border-zinc-800">
                <h3 className="text-xl font-bold text-white mb-4">Transaction History</h3>
                <div className="space-y-3">
                  {[
                    { date: "2026-03-05", amount: "$25.00", from: "Sarah Kim", type: "Tip" },
                    { date: "2026-03-04", amount: "$10.00", from: "Marcus Lee", type: "Tip" },
                    { date: "2026-03-03", amount: "$50.00", from: "Nina Patel", type: "Tip" },
                  ].map((transaction, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{transaction.type} from {transaction.from}</p>
                        <p className="text-sm text-zinc-400">{transaction.date}</p>
                      </div>
                      <p className="text-emerald-500 font-bold">{transaction.amount}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
