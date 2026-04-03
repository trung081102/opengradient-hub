"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

interface FooterSection {
  [key: string]: FooterLink[];
}

const footerLinks: FooterSection = {
  Platform: [
    { label: "Home", href: "/" },
    { label: "Spaces", href: "/spaces" },
    { label: "Agents", href: "/agents" },
    { label: "Models", href: "/models" },
    { label: "Leaderboard", href: "/leaderboard" },
  ],
  Products: [
    { label: "BitQuant", href: "https://www.bitquant.io/", external: true },
    { label: "BitQuant Subnet", href: "https://github.com/OpenGradient/BitQuant-Subnet", external: true },
    { label: "MemSync", href: "https://memsync.ai/", external: true },
    { label: "MemSync Extension", href: "https://chromewebstore.google.com/detail/memsync/ekhglfoplnmigdhkifhegcdjmjkbljom", external: true },
    { label: "Twin.fun", href: "https://www.twin.fun/", external: true },
    { label: "Model Hub", href: "https://hub.opengradient.ai/", external: true },
  ],
  Developers: [
    { label: "Technical Docs", href: "https://docs.opengradient.ai/", external: true },
    { label: "GitHub", href: "https://github.com/OpenGradient", external: true },
    { label: "Blog", href: "https://www.opengradient.ai/blog", external: true },
    { label: "Medium", href: "https://opengradient.medium.com/", external: true },
    { label: "Official Website", href: "https://www.opengradient.ai/", external: true },
  ],
  Community: [
    { label: "X (Twitter)", href: "https://x.com/OpenGradient", external: true },
    { label: "X Community", href: "https://x.com/i/communities/1978779669693362400", external: true },
    { label: "Discord", href: "https://discord.com/invite/2t5sx5BCpB", external: true },
    { label: "LinkedIn", href: "https://www.linkedin.com/company/opengradientlabs/", external: true },
  ],
};

export default function Footer() {
  const [email, setEmail] = useState("");

  return (
    <footer className="bg-og-dark text-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Top: Logo + tagline */}
        <div className="flex items-center gap-3 mb-8">
          <Image
            src="/logo.svg"
            alt="OpenGradient"
            width={32}
            height={32}
            className="w-8 h-8 rounded-full flex-shrink-0"
          />
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
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-og-text-muted hover:text-white transition-colors text-sm inline-flex items-center gap-1"
                      >
                        {link.label}
                        <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-og-text-muted hover:text-white transition-colors text-sm"
                      >
                        {link.label}
                      </Link>
                    )}
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
          <div className="flex items-center gap-4">
            <Link href="/terms" className="text-og-text-muted hover:text-white text-xs transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="text-og-text-muted hover:text-white text-xs transition-colors">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
