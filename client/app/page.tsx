"use client";

import { Play, TrendingUp, Users, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  const stats = [
    { icon: Video, label: "Total Videos", value: "1.2M+", color: "text-[#663399]" },
    { icon: Users, label: "Active Creators", value: "250K+", color: "text-[#7d3fb8]" },
    { icon: TrendingUp, label: "Views Today", value: "50M+", color: "text-cyan-500" },
    { icon: Play, label: "Watch Time", value: "100M hrs", color: "text-emerald-500" },
  ];

  const featuredCategories = [
    { name: "Gaming", count: "250K videos", image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&h=500&fit=crop" },
    { name: "Music", count: "180K videos", image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=500&fit=crop" },
    { name: "Education", count: "120K videos", image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=500&fit=crop" },
    { name: "Comedy", count: "300K videos", image: "https://images.unsplash.com/photo-1527224538127-2104bb45c51b?w=800&h=500&fit=crop" },
  ];

  return (
    <div className="min-h-screen">
      <div>
        {/* Hero Section */}
        <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-b from-zinc-950/20 via-zinc-950/50 to-zinc-950 z-10" />
          <img 
            src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1920&h=1080&fit=crop" 
            alt="Hero"
            className="absolute inset-0 w-full h-full object-cover scale-105 animate-pulse-slow"
          />

          {/* Hero Content */}
          <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
            <div className="mb-6 inline-block">
              <span className="px-4 py-2 rounded-full bg-[#663399]/20 text-[#663399] text-sm font-medium border border-[#663399]/30">
                Welcome to ClipSphere
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-300 mb-6 leading-tight">
              Share Your Story in
              <span className="block bg-linear-to-r from-[#663399] via-[#7d3fb8] to-[#9b59d6] bg-clip-text text-transparent">
                300 Seconds
              </span>
            </h1>
            <p className="text-lg md:text-xl text-zinc-300 mb-8 max-w-2xl mx-auto">
              Join the next generation of creators. Upload, share, and monetize your short videos with our powerful platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/discover">
                <Button size="lg" className="bg-[#663399] hover:bg-[#7d3fb8] text-white px-8">
                  <Play className="w-5 h-5 mr-2" />
                  Start Watching
                </Button>
              </Link>
              <Link href="/upload">
                <Button size="lg" variant="outline" className="border-zinc-700 text-gray-300 hover:bg-zinc-800 hover:text-[#7d3fb8] px-8">
                  Upload Your First Video
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 px-4 max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, idx) => (
              <Card key={idx} className="p-6 bg-zinc-900 border-zinc-800">
                <div className="flex flex-col items-center text-center">
                  <stat.icon className={`w-8 h-8 mb-3 ${stat.color}`} />
                  <p className="text-2xl md:text-3xl font-bold text-gray-300 mb-1">{stat.value}</p>
                  <p className="text-sm text-zinc-400">{stat.label}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Featured Categories */}
        <section className="py-16 px-4 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Explore Categories</h2>
              <p className="text-zinc-400 text-sm">Discover content tailored to your interests</p>
            </div>
            <Link href="/discover">
              <Button variant="outline" className="border-zinc-800 text-zinc-400 hover:text-violet-400 hover:border-violet-500/50 transition-all">
                View All Categories
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCategories.map((category, idx) => (
              <Link key={idx} href="/discover" className="group relative h-72 rounded-3xl overflow-hidden border border-white/5 hover:border-violet-500/30 transition-all duration-500 shadow-2xl">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-zinc-950/20 to-transparent z-10" />
                
                {/* Glassmorphism Badge */}
                <div className="absolute bottom-4 left-4 right-4 p-5 z-20 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-violet-400 transition-colors">{category.name}</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-zinc-400 font-medium">{category.count}</p>
                    <div className="w-8 h-8 rounded-full bg-violet-600/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-3 h-3 text-violet-400 fill-violet-400" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 max-w-7xl mx-auto border-t border-zinc-900">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Elevate Your Content</h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Powerful tools designed for modern creators. Scale your audience and monetize your passion with ease.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Real-Time Engagement",
                description: "Instant notifications, live interactions, and Socket.io powered real-time updates.",
                icon: "🚀",
                gradient: "from-violet-600/10 to-transparent"
              },
              {
                title: "Monetization Built-In",
                description: "Accept tips from fans with Stripe integration. Turn your passion into profit.",
                icon: "💰",
                gradient: "from-fuchsia-600/10 to-transparent"
              },
              {
                title: "Advanced Analytics",
                description: "Track views, engagement, and revenue with detailed creator dashboards.",
                icon: "📊",
                gradient: "from-cyan-600/10 to-transparent"
              },
            ].map((feature, idx) => (
              <div key={idx} className={`group p-10 rounded-3xl bg-linear-to-br ${feature.gradient} border border-white/5 hover:border-violet-500/30 transition-all duration-500 text-center relative overflow-hidden`}>
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <div className="text-9xl">{feature.icon}</div>
                </div>
                <div className="relative z-10">
                  <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-500 inline-block">{feature.icon}</div>
                  <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-zinc-400 leading-relaxed text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 max-w-7xl mx-auto mb-12">
          <Card className="p-12 bg-gradient-to-r from-[#663399] to-[#7d3fb8] border-0 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Start Creating?
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of creators already sharing their stories on ClipSphere
            </p>
            <Link href="/auth">
              <Button size="lg" className="bg-white text-[#663399] hover:bg-zinc-100 px-8">
                Sign Up Free
              </Button>
            </Link>
          </Card>
        </section>
      </div>
    </div>
  );
}
