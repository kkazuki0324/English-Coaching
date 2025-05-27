# Contributing to English Coaching

## 開発環境のセットアップ

### 前提条件

- Node.js 20 LTS 以上
- Docker Desktop
- Azure CLI
- Azure Developer CLI (azd)
- Git

### 初期セットアップ

1. リポジトリをフォーク・クローン

```bash
git clone <your-fork-url>
cd English-Coaching
```

2. 依存関係のインストール

```bash
npm run install:all
```

3. 環境変数の設定

```bash
# フロントエンド
cp frontend/.env.example frontend/.env.local

# バックエンド
cp backend/.env.example backend/.env
```

4. ローカル開発環境の起動

```bash
npm run dev
```

## 開発ワークフロー

### ブランチ戦略

- `main`: 本番環境用ブランチ
- `develop`: 開発統合ブランチ
- `feature/*`: 機能開発ブランチ
- `hotfix/*`: 緊急修正ブランチ

### コミット規約

Conventional Commits 形式を使用：

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**

- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント更新
- `style`: コードスタイル修正
- `refactor`: リファクタリング
- `test`: テスト追加・修正
- `chore`: その他の変更

**例:**

```
feat(frontend): add voice recording component
fix(backend): resolve audio upload issue
docs: update API documentation
```

### プルリクエスト

1. feature ブランチを作成

```bash
git checkout -b feature/voice-recording
```

2. 変更を実装・コミット

```bash
git add .
git commit -m "feat(frontend): add voice recording component"
```

3. プッシュ・プルリクエスト作成

```bash
git push origin feature/voice-recording
```

4. プルリクエストテンプレートに従って詳細を記入

### コードレビュー基準

- [ ] コード品質（可読性、保守性）
- [ ] テスト追加・既存テスト通過
- [ ] ドキュメント更新
- [ ] セキュリティ考慮
- [ ] パフォーマンス影響
- [ ] Azure ベストプラクティス遵守

## コーディング規約

### TypeScript/JavaScript

- ESLint + Prettier 使用
- 型安全性の確保
- 関数型プログラミング推奨
- 適切なエラーハンドリング

### React/Next.js

- 関数コンポーネント + Hooks
- TypeScript 厳格モード
- パフォーマンス最適化
- アクセシビリティ対応

### Node.js/Express

- TypeScript 使用
- 適切な型定義
- ミドルウェア分離
- エラーハンドリング

### Azure 開発

- Managed Identity 使用
- Infrastructure as Code (Bicep)
- セキュリティベストプラクティス
- モニタリング・ログ実装

## テスト

### フロントエンド

```bash
cd frontend
npm test              # ユニットテスト
npm run test:e2e      # E2Eテスト
```

### バックエンド

```bash
cd backend
npm test              # ユニット・統合テスト
npm run test:coverage # カバレッジ確認
```

### 全体

```bash
npm test              # 全テスト実行
```

## デプロイメント

### ローカル → Azure

```bash
azd provision --preview  # プレビュー確認
azd up                   # デプロイ実行
```

### CI/CD

GitHub Actions 経由で自動デプロイ：

- `develop` ブランチ → 開発環境
- `main` ブランチ → 本番環境

## トラブルシューティング

### よくある問題

1. **Docker 起動エラー**

   - Docker Desktop が起動していることを確認
   - ポート競合を確認（3000, 3001, 8081）

2. **Azure 認証エラー**

   ```bash
   az login
   azd auth login
   ```

3. **依存関係エラー**
   ```bash
   npm run clean
   npm run install:all
   ```

## サポート

- **Issue**: バグ報告・機能リクエスト
- **Discussion**: 技術的な質問・相談
- **Email**: [your-email]（緊急時のみ）

## ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。詳細は[LICENSE](./LICENSE)を参照してください。
