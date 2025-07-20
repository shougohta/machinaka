export interface User {
  id: string;
  username: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  interests: string[];
  seekingType: 'romance' | 'friendship' | 'hobby';
  profilePicture?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Encounter {
  id: string;
  userId1: string;
  userId2: string;
  location: Location;
  timestamp: Date;
  isMatched: boolean;
  distance?: number;
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  placeType?: 'cafe' | 'library' | 'station' | 'park' | 'other';
}

export interface Match {
  id: string;
  encounterId: string;
  user1: User;
  user2: User;
  timestamp: Date;
  status: 'pending' | 'accepted' | 'rejected';
  messages?: Message[];
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

export interface ProximityEvent {
  deviceId: string;
  location: Location;
  timestamp: Date;
  signalStrength?: number;
}

export interface NotificationPayload {
  type: 'encounter' | 'match' | 'message';
  title: string;
  body: string;
  data?: any;
}