import { create } from 'zustand';
import { api, AAGPost, AAGComment, AAGCommunity } from '../lib/api';

// ─── State Interface ───────────────────────────────────────

interface GameState {
    // Data
    posts: AAGPost[];
    communities: AAGCommunity[];
    comments: Record<string, AAGComment[]>;
    feedType: 'smart' | 'following';

    // Loading states
    loading: boolean;
    interacting: boolean;

    // Feed
    loadFeed: (type?: 'smart' | 'following') => Promise<void>;
    setFeedType: (type: 'smart' | 'following') => void;

    // Posts
    addPost: (content: string, gameTag?: string, mediaUrl?: string) => Promise<any>;
    deletePost: (postId: string) => Promise<void>;

    // Comments
    loadComments: (postId: string) => Promise<void>;
    addComment: (postId: string, content: string) => Promise<void>;

    // Interactions
    likePost: (postId: string) => Promise<void>;
    unlikePost: (postId: string) => Promise<void>;
    sharePost: (postId: string) => Promise<void>;
    followUser: (userId: string) => Promise<void>;
    unfollowUser: (userId: string) => Promise<void>;
    reportEntity: (entityId: string, reason?: string) => Promise<void>;

    // Communities
    loadCommunities: () => Promise<void>;
    createCommunity: (name: string, description: string, gameTag?: string) => Promise<void>;
    joinCommunity: (communityId: string) => Promise<void>;
    leaveCommunity: (communityId: string) => Promise<void>;
}

// ─── Store ─────────────────────────────────────────────────

export const useGameStore = create<GameState>((set, get) => ({
    posts: [],
    communities: [],
    comments: {},
    feedType: 'smart',
    loading: false,
    interacting: false,

    // ─── Feed ──────────────────────────────────────────────

    setFeedType: (type) => set({ feedType: type }),

    loadFeed: async (type) => {
        const feedType = type || get().feedType;
        set({ loading: true, feedType, posts: get().posts || [] });
        try {
            const response = feedType === 'following'
                ? await api.feed.following({ limit: 30 })
                : await api.feed.smart({ limit: 30 });
            
            set({ posts: response?.posts || [], loading: false });
        } catch (err) {
            console.error('Load feed failed:', err);
            set({ loading: false });
        }
    },

    // ─── Posts ──────────────────────────────────────────────

    addPost: async (content, gameTag, mediaUrl) => {
        try {
            const result = await api.posts.create(content, gameTag, mediaUrl);
            if (result?.post) {
                set(state => ({ posts: [result.post, ...state.posts] }));
            }
            return result;
        } catch (err) {
            console.error('Add post failed:', err);
            throw err;
        }
    },

    deletePost: async (postId) => {
        try {
            await api.posts.delete(postId);
            set(state => ({ posts: state.posts.filter(p => p.id !== postId) }));
        } catch (err) {
            console.error('Delete post failed:', err);
        }
    },

    // ─── Comments ──────────────────────────────────────────

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
            const { comment } = await api.interact.reply(postId, content);
            set(state => ({
                comments: {
                    ...state.comments,
                    [postId]: [...(state.comments[postId] || []), comment]
                },
                // Increment reply count on the post
                posts: state.posts.map(p =>
                    p.id === postId ? { ...p, replyCount: p.replyCount + 1 } : p
                )
            }));
        } catch (err) {
            console.error('Add comment failed:', err);
        }
    },

    // ─── Interactions ──────────────────────────────────────

    likePost: async (postId) => {
        set({ interacting: true });
        try {
            await api.interact.like(postId);
            set(state => ({
                posts: state.posts.map(p =>
                    p.id === postId ? { ...p, userLiked: true, likeCount: p.likeCount + 1 } : p
                ),
                interacting: false,
            }));
        } catch (err) {
            console.error('Like failed:', err);
            set({ interacting: false });
        }
    },

    unlikePost: async (postId) => {
        set({ interacting: true });
        try {
            await api.interact.unlike(postId);
            set(state => ({
                posts: state.posts.map(p =>
                    p.id === postId ? { ...p, userLiked: false, likeCount: Math.max(0, p.likeCount - 1) } : p
                ),
                interacting: false,
            }));
        } catch (err) {
            console.error('Unlike failed:', err);
            set({ interacting: false });
        }
    },

    sharePost: async (postId) => {
        try {
            await api.interact.share(postId);
            set(state => ({
                posts: state.posts.map(p =>
                    p.id === postId ? { ...p, shareCount: p.shareCount + 1 } : p
                )
            }));
        } catch (err) {
            console.error('Share failed:', err);
        }
    },

    followUser: async (userId) => {
        try {
            await api.interact.follow(userId);
        } catch (err) {
            console.error('Follow failed:', err);
        }
    },

    unfollowUser: async (userId) => {
        try {
            await api.interact.unfollow(userId);
        } catch (err) {
            console.error('Unfollow failed:', err);
        }
    },

    reportEntity: async (entityId, reason) => {
        try {
            await api.interact.report(entityId, reason);
        } catch (err) {
            console.error('Report failed:', err);
        }
    },

    // ─── Communities ───────────────────────────────────────

    loadCommunities: async () => {
        try {
            const { communities } = await api.communities.list();
            set({ communities });
        } catch (err) {
            console.error('Load communities failed:', err);
        }
    },

    createCommunity: async (name, description, gameTag) => {
        try {
            const { community } = await api.communities.create(name, description, gameTag);
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
                    c.id === communityId ? { ...c, memberCount: c.memberCount + 1 } : c
                )
            }));
        } catch (err) {
            console.error('Join community failed:', err);
        }
    },

    leaveCommunity: async (communityId) => {
        try {
            await api.communities.leave(communityId);
            set(state => ({
                communities: state.communities.map(c =>
                    c.id === communityId ? { ...c, memberCount: Math.max(0, c.memberCount - 1) } : c
                )
            }));
        } catch (err) {
            console.error('Leave community failed:', err);
        }
    },
}));
