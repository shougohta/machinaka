import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Encounter } from '../types';

const HistoryScreen = () => {
  // サンプルデータ
  const [encounters, setEncounters] = useState<Encounter[]>([
    {
      id: '1',
      userId1: 'user1',
      userId2: 'user2',
      location: {
        latitude: 35.6762,
        longitude: 139.6503,
        address: '渋谷のカフェ',
        placeType: 'cafe'
      },
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2時間前
      isMatched: false,
      distance: 3
    },
    {
      id: '2',
      userId1: 'user1',
      userId2: 'user3',
      location: {
        latitude: 35.6812,
        longitude: 139.7671,
        address: '新宿駅',
        placeType: 'station'
      },
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5時間前
      isMatched: true,
      distance: 5
    },
    {
      id: '3',
      userId1: 'user1',
      userId2: 'user4',
      location: {
        latitude: 35.6586,
        longitude: 139.7454,
        address: '代々木公園',
        placeType: 'park'
      },
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1日前
      isMatched: false,
      distance: 8
    }
  ]);

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}日前`;
    } else if (hours > 0) {
      return `${hours}時間前`;
    } else {
      return '1時間以内';
    }
  };

  const getPlaceIcon = (placeType?: string) => {
    switch (placeType) {
      case 'cafe':
        return 'cafe';
      case 'station':
        return 'train';
      case 'park':
        return 'leaf';
      case 'library':
        return 'library';
      default:
        return 'location';
    }
  };

  const handleLike = (encounterId: string) => {
    // いいね処理（後で実装）
    console.log('Like encounter:', encounterId);
  };

  const renderEncounterItem = ({ item }: { item: Encounter }) => (
    <View style={styles.encounterCard}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={30} color="#666" />
          </View>
          {item.isMatched && (
            <View style={styles.matchBadge}>
              <Ionicons name="heart" size={12} color="#fff" />
            </View>
          )}
        </View>
        
        <View style={styles.encounterInfo}>
          <Text style={styles.timeText}>{formatTimeAgo(item.timestamp)}</Text>
          <View style={styles.locationContainer}>
            <Ionicons 
              name={getPlaceIcon(item.location.placeType)} 
              size={16} 
              color="#666" 
            />
            <Text style={styles.locationText}>{item.location.address}</Text>
          </View>
          <Text style={styles.distanceText}>約{item.distance}m</Text>
        </View>
      </View>

      {!item.isMatched && (
        <TouchableOpacity 
          style={styles.likeButton}
          onPress={() => handleLike(item.id)}
        >
          <Ionicons name="heart-outline" size={20} color="#FF6B6B" />
          <Text style={styles.likeButtonText}>いいね</Text>
        </TouchableOpacity>
      )}

      {item.isMatched && (
        <View style={styles.matchedContainer}>
          <Ionicons name="heart" size={16} color="#FF6B6B" />
          <Text style={styles.matchedText}>マッチしました！</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>すれ違い履歴</Text>
        <Text style={styles.subtitle}>
          {encounters.length}件のすれ違い
        </Text>
      </View>

      <FlatList
        data={encounters}
        renderItem={renderEncounterItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  listContainer: {
    padding: 16,
  },
  encounterCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  encounterInfo: {
    flex: 1,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
  },
  distanceText: {
    fontSize: 12,
    color: '#999',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF6B6B',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 6,
  },
  likeButtonText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '500',
  },
  matchedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF6B6B',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 6,
  },
  matchedText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default HistoryScreen;