"use client";

import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import Button from "@/components/ui/Button";

const stats = [
  {
    value: "1.2M+",
    label: "Total Videos",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.845v6.31a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    value: "250K+",
    label: "Active Creators",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    value: "50M+",
    label: "Views Today",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    value: "100M hrs",
    label: "Watch Time",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const PlayIcon = (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
);

export default function Home() {
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto">
       
          <div className="relative flex items-center justify-center overflow-hidden" style={{ minHeight: "420px" }}>
            <div className="absolute inset-0 bg-gradient-to-br from-background via-sidebar to-background" />
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--sidebar-primary) 10%, transparent), transparent, color-mix(in srgb, var(--sidebar-primary) 5%, transparent))" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />

            <div className="relative z-10 text-center px-6 py-16">
              <span className="inline-block mb-6 px-4 py-1.5 rounded-full border border-border bg-background/50 backdrop-blur-sm text-sm text-foreground/70">
                Welcome to ClipSphere
              </span>

              <h1 className="text-5xl font-bold tracking-tight text-foreground mb-4 leading-tight">
                Share Your Story in
                <br />
                <span style={{ color: "var(--sidebar-primary)" }}>300 Seconds</span>
              </h1>

              <p className="max-w-lg mx-auto text-foreground/60 text-lg mb-8 leading-relaxed">
                Join the next generation of creators. Upload, share, and monetize your
                short videos with our powerful platform.
              </p>

              <div className="flex items-center justify-center gap-4">
                <Button variant="primary" size="lg" icon={PlayIcon}>
                  Start Watching
                </Button>
                <Button variant="outline" size="lg">
                  Upload Your First Video
                </Button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 p-6">
            {stats.map(({ value, label, icon }) => (
              <div
                key={label}
                className="bg-card border border-border rounded-xl p-6 flex flex-col items-center gap-3"
              >
                <div style={{ color: "var(--sidebar-primary)" }}>{icon}</div>
                <div className="text-2xl font-bold text-foreground">{value}</div>
                <div className="text-sm text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
