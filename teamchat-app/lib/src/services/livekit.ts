import { AccessToken } from 'livekit-server-sdk';

const livekitUrl = process.env.LIVEKIT_URL || 'wss://duan-kryqhcty.livekit.cloud';
const apiKey = process.env.LIVEKIT_API_KEY || 'APIWLZbdGRmonek';
const apiSecret = process.env.LIVEKIT_API_SECRET || 'CZKVsE1fRuL3VvyWqknDdz0nJmztpH6pR0QNjD1IvXF';

export const generateToken = async (roomName: string, participantName: string) => {
    const token = new AccessToken(apiKey, apiSecret, {
        identity: participantName,
        ttl: '10m',
    });

    token.addGrant({
        room: roomName,
        roomJoin: true,
        canPublish: true,
        canSubscribe: true,
    });

    return token.toJwt();
};

export const createRoom = async (roomName: string) => {
    try {
        const response = await fetch('/api/videocall/create-room', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ roomName }),
        });

        if (!response.ok) {
            throw new Error('Failed to create room');
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating room:', error);
        throw error;
    }
};

export const joinRoom = async (roomName: string, participantName: string) => {
    try {
        const response = await fetch('/api/videocall/join-room', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ roomName, participantName }),
        });

        if (!response.ok) {
            throw new Error('Failed to join room');
        }

        return await response.json();
    } catch (error) {
        console.error('Error joining room:', error);
        throw error;
    }
};

export { livekitUrl };