import * as Device from 'expo-device';
import { Platform } from 'react-native';

export interface BluetoothDevice {
  id: string;
  name?: string;
  rssi?: number;
  timestamp: Date;
}

export interface ProximityDetectionOptions {
  scanDuration?: number; // ミリ秒
  rssiThreshold?: number; // RSSI閾値
}

class BluetoothService {
  private isScanning = false;
  private scanTimeout?: NodeJS.Timeout;
  private detectedDevices: Map<string, BluetoothDevice> = new Map();
  private onDeviceDetected?: (device: BluetoothDevice) => void;
  private onScanStateChanged?: (isScanning: boolean) => void;

  constructor() {
    // デバイス情報を初期化
    this.initializeDevice();
  }

  private async initializeDevice() {
    console.log('Device Info:', {
      brand: Device.brand,
      manufacturer: Device.manufacturer,
      modelName: Device.modelName,
      osName: Device.osName,
      osVersion: Device.osVersion,
      platform: Platform.OS,
    });
  }

  // Bluetooth権限をチェック
  async checkBluetoothPermission(): Promise<boolean> {
    try {
      // 実際の実装ではPermissionsAPIを使用
      // 現在はシミュレーション
      if (Platform.OS === 'web') {
        return true; // Web版では常にtrue
      }
      
      // TODO: 実際のBluetooth権限チェック
      return true;
    } catch (error) {
      console.error('Bluetooth permission check failed:', error);
      return false;
    }
  }

  // Bluetoothが利用可能かチェック
  async isBluetoothAvailable(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        // Web Bluetooth APIの確認
        return 'bluetooth' in navigator;
      }
      
      // TODO: ネイティブのBluetooth状態確認
      return true;
    } catch (error) {
      console.error('Bluetooth availability check failed:', error);
      return false;
    }
  }

  // 近接スキャンを開始
  async startProximityScanning(
    options: ProximityDetectionOptions = {},
    onDeviceDetected?: (device: BluetoothDevice) => void,
    onScanStateChanged?: (isScanning: boolean) => void
  ): Promise<boolean> {
    try {
      if (this.isScanning) {
        console.log('Already scanning');
        return true;
      }

      const hasPermission = await this.checkBluetoothPermission();
      if (!hasPermission) {
        throw new Error('Bluetooth permission denied');
      }

      const isAvailable = await this.isBluetoothAvailable();
      if (!isAvailable) {
        throw new Error('Bluetooth not available');
      }

      this.onDeviceDetected = onDeviceDetected;
      this.onScanStateChanged = onScanStateChanged;
      this.isScanning = true;
      
      console.log('Starting Bluetooth proximity scanning...');
      this.onScanStateChanged?.(true);

      // シミュレーション: 定期的にランダムデバイスを検出
      this.simulateDeviceDetection(options);

      return true;
    } catch (error) {
      console.error('Failed to start proximity scanning:', error);
      return false;
    }
  }

  // 近接スキャンを停止
  stopProximityScanning(): void {
    if (!this.isScanning) {
      return;
    }

    console.log('Stopping Bluetooth proximity scanning...');
    this.isScanning = false;
    
    if (this.scanTimeout) {
      clearTimeout(this.scanTimeout);
      this.scanTimeout = undefined;
    }

    this.detectedDevices.clear();
    this.onScanStateChanged?.(false);
  }

  // 現在検出されているデバイス一覧を取得
  getDetectedDevices(): BluetoothDevice[] {
    return Array.from(this.detectedDevices.values());
  }

  // スキャン状態を取得
  getIsScanning(): boolean {
    return this.isScanning;
  }

  // シミュレーション: ランダムデバイス検出
  private simulateDeviceDetection(options: ProximityDetectionOptions) {
    if (!this.isScanning) return;

    const simulateDetection = () => {
      if (!this.isScanning) return;

      // ランダムでデバイスを検出
      if (Math.random() < 0.3) { // 30%の確率で検出
        const device: BluetoothDevice = {
          id: `device_${Math.random().toString(36).substr(2, 9)}`,
          name: `User${Math.floor(Math.random() * 100)}`,
          rssi: -30 - Math.floor(Math.random() * 40), // -30 to -70 dBm
          timestamp: new Date()
        };

        // RSSI閾値チェック
        const rssiThreshold = options.rssiThreshold || -60;
        if (device.rssi && device.rssi > rssiThreshold) {
          this.detectedDevices.set(device.id, device);
          this.onDeviceDetected?.(device);
          console.log('Device detected:', device);
        }
      }

      // 古いデバイスをクリーンアップ（5秒以上古い）
      const now = new Date();
      for (const [id, device] of this.detectedDevices.entries()) {
        if (now.getTime() - device.timestamp.getTime() > 5000) {
          this.detectedDevices.delete(id);
        }
      }

      // 次のスキャンをスケジュール
      this.scanTimeout = setTimeout(simulateDetection, 2000 + Math.random() * 3000);
    };

    // 初回実行
    this.scanTimeout = setTimeout(simulateDetection, 1000);
  }

  // Web Bluetooth API実装（参考）
  private async startWebBluetoothScanning(): Promise<void> {
    if (Platform.OS !== 'web' || !('bluetooth' in navigator)) {
      throw new Error('Web Bluetooth not supported');
    }

    try {
      // Web Bluetooth APIを使用した実装例
      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['generic_access']
      });

      console.log('Web Bluetooth device:', device);
      
      // 実際の実装では、advertisementイベントをリスンして
      // 近接デバイスを検出する
    } catch (error) {
      console.error('Web Bluetooth scanning failed:', error);
      throw error;
    }
  }
}

export const bluetoothService = new BluetoothService();