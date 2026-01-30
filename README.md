# Habit Tracker (簡易版)

簡易的な習慣トラッカー（Next.js + SQLite）です。フロントはReact/Next.js、APIはNext API Routesで提供します。

セットアップ:

```powershell
npm install
npm run dev
```

利用可能なAPI:
- `GET /api/habits` - 習慣一覧
- `POST /api/habits` - 習慣作成 { name }
- `POST /api/habits/:id/checkin` - 日次チェックイン
- `GET /api/stats/:id` - 習慣ごとのチェックイン合計

開発メモ:
- DBはルートの `data.db` に作成されます（`db.js` が自動でテーブルを作成します）。

認証について:
- JWT を用いた簡易認証を実装しました。`/api/auth/register` と `/api/auth/login` を使ってトークンを取得してください。
- ローカルで既に `data.db` がある場合、スキーマ差分は自動で反映されません。問題がある場合は `data.db` を削除して再生成してください（開発環境向け）。

