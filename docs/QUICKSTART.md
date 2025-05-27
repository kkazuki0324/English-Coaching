# 🚀 クイックスタートガイド

English Coaching プロジェクトの開発を素早く開始するためのガイドです。

## 📋 事前準備

以下がインストールされていることを確認してください：

- **Node.js 20 LTS** ([ダウンロード](https://nodejs.org/))
- **Docker Desktop** ([ダウンロード](https://www.docker.com/products/docker-desktop))
- **Azure CLI** ([インストールガイド](https://docs.microsoft.com/ja-jp/cli/azure/install-azure-cli))
- **Azure Developer CLI** ([インストールガイド](https://learn.microsoft.com/ja-jp/azure/developer/azure-developer-cli/install-azd))
- **Git** ([ダウンロード](https://git-scm.com/))

## ⚡ 30 秒でスタート

### 1. プロジェクトセットアップ

```bash
# 自動セットアップスクリプトを実行
./scripts/setup.sh    # Linux/macOS
# または
./scripts/setup.bat   # Windows
```

### 2. 開発環境起動

```bash
# Docker Compose で全体を起動
npm run dev

# または個別に起動
npm run dev:frontend  # フロントエンド（ポート3000）
npm run dev:backend   # バックエンド（ポート3001）
```

### 3. 動作確認

- **フロントエンド**: http://localhost:3000
- **バックエンド API**: http://localhost:3001
- **ヘルスチェック**: http://localhost:3001/api/health

## 🔧 開発フロー

### 日常的な開発

```bash
# 依存関係インストール
npm run install:all

# 型チェック
npm run type-check   # 全体
cd frontend && npm run type-check  # フロントエンドのみ
cd backend && npm run type-check   # バックエンドのみ

# リンティング
npm run lint         # 全体
npm run lint:fix     # 自動修正

# テスト実行
npm test             # 全体
cd frontend && npm test  # フロントエンドのみ
cd backend && npm test   # バックエンドのみ

# ビルド
npm run build        # 全体
```

### Azure デプロイ

```bash
# 初回：Azure 環境セットアップ
azd init

# Azure にログイン
azd auth login

# プレビュー確認
azd provision --preview

# デプロイ実行
azd up
```

## 📁 プロジェクト構造

```
English-Coaching/
├── frontend/           # Next.js + React フロントエンド
│   ├── src/
│   │   ├── components/ # UIコンポーネント
│   │   ├── pages/      # ページ
│   │   ├── hooks/      # カスタムフック
│   │   └── services/   # API通信
│   └── package.json
├── backend/            # Node.js + Express バックエンド
│   ├── src/
│   │   ├── controllers/# APIコントローラー
│   │   ├── services/   # ビジネスロジック
│   │   ├── models/     # データモデル
│   │   └── middleware/ # ミドルウェア
│   └── package.json
├── infra/              # Azure インフラ (Bicep)
├── scripts/            # セットアップスクリプト
└── docs/               # ドキュメント
```

## 🎯 開発ターゲット

### Phase 1: MVP (2-3 週間)

- [x] プロジェクト基盤構築
- [ ] 基本認証システム
- [ ] 音声録音機能
- [ ] シンプルな UI

### Phase 2: コア機能 (3-4 週間)

- [ ] シャドーイング自動添削
- [ ] AI 英語コーチ
- [ ] 教材管理
- [ ] 進捗追跡

### Phase 3: 高度機能 (4-6 週間)

- [ ] パーソナライゼーション
- [ ] 詳細分析
- [ ] レポート機能
- [ ] パフォーマンス最適化

## 🆘 トラブルシューティング

### よくある問題

1. **ポート競合エラー**

   ```bash
   # ポート使用状況確認
   netstat -an | findstr :3000
   netstat -an | findstr :3001
   ```

2. **Docker 起動エラー**

   ```bash
   # Docker サービス確認
   docker version
   docker-compose version
   ```

3. **依存関係エラー**

   ```bash
   # クリーンインストール
   npm run clean
   npm run install:all
   ```

4. **Azure 認証エラー**
   ```bash
   # 再認証
   az login
   azd auth login
   ```

## 🔗 有用なリンク

- [Azure Developer CLI ドキュメント](https://learn.microsoft.com/ja-jp/azure/developer/azure-developer-cli/)
- [Next.js ドキュメント](https://nextjs.org/docs)
- [Express.js ドキュメント](https://expressjs.com/)
- [Azure OpenAI ドキュメント](https://learn.microsoft.com/ja-jp/azure/ai-services/openai/)
- [Azure Speech Services ドキュメント](https://learn.microsoft.com/ja-jp/azure/ai-services/speech-service/)

## 💬 サポート

質問や問題がある場合：

1. [Issues](../../issues) で既存の問題を検索
2. 新しい Issue を作成
3. [Discussions](../../discussions) で相談

---

**Happy Coding! 🎉**
