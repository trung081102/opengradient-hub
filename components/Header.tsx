"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, profile, loading, signOut } = useAuth();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const avatarLetter = profile?.display_name?.[0] || profile?.username?.[0] || user?.email?.[0] || "U";
  const avatarColor = profile?.avatar_color || "#8B5CF6";

  return (
    <header className="sticky top-0 z-50 h-[60px] bg-og-dark border-b-4 border-og-purple flex items-center px-4">
      {/* Left: Logo */}
      <Link href="/" className="flex items-center gap-2 shrink-0">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
          style={{
            background: "linear-gradient(135deg, #8B5CF6, #00D4AA)",
          }}
        >
          OG
        </div>
        <span className="text-white font-bold text-lg hidden sm:inline">
          opengradient
        </span>
      </Link>

      {/* Center: Search bar */}
      <div className="flex-1 max-w-xl mx-4">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-og-text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search OpenGradient Hub"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-10 pr-4 bg-white rounded-full text-sm text-gray-900 placeholder-gray-400 border border-gray-200 focus:outline-none focus:border-og-purple focus:ring-1 focus:ring-og-purple transition-colors"
          />
        </div>
      </div>

      {/* Right: Nav links + Auth */}
      <nav className="flex items-center gap-1 sm:gap-4 shrink-0">
        <Link
          href="/spaces"
          className="text-og-text-secondary hover:text-white text-sm font-medium transition-colors hidden md:inline-block"
        >
          Spaces
        </Link>
        <Link
          href="/agents"
          className="text-og-text-secondary hover:text-white text-sm font-medium transition-colors hidden md:inline-block"
        >
          Agents
        </Link>
        <Link
          href="/models"
          className="text-og-text-secondary hover:text-white text-sm font-medium transition-colors hidden md:inline-block"
        >
          Models
        </Link>

        {loading ? (
          <div className="w-8 h-8 rounded-full bg-og-border animate-pulse" />
        ) : user ? (
          <>
            {/* Create Post button */}
            <Link
              href="/create"
              className="hidden sm:inline-flex items-center gap-1.5 ml-2 px-3 py-1.5 bg-og-teal hover:bg-og-teal-dark text-white text-sm font-medium rounded transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Post
            </Link>

            {/* User avatar + dropdown */}
            <div className="relative ml-2" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold transition-opacity hover:opacity-80"
                style={{ backgroundColor: avatarColor }}
              >
                {avatarLetter.toUpperCase()}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-og-card border border-og-border rounded-lg shadow-xl py-1 z-50">
                  <div className="px-4 py-2 border-b border-og-border">
                    <p className="text-white text-sm font-medium truncate">
                      {profile?.display_name || profile?.username || 'User'}
                    </p>
                    <p className="text-og-text-muted text-xs truncate">
                      @{profile?.username || user.email}
                    </p>
                  </div>
                  <Link
                    href="/create"
                    className="block px-4 py-2 text-og-text-secondary hover:text-white hover:bg-og-border/50 text-sm transition-colors sm:hidden"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Create Post
                  </Link>
                  <Link
                    href={`/u/${profile?.username || ''}`}
                    className="block px-4 py-2 text-og-text-secondary hover:text-white hover:bg-og-border/50 text-sm transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    My Profile
                  </Link>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      signOut();
                    }}
                    className="block w-full text-left px-4 py-2 text-og-text-secondary hover:text-red-400 hover:bg-og-border/50 text-sm transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link
            href="/login"
            className="ml-2 px-4 py-1.5 bg-og-purple hover:bg-og-purple-dark text-white text-sm font-medium rounded transition-colors"
          >
            Login
          </Link>
        )}
      </nav>
    </header>
  );
}
