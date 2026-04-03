"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function DeveloperCTA() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from('email_subscribers')
          .insert({ email: email.trim() });

        if (error) {
          if (error.code === '23505') {
            setStatus('success');
            setMessage('You\'re already subscribed!');
          } else {
            throw error;
          }
        } else {
          setStatus('success');
          setMessage('You\'re in! We\'ll notify you when developer access opens.');
        }
      } catch {
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
      }
    } else {
      // Demo mode - just show success
      setStatus('success');
      setMessage('You\'re in! We\'ll notify you when developer access opens.');
    }

    setEmail("");
    setTimeout(() => {
      setStatus('idle');
      setMessage("");
    }, 4000);
  };

  return (
    <section
      className="rounded-xl p-8 text-center"
      style={{
        background: "linear-gradient(135deg, #0A0A0F 0%, #12121A 100%)",
      }}
    >
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-white font-bold text-xl">
          {"\uD83D\uDD27"} Build on OpenGradient
        </h3>
        <p className="text-og-text-secondary mt-2 max-w-2xl mx-auto text-sm">
          Integrate verifiable AI into your dApp. Access 2,800+ models,
          TEE-verified inference, and on-chain ML pipelines.
        </p>
      </div>

      {/* Features row */}
      <div className="flex flex-wrap justify-center gap-8 my-6">
        {/* x402 API */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-og-purple/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-og-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-white text-sm font-medium">x402 API</span>
        </div>

        {/* PIPE Smart Contracts */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-og-teal/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-og-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <span className="text-white text-sm font-medium">PIPE Smart Contracts</span>
        </div>

        {/* Python SDK */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-og-blue/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-og-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <span className="text-white text-sm font-medium">Python SDK</span>
        </div>
      </div>

      {/* Email Subscribe Form */}
      <div className="mt-6 max-w-md mx-auto">
        {status === 'success' ? (
          <div className="bg-og-green/10 border border-og-green/30 rounded-lg p-3">
            <p className="text-og-green text-sm font-medium">{message}</p>
          </div>
        ) : status === 'error' ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <p className="text-red-400 text-sm">{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 px-4 py-2.5 bg-og-dark border border-og-border rounded-lg text-white text-sm placeholder-og-text-muted focus:outline-none focus:border-og-purple focus:ring-1 focus:ring-og-purple transition-colors"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-5 py-2.5 bg-og-purple hover:bg-og-purple-dark text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              {status === 'loading' ? 'Sending...' : 'Notify me'}
            </button>
          </form>
        )}
      </div>

      {/* CTA Button */}
      <div className="mt-4">
        <Link
          href="/developers/apply"
          className="inline-block bg-og-purple hover:bg-og-purple-dark text-white font-medium rounded-lg px-6 py-3 transition-colors text-sm"
        >
          Get Developer Access
        </Link>
      </div>

      {/* pip install line */}
      <p className="mt-4 font-mono text-og-teal text-sm">
        pip install opengradient
      </p>
    </section>
  );
}
