// ─── ElevenLabs Voice Options ─────────────────────────────
// Voices selected for natural, engaging book conversations
export const voiceOptions = {
    // Male voices
    dave: { id: 'CYw3kZ02Hs0563khs1Fj', name: 'Dave', description: 'Young male, British-Essex, casual & conversational', gender: 'male' },
    daniel: { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', description: 'Middle-aged male, British, authoritative but warm', gender: 'male' },
    chris: { id: 'iP95p4xoKVk53GoZ742B', name: 'Chris', description: 'Male, casual & easy-going', gender: 'male' },
    // Female voices
    rachel: { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', description: 'Young female, American, calm & clear', gender: 'female' },
    sarah: { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', description: 'Young female, American, soft & approachable', gender: 'female' },
};

export const voiceCategories = {
    male: ['dave', 'daniel', 'chris'],
    female: ['rachel', 'sarah'],
};

export const DEFAULT_VOICE = 'rachel';

// ElevenLabs voice settings for conversational AI
export const VOICE_SETTINGS = {
    stability: 0.45,
    similarityBoost: 0.75,
    style: 0,
    useSpeakerBoost: true,
    speed: 1.0,
};

// ─── VAPI Configuration ───────────────────────────────
// Public key for VAPI Web SDK
export const VAPI_PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY;

// Assistant ID — only available after deployment
// Set this in .env as VITE_VAPI_ASSISTANT_ID once your app is deployed
export const VAPI_ASSISTANT_ID = import.meta.env.VITE_VAPI_ASSISTANT_ID;

// Whether to use VAPI (deployed) or browser speech (local dev)
// Automatically detects: if assistant ID is set, use VAPI; otherwise use local mode
export const USE_VAPI = !!VAPI_ASSISTANT_ID && VAPI_ASSISTANT_ID !== 'YOUR_ASSISTANT_ID_HERE';

// VAPI Dashboard Config Reference — configure these in the VAPI Dashboard for the assistant
// Kept here for reference and documentation purposes
export const VAPI_DASHBOARD_CONFIG = {
    startSpeakingPlan: {
        smartEndpointingEnabled: true,
        waitSeconds: 0.4,
    },
    stopSpeakingPlan: {
        numWords: 2,
        voiceSeconds: 0.2,
        backoffSeconds: 1.0,
    },
    silenceTimeoutSeconds: 30,
    responseDelaySeconds: 0.4,
    llmRequestDelaySeconds: 0.1,
    backgroundDenoisingEnabled: true,
    backchannelingEnabled: true,
    fillerInjectionEnabled: false,
};
