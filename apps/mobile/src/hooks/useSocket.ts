import { useState, useEffect, useCallback, useRef } from 'react';
import { socketService } from '../services/SocketService';
import { Alert, Vibration } from 'react-native';

export interface UseSocketReturn {
  isConnected: boolean;
  socketId: string | null;
  currentUserId: string | null;
  connect: (userId: string) => Promise<boolean>;
  disconnect: () => void;
  sendProximityDetection: (data: {
    userId: string;
    nearbyUsers: string[];
    location: any;
  }) => void;
  sendMatchNotification: (data: {
    userId1: string;
    userId2: string;
    encounterId: string;
  }) => void;
  reconnect: (userId?: string) => Promise<boolean>;
}

export const useSocket = (): UseSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // 接続状態の監視
  useEffect(() => {
    // 接続イベントリスナー
    const handleConnect = () => {
      setIsConnected(true);
      setSocketId(socketService.getSocketId());
      reconnectAttempts.current = 0;
      console.log('Socket connected');
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setSocketId(null);
      console.log('Socket disconnected');
    };

    const handleConnectError = (error: Error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
      
      // 自動再接続の試行
      if (reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current++;
        setTimeout(() => {
          console.log(`Reconnection attempt ${reconnectAttempts.current}`);
          if (currentUserId) {
            socketService.reconnect(currentUserId);
          }
        }, 2000 * reconnectAttempts.current); // 指数バックオフ
      } else {
        Alert.alert(
          'サーバー接続エラー',
          'サーバーに接続できません。ネットワーク接続を確認してください。'
        );
      }
    };

    // すれ違い通知の処理
    const handleEncounterNotification = (data: {
      type: 'proximity';
      fromUserId: string;
      timestamp: string;
      location: any;
    }) => {
      console.log('Encounter notification:', data);
      
      // バイブレーション
      Vibration.vibrate([100, 50, 100]);
      
      // 通知表示
      Alert.alert(
        'ピロン♪',
        'すれ違いました！履歴を確認してみてください。',
        [{ text: 'OK' }]
      );
    };

    // マッチ成功通知の処理
    const handleMatchSuccess = (data: {
      encounterId: string;
      timestamp: string;
    }) => {
      console.log('Match success:', data);
      
      // バイブレーション
      Vibration.vibrate([200, 100, 200, 100, 200]);
      
      // 通知表示
      Alert.alert(
        '🎉 マッチしました！',
        '相互いいねが成立しました。メッセージを送ってみましょう！',
        [{ text: 'OK' }]
      );
    };

    // イベントリスナーを登録
    socketService.on('connect', handleConnect);
    socketService.on('disconnect', handleDisconnect);
    socketService.on('connect_error', handleConnectError);
    socketService.on('encounter-notification', handleEncounterNotification);
    socketService.on('match-success', handleMatchSuccess);

    // クリーンアップ
    return () => {
      socketService.off('connect', handleConnect);
      socketService.off('disconnect', handleDisconnect);
      socketService.off('connect_error', handleConnectError);
      socketService.off('encounter-notification', handleEncounterNotification);
      socketService.off('match-success', handleMatchSuccess);
    };
  }, [currentUserId]);

  // 接続
  const connect = useCallback(async (userId: string): Promise<boolean> => {
    try {
      setCurrentUserId(userId);
      const success = await socketService.connect(userId);
      return success;
    } catch (error) {
      console.error('Failed to connect:', error);
      return false;
    }
  }, []);

  // 切断
  const disconnect = useCallback(() => {
    socketService.disconnect();
    setCurrentUserId(null);
  }, []);

  // 近接検知を送信
  const sendProximityDetection = useCallback((data: {
    userId: string;
    nearbyUsers: string[];
    location: any;
  }) => {
    socketService.sendProximityDetection(data);
  }, []);

  // マッチング通知を送信
  const sendMatchNotification = useCallback((data: {
    userId1: string;
    userId2: string;
    encounterId: string;
  }) => {
    socketService.sendMatchNotification(data);
  }, []);

  // 再接続
  const reconnect = useCallback(async (userId?: string): Promise<boolean> => {
    const userIdToUse = userId || currentUserId;
    if (!userIdToUse) {
      console.warn('No user ID available for reconnection');
      return false;
    }

    try {
      const success = await socketService.reconnect(userIdToUse);
      if (success) {
        setCurrentUserId(userIdToUse);
      }
      return success;
    } catch (error) {
      console.error('Failed to reconnect:', error);
      return false;
    }
  }, [currentUserId]);

  // 定期的な接続状態の確認
  useEffect(() => {
    const checkConnection = setInterval(() => {
      const connected = socketService.getIsConnected();
      const currentSocketId = socketService.getSocketId();
      
      if (connected !== isConnected) {
        setIsConnected(connected);
      }
      
      if (currentSocketId !== socketId) {
        setSocketId(currentSocketId);
      }
    }, 5000); // 5秒間隔

    return () => clearInterval(checkConnection);
  }, [isConnected, socketId]);

  return {
    isConnected,
    socketId,
    currentUserId,
    connect,
    disconnect,
    sendProximityDetection,
    sendMatchNotification,
    reconnect,
  };
};