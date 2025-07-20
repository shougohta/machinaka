import { Platform } from 'react-native';
import { User, Encounter, Location } from '../types';

class ApiService {
  private baseUrl: string;

  constructor() {
    // 環境に応じてAPIのベースURLを設定
    if (Platform.OS === 'web') {
      this.baseUrl = 'http://localhost:3000/api';
    } else {
      // モバイルの場合はローカルIPアドレスを使用
      this.baseUrl = 'http://192.168.1.100:3000/api'; // 実際のIPアドレスに変更
    }
  }

  // APIリクエストのヘルパー
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request failed: ${url}`, error);
      throw error;
    }
  }

  // ユーザー登録
  async registerUser(userData: {
    username: string;
    age: number;
    gender: 'male' | 'female' | 'other';
    interests?: string[];
    seekingType?: 'romance' | 'friendship' | 'hobby';
    bio?: string;
  }): Promise<{ success: boolean; user: User }> {
    return this.request('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // ユーザー情報取得
  async getUser(userId: string): Promise<{ user: User }> {
    return this.request(`/users/${userId}`);
  }

  // ユーザー情報更新
  async updateUser(userId: string, updateData: Partial<User>): Promise<{ success: boolean; user: User }> {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  // 位置情報更新
  async updateLocation(userId: string, location: Location): Promise<{ success: boolean; message: string }> {
    return this.request('/encounters/location', {
      method: 'POST',
      body: JSON.stringify({ userId, location }),
    });
  }

  // 近接検知データ送信
  async sendProximityData(
    userId: string,
    proximityData: {
      deviceId: string;
      location: Location;
      timestamp: Date;
      signalStrength?: number;
    }
  ): Promise<{
    success: boolean;
    encounters: Encounter[];
    nearbyCount: number;
  }> {
    return this.request('/encounters/proximity', {
      method: 'POST',
      body: JSON.stringify({ userId, proximityData }),
    });
  }

  // すれ違い履歴取得
  async getEncounterHistory(
    userId: string,
    limit = 50,
    offset = 0
  ): Promise<{
    encounters: Encounter[];
    total: number;
  }> {
    return this.request(`/encounters/history/${userId}?limit=${limit}&offset=${offset}`);
  }

  // マッチング処理
  async createMatch(
    encounterId: string,
    userId: string
  ): Promise<{
    success: boolean;
    message: string;
    encounter: Encounter;
  }> {
    return this.request('/encounters/match', {
      method: 'POST',
      body: JSON.stringify({ encounterId, userId }),
    });
  }

  // アクティブユーザー数取得
  async getActiveUsers(): Promise<{ activeUsers: number }> {
    return this.request('/encounters/active-users');
  }

  // ヘルスチェック
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request('/health', {}, );
  }

  // ユーザーリスト取得（管理用）
  async getUserList(
    limit = 20,
    offset = 0
  ): Promise<{
    users: User[];
    total: number;
  }> {
    return this.request(`/users?limit=${limit}&offset=${offset}`);
  }

  // エラーハンドリング用のヘルパー
  handleApiError(error: unknown): string {
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch')) {
        return 'ネットワーク接続を確認してください';
      }
      if (error.message.includes('500')) {
        return 'サーバーエラーが発生しました';
      }
      if (error.message.includes('404')) {
        return 'データが見つかりません';
      }
      if (error.message.includes('400')) {
        return '入力データに問題があります';
      }
      return error.message;
    }
    return '予期しないエラーが発生しました';
  }

  // ベースURLを取得（デバッグ用）
  getBaseUrl(): string {
    return this.baseUrl;
  }

  // ベースURLを更新（IP変更時など）
  updateBaseUrl(newBaseUrl: string): void {
    this.baseUrl = newBaseUrl;
  }
}

export const apiService = new ApiService();