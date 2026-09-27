export interface UserProfile {
  name: string;
  avatarUrl?: string;
  primaryNeighborhood: string;
}

export interface AppPreferences {
  powerStatusAlerts: boolean;
  communityUpdates: boolean;
  darkMode: boolean;
  dataSaverMode: boolean;
  language: string;
}