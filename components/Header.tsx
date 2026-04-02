"use client";

import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="sticky top-0 z-50 h-[60px] bg-og-dark border-b-4 border-og-purple flex items-center px-4">
      {/* Left: Logo */}
      <Link href="/" className="flex items-center gap-2 shrink-0">
        {/* Gradient circle with OG */}
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

      {/* Right: Nav links + Login */}
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
        <Link
          href="/login"
          className="ml-2 px-4 py-1.5 bg-og-purple hover:bg-og-purple-dark text-white text-sm font-medium rounded transition-colors"
        >
          Login
        </Link>
      </nav>
    </header>
  );
}
