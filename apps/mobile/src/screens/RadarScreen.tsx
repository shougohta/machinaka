import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Alert,
  FlatList
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useBluetooth } from '../hooks/useBluetooth';
import { useSocket } from '../hooks/useSocket';
import { apiService } from '../services/ApiService';

const RadarScreen = () => {
  const [pulseAnim] = useState(new Animated.Value(1));
  const [currentUserId] = useState(`user_${Math.random().toString(36).substr(2, 9)}`); // 仮のユーザーID
  
  const {
    isScanning,
    detectedDevices,
    nearbyCount,
    isBluetoothAvailable,
    hasPermission,
    currentLocation,
    startScanning,
    stopScanning,
    requestPermissions,
  } = useBluetooth();

  const {
    isConnected: isSocketConnected,
    connect: connectSocket,
    disconnect: disconnectSocket,
    sendProximityDetection,
    reconnect: reconnectSocket,
  } = useSocket();

  // Socket接続を初期化
  useEffect(() => {
    const initializeConnection = async () => {
      try {
        await connectSocket(currentUserId);
      } catch (error) {
        console.error('Socket connection failed:', error);
      }
    };

    initializeConnection();

    return () => {
      disconnectSocket();
    };
  }, [currentUserId, connectSocket, disconnectSocket]);

  // レーダーのパルスアニメーション
  useEffect(() => {
    const startPulse = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    if (isScanning) {
      startPulse();
    }
  }, [isScanning, pulseAnim]);

  // 検出されたデバイスをサーバーに送信
  useEffect(() => {
    if (detectedDevices.length > 0 && currentLocation && isSocketConnected) {
      const nearbyUserIds = detectedDevices.map(device => device.id);
      
      // APIサービス経由でサーバーに送信
      const sendToServer = async () => {
        try {
          // 位置情報を更新
          await apiService.updateLocation(currentUserId, {
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
            address: '現在位置',
          });

          // 近接検知データを送信
          await apiService.sendProximityData(currentUserId, {
            deviceId: currentUserId,
            location: {
              latitude: currentLocation.coords.latitude,
              longitude: currentLocation.coords.longitude,
            },
            timestamp: new Date(),
          });

          // Socket経由でリアルタイム通知
          sendProximityDetection({
            userId: currentUserId,
            nearbyUsers: nearbyUserIds,
            location: {
              latitude: currentLocation.coords.latitude,
              longitude: currentLocation.coords.longitude,
            },
          });

        } catch (error) {
          console.error('Failed to send proximity data:', error);
        }
      };

      sendToServer();
    }
  }, [detectedDevices, currentLocation, isSocketConnected, currentUserId, sendProximityDetection]);

  const toggleScanning = async () => {
    if (!isScanning) {
      // 権限チェック
      if (!hasPermission) {
        const granted = await requestPermissions();
        if (!granted) {
          Alert.alert(
            '権限が必要です',
            'Bluetoothと位置情報の権限が必要です。設定から許可してください。'
          );
          return;
        }
      }

      // Bluetooth利用可能性チェック
      if (!isBluetoothAvailable) {
        Alert.alert(
          'Bluetoothが無効です',
          'Bluetoothを有効にしてからお試しください。'
        );
        return;
      }

      const success = await startScanning({
        rssiThreshold: -60, // 60dBm以内
        scanDuration: 5000, // 5秒間隔
      });

      if (success) {
        Alert.alert(
          'すれ違い検知開始',
          'バックグラウンドで近くの人を検知します。「ピロン♪」が鳴ったらすれ違いです！',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'エラー',
          'スキャンの開始に失敗しました。'
        );
      }
    } else {
      stopScanning();
    }
  };

  const simulateEncounter = () => {
    Alert.alert(
      'ピロン♪',
      'すれ違いました！後で履歴を確認してみてください。',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.title}>まちなか</Text>
        <View style={styles.statusContainer}>
          <Ionicons 
            name={isScanning ? "radio" : "radio-outline"} 
            size={20} 
            color={isScanning ? "#4CAF50" : "#666"} 
          />
          <Text style={[styles.statusText, { color: isScanning ? "#4CAF50" : "#666" }]}>
            {isScanning ? "検知中" : "停止中"}
          </Text>
          <Ionicons 
            name={isSocketConnected ? "wifi" : "wifi-outline"} 
            size={20} 
            color={isSocketConnected ? "#4CAF50" : "#FF6B6B"} 
          />
          <Text style={[styles.statusText, { color: isSocketConnected ? "#4CAF50" : "#FF6B6B" }]}>
            {isSocketConnected ? "接続中" : "未接続"}
          </Text>
        </View>
      </View>

      {/* レーダー表示エリア */}
      <View style={styles.radarContainer}>
        <Animated.View 
          style={[
            styles.radarCircle,
            { transform: [{ scale: pulseAnim }] }
          ]}
        >
          <View style={styles.radarCenter}>
            <Ionicons name="person" size={30} color="#fff" />
          </View>
        </Animated.View>
        
        {/* すれ違い数表示 */}
        {nearbyCount > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{nearbyCount}</Text>
          </View>
        )}

        {/* 検出されたデバイス一覧 */}
        {detectedDevices.length > 0 && (
          <View style={styles.deviceList}>
            {detectedDevices.slice(0, 3).map((device, index) => (
              <View key={device.id} style={styles.deviceDot}>
                <Text style={styles.deviceText}>{device.name?.substring(0, 1) || '?'}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* 状態テキスト */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          {isScanning ? 
            "近くの人を検知しています..." : 
            "タップして検知を開始"}
        </Text>
        {nearbyCount > 0 && (
          <Text style={styles.encounterText}>
            今検知中: {nearbyCount}人
          </Text>
        )}
        {currentLocation && (
          <Text style={styles.locationText}>
            📍 {currentLocation.coords.latitude.toFixed(4)}, {currentLocation.coords.longitude.toFixed(4)}
          </Text>
        )}
        {!isBluetoothAvailable && (
          <Text style={styles.warningText}>
            ⚠️ Bluetoothが無効です
          </Text>
        )}
        {!hasPermission && (
          <Text style={styles.warningText}>
            ⚠️ 権限が必要です
          </Text>
        )}
      </View>

      {/* コントロールボタン */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity 
          style={[styles.mainButton, isScanning && styles.activeButton]}
          onPress={toggleScanning}
        >
          <Ionicons 
            name={isScanning ? "pause" : "play"} 
            size={24} 
            color="#fff" 
          />
          <Text style={styles.buttonText}>
            {isScanning ? "停止" : "開始"}
          </Text>
        </TouchableOpacity>

        {/* デバッグ用ボタン */}
        <TouchableOpacity 
          style={styles.debugButton}
          onPress={simulateEncounter}
        >
          <Text style={styles.debugButtonText}>すれ違いをシミュレート</Text>
        </TouchableOpacity>

        {/* Socket再接続ボタン */}
        {!isSocketConnected && (
          <TouchableOpacity 
            style={styles.reconnectButton}
            onPress={() => reconnectSocket(currentUserId)}
          >
            <Ionicons name="refresh" size={16} color="#4CAF50" />
            <Text style={styles.reconnectButtonText}>サーバーに再接続</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  radarContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  radarCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderWidth: 2,
    borderColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radarCenter: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#FF4444',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  infoText: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 8,
  },
  encounterText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  controlsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },
  mainButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 25,
    gap: 8,
  },
  activeButton: {
    backgroundColor: '#FF6B6B',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  debugButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  debugButtonText: {
    color: '#ccc',
    fontSize: 14,
  },
  deviceList: {
    position: 'absolute',
    top: -120,
    left: -120,
    right: -120,
    bottom: -120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceDot: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  deviceText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  locationText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 4,
  },
  warningText: {
    fontSize: 12,
    color: '#FF6B6B',
    textAlign: 'center',
    marginTop: 4,
  },
  reconnectButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4CAF50',
    gap: 6,
  },
  reconnectButtonText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default RadarScreen;