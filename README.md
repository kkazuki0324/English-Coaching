# English Coaching - スピーキング特化英語学習サービス

## 🎯 プロジェクト概要

Speaking（スピーキング）力の向上に特化した英語学習 Web サービスです。シャドーイングの自動添削機能と Agentic な英語コーチ機能を通じて、ユーザーの発音・リズム・表現力の改善を支援します。

## 🌟 主要機能

### 1. シャドーイング自動添削機能

- **音声録音・分析**: ユーザーの発音を録音し、AI 音声分析で評価
- **リアルタイムフィードバック**: 発音・リズム・流暢性の即座評価
- **詳細レポート**: 改善点の具体的な指摘と練習方法の提案

### 2. Agentic な英語コーチ機能

- **パーソナライズド学習**: ユーザーのレベル・目標に応じた学習プラン
- **インタラクティブ会話**: AI 英語コーチとの自然な対話練習
- **進捗追跡**: 学習履歴と上達度の可視化

### 3. 教材管理

- **多様な教材**: ニュース、映画、ポッドキャストなど豊富なコンテンツ
- **難易度調整**: ユーザーレベルに応じた教材推奨
- **カスタム教材**: ユーザー独自の学習素材アップロード対応

## 🏗️ アーキテクチャ概要

### Azure サービス構成（POC 版）

- **Frontend**: Azure Static Web Apps (React/Next.js)
- **Backend API**: Azure Container Apps (Node.js/Express または ASP.NET Core)
- **AI Services**:
  - Azure OpenAI Service (GPT-4 for coaching)
  - Azure Cognitive Services Speech (音声認識・音声合成)
- **Database**: Azure Cosmos DB (NoSQL)
- **Storage**: Azure Blob Storage (音声ファイル・教材)
- **Authentication**: Azure AD B2C

### 開発フロー

1. **ローカル開発**: Docker + Azure Emulator
2. **CI/CD**: GitHub Actions + Azure DevOps
3. **デプロイメント**: Azure Developer CLI (azd)
4. **モニタリング**: Azure Application Insights

## 🚀 技術スタック

### Frontend

- **Framework**: React 18 + Next.js 14
- **UI Library**: Material-UI または Tailwind CSS
- **State Management**: Zustand
- **Audio Recording**: Web Audio API

### Backend

- **Runtime**: Node.js 20 LTS
- **Framework**: Express.js + TypeScript
- **Authentication**: Passport.js + Azure AD
- **Audio Processing**: FFmpeg + Azure Speech SDK

### AI & ML

- **Language Model**: Azure OpenAI GPT-4
- **Speech Recognition**: Azure Speech to Text
- **Speech Synthesis**: Azure Text to Speech
- **Audio Analysis**: Custom ML models on Azure ML

## 📁 プロジェクト構造

```
English-Coaching/
├── frontend/                 # React/Next.js フロントエンド
│   ├── src/
│   │   ├── components/      # UIコンポーネント
│   │   ├── pages/          # ページコンポーネント
│   │   ├── hooks/          # カスタムフック
│   │   ├── services/       # API通信
│   │   └── utils/          # ユーティリティ
│   ├── public/             # 静的ファイル
│   └── package.json
├── backend/                  # Node.js バックエンド
│   ├── src/
│   │   ├── controllers/    # APIコントローラー
│   │   ├── services/       # ビジネスロジック
│   │   ├── models/         # データモデル
│   │   ├── middleware/     # ミドルウェア
│   │   └── utils/          # ユーティリティ
│   ├── Dockerfile
│   └── package.json
├── infra/                    # Infrastructure as Code (Bicep)
│   ├── main.bicep          # メインテンプレート
│   ├── modules/            # Bicepモジュール
│   └── parameters/         # パラメーターファイル
├── scripts/                  # デプロイ・セットアップスクリプト
├── docs/                     # ドキュメント
├── .github/                  # GitHub Actions ワークフロー
├── azure.yaml               # Azure Developer CLI設定
├── docker-compose.yml       # ローカル開発環境
└── README.md
```

## 🔧 開発環境セットアップ

### 前提条件

- Node.js 20 LTS
- Docker Desktop
- Azure CLI
- Azure Developer CLI (azd)
- Git

### ローカル開発

```bash
# リポジトリクローン
git clone <repository-url>
cd English-Coaching

# 依存関係インストール
npm run install:all

# ローカル環境起動
npm run dev
```

### Azure 環境デプロイ

```bash
# Azure環境初期化
azd init

# Azure環境プロビジョニング・デプロイ
azd up
```

## 📋 開発ロードマップ

### Phase 1: MVP 開発 (2-3 週間)

- [ ] 基本認証システム
- [ ] 音声録音機能
- [ ] 簡単な音声分析
- [ ] 基本的な UI コンポーネント

### Phase 2: コア機能開発 (3-4 週間)

- [ ] シャドーイング自動添削
- [ ] AI 英語コーチとの対話
- [ ] 学習進捗管理
- [ ] 教材管理システム

### Phase 3: 高度機能・改善 (4-6 週間)

- [ ] パーソナライズド学習
- [ ] 詳細な音声分析
- [ ] レポート機能
- [ ] パフォーマンス最適化

## 🛡️ セキュリティ考慮事項

- Azure AD B2C による認証
- Managed Identity でのサービス間通信
- Azure Key Vault でのシークレット管理
- HTTPS/TLS 暗号化
- CORS 設定

## 📊 モニタリング・ログ

- Azure Application Insights
- Azure Monitor
- カスタムメトリクス（学習進捗、利用状況）
- エラー追跡・アラート

## 🤝 コントリビューション

詳細は [CONTRIBUTING.md](./CONTRIBUTING.md) を参照してください。

## 📄 ライセンス

[MIT License](./LICENSE)

---

**プロジェクト開始**: 2025 年 5 月
**想定期間**: 3-4 ヶ月（POC → MVP → 本格運用）
