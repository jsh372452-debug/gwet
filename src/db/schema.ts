// TypeScript interfaces for GWET data models
// Database is now Cloudflare D1 (see schema.sql and functions/api/)

export interface User {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string;
    isOnboarded: boolean;
    xp: number;
    level: number;
    rank: string;
    country?: string;
    language?: 'ar' | 'en';
}

export interface Post {
    id: string;
    content: string;
    image_url: string | null;
    created_at: string;
    user_id: string;
    username: string;
    game_tag: string;
    wow_count: number;
    is_deleted: number;
    visibility: string;
    country: string;
}

export interface Comment {
    id: string;
    post_id: string;
    user_id: string;
    username: string;
    content: string;
    created_at: string;
    country: string;
}

export interface Community {
    id: string;
    name: string;
    description: string;
    owner_id: string;
    theme_color: string;
    banner_base64: string | null;
    bg_style: string;
    member_count: number;
    is_member: number;
}

export interface Group {
    id: string;
    community_id: string | null;
    name: string;
    description: string;
    owner_id: string;
    type: string;
    member_count: number;
    is_member: number;
}

export interface Message {
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    display_name: string;
    avatar_url: string;
    country: string;
    target_id: string;
    type: string;
}
