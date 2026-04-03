-- ============================================
-- OpenGradient Hub Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- ==========================================
-- 1. TABLES
-- ==========================================

-- profiles table (extends auth.users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  display_name text,
  avatar_url text,
  avatar_color text default '#8B5CF6',
  bio text,
  is_verified boolean default false,
  energy_score integer default 0,
  created_at timestamptz default now()
);

-- spaces table
create table if not exists spaces (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  description text,
  icon text,
  member_count integer default 0,
  created_at timestamptz default now()
);

-- posts table
create table if not exists posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  body text not null,
  author_id uuid references profiles(id) on delete cascade not null,
  space_id uuid references spaces(id) on delete cascade not null,
  upvotes integer default 0,
  downvotes integer default 0,
  comment_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- comments table
create table if not exists comments (
  id uuid default gen_random_uuid() primary key,
  body text not null,
  author_id uuid references profiles(id) on delete cascade not null,
  post_id uuid references posts(id) on delete cascade not null,
  parent_id uuid references comments(id) on delete cascade,
  upvotes integer default 0,
  downvotes integer default 0,
  created_at timestamptz default now()
);

-- votes table (for both posts and comments)
create table if not exists votes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  post_id uuid references posts(id) on delete cascade,
  comment_id uuid references comments(id) on delete cascade,
  vote_type smallint not null check (vote_type in (-1, 1)),
  created_at timestamptz default now(),
  unique(user_id, post_id),
  unique(user_id, comment_id)
);

-- email_subscribers table (for developer CTA)
create table if not exists email_subscribers (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  created_at timestamptz default now()
);

-- ==========================================
-- 2. INDEXES
-- ==========================================

create index if not exists idx_posts_author_id on posts(author_id);
create index if not exists idx_posts_space_id on posts(space_id);
create index if not exists idx_posts_created_at on posts(created_at desc);
create index if not exists idx_posts_upvotes on posts(upvotes desc);

create index if not exists idx_comments_post_id on comments(post_id);
create index if not exists idx_comments_author_id on comments(author_id);
create index if not exists idx_comments_parent_id on comments(parent_id);
create index if not exists idx_comments_created_at on comments(created_at desc);

create index if not exists idx_votes_user_id on votes(user_id);
create index if not exists idx_votes_post_id on votes(post_id);
create index if not exists idx_votes_comment_id on votes(comment_id);

create index if not exists idx_profiles_username on profiles(username);
create index if not exists idx_spaces_slug on spaces(slug);

-- ==========================================
-- 3. ROW LEVEL SECURITY
-- ==========================================

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table spaces enable row level security;
alter table posts enable row level security;
alter table comments enable row level security;
alter table votes enable row level security;
alter table email_subscribers enable row level security;

-- PROFILES policies
create policy "Profiles are viewable by everyone"
  on profiles for select
  using (true);

create policy "Users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- SPACES policies
create policy "Spaces are viewable by everyone"
  on spaces for select
  using (true);

-- POSTS policies
create policy "Posts are viewable by everyone"
  on posts for select
  using (true);

create policy "Authenticated users can create posts"
  on posts for insert
  with check (auth.uid() = author_id);

create policy "Users can update their own posts"
  on posts for update
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

create policy "Users can delete their own posts"
  on posts for delete
  using (auth.uid() = author_id);

-- COMMENTS policies
create policy "Comments are viewable by everyone"
  on comments for select
  using (true);

create policy "Authenticated users can create comments"
  on comments for insert
  with check (auth.uid() = author_id);

create policy "Users can update their own comments"
  on comments for update
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

create policy "Users can delete their own comments"
  on comments for delete
  using (auth.uid() = author_id);

-- VOTES policies
create policy "Votes are viewable by everyone"
  on votes for select
  using (true);

create policy "Authenticated users can vote"
  on votes for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own votes"
  on votes for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own votes"
  on votes for delete
  using (auth.uid() = user_id);

-- EMAIL_SUBSCRIBERS policies
create policy "Anyone can subscribe"
  on email_subscribers for insert
  with check (true);

-- ==========================================
-- 4. FUNCTIONS & TRIGGERS
-- ==========================================

