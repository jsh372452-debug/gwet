import { create } from 'zustand';
import { api } from '../lib/api';

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

interface GameState {
    posts: Post[];
    communities: Community[];
    groups: Group[];
    comments: Record<string, Comment[]>;
    loading: boolean;
    loadPosts: () => Promise<void>;
    loadCommunities: () => Promise<void>;
    loadGroups: () => Promise<void>;
    addPost: (content: string, gameTag: string) => Promise<any>;
    wowPost: (postId: string) => Promise<void>;
    addComment: (postId: string, content: string) => Promise<void>;
    loadComments: (postId: string) => Promise<void>;
    createCommunity: (name: string, description: string) => Promise<void>;
    joinCommunity: (communityId: string) => Promise<void>;
    createGroup: (name: string, desc: string, communityId: string | null, type: string) => Promise<void>;
    updateCommunity: (id: string, data: Partial<Community>) => Promise<void>;
    kickMember: (communityId: string, userId: string) => Promise<void>;
}

export const useGameStore = create<GameState>((set, get) => ({
    posts: [],
    communities: [],
    groups: [],
    comments: {},
    loading: false,

    loadPosts: async () => {
        set({ loading: true });
        try {
            const { posts } = await api.posts.list({ limit: 50 });
            set({ posts, loading: false });
        } catch (err) {
            console.error('Load posts failed:', err);
            set({ loading: false });
        }
    },

    loadCommunities: async () => {
        try {
            const { communities } = await api.communities.list();
            set({ communities });
        } catch (err) {
            console.error('Load communities failed:', err);
        }
    },

    loadGroups: async () => {
        try {
            const { groups } = await api.groups.list();
            set({ groups });
        } catch (err) {
            console.error('Load groups failed:', err);
        }
    },

    addPost: async (content, gameTag) => {
        try {
            const result = await api.posts.create(content, gameTag);
            set(state => ({ posts: [result.post, ...state.posts] }));
            return result;
        } catch (err) {
            console.error('Add post failed:', err);
        }
    },

    wowPost: async (postId) => {
        try {
            const { wowCount } = await api.posts.wow(postId);
            set(state => ({
                posts: state.posts.map(p => p.id === postId ? { ...p, wow_count: wowCount } : p)
            }));
        } catch (err) {
            console.error('Wow failed:', err);
        }
    },

    loadComments: async (postId) => {
        try {
            const { comments } = await api.posts.getComments(postId);
            set(state => ({ comments: { ...state.comments, [postId]: comments } }));
        } catch (err) {
            console.error('Load comments failed:', err);
        }
    },

    addComment: async (postId, content) => {
        try {
            const { comment } = await api.posts.addComment(postId, content);
            set(state => ({
                comments: {
                    ...state.comments,
                    [postId]: [...(state.comments[postId] || []), comment]
                }
            }));
        } catch (err) {
            console.error('Add comment failed:', err);
        }
    },

    createCommunity: async (name, description) => {
        try {
            const { community } = await api.communities.create(name, description);
            set(state => ({ communities: [community, ...state.communities] }));
        } catch (err) {
            console.error('Create community failed:', err);
        }
    },

    joinCommunity: async (communityId) => {
        try {
            await api.communities.join(communityId);
            set(state => ({
                communities: state.communities.map(c =>
                    c.id === communityId ? { ...c, is_member: 1, member_count: c.member_count + 1 } : c
                )
            }));
        } catch (err) {
            console.error('Join community failed:', err);
        }
    },

    createGroup: async (name, description, communityId, type) => {
        try {
            const { group } = await api.groups.create(name, description, communityId || undefined, type);
            set(state => ({ groups: [group, ...state.groups] }));
        } catch (err) {
            console.error('Create group failed:', err);
        }
    },

    updateCommunity: async (id, data) => {
        try {
            await api.communities.update(id, data);
            set(state => ({
                communities: state.communities.map(c => c.id === id ? { ...c, ...data } : c)
            }));
        } catch (err) {
            console.error('Update community failed:', err);
        }
    },

    kickMember: async (communityId, userId) => {
        try {
            await api.communities.kick(communityId, userId);
        } catch (err) {
            console.error('Kick member failed:', err);
        }
    }
}));
