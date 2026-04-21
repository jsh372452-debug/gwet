import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Lock } from 'lucide-react';

export const GooglePasswordSetup: React.FC<{onComplete: () => void}> = ({onComplete}) => {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: password,
                data: { google_password_set: true }
            });
            if (updateError) throw updateError;
            setSuccess(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--bg-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                <div style={{ maxWidth: '400px', width: '100%', padding: '40px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--success)', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>✓</div>
                    <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.5px' }}>SECURE ACCESS CONFIRMED</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>Your secondary passkey has been configured successfully.</p>
                    <button onClick={onComplete} className="btn btn-primary" style={{ width: '100%', background: 'var(--text-primary)', color: 'var(--bg-deep)' }}>PROCEED</button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <div style={{ maxWidth: '400px', width: '100%', padding: '40px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.5px' }}>INITIALIZE PASSKEY</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>You authenticated via an external provider. Please establish a secure passkey to finalize setup before entering the platform.</p>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Secure Passkey</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input 
                                className="input" 
                                style={{ paddingLeft: '48px' }}
                                placeholder="••••••••"
                                type="password"
                                required
                                minLength={8}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>
                    {error && <div style={{ color: 'var(--danger)', fontSize: '12px' }}>{error}</div>}
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ background: 'var(--text-primary)', color: 'var(--bg-deep)' }}>
                        {loading ? 'PROCESSING...' : 'CONFIRM PASSKEY'}
                    </button>
                </form>
            </div>
        </div>
    );
};
