# Claude Code メモリ - machinaka プロジェクト

## プロジェクト概要
- **アプリ名**: machinaka（まちなか）
- **概念**: リアルタイムすれ違い検知アプリ
- **技術**: Bluetooth LE + React Native + Node.js
- **コンセプト**: ドラクエのすれ違い通信 × 現代的マッチングアプリ

## 現在の進捗状況

### ✅ 完了済み
1. **GitHubリポジトリ作成**: https://github.com/shougohta/machinaka
2. **プロジェクト構成設計**: monorepo構成（apps/mobile, packages/backend, packages/shared）
3. **React Native アプリ初期化**: Expo + TypeScript テンプレート
4. **Node.js バックエンド初期化**: Express + Socket.io + TypeScript
5. **デプロイ設定**: Railway + GitHub Actions CI/CD
6. **共通型定義**: packages/shared にUser, Encounter, Match等の型定義
7. **README更新**: 仕様書の内容を含む詳細なドキュメント作成

### 📁 プロジェクト構成
```
machinaka/
├── apps/mobile/          # React Native + Expo アプリ
├── packages/backend/     # Node.js API + Socket.io
├── packages/shared/      # 共通型定義・設定
├── .github/workflows/    # CI/CD設定
├── deploy/              # デプロイ設定
└── docs/               # ドキュメント
```

### 🛠 技術スタック
- **Frontend**: React Native + Expo + TypeScript
- **Backend**: Node.js + Express + Socket.io + TypeScript  
- **Database**: PostgreSQL + Redis（まだ未実装）
- **Deploy**: Railway（設定済み）
- **CI/CD**: GitHub Actions（設定済み）

## 次に実装すべき機能

### 🎯 優先度: 高
1. **Bluetooth LE 検知機能**
   - expo-bluetooth-classic または react-native-bluetooth-state-manager
   - バックグラウンド検知
   - 近接デバイス一覧取得

2. **位置情報取得**
   - expo-location
   - GPS座標取得
   - 住所逆引き

3. **基本的なUI実装**
   - メイン画面（レーダー風デザイン）
   - すれ違い履歴画面
   - プロフィール画面

### 🎯 優先度: 中
1. **データベース設計・実装**
   - PostgreSQL スキーマ設計
   - Prisma ORM セットアップ
   - Redis セッション管理

2. **認証システム**
   - JWT認証
   - プロフィール登録・編集

3. **マッチング機能**
   - いいね機能
   - 相互マッチ検知
   - 通知システム

## 開発コマンド
```bash
# プロジェクトルートから
npm install
npm run dev          # バックエンド + モバイル同時起動
npm run dev:backend  # バックエンドのみ
npm run dev:mobile   # モバイルアプリのみ
```

## 重要な技術的検討事項
1. **Bluetooth LE権限**: iOS/Android各プラットフォームでの権限管理
2. **バックグラウンド処理**: アプリがバックグラウンドでもBluetooth検知を継続
3. **プライバシー**: 位置情報の匿名化、デバイスID暗号化
4. **バッテリー効率**: 検知頻度とバッテリー消費のバランス

## 参考資料・仕様書
- 詳細仕様は README.md に記載済み
- UI設計、収益化モデル、プライバシー方針なども含む

---
*Last updated: 2025-07-20*
*Claude Code session memory for continuing development*