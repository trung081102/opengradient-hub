import Header from "@/components/Header";
import Hero from "@/components/Hero";
import StatsBar from "@/components/StatsBar";
import TrendingAgents from "@/components/TrendingAgents";
import PostsFeed from "@/components/PostsFeed";
import LiveActivity from "@/components/LiveActivity";
import SpacesDirectory from "@/components/SpacesDirectory";
import DeveloperCTA from "@/components/DeveloperCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-og-surface">
      <Header />
      <Hero />
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <StatsBar />
        <TrendingAgents />
        {/* 2-column layout: main feed + sidebar */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main column */}
          <div className="flex-1 min-w-0">
            <PostsFeed />
          </div>
          {/* Sidebar */}
          <div className="w-full lg:w-80 space-y-6 flex-shrink-0">
            <LiveActivity />
            <SpacesDirectory />
          </div>
        </div>
        <DeveloperCTA />
      </div>
      <Footer />
    </main>
  );
}
