import { useState, useEffect, useCallback } from 'react';
import { bluetoothService, BluetoothDevice, ProximityDetectionOptions } from '../services/BluetoothService';
import * as Location from 'expo-location';

export interface UseBluetoothReturn {
  isScanning: boolean;
  detectedDevices: BluetoothDevice[];
  nearbyCount: number;
  isBluetoothAvailable: boolean;
  hasPermission: boolean;
  currentLocation: Location.LocationObject | null;
  startScanning: (options?: ProximityDetectionOptions) => Promise<boolean>;
  stopScanning: () => void;
  requestPermissions: () => Promise<boolean>;
}

export const useBluetooth = (): UseBluetoothReturn => {
  const [isScanning, setIsScanning] = useState(false);
  const [detectedDevices, setDetectedDevices] = useState<BluetoothDevice[]>([]);
  const [isBluetoothAvailable, setIsBluetoothAvailable] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);

  // Bluetooth状態を初期化
  useEffect(() => {
    const initializeBluetooth = async () => {
      const available = await bluetoothService.isBluetoothAvailable();
      const permission = await bluetoothService.checkBluetoothPermission();
      
      setIsBluetoothAvailable(available);
      setHasPermission(permission);
    };

    initializeBluetooth();
  }, []);

  // 位置情報を取得
  const getCurrentLocation = useCallback(async (): Promise<Location.LocationObject | null> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setCurrentLocation(location);
      return location;
    } catch (error) {
      console.error('Failed to get location:', error);
      return null;
    }
  }, []);

  // デバイス検出時のコールバック
  const handleDeviceDetected = useCallback((device: BluetoothDevice) => {
    setDetectedDevices(prev => {
      const existing = prev.find(d => d.id === device.id);
      if (existing) {
        // 既存デバイスの情報を更新
        return prev.map(d => d.id === device.id ? device : d);
      } else {
        // 新しいデバイスを追加
        return [...prev, device];
      }
    });
  }, []);

  // スキャン状態変更時のコールバック
  const handleScanStateChanged = useCallback((scanning: boolean) => {
    setIsScanning(scanning);
    
    if (!scanning) {
      // スキャン停止時にデバイスリストをクリア
      setDetectedDevices([]);
    }
  }, []);

  // スキャンを開始
  const startScanning = useCallback(async (options?: ProximityDetectionOptions): Promise<boolean> => {
    try {
      // 位置情報を取得
      await getCurrentLocation();

      const success = await bluetoothService.startProximityScanning(
        options,
        handleDeviceDetected,
        handleScanStateChanged
      );

      return success;
    } catch (error) {
      console.error('Failed to start scanning:', error);
      return false;
    }
  }, [getCurrentLocation, handleDeviceDetected, handleScanStateChanged]);

  // スキャンを停止
  const stopScanning = useCallback(() => {
    bluetoothService.stopProximityScanning();
  }, []);

  // 権限をリクエスト
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      // Bluetooth権限
      const bluetoothPermission = await bluetoothService.checkBluetoothPermission();
      
      // 位置情報権限
      const { status } = await Location.requestForegroundPermissionsAsync();
      const locationPermission = status === 'granted';

      const allPermissionsGranted = bluetoothPermission && locationPermission;
      
      setHasPermission(allPermissionsGranted);
      return allPermissionsGranted;
    } catch (error) {
      console.error('Failed to request permissions:', error);
      return false;
    }
  }, []);

  // 定期的にデバイスリストをクリーンアップ
  useEffect(() => {
    if (!isScanning) return;

    const cleanup = setInterval(() => {
      const now = new Date();
      setDetectedDevices(prev => 
        prev.filter(device => 
          now.getTime() - device.timestamp.getTime() < 10000 // 10秒以上古いデバイスを削除
        )
      );
    }, 5000);

    return () => clearInterval(cleanup);
  }, [isScanning]);

  return {
    isScanning,
    detectedDevices,
    nearbyCount: detectedDevices.length,
    isBluetoothAvailable,
    hasPermission,
    currentLocation,
    startScanning,
    stopScanning,
    requestPermissions,
  };
};