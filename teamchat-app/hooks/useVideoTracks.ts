import { useState, useEffect, useCallback } from 'react';
import { LocalParticipant, RemoteParticipant, Track, LocalTrackPublication, RemoteTrackPublication } from 'livekit-client';

export interface VideoTrackState {
    hasVideo: boolean;
    isMuted: boolean;
    isSubscribed: boolean;
    trackPublication: LocalTrackPublication | RemoteTrackPublication | undefined;
}

export const useVideoTracks = (participant: LocalParticipant | RemoteParticipant, isLocal: boolean) => {
    const [videoState, setVideoState] = useState<VideoTrackState>({
        hasVideo: false,
        isMuted: true,
        isSubscribed: false,
        trackPublication: undefined
    });

    const updateVideoState = useCallback(() => {
        const videoPublication = participant.getTrackPublication(Track.Source.Camera);

        if (isLocal) {
            // For local participant
            const localPub = videoPublication as LocalTrackPublication | undefined;
            setVideoState({
                hasVideo: participant.isCameraEnabled && !!localPub?.track,
                isMuted: !participant.isCameraEnabled,
                isSubscribed: true, // Local is always "subscribed"
                trackPublication: localPub
            });
        } else {
            // For remote participant
            const remotePub = videoPublication as RemoteTrackPublication | undefined;
            setVideoState({
                hasVideo: !!remotePub?.track && remotePub.isSubscribed && !remotePub.isMuted,
                isMuted: !!remotePub?.isMuted,
                isSubscribed: !!remotePub?.isSubscribed,
                trackPublication: remotePub
            });
        }
    }, [participant, isLocal]);

    useEffect(() => {
        // Initial state
        updateVideoState();

        // Event listeners
        const events = [
            'trackPublished',
            'trackUnpublished',
            'trackSubscribed',
            'trackUnsubscribed',
            'trackMuted',
            'trackUnmuted'
        ];

        // Add remote-specific events
        if (!isLocal) {
            events.push('trackSubscriptionPermissionChanged', 'trackStreamStateChanged');
        }

        // Attach listeners with proper typing
        events.forEach(event => {
            (participant as any).on(event, updateVideoState);
        });

        // For local participant, also listen to camera enable/disable
        if (isLocal) {
            const localParticipant = participant as LocalParticipant;
            // Poll for camera state changes since there's no direct event
            const interval = setInterval(updateVideoState, 200);

            setTimeout(() => {
                clearInterval(interval);
            }, 10000); // Stop after 10 seconds

            return () => {
                clearInterval(interval);
                events.forEach(event => {
                    (participant as any).off(event, updateVideoState);
                });
            };
        }

        return () => {
            events.forEach(event => {
                (participant as any).off(event, updateVideoState);
            });
        };
    }, [participant, isLocal, updateVideoState]);

    return videoState;
};