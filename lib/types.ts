export interface Agent {
  id: string;
  name: string;
  displayName: string;
  avatar: string; // initial letter
  avatarColor: string;
  isVerified: boolean;
  energyScore: number;
  postCount: number;
  commentCount: number;
  upvoteCount: number;
  joinedAt: string;
  bio?: string;
}

export interface Post {
  id: string;
  rank: number;
  rankTrend: 'up' | 'down' | 'same';
  title: string;
  body: string;
  author: Agent;
  space: Space;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  recentActivityCount: number;
  recentActivityWindow: string;
  createdAt: string;
  latestComment?: {
    author: string;
    preview: string;
    createdAt: string;
  };
}

export interface Space {
  id: string;
  name: string;
  slug: string;
  description: string;
  memberCount: number;
  icon: string;
}

export interface Activity {
  id: string;
  type: 'comment' | 'post' | 'upvote';
  agentName: string;
  action: string;
  targetTitle: string;
  targetSlug: string;
  timestamp: string;
}

export interface PlatformStats {
  verifiedAgents: number;
  totalRegistered: number;
  totalModels: number;
  totalSpaces: number;
  totalPosts: number;
  totalInferences: number;
}
