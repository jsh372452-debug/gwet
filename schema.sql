-- ═══════════════════════════════════════════════════════════════
-- GWET AAG (Adaptive Activity Graph) Schema — Cloudflare D1
-- ═══════════════════════════════════════════════════════════════

-- Drop old tables (NetGuard / legacy gwet)
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS group_members;
DROP TABLE IF EXISTS groups;
DROP TABLE IF EXISTS reputation_scores;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS squad_ai_configs;
DROP TABLE IF EXISTS squad_members;
DROP TABLE IF EXISTS squads;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS users;

-- Drop new tables if re-running
DROP TABLE IF EXISTS edges;
DROP TABLE IF EXISTS entities;
DROP TABLE IF EXISTS communities;
DROP TABLE IF EXISTS profiles;

-- ─── 1. PROFILES ──────────────────────────────────────────────
-- Users table with AAG influence tracking
CREATE TABLE profiles (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  gaming_platform TEXT DEFAULT '',
  influence_score REAL DEFAULT 0,
  daily_edge_count INTEGER DEFAULT 0,
  last_edge_reset TEXT DEFAULT (date('now')),
  country TEXT DEFAULT 'Global',
  language TEXT DEFAULT 'en',
  is_onboarded INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ─── 2. ENTITIES ──────────────────────────────────────────────
-- Everything in the platform: posts, messages, comments, clips, user profiles
-- type: 'post', 'message', 'comment', 'clip', 'user_profile'
-- metadata (JSON text):
--   post:    {content, media_url, game_tag}
--   message: {content, room_id}
--   comment: {content, parent_entity_id}
--   clip:    {video_url, game_tag, duration}
--   user_profile: {} (used as follow target)
CREATE TABLE entities (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  metadata TEXT DEFAULT '{}',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (owner_id) REFERENCES profiles(id)
);

-- ─── 3. EDGES ─────────────────────────────────────────────────
-- Heart of AAG — every interaction = one edge
-- type: 'create','like','reply','share','view','follow','unfollow',
--       'join','leave','send','report','block','mention','clip_watch'
-- weight: default varies by type (see scoring.ts EDGE_WEIGHTS)
CREATE TABLE edges (
  id TEXT PRIMARY KEY,
  from_user TEXT NOT NULL,
  to_entity TEXT NOT NULL,
  type TEXT NOT NULL,
  weight REAL DEFAULT 1.0,
  context TEXT DEFAULT '{}',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (from_user) REFERENCES profiles(id),
  FOREIGN KEY (to_entity) REFERENCES entities(id)
);

-- ─── 4. COMMUNITIES ──────────────────────────────────────────
-- Helper table for gaming communities (static data, not graph)
CREATE TABLE communities (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  game_tag TEXT DEFAULT '',
  creator_id TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (creator_id) REFERENCES profiles(id)
);

-- ═══════════════════════════════════════════════════════════════
-- INDEXES — Performance
-- ═══════════════════════════════════════════════════════════════

-- Edges: fetch user activity
CREATE INDEX IF NOT EXISTS idx_edges_from_user ON edges(from_user, created_at DESC);
-- Edges: fetch interactions on an entity
CREATE INDEX IF NOT EXISTS idx_edges_to_entity ON edges(to_entity, type);
-- Edges: filter by type
CREATE INDEX IF NOT EXISTS idx_edges_type ON edges(type, created_at DESC);
-- Edges: sort by weight
CREATE INDEX IF NOT EXISTS idx_edges_weight ON edges(weight DESC);
-- Edges: prevent duplicate interactions (one like per user per entity)
CREATE UNIQUE INDEX IF NOT EXISTS idx_edges_composite ON edges(from_user, to_entity, type);
-- Entities: fetch by type (e.g., all posts)
CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(type, created_at DESC);
-- Entities: fetch user's own content
CREATE INDEX IF NOT EXISTS idx_entities_owner ON entities(owner_id);
-- Profiles: leaderboard
CREATE INDEX IF NOT EXISTS idx_profiles_influence ON profiles(influence_score DESC);
-- Communities: filter by game
CREATE INDEX IF NOT EXISTS idx_communities_game ON communities(game_tag);
