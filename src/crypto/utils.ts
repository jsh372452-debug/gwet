export const CryptoUtils = {
    // Generate a random salt
    generateSalt: () => {
        return window.crypto.getRandomValues(new Uint8Array(16));
    },

    // Hash password using SHA-256
    hashPassword: async (password: string, salt: Uint8Array) => {
        const encoder = new TextEncoder();
        const data = encoder.encode(password + Array.from(salt).join(''));
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hashBuffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    },

    // Derive encryption key from password (PBKDF2)
    deriveKey: async (password: string, salt: Uint8Array) => {
        const encoder = new TextEncoder();
        const baseKey = await window.crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            'PBKDF2',
            false,
            ['deriveKey']
        );

        return window.crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt as any,
                iterations: 100000,
                hash: 'SHA-256'
            },
            baseKey,
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt', 'decrypt']
        );
    },

    // Encrypt data
    encrypt: async (text: string, key: CryptoKey) => {
        const encoder = new TextEncoder();
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await window.crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            key,
            encoder.encode(text)
        );

        return {
            ciphertext: Array.from(new Uint8Array(encrypted)),
            iv: Array.from(iv)
        };
    },

    // Decrypt data
    decrypt: async (ciphertext: number[], iv: number[], key: CryptoKey) => {
        const decrypted = await window.crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: new Uint8Array(iv) },
            key,
            new Uint8Array(ciphertext)
        );
        const decoder = new TextDecoder();
        return decoder.decode(decrypted);
    }
};
