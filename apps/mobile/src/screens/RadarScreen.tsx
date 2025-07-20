import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

const RadarScreen = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [nearbyCount, setNearbyCount] = useState(0);
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // レーダーのパルスアニメーション
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

  const toggleScanning = () => {
    if (!isScanning) {
      setIsScanning(true);
      Alert.alert(
        'すれ違い検知開始',
        'バックグラウンドで近くの人を検知します。「ピロン♪」が鳴ったらすれ違いです！',
        [{ text: 'OK' }]
      );
    } else {
      setIsScanning(false);
    }
  };

  const simulateEncounter = () => {
    setNearbyCount(prev => prev + 1);
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
            今日のすれ違い: {nearbyCount}人
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

        {/* デバッグ用 */}
        <TouchableOpacity 
          style={styles.debugButton}
          onPress={simulateEncounter}
        >
          <Text style={styles.debugButtonText}>すれ違いをシミュレート</Text>
        </TouchableOpacity>
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
});

export default RadarScreen;