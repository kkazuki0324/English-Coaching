# 技術仕様書

## 1. システム概要

### 1.1 システム目的

Speaking（スピーキング）力の向上に特化した英語学習 Web サービスを提供し、シャドーイングの自動添削機能と Agentic な英語コーチ機能により、ユーザーの発音・リズム・表現力を改善する。

### 1.2 システム構成

- **フロントエンド**: React 18 + Next.js 14 on Azure Static Web Apps
- **バックエンド**: Node.js + Express on Azure Container Apps
- **データベース**: Azure Cosmos DB (NoSQL)
- **AI サービス**: Azure OpenAI + Cognitive Services
- **ストレージ**: Azure Blob Storage
- **認証**: Azure AD B2C

## 2. 機能仕様

### 2.1 シャドーイング自動添削機能

#### 2.1.1 音声録音

- **要件**: ユーザーが手本音声に合わせて発話した内容を録音
- **技術**: Web Audio API + MediaRecorder API
- **形式**: WebM (Opus) → MP3 変換
- **制限**: 最大 5 分、16kHz、16bit

#### 2.1.2 音声分析

- **発音精度**: Azure Speech-to-Text + 音韻分析
- **リズム・テンポ**: 音声波形解析（音量・間隔）
- **流暢性**: フィラー検出 + 発話速度計算
- **評価指標**: 0-100 スコア（発音 50%、リズム 30%、流暢性 20%）

#### 2.1.3 フィードバック生成

- **即座評価**: リアルタイム表示（録音中）
- **詳細分析**: 録音後の詳細レポート
- **改善提案**: Azure OpenAI による個別アドバイス

### 2.2 Agentic な英語コーチ機能

#### 2.2.1 対話型コーチング

- **AI エージェント**: GPT-4 based English Coach
- **会話形式**: 自然言語でのインタラクション
- **パーソナライゼーション**: ユーザープロファイル学習

#### 2.2.2 学習プラン作成

- **初期評価**: レベル判定テスト
- **目標設定**: TOEIC、英検、実用英語など
- **進捗追跡**: 学習履歴分析 + 上達グラフ

### 2.3 教材管理

#### 2.3.1 コンテンツ種別

- **ニュース**: BBC, CNN, NHK World
- **映画・ドラマ**: Netflix 字幕データ
- **ポッドキャスト**: 英語学習系番組
- **カスタム**: ユーザーアップロード音声

#### 2.3.2 難易度調整

- **自動分類**: 語彙レベル + 文法複雑度
- **推奨システム**: ユーザーレベル適合度
- **進行管理**: 段階的難易度上昇

## 3. データベース設計

### 3.1 Cosmos DB コレクション設計

#### Users Collection

```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "profile": {
    "name": "John Doe",
    "level": "intermediate",
    "nativeLanguage": "japanese",
    "goals": ["business", "travel"],
    "createdAt": "2025-05-27T00:00:00Z"
  },
  "preferences": {
    "voiceSpeed": 1.0,
    "feedbackDetail": "detailed",
    "reminderFrequency": "daily"
  }
}
```

#### Sessions Collection

```json
{
  "id": "session-uuid",
  "userId": "user-uuid",
  "materialId": "material-uuid",
  "type": "shadowing",
  "audioUrl": "blob-storage-url",
  "analysis": {
    "pronunciationScore": 85,
    "rhythmScore": 78,
    "fluencyScore": 82,
    "overallScore": 82,
    "feedback": "...",
    "improvements": ["..."]
  },
  "duration": 120,
  "createdAt": "2025-05-27T00:00:00Z"
}
```

#### Materials Collection

```json
{
  "id": "material-uuid",
  "title": "BBC News - Climate Change",
  "type": "news",
  "level": "intermediate",
  "duration": 180,
  "transcript": "...",
  "audioUrl": "...",
  "metadata": {
    "source": "BBC",
    "category": "environment",
    "vocabulary": ["climate", "renewable", "sustainable"]
  }
}
```

## 4. API 設計

### 4.1 REST API エンドポイント

#### 認証

- `POST /api/auth/login` - ログイン
- `POST /api/auth/logout` - ログアウト
- `GET /api/auth/profile` - プロファイル取得

#### ユーザー管理

- `GET /api/users/profile` - ユーザープロファイル
- `PUT /api/users/profile` - プロファイル更新
- `GET /api/users/progress` - 学習進捗

#### 教材

- `GET /api/materials` - 教材一覧
- `GET /api/materials/:id` - 教材詳細
- `POST /api/materials/upload` - カスタム教材アップロード

#### セッション

- `POST /api/sessions` - セッション開始
- `PUT /api/sessions/:id/audio` - 音声アップロード
- `GET /api/sessions/:id/analysis` - 分析結果取得

#### AI コーチ

- `POST /api/coach/chat` - コーチとの対話
- `GET /api/coach/plan` - 学習プラン取得
- `PUT /api/coach/plan` - プラン更新

### 4.2 WebSocket API

#### リアルタイム機能

- `/ws/recording` - 録音中のリアルタイム分析
- `/ws/coaching` - AI コーチとのリアルタイム対話

## 5. セキュリティ仕様

### 5.1 認証・認可

- **ID プロバイダー**: Azure AD B2C
- **認証方式**: OAuth 2.0 + OpenID Connect
- **トークン**: JWT (Access Token + Refresh Token)
- **有効期限**: Access Token 1 時間、Refresh Token 7 日

### 5.2 データ保護

- **暗号化**: TLS 1.3 (通信), AES-256 (保存)
- **個人情報**: Azure Key Vault で暗号化キー管理
- **音声データ**: 30 日後自動削除（設定可能）

### 5.3 アクセス制御

- **RBAC**: Azure AD ロールベースアクセス制御
- **Managed Identity**: サービス間通信
- **CORS**: フロントエンドドメインのみ許可

## 6. パフォーマンス仕様

### 6.1 レスポンス時間

- **API レスポンス**: < 500ms (95%ile)
- **音声分析**: < 3 秒 (1 分音声)
- **AI コーチ応答**: < 2 秒

### 6.2 スケーラビリティ

- **同時ユーザー**: 1,000 人（初期）
- **音声処理**: 並列処理対応
- **Auto Scaling**: CPU 70%で自動スケール

### 6.3 可用性

- **SLA**: 99.9%
- **バックアップ**: 日次自動バックアップ
- **災害復旧**: RTO 4 時間、RPO 1 時間

## 7. 監視・運用

### 7.1 ログ・メトリクス

- **Application Insights**: パフォーマンス監視
- **カスタムメトリクス**: 学習進捗、利用パターン
- **アラート**: エラー率、レスポンス時間

### 7.2 運用フロー

- **CI/CD**: GitHub Actions
- **デプロイ**: Blue-Green デプロイ
- **ロールバック**: 自動ロールバック対応
