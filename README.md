# summarize-shortcut

Slack のメッセージを指定された形式で要約する Cloudflare Worker
アプリケーションです。

## 機能

- Slack のショートカットから起動できます。
- 選択されたメッセージやチャンネルの会話履歴を Google Vertex AI
  を使用して要約します。
- 要約結果を Slack のモーダルビューまたはメッセージとして表示します。

## 技術スタック

- Cloudflare Workers
- TypeScript
- Slack API (slack-cloudflare-workers)
- Google Vertex AI (vercel ai)

## セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/KeisukeKudo/summarize-shortcut.git
cd summarize-shortcut
```

### 2. 依存関係のインストール

```bash
pnpm install
```

### 3. 環境変数の設定

Cloudflare のダッシュボードまたは `.dev.vars`
ファイルに必要な環境変数を設定します。

- `SLACK_BOT_TOKEN`: Slack Bot Token
- `SLACK_SIGNING_SECRET`: Slack Signing Secret
- `VERTEX_AI_MODEL`: 使用する Vertex AI モデル名 (例:
  `gemini-2.5-flash-preview-04-17`)
- `GCP_PROJECT_ID`: Google Cloud プロジェクト ID
- `GCP_LOCATION`: Google Cloud リージョン (例: `us-central1`)
- `GCP_CLIENT_EMAIL`: Google Cloud サービスアカウントのメールアドレス
- `GCP_PRIVATE_KEY`: Google Cloud サービスアカウントの秘密鍵
- `GCP_PRIVATE_KEY_ID`: Google Cloud サービスアカウントの秘密鍵 ID

### 4. Slack アプリの設定

1. Slack アプリを作成し、必要な権限 (例: `commands`, `chat:write`,
   `channels:history`, `groups:history`, `im:history`, `mpim:history`)
   を付与します。
2. Interactivity & Shortcuts を有効にし、Request URL にデプロイした Worker の
   URL を設定します。
3. Global Shortcut を作成し、Callback ID を `summarize_shortcut` (または
   `src/shortcut-handler.ts` で定義したもの) に設定します。
4. Slash Command を作成し (任意)、Request URL に Worker の URL を設定します。

## 開発

ローカル環境で開発サーバーを起動します。

```bash
pnpm dev # or pnpm start
```

ローカル開発環境で Slack 上の動作を確認するには、Slack アプリケーション管理画面で Event Subscriptions などのリクエスト URL を設定する必要があります。
[ngrok](https://ngrok.com/) や [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/) を利用します。
以下は、Cloudflare Tunnel (Quick Tunnel) を使用した例です。

```bash
cloudflared tunnel --url http://localhost:8787
```

## デプロイ

```bash
pnpm run deploy
```
