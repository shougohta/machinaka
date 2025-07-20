import express from 'express';
import { User } from '../../../shared/src/types';

const router = express.Router();

// In-memory storage for demo (will be replaced with database)
const users: Map<string, User> = new Map();

// ユーザー登録
router.post('/register', (req, res) => {
  try {
    const userData = req.body;
    
    if (!userData.username || !userData.age || !userData.gender) {
      return res.status(400).json({ 
        error: 'username, age, and gender are required' 
      });
    }

    const userId = generateId();
    const user: User = {
      id: userId,
      username: userData.username,
      age: userData.age,
      gender: userData.gender,
      interests: userData.interests || [],
      seekingType: userData.seekingType || 'friendship',
      profilePicture: userData.profilePicture,
      bio: userData.bio,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    users.set(userId, user);

    return res.status(201).json({ 
      success: true, 
      user: { ...user, id: userId } 
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ユーザー情報取得
router.get('/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const user = users.get(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ユーザー情報更新
router.put('/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;
    
    const user = users.get(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser: User = {
      ...user,
      ...updateData,
      id: userId, // IDは変更不可
      createdAt: user.createdAt, // 作成日は変更不可
      updatedAt: new Date()
    };

    users.set(userId, updatedUser);

    return res.json({ 
      success: true, 
      user: updatedUser 
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ユーザーリスト取得（管理用）
router.get('/', (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    
    const userList = Array.from(users.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(Number(offset), Number(offset) + Number(limit));

    return res.json({
      users: userList,
      total: users.size
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 簡易ID生成関数
function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export default router;