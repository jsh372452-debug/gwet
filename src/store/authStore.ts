import { create } from 'zustand';
import { getDB } from '../db/schema';
import { CryptoUtils } from '../crypto/utils';

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

interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
    encryptionKey: any | null; // CryptoKey
    login: (u: string, p: string) => Promise<void>;
    register: (u: string, p: string) => Promise<void>;
    signOut: () => void;
    checkSession: () => Promise<void>;
    updateProfile: (displayName: string, avatarUrl: string) => Promise<void>;
    updateIdentity: (country: string, language: 'ar' | 'en') => Promise<void>;
    addXP: (amount: number) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    encryptionKey: null,
    loading: true,
    error: null,

    updateProfile: async (displayName, avatarUrl) => {
        const { user } = get();
        if (!user) return;
        const updatedUser = { ...user, displayName, avatarUrl, isOnboarded: true };
        set({ user: updatedUser });

        const db = await getDB();
        const record = await db.get('users', user.id);
        if (record) {
            await db.put('users', { ...record, displayName, avatarUrl, isOnboarded: true });
        }
        sessionStorage.setItem('gwet_session', JSON.stringify({ user: updatedUser }));
    },

    updateIdentity: async (country, language) => {
        const { user } = get();
        if (!user) return;
        const updatedUser = { ...user, country, language };
        set({ user: updatedUser });

        const db = await getDB();
        const record = await db.get('users', user.id);
        if (record) {
            await db.put('users', { ...record, country, language });
        }
        sessionStorage.setItem('gwet_session', JSON.stringify({ user: updatedUser }));
    },

    addXP: (amount) => {
        const { user } = get();
        if (!user) return;

        let newXP = user.xp + amount;
        let newLevel = user.level;
        let leveledUp = false;

        while (newXP >= 100) {
            newXP -= 100;
            newLevel += 1;
            leveledUp = true;
        }

        const ranks = ['ROOKIE', 'SOLDIER', 'ELITE', 'COMMANDER', 'LEGEND'];
        const rankIndex = Math.min(Math.floor(newLevel / 5), ranks.length - 1);
        const newRank = ranks[rankIndex];

        const updatedUser = { ...user, xp: newXP, level: newLevel, rank: newRank };
        set({ user: updatedUser });

        sessionStorage.setItem('gwet_session', JSON.stringify({ user: updatedUser }));
        if (leveledUp) console.log(`LEVEL UP! Level ${newLevel}`);
    },

    checkSession: async () => {
        const session = sessionStorage.getItem('gwet_session');
        if (session) {
            const { user } = JSON.parse(session);
            set({ user, loading: false });
        } else {
            set({ loading: false });
        }
    },

    register: async (username, password) => {
        set({ loading: true, error: null });
        try {
            const db = await getDB();
            const salt = CryptoUtils.generateSalt();
            const passwordHash = await CryptoUtils.hashPassword(password, salt);
            const userId = crypto.randomUUID();

            const newUser: User = {
                id: userId,
                username,
                displayName: username,
                avatarUrl: '',
                xp: 0,
                level: 1,
                rank: 'ROOKIE',
                isOnboarded: false,
                country: 'Global',
                language: 'en'
            };

            await db.add('users', {
                ...newUser,
                passwordHash,
                salt: Array.from(salt).join(','),
                profileDataEncrypted: '',
                created_at: new Date().toISOString()
            });

            const key = await CryptoUtils.deriveKey(password, salt);
            set({ user: newUser, encryptionKey: key, loading: false });
            sessionStorage.setItem('gwet_session', JSON.stringify({ user: newUser }));
        } catch (err: any) {
            set({ error: err.message || 'Registration failed', loading: false });
        }
    },

    login: async (username, password) => {
        set({ loading: true, error: null });
        try {
            const db = await getDB();
            const userRecords = await db.getAllFromIndex('users', 'by-username', username);

            if (userRecords.length === 0) throw new Error('User not found');
            const record = userRecords[0];

            const salt = new Uint8Array(record.salt.split(',').map(Number));
            const currentHash = await CryptoUtils.hashPassword(password, salt);

            if (currentHash !== record.passwordHash) throw new Error('Invalid password');

            const key = await CryptoUtils.deriveKey(password, salt);
            const user: User = {
                id: record.id,
                username: record.username,
                displayName: record.displayName || record.username,
                avatarUrl: record.avatarUrl || '',
                isOnboarded: record.isOnboarded || false,
                xp: record.xp || 0,
                level: record.level || 1,
                rank: record.rank || 'ROOKIE',
                country: record.country || 'Global',
                language: record.language || 'en'
            };

            set({ user, encryptionKey: key, loading: false });
            sessionStorage.setItem('gwet_session', JSON.stringify({ user }));
        } catch (err: any) {
            set({ error: err.message || 'Login failed', loading: false });
        }
    },

    signOut: () => {
        set({ user: null, encryptionKey: null });
        sessionStorage.removeItem('gwet_session');
    },
}));
