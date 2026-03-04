import { create } from 'zustand';
import { api } from '../lib/api';

export interface Post {
    id: string;
    content: string;
    image_url?: string;
    created_at: string;
    user_id: string;
    username: string;
    reputation_tier?: string;
    game_tag: string;
    fire_count: number;
    post_count?: number;
    message_count?: number;
    post_type: 'normal' | 'session';
    metadata_json: string;
    is_deleted: number;
    visibility: string;
    country: string;
}

export interface Comment {
    id: string;
    post_id: string;
    user_id: string;
    username: string;
    reputation_tier?: string;
    content: string;
    created_at: string;
    country: string;
}

export interface Squad {
    id: string;
    name: string;
    description: string;
    game_category?: string;
    owner_id: string;
    theme_color: string;
    banner_base64: string | null;
    bg_style: string;
    member_count: number;
    is_member: number;
}

export interface Group {
    id: string;
    squad_id: string | null;
    name: string;
    description: string;
    owner_id: string;
    type: string;
    member_count: number;
    is_member: number;
}

interface GameState {
    posts: Post[];
    squads: Squad[];
    groups: Group[];
    comments: Record<string, Comment[]>;
    loading: boolean;
    loadPosts: (gameTag?: string, sort?: 'latest' | 'fire') => Promise<void>;
    loadSquads: () => Promise<void>;
    loadGroups: () => Promise<void>;
    addPost: (content: string, game_tag: string, type?: 'normal' | 'session', metadata?: any) => Promise<any>;
    firePost: (postId: string) => Promise<void>;
    addComment: (postId: string, content: string) => Promise<void>;
    loadComments: (postId: string) => Promise<void>;
    createSquad: (name: string, description: string) => Promise<void>;
    joinSquad: (squadId: string) => Promise<void>;
    createGroup: (name: string, desc: string, squadId: string | null, type: string) => Promise<void>;
    updateSquad: (id: string, data: Partial<Squad>) => Promise<void>;
    kickMember: (squadId: string, userId: string) => Promise<void>;
}

export const useGameStore = create<GameState>((set, get) => ({
    posts: [],
    squads: [],
    groups: [],
    comments: {},
    loading: false,

    loadPosts: async (gameTag, sort) => {
        set({ loading: true });
        try {
            const { posts } = await api.posts.list({ limit: 50, gameTag, sort });
            set({ posts, loading: false });
        } catch (err) {
            console.error('Load posts failed:', err);
            set({ loading: false });
        }
    },

    loadSquads: async () => {
        try {
            const { squads } = await api.squads.list();
            set({ squads });
        } catch (err) {
            console.error('Load squads failed:', err);
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

    addPost: async (content, gameTag, type = 'normal', metadata = {}) => {
        console.log('📦 STORE: addPost CALLED', { content, gameTag, type });
        try {
            const result = await api.posts.create(content, gameTag, type, metadata);
            console.log('📦 STORE: API RESULT RECEIVED', result);

            if (result && result.post) {
                set(state => ({
                    posts: [result.post, ...state.posts]
                }));
                console.log('📦 STORE: STATE UPDATED WITH NEW POST');
            }
            return result;
        } catch (err) {
            console.error('📦 STORE: Add post failed:', err);
            throw err;
        }
    },

    firePost: async (postId) => {
        try {
            const { fireCount } = await api.posts.fire(postId);
            set(state => ({
                posts: state.posts.map(p => p.id === postId ? { ...p, fire_count: fireCount } : p)
            }));
        } catch (err) {
            console.error('Fire failed:', err);
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

    createSquad: async (name, description) => {
        try {
            const { squad } = await api.squads.create(name, description);
            set(state => ({ squads: [squad, ...state.squads] }));
        } catch (err) {
            console.error('Create squad failed:', err);
        }
    },

    joinSquad: async (squadId) => {
        try {
            await api.squads.join(squadId);
            set(state => ({
                squads: state.squads.map(s =>
                    s.id === squadId ? { ...s, is_member: 1, member_count: s.member_count + 1 } : s
                )
            }));
        } catch (err) {
            console.error('Join squad failed:', err);
        }
    },

    createGroup: async (name, description, squadId, type) => {
        try {
            const { group } = await api.groups.create(name, description, squadId || undefined, type);
            set(state => ({ groups: [group, ...state.groups] }));
        } catch (err) {
            console.error('Create group failed:', err);
        }
    },

    updateSquad: async (id, data) => {
        try {
            await api.squads.update(id, data);
            set(state => ({
                squads: state.squads.map(s => s.id === id ? { ...s, ...data } : s)
            }));
        } catch (err) {
            console.error('Update squad failed:', err);
        }
    },

    kickMember: async (squadId, userId) => {
        try {
            await api.squads.kick(squadId, userId);
        } catch (err) {
            console.error('Kick member failed:', err);
        }
    }
}));
