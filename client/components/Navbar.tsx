"use client";

import Button from "@/components/ui/Button";

const UploadIcon = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

export default function Navbar() {
  return (
    <header className="flex items-center gap-4 px-6 py-3 bg-background border-b border-border">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="flex items-center gap-2 bg-muted rounded-full px-4 py-2 text-sm text-muted-foreground">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Search videos, creators...
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Notifications */}
        <button className="relative w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-accent transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive rounded-full text-[10px] flex items-center justify-center text-destructive-foreground font-bold">
            3
          </span>
        </button>

        {/* Upload */}
        <Button variant="primary" size="md" icon={UploadIcon}>
          Upload
        </Button>

        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-full flex-shrink-0"
          style={{ background: "linear-gradient(135deg, var(--sidebar-primary), var(--sidebar-primary-hover))" }}
        />
      </div>
    </header>
  );
}
