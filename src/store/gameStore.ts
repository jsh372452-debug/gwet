import { create } from 'zustand';
import { getDB } from '../db/schema';
import { getGunApp } from '../db/gun';

export interface Post {
    id: string;
    content: string;
    image: Blob | null;
    created_at: string;
    userId: string;
    username: string;
    gameTag: string;
    wowCount: number;
    is_deleted: boolean;
    visibility: 'public' | 'private';
    country: string; // Added for global identity
}

export interface Comment {
    id: string;
    postId: string;
    userId: string;
    username: string;
    content: string;
    created_at: string;
    country: string; // Added for global identity
}

export interface Community {
    id: string;
    name: string;
    description: string;
    ownerId: string;
    themeColor: string;
    bannerBase64: string | null;
    bgStyle: 'default' | 'energetic' | 'calm' | 'matrix';
    members: string[];
}

export interface Group {
    id: string;
    communityId: string | null;
    name: string;
    description: string;
    ownerId: string;
    members: string[];
    created_at: string;
    type: 'community_sub' | 'standalone';
}

interface GameState {
    posts: Post[];
    communities: Community[];
    groups: Group[];
    comments: Record<string, Comment[]>;
    loading: boolean;
    syncData: () => void;
    addPost: (content: string, image: Blob | null, userId: string, username: string, gameTag: string, country: string) => Promise<void>;
    wowPost: (postId: string) => Promise<void>;
    addComment: (postId: string, userId: string, username: string, content: string, country: string) => Promise<void>;
    createCommunity: (name: string, description: string, ownerId: string) => Promise<void>;
    createGroup: (name: string, desc: string, ownerId: string, communityId: string | null, type: 'community_sub' | 'standalone') => Promise<void>;
    updateCommunityElite: (id: string, data: Partial<Community>) => Promise<void>;
    kickMember: (communityId: string, userId: string) => Promise<void>;
}

export const useGameStore = create<GameState>((set, get) => ({
    posts: [],
    communities: [],
    groups: [],
    comments: {},
    loading: false,

    syncData: () => {
        const gunApp = getGunApp();

        gunApp.get('global-posts').map().on(async (data, id) => {
            if (!data || data.is_deleted) return;
            const db = await getDB();
            const existing = await db.get('posts', id as string);
            if (!existing) {
                await db.put('posts', { ...data, id, image: null, wowCount: data.wowCount || 0, visibility: data.visibility || 'public', country: data.country || 'Global' });
            }
            set(state => {
                if (state.posts.find(p => p.id === id)) return state;
                return { posts: [...state.posts, { ...data, id }].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()) };
            });
        });

        gunApp.get('global-communities').map().on(async (data, id) => {
            if (!data) return;
            const db = await getDB();
            const existing = await db.get('communities', id as string);
            if (!existing) {
                const comm = { ...data, id, members: data.members || [data.ownerId] };
                await db.put('communities', comm);
            }
            set(state => {
                const communities = state.communities.find(c => c.id === id) ? state.communities : [...state.communities, { ...data, id }];
                return { communities };
            });
        });

        gunApp.get('global-groups').map().on(async (data, id) => {
            if (!data) return;
            const db = await getDB();
            await db.put('groups', { ...data, id } as Group);
            set(state => ({ groups: state.groups.find(g => g.id === id) ? state.groups : [...state.groups, { ...data, id } as Group] }));
        });

        gunApp.get('global-comments').map().on(async (data, id) => {
            if (!data) return;
            const db = await getDB();
            await db.put('comments', { ...data, id } as Comment);
            set(state => {
                const pid = data.postId;
                const existing = state.comments[pid] || [];
                if (existing.find(c => c.id === id)) return state;
                return {
                    comments: {
                        ...state.comments,
                        [pid]: [...existing, { ...data, id } as Comment].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                    }
                };
            });
        });
    },

    addPost: async (content, image, userId, username, gameTag, country) => {
        const id = crypto.randomUUID();
        const created_at = new Date().toISOString();
        const postData: Post = {
            id, content, created_at, userId, username, gameTag,
            wowCount: 0, is_deleted: false, visibility: 'public', image: null, country
        };

        const db = await getDB();
        await db.add('posts', { ...postData, image });
        getGunApp().get('global-posts').get(id).put(postData);
        set(state => ({ posts: [{ ...postData, id, image }, ...state.posts] }));
    },

    wowPost: async (postId) => {
        const post = get().posts.find(p => p.id === postId);
        if (!post) return;
        const newWow = (post.wowCount || 0) + 1;
        const db = await getDB();
        const record = await db.get('posts', postId);
        if (record) await db.put('posts', { ...record, wowCount: newWow });
        getGunApp().get('global-posts').get(postId).get('wowCount').put(newWow);
        set(state => ({ posts: state.posts.map(p => p.id === postId ? { ...p, wowCount: newWow } : p) }));
    },

    addComment: async (postId, userId, username, content, country) => {
        const id = crypto.randomUUID();
        const created_at = new Date().toISOString();
        const commentData = { id, postId, userId, username, content, created_at, country };
        const db = await getDB();
        await db.add('comments', commentData);
        getGunApp().get('global-comments').get(id).put(commentData);
        set(state => {
            const existing = state.comments[postId] || [];
            return { comments: { ...state.comments, [postId]: [...existing, commentData] } };
        });
    },

    createCommunity: async (name, description, ownerId) => {
        const id = crypto.randomUUID();
        const commData: Community = {
            id, name, description, ownerId, themeColor: 'var(--primary)',
            bannerBase64: null, bgStyle: 'default', members: [ownerId]
        };
        const db = await getDB();
        await db.add('communities', commData);
        getGunApp().get('global-communities').get(id).put(commData);
        set(state => ({ communities: [commData, ...state.communities] }));
    },

    createGroup: async (name, description, ownerId, communityId, type) => {
        const id = crypto.randomUUID();
        const groupData: Group = {
            id, name, description, ownerId, communityId, type,
            members: [ownerId], created_at: new Date().toISOString()
        };
        const db = await getDB();
        await db.add('groups', groupData);
        getGunApp().get('global-groups').get(id).put(groupData);
        set(state => ({ groups: [groupData, ...state.groups] }));
    },

    updateCommunityElite: async (id, data) => {
        const db = await getDB();
        const community = await db.get('communities', id);
        if (!community) return;
        const updated = { ...community, ...data };
        await db.put('communities', updated);
        getGunApp().get('global-communities').get(id).put(data);
        set(state => ({ communities: state.communities.map(c => c.id === id ? { ...c, ...data } : c) }));
    },

    kickMember: async (communityId, userId) => {
        const db = await getDB();
        const community = await db.get('communities', communityId);
        if (!community) return;
        const newMembers = community.members.filter(m => m !== userId);
        await db.put('communities', { ...community, members: newMembers });
        getGunApp().get('global-communities').get(communityId).get('members').put(newMembers);
        set(state => ({ communities: state.communities.map(c => c.id === communityId ? { ...c, members: newMembers } : c) }));
    }
}));
