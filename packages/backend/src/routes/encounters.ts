import express from 'express';
import { Encounter, Location, ProximityEvent } from '../../../shared/src/types';

const router = express.Router();

// In-memory storage for demo (will be replaced with database)
const encounters: Encounter[] = [];
const activeUsers: Map<string, { location: Location; lastSeen: Date }> = new Map();

// ユーザーの位置情報を更新
router.post('/location', (req, res) => {
  try {
    const { userId, location }: { userId: string; location: Location } = req.body;
    
    if (!userId || !location) {
      return res.status(400).json({ error: 'userId and location are required' });
    }

    activeUsers.set(userId, {
      location,
      lastSeen: new Date()
    });

    return res.json({ success: true, message: 'Location updated' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 近接検知イベントを処理
router.post('/proximity', (req, res) => {
  try {
    const { userId, proximityData }: { userId: string; proximityData: ProximityEvent } = req.body;
    
    if (!userId || !proximityData) {
      return res.status(400).json({ error: 'userId and proximityData are required' });
    }

    // 近くのアクティブユーザーを検索
    const nearbyUsers = findNearbyUsers(userId, proximityData.location);
    
    // すれ違いイベントを記録
    const newEncounters: Encounter[] = [];
    
    for (const nearbyUser of nearbyUsers) {
      const encounter: Encounter = {
        id: generateId(),
        userId1: userId,
        userId2: nearbyUser.userId,
        location: proximityData.location,
        timestamp: new Date(),
        isMatched: false,
        distance: nearbyUser.distance
      };
      
      encounters.push(encounter);
      newEncounters.push(encounter);
    }

    return res.json({ 
      success: true, 
      encounters: newEncounters,
      nearbyCount: nearbyUsers.length 
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ユーザーのすれ違い履歴を取得
router.get('/history/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const userEncounters = encounters
      .filter(e => e.userId1 === userId || e.userId2 === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(Number(offset), Number(offset) + Number(limit));

    res.json({
      encounters: userEncounters,
      total: encounters.filter(e => e.userId1 === userId || e.userId2 === userId).length
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// マッチング処理（相互いいね）
router.post('/match', (req, res) => {
  try {
    const { encounterId, userId }: { encounterId: string; userId: string } = req.body;
    
    const encounter = encounters.find(e => e.id === encounterId);
    if (!encounter) {
      return res.status(404).json({ error: 'Encounter not found' });
    }

    // ユーザーがこのすれ違いに関与しているか確認
    if (encounter.userId1 !== userId && encounter.userId2 !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // マッチング成立の処理（簡易版）
    encounter.isMatched = true;

    return res.json({ 
      success: true, 
      message: 'Match successful',
      encounter 
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 現在アクティブなユーザー数を取得
router.get('/active-users', (req, res) => {
  try {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    let activeCount = 0;
    for (const [userId, userData] of activeUsers.entries()) {
      if (userData.lastSeen > fiveMinutesAgo) {
        activeCount++;
      }
    }

    res.json({ activeUsers: activeCount });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 近くのユーザーを検索する関数
function findNearbyUsers(currentUserId: string, currentLocation: Location) {
  const nearbyUsers: Array<{ userId: string; distance: number }> = [];
  const PROXIMITY_THRESHOLD = 50; // 50メートル以内

  for (const [userId, userData] of activeUsers.entries()) {
    if (userId === currentUserId) continue;

    const distance = calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      userData.location.latitude,
      userData.location.longitude
    );

    if (distance <= PROXIMITY_THRESHOLD) {
      nearbyUsers.push({ userId, distance });
    }
  }

  return nearbyUsers;
}

// 2点間の距離を計算（メートル単位）
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // 地球の半径（メートル）
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// 簡易ID生成関数
function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export default router;