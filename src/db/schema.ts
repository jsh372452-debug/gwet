import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface User {
    id: string;
    username: string;
    passwordHash: string;
    salt: string;
    profileDataEncrypted: string;
    created_at: string;
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
    image: Blob | null;
    created_at: string;
    userId: string;
    username: string;
    gameTag: string;
    wowCount: number;
    is_deleted: boolean;
    visibility: 'public' | 'private';
}

export interface Comment {
    id: string;
    postId: string;
    userId: string;
    username: string;
    content: string;
    created_at: string;
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
    communityId: string | null; // null if standalone
    name: string;
    description: string;
    ownerId: string;
    members: string[];
    created_at: string;
    type: 'community_sub' | 'standalone';
}

export interface Message {
    id: string;
    content: string;
    image: Blob | null;
    created_at: string;
    userId: string;
    targetId: string; // CommunityId, GroupId, or UserId (for private)
    type: 'global' | 'community' | 'group' | 'private';
}

interface GwetDB extends DBSchema {
    users: {
        key: string;
        value: User;
        indexes: { 'by-username': string };
    };
    messages: {
        key: string;
        value: Message;
        indexes: { 'by-user': string, 'by-target': string };
    };
    posts: {
        key: string;
        value: Post;
        indexes: { 'by-user': string, 'by-date': string };
    };
    communities: {
        key: string;
        value: Community;
        indexes: { 'by-owner': string };
    };
    groups: {
        key: string;
        value: Group;
        indexes: { 'by-community': string, 'by-owner': string };
    };
    comments: {
        key: string;
        value: Comment;
        indexes: { 'by-post': string };
    };
}

let dbPromise: Promise<IDBPDatabase<GwetDB>>;

export const initDB = () => {
    dbPromise = openDB<GwetDB>('GWET_OFFLINE', 5, { // Upgrade to v5
        upgrade(db, oldVersion) {
            if (oldVersion < 1) {
                const userStore = db.createObjectStore('users', { keyPath: 'id' });
                userStore.createIndex('by-username', 'username', { unique: true });

                const msgStore = db.createObjectStore('messages', { keyPath: 'id' });
                msgStore.createIndex('by-user', 'userId');
                msgStore.createIndex('by-target', 'targetId');
            }
            if (oldVersion < 3) {
                if (!db.objectStoreNames.contains('posts')) {
                    const postStore = db.createObjectStore('posts', { keyPath: 'id' });
                    postStore.createIndex('by-user', 'userId');
                    postStore.createIndex('by-date', 'created_at');
                }
                if (!db.objectStoreNames.contains('communities')) {
                    const commStore = db.createObjectStore('communities', { keyPath: 'id' });
                    commStore.createIndex('by-owner', 'ownerId');
                }
            }
            if (oldVersion < 5) {
                if (!db.objectStoreNames.contains('groups')) {
                    const groupStore = db.createObjectStore('groups', { keyPath: 'id' });
                    groupStore.createIndex('by-community', 'communityId');
                    groupStore.createIndex('by-owner', 'ownerId');
                }
                if (!db.objectStoreNames.contains('comments')) {
                    const commentStore = db.createObjectStore('comments', { keyPath: 'id' });
                    commentStore.createIndex('by-post', 'postId');
                }
            }
        },
    });
    return dbPromise;
};

export const getDB = () => dbPromise || initDB();
