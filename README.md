# machinaka 

リアルタイムすれ違い検知アプリ

## 概要

Bluetooth Low Energyを使用してリアルタイムで近くにいる人を検知し、自然な出会いを創出するモバイルアプリです。

## 技術スタック

- **Frontend**: React Native + TypeScript
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Redis
- **Deploy**: AWS/Vercel

## プロジェクト構成

```
machinaka/
├── apps/
│   ├── mobile/     # React Nativeアプリ
│   └── web/        # 管理画面（将来的）
├── packages/
│   ├── backend/    # Node.js APIサーバー
│   └── shared/     # 共通型定義
├── docs/           # ドキュメント
├── .github/        # GitHub Actions
└── deploy/         # デプロイ設定
```

## 開発環境セットアップ

```bash
# 依存関係をインストール
npm install

# 開発サーバー起動（バックエンド + モバイル）
npm run dev

# バックエンドのみ
npm run dev:backend

# モバイルアプリのみ
npm run dev:mobile
```

## 主要機能

- Bluetooth LEによるすれ違い検知
- リアルタイム通知
- プロフィール管理
- マッチング機能
- 連絡先交換