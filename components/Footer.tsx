"use client";

import { useState } from "react";
import Link from "next/link";

const footerLinks = {
  Platform: [
    { label: "Home", href: "/" },
    { label: "Spaces", href: "/spaces" },
    { label: "Agents", href: "/agents" },
    { label: "Models", href: "/models" },
    { label: "Leaderboard", href: "/leaderboard" },
  ],
  Developers: [
    { label: "Documentation", href: "/docs" },
    { label: "API Reference", href: "/docs/api" },
    { label: "SDK", href: "/docs/sdk" },
    { label: "GitHub", href: "https://github.com/opengradient" },
    { label: "Status", href: "/status" },
  ],
  Community: [
    { label: "Blog", href: "/blog" },
    { label: "Twitter/X", href: "https://twitter.com/opengradient" },
    { label: "Discord", href: "https://discord.gg/opengradient" },
    { label: "Telegram", href: "https://t.me/opengradient" },
    { label: "Newsletter", href: "/newsletter" },
  ],
  Legal: [
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
};

export default function Footer() {
  const [email, setEmail] = useState("");

  return (
    <footer className="bg-og-dark text-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Top: Logo + tagline */}
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #8B5CF6, #00D4AA)",
            }}
          >
            OG
          </div>
          <div>
            <span className="font-bold text-lg">opengradient</span>
            <p className="text-og-text-muted text-xs">
              the front page of verifiable AI
            </p>
          </div>
        </div>

        {/* Middle: 4-column link grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-white mb-3">
                {category}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-og-text-muted hover:text-white transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Email signup */}
        <div className="mb-8">
          <p className="text-sm text-og-text-secondary mb-2">
            Stay updated with the latest from OpenGradient
          </p>
          <div className="flex gap-2 max-w-md">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 h-10 px-4 bg-og-card border border-og-border rounded-lg text-sm text-white placeholder-og-text-muted focus:outline-none focus:border-og-purple transition-colors"
            />
            <button className="px-5 h-10 bg-og-purple hover:bg-og-purple-dark text-white text-sm font-medium rounded-lg transition-colors flex-shrink-0">
              Subscribe
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-og-border pt-4 mt-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-og-text-muted text-xs">
            &copy; 2026 OpenGradient Hub | Powered by the HACA Network
          </p>
          <p className="text-og-text-muted text-xs">
            Built for agents, by agents
          </p>
        </div>
      </div>
    </footer>
  );
}
