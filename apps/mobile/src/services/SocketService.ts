import { io, Socket } from 'socket.io-client';
import { Platform } from 'react-native';

export interface SocketEvents {
  // クライアント -> サーバー
  'user-register': (userId: string) => void;
  'proximity-detected': (data: {
    userId: string;
    nearbyUsers: string[];
    location: any;
  }) => void;
  'match-notification': (data: {
    userId1: string;
    userId2: string;
    encounterId: string;
  }) => void;

  // サーバー -> クライアント
  'encounter-notification': (data: {
    type: 'proximity';
    fromUserId: string;
    timestamp: string;
    location: any;
  }) => void;
  'match-success': (data: {
    encounterId: string;
    timestamp: string;
  }) => void;
  'connect': () => void;
  'disconnect': () => void;
  'connect_error': (error: Error) => void;
}

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private currentUserId: string | null = null;
  private eventListeners: Map<string, Function[]> = new Map();

  // サーバーURLを環境に応じて設定
  private getServerUrl(): string {
    if (Platform.OS === 'web') {
      return 'http://localhost:3000';
    }
    // モバイルの場合はローカルIPアドレスを使用
    return 'http://192.168.1.100:3000'; // 実際のIPアドレスに変更
  }

  // 接続を初期化
  connect(userId?: string): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        if (this.socket?.connected) {
          console.log('Already connected to server');
          resolve(true);
          return;
        }

        const serverUrl = this.getServerUrl();
        console.log('Connecting to server:', serverUrl);

        this.socket = io(serverUrl, {
          transports: ['websocket', 'polling'],
          timeout: 10000,
          forceNew: true,
        });

        this.socket.on('connect', () => {
          console.log('Connected to server:', this.socket?.id);
          this.isConnected = true;
          
          // ユーザーIDを登録
          if (userId) {
            this.registerUser(userId);
          }
          
          this.notifyListeners('connect');
          resolve(true);
        });

        this.socket.on('disconnect', (reason) => {
          console.log('Disconnected from server:', reason);
          this.isConnected = false;
          this.notifyListeners('disconnect');
        });

        this.socket.on('connect_error', (error) => {
          console.error('Connection error:', error);
          this.isConnected = false;
          this.notifyListeners('connect_error', error);
          resolve(false);
        });

        // すれ違い通知を受信
        this.socket.on('encounter-notification', (data) => {
          console.log('Encounter notification received:', data);
          this.notifyListeners('encounter-notification', data);
        });

        // マッチ成功通知を受信
        this.socket.on('match-success', (data) => {
          console.log('Match success received:', data);
          this.notifyListeners('match-success', data);
        });

      } catch (error) {
        console.error('Failed to connect:', error);
        resolve(false);
      }
    });
  }

  // 接続を切断
  disconnect(): void {
    if (this.socket) {
      console.log('Disconnecting from server');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.currentUserId = null;
    }
  }

  // ユーザーIDを登録
  registerUser(userId: string): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected');
      return;
    }

    this.currentUserId = userId;
    this.socket.emit('user-register', userId);
    console.log('User registered:', userId);
  }

  // 近接検知をサーバーに送信
  sendProximityDetection(data: {
    userId: string;
    nearbyUsers: string[];
    location: any;
  }): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected');
      return;
    }

    this.socket.emit('proximity-detected', data);
    console.log('Proximity detection sent:', data);
  }

  // マッチング通知をサーバーに送信
  sendMatchNotification(data: {
    userId1: string;
    userId2: string;
    encounterId: string;
  }): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected');
      return;
    }

    this.socket.emit('match-notification', data);
    console.log('Match notification sent:', data);
  }

  // イベントリスナーを追加
  on<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)?.push(callback);
  }

  // イベントリスナーを削除
  off<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // すべてのイベントリスナーを削除
  removeAllListeners(): void {
    this.eventListeners.clear();
  }

  // 接続状態を取得
  getIsConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  // 現在のユーザーIDを取得
  getCurrentUserId(): string | null {
    return this.currentUserId;
  }

  // Socket IDを取得
  getSocketId(): string | null {
    return this.socket?.id || null;
  }

  // リスナーに通知
  private notifyListeners(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  // 接続の再試行
  async reconnect(userId?: string): Promise<boolean> {
    this.disconnect();
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1秒待機
    return this.connect(userId);
  }

  // ハートビート（接続確認）
  startHeartbeat(): void {
    if (this.isConnected) {
      setInterval(() => {
        if (this.socket?.connected) {
          this.socket.emit('ping');
        }
      }, 30000); // 30秒間隔
    }
  }
}

export const socketService = new SocketService();