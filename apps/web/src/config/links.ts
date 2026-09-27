// Store listing URLs. Set these in `.env` once the app is published; until
// then the download buttons show as "Coming soon".
export const APP_STORE_URL: string | undefined = import.meta.env.VITE_APP_STORE_URL || undefined;
export const PLAY_STORE_URL: string | undefined = import.meta.env.VITE_PLAY_STORE_URL || undefined;
