// Re-export shared types
export * from '../../../packages/shared/src/types';

// Navigation types
export type RootStackParamList = {
  Main: undefined;
  Profile: { userId?: string };
  EncounterDetail: { encounterId: string };
};

export type MainTabParamList = {
  Radar: undefined;
  History: undefined;
  Settings: undefined;
};

// App-specific types
export interface AppState {
  isLocationEnabled: boolean;
  isBluetoothEnabled: boolean;
  currentUser: any | null;
  isConnected: boolean;
}