-- Function to update post vote counts
create or replace function update_post_vote_counts()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    if NEW.post_id is not null then
      update posts set
        upvotes = (select count(*) from votes where post_id = NEW.post_id and vote_type = 1),
        downvotes = (select count(*) from votes where post_id = NEW.post_id and vote_type = -1)
      where id = NEW.post_id;
    end if;
    return NEW;
  elsif TG_OP = 'DELETE' then
    if OLD.post_id is not null then
      update posts set
        upvotes = (select count(*) from votes where post_id = OLD.post_id and vote_type = 1),
        downvotes = (select count(*) from votes where post_id = OLD.post_id and vote_type = -1)
      where id = OLD.post_id;
    end if;
    return OLD;
  elsif TG_OP = 'UPDATE' then
    if NEW.post_id is not null then
      update posts set
        upvotes = (select count(*) from votes where post_id = NEW.post_id and vote_type = 1),
        downvotes = (select count(*) from votes where post_id = NEW.post_id and vote_type = -1)
      where id = NEW.post_id;
    end if;
    return NEW;
  end if;
  return null;
end;
$$ language plpgsql security definer;

-- Function to update comment vote counts
create or replace function update_comment_vote_counts()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    if NEW.comment_id is not null then
      update comments set
        upvotes = (select count(*) from votes where comment_id = NEW.comment_id and vote_type = 1),
        downvotes = (select count(*) from votes where comment_id = NEW.comment_id and vote_type = -1)
      where id = NEW.comment_id;
    end if;
    return NEW;
  elsif TG_OP = 'DELETE' then
    if OLD.comment_id is not null then
      update comments set
        upvotes = (select count(*) from votes where comment_id = OLD.comment_id and vote_type = 1),
        downvotes = (select count(*) from votes where comment_id = OLD.comment_id and vote_type = -1)
      where id = OLD.comment_id;
    end if;
    return OLD;
  elsif TG_OP = 'UPDATE' then
    if NEW.comment_id is not null then
      update comments set
        upvotes = (select count(*) from votes where comment_id = NEW.comment_id and vote_type = 1),
        downvotes = (select count(*) from votes where comment_id = NEW.comment_id and vote_type = -1)
      where id = NEW.comment_id;
    end if;
    return NEW;
  end if;
  return null;
end;
$$ language plpgsql security definer;

-- Function to update post comment count
create or replace function update_post_comment_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update posts set comment_count = comment_count + 1 where id = NEW.post_id;
    return NEW;
  elsif TG_OP = 'DELETE' then
    update posts set comment_count = comment_count - 1 where id = OLD.post_id;
    return OLD;
  end if;
  return null;
end;
$$ language plpgsql security definer;

-- Function to update updated_at timestamp
create or replace function update_updated_at()
returns trigger as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$ language plpgsql;

-- Create triggers
create trigger on_vote_change_post
  after insert or update or delete on votes
  for each row execute function update_post_vote_counts();

create trigger on_vote_change_comment
  after insert or update or delete on votes
  for each row execute function update_comment_vote_counts();

create trigger on_comment_change
  after insert or delete on comments
  for each row execute function update_post_comment_count();

create trigger on_post_update
  before update on posts
  for each row execute function update_updated_at();

-- ==========================================
-- 5. SEED DATA - Default Spaces
-- ==========================================

insert into spaces (name, slug, description, icon, member_count) values
  ('General', 'og/general', 'General discussion about OpenGradient', '💬', 48250),
  ('Models', 'og/models', 'ML model sharing and benchmarks', '🧠', 35120),
  ('Trading & DeFi', 'og/trading', 'AI-powered trading and DeFi strategies', '📈', 31890),
  ('Agents', 'og/agents', 'AI agent development and collaboration', '🤖', 28450),
  ('Research', 'og/research', 'Academic papers and research discussion', '🔬', 22100),
  ('Governance', 'og/governance', 'OPG token governance and proposals', '🏛️', 18750),
  ('Developers', 'og/developers', 'SDK, API, and developer tools', '🛠️', 26300),
  ('Showcase', 'og/showcase', 'Show off your builds and projects', '🚀', 15600)
on conflict (slug) do nothing;
