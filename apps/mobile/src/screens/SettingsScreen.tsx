import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SettingsScreen = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    soundEffects: true,
    vibration: true,
    backgroundDetection: true,
    locationSharing: true,
  });

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleProfileEdit = () => {
    Alert.alert('プロフィール編集', '実装予定の機能です');
  };

  const handlePrivacySettings = () => {
    Alert.alert('プライバシー設定', '実装予定の機能です');
  };

  const handleAbout = () => {
    Alert.alert(
      'まちなかについて',
      'リアルタイムすれ違い検知アプリ\n\nバージョン: 1.0.0\n\nBluetooth Low Energyを使用して、近くにいる人との偶然の出会いを創出します。',
      [{ text: 'OK' }]
    );
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    value, 
    onToggle, 
    type = 'switch' 
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    value?: boolean;
    onToggle?: (value: boolean) => void;
    type?: 'switch' | 'button';
  }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon as any} size={24} color="#666" />
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {type === 'switch' && (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: '#ddd', true: '#4CAF50' }}
          thumbColor={value ? '#fff' : '#f4f3f4'}
        />
      )}
      {type === 'button' && (
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>設定</Text>
      </View>

      {/* プロフィール設定 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>プロフィール</Text>
        <TouchableOpacity onPress={handleProfileEdit}>
          <SettingItem
            icon="person-circle"
            title="プロフィールを編集"
            subtitle="年齢、趣味、自己紹介など"
            type="button"
          />
        </TouchableOpacity>
      </View>

      {/* 検知設定 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>検知設定</Text>
        <SettingItem
          icon="radio"
          title="バックグラウンド検知"
          subtitle="アプリを閉じていても検知を続行"
          value={settings.backgroundDetection}
          onToggle={(value) => handleSettingChange('backgroundDetection', value)}
        />
        <SettingItem
          icon="location"
          title="位置情報の共有"
          subtitle="すれ違い場所の記録に使用"
          value={settings.locationSharing}
          onToggle={(value) => handleSettingChange('locationSharing', value)}
        />
      </View>

      {/* 通知設定 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>通知設定</Text>
        <SettingItem
          icon="notifications"
          title="通知"
          subtitle="すれ違いやマッチの通知"
          value={settings.notifications}
          onToggle={(value) => handleSettingChange('notifications', value)}
        />
        <SettingItem
          icon="volume-high"
          title="効果音"
          subtitle="すれ違い時の「ピロン♪」音"
          value={settings.soundEffects}
          onToggle={(value) => handleSettingChange('soundEffects', value)}
        />
        <SettingItem
          icon="phone-portrait"
          title="バイブレーション"
          subtitle="すれ違い時の振動"
          value={settings.vibration}
          onToggle={(value) => handleSettingChange('vibration', value)}
        />
      </View>

      {/* その他 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>その他</Text>
        <TouchableOpacity onPress={handlePrivacySettings}>
          <SettingItem
            icon="shield-checkmark"
            title="プライバシー設定"
            subtitle="ブロック・通報など"
            type="button"
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleAbout}>
          <SettingItem
            icon="information-circle"
            title="アプリについて"
            subtitle="バージョン情報など"
            type="button"
          />
        </TouchableOpacity>
      </View>

      {/* ステータス表示 */}
      <View style={styles.statusSection}>
        <Text style={styles.sectionTitle}>接続状況</Text>
        <View style={styles.statusContainer}>
          <View style={styles.statusItem}>
            <Ionicons name="bluetooth" size={20} color="#4CAF50" />
            <Text style={styles.statusText}>Bluetooth: 有効</Text>
          </View>
          <View style={styles.statusItem}>
            <Ionicons name="location" size={20} color="#4CAF50" />
            <Text style={styles.statusText}>位置情報: 有効</Text>
          </View>
          <View style={styles.statusItem}>
            <Ionicons name="wifi" size={20} color="#4CAF50" />
            <Text style={styles.statusText}>サーバー: 接続中</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 20,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginHorizontal: 20,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  statusSection: {
    backgroundColor: '#fff',
    marginTop: 20,
    marginBottom: 20,
    paddingVertical: 16,
  },
  statusContainer: {
    paddingHorizontal: 20,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#333',
  },
});

export default SettingsScreen;