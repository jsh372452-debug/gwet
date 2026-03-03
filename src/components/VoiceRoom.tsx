import React, { useEffect, useState } from 'react';
import {
    LiveKitRoom,
    VideoConference,
    RoomAudioRenderer,
    ControlBar,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { api } from '../lib/api';
import { Loader, Mic, MicOff, PhoneOff } from 'lucide-react';

// Workaround for LiveKitRoom JSX type mismatch in some React versions
const LiveKitRoomAny = LiveKitRoom as any;

interface Props {
    squadId: string;
    onDisconnect: () => void;
    mini?: boolean;
}

export const VoiceRoom: React.FC<Props> = ({ squadId, onDisconnect, mini }) => {
    const [token, setToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // LiveKit Cloud URL - Typically something like: wss://gwet-xxxx.livekit.cloud
    const serverUrl = 'wss://gwet-hwfkimmx.livekit.cloud';

    useEffect(() => {
        const fetchToken = async () => {
            try {
                const { token } = await api.squads.getVoiceToken(squadId);
                setToken(token);
            } catch (err: any) {
                console.error('Failed to get LiveKit token:', err);
                setError(err.message || 'Failed to join voice room');
            }
        };

        fetchToken();
    }, [squadId]);

    if (error) {
        return (
            <div className="card" style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
                <p style={{ color: 'var(--error)', marginBottom: 'var(--space-md)' }}>{error}</p>
                <button className="btn" onClick={onDisconnect}>Back to Chat</button>
            </div>
        );
    }

    if (!token) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 'var(--space-md)' }}>
                <Loader className="spin" size={32} color="var(--primary)" />
                <p style={{ fontWeight: 700, fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>INITIALIZING VOICE ENCRYPTION...</p>
            </div>
        );
    }

    if (mini) {
        return (
            <LiveKitRoomAny
                audio={true}
                token={token}
                serverUrl={serverUrl}
                onDisconnected={onDisconnect}
                style={{ height: '100%', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', border: '1px solid var(--border-active)', display: 'flex', alignItems: 'center', padding: '0 var(--space-md)', gap: 'var(--space-md)' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', flex: 1 }}>
                    <div className="pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }}></div>
                    <span style={{ fontSize: 'var(--font-xs)', fontWeight: 800 }}>SQUAD VOICE ACTIVE</span>
                </div>
                <ControlBar variation="minimal" controls={{ camera: false, screenShare: false }} />
                <button className="btn ghost icon-only" onClick={onDisconnect}><PhoneOff size={14} color="var(--error)" /></button>
            </LiveKitRoomAny>
        );
    }

    return (
        <LiveKitRoomAny
            video={false}
            audio={true}
            token={token}
            serverUrl={serverUrl}
            onDisconnected={onDisconnect}
            data-lk-theme="default"
            style={{ height: '100%', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)' }}
        >
            <VideoConference />
            {/* Custom styles to match GWET Premium Gaming Aesthetic */}
            <style>{`
        .lk-video-conference { background: var(--bg-base); }
        .lk-control-bar { background: var(--bg-elevated); border-top: 1px solid var(--border); }
        .lk-button { border-radius: var(--radius-sm); font-family: inherit; font-weight: 700; text-transform: uppercase; font-size: 10px; }
        .lk-audio-visualizer { color: var(--primary); }
        .lk-control-bar button { height: 32px !important; }
      `}</style>
        </LiveKitRoomAny>
    );
};
