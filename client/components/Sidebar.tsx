"use client";

const navItems = [
  {
    label: "Home",
    active: true,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: "Discover",
    active: false,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    label: "Admin Dashboard",
    active: false,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    label: "Settings",
    active: false,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

const trendingCreators = [
  { name: "Sarah Kim", followers: "1.2M followers", initials: "SK" },
  { name: "Marcus Lee", followers: "890K followers", initials: "ML" },
  { name: "Nina Patel", followers: "650K followers", initials: "NP" },
];

export default function Sidebar() {
  return (
    <aside className="w-52 flex-shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col p-4 gap-6">
      {/* Logo */}
      <div className="flex items-center gap-2 px-2 pt-1">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs"
          style={{ backgroundColor: "var(--sidebar-primary)" }}
        >
          CS
        </div>
        <span className="font-semibold text-sidebar-foreground">ClipSphere</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1">
        {navItems.map(({ label, active, icon }) => (
          <a
            key={label}
            href="#"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              active
                ? "text-sidebar-primary-foreground font-medium"
                : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
            style={
              active
                ? { backgroundColor: "var(--sidebar-primary)" }
                : undefined
            }
            onMouseEnter={(e) => {
              if (active) {
                (e.currentTarget as HTMLElement).style.backgroundColor =
                  "var(--sidebar-primary-hover)";
              }
            }}
            onMouseLeave={(e) => {
              if (active) {
                (e.currentTarget as HTMLElement).style.backgroundColor =
                  "var(--sidebar-primary)";
              }
            }}
          >
            {icon}
            {label}
          </a>
        ))}
      </nav>

      {/* Trending Creators */}
      <div className="flex flex-col gap-3 mt-2">
        <p className="text-[10px] font-semibold tracking-widest text-sidebar-foreground/40 uppercase px-2">
          Trending Creators
        </p>
        {trendingCreators.map(({ name, followers, initials }) => (
          <div key={name} className="flex items-center gap-3 px-2">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
              style={{
                backgroundColor: "color-mix(in srgb, var(--sidebar-primary) 25%, transparent)",
                color: "var(--sidebar-primary)",
              }}
            >
              {initials}
            </div>
            <div>
              <p className="text-sm font-medium text-sidebar-foreground leading-tight">{name}</p>
              <p className="text-xs text-sidebar-foreground/45">{followers}</p>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
