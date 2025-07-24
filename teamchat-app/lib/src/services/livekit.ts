import { AccessToken } from 'livekit-server-sdk';


const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;

export const generateToken = async (roomName: string, participantName: string) => {
    if (!apiKey || !apiSecret) {
        throw new Error('LiveKit API Key or Secret is not configured');
    }

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