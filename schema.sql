-- GWET D1 Database Schema - Optimized for Squads & Gaming Economy

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  display_name TEXT,
  bio TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  is_onboarded INTEGER DEFAULT 0,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  rank TEXT DEFAULT 'ROOKIE',
  reputation_tier TEXT DEFAULT 'BRONZE', -- BRONZE, SILVER, GOLD, PLATINUM, DIAMOND, LEGEND, MYTHIC
  post_count INTEGER DEFAULT 0,
  message_count INTEGER DEFAULT 0,
  total_likes INTEGER DEFAULT 0,
  total_helpful_ai_flags INTEGER DEFAULT 0,
  game_id TEXT DEFAULT '',
  game_username TEXT DEFAULT '',
  country TEXT DEFAULT 'Global',
  language TEXT DEFAULT 'en',
  whatsapp TEXT DEFAULT '',
  telegram TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  game_tag TEXT DEFAULT 'Global',
  fire_count INTEGER DEFAULT 0,
  is_deleted INTEGER DEFAULT 0,
  visibility TEXT DEFAULT 'public',
  country TEXT DEFAULT 'Global',
  post_type TEXT DEFAULT 'normal',
  metadata_json TEXT DEFAULT '{}',
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  content TEXT NOT NULL,
  country TEXT DEFAULT 'Global',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (post_id) REFERENCES posts(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS squads (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  owner_id TEXT NOT NULL,
  theme_color TEXT DEFAULT '#a855f7',
  banner_base64 TEXT,
  bg_style TEXT DEFAULT 'default',
  squad_type TEXT DEFAULT 'public',
  game_category TEXT DEFAULT 'Global', -- Linked to specific game
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS squad_members (
  squad_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT DEFAULT 'member',
  joined_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (squad_id, user_id),
  FOREIGN KEY (squad_id) REFERENCES squads(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS squad_ai_configs (
  squad_id TEXT PRIMARY KEY,
  is_active INTEGER DEFAULT 0,
  ai_name TEXT DEFAULT 'Squad Master',
  personality TEXT DEFAULT 'professional',
  welcome_message TEXT DEFAULT 'Welcome to our Squad!',
  auto_mod_level INTEGER DEFAULT 5,
  custom_instructions TEXT DEFAULT '',
  FOREIGN KEY (squad_id) REFERENCES squads(id)
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  squad_id TEXT,
  creator_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  rules TEXT DEFAULT '', -- New: Custom rules/text
  start_time TEXT NOT NULL,
  end_time TEXT,
  event_type TEXT DEFAULT 'tournament',
  frame_type TEXT DEFAULT 'none', -- New: Custom SVG frame
  prize_pool TEXT DEFAULT '0',
  registration_fee TEXT DEFAULT 'free',
  max_slots INTEGER DEFAULT 0, -- New: Max participants
  status TEXT DEFAULT 'upcoming',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (squad_id) REFERENCES squads(id),
  FOREIGN KEY (creator_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS reputation_scores (
  user_id TEXT PRIMARY KEY,
  trust_score INTEGER DEFAULT 100,
  total_deals INTEGER DEFAULT 0,
  positive_reviews INTEGER DEFAULT 0,
  negative_reviews INTEGER DEFAULT 0,
  last_updated TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS groups (
  id TEXT PRIMARY KEY,
  squad_id TEXT,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  owner_id TEXT NOT NULL,
  type TEXT DEFAULT 'standalone',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (owner_id) REFERENCES users(id),
  FOREIGN KEY (squad_id) REFERENCES squads(id)
);

CREATE TABLE IF NOT EXISTS group_members (
  group_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  joined_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (group_id, user_id),
  FOREIGN KEY (group_id) REFERENCES groups(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  user_id TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT DEFAULT '',
  country TEXT DEFAULT 'Global',
  target_id TEXT NOT NULL,
  type TEXT NOT NULL,
  is_helpful INTEGER DEFAULT 0 -- For AI tracking
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_user ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_game_tag ON posts(game_tag);
CREATE INDEX IF NOT EXISTS idx_posts_fire ON posts(fire_count DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_messages_target ON messages(target_id, type);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_squad_members_user ON squad_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_groups_squad ON groups(squad_id);
CREATE INDEX IF NOT EXISTS idx_events_squad ON events(squad_id);
CREATE INDEX IF NOT EXISTS idx_events_start ON events(start_time);
