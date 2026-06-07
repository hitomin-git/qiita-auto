# qiita-auto

Claude Code を使って Qiita 記事を自動生成・レビュー・投稿するツールです。

## フェーズ

| Phase | 内容 | 状態 |
|-------|------|------|
| 1 | プロジェクト雛形・設定・ルールブック | ✅ 完了 |
| 2 | Claude Code で Markdown 生成 → `public/` 保存 | ✅ 完了 |
| 3 | レビュー・リライト・採点 → Qiita CLI で投稿 | 🔄 進行中 |
| 4 | CLI メニュー化 | 🔜 予定 |

---

## セットアップ

```bash
# 1. 依存パッケージをインストール
NODE_OPTIONS=--use-system-ca npm install

# 2. 環境変数ファイルを作成
cp .env.example .env
# .env を開いて QIITA_TOKEN を設定する
```

---

## 記事生成フロー

```
generate → review → rewrite → score → publish
```

各フェーズで Claude Code がファイルを生成します。コマンドはプロンプト表示・状態確認の役割を担います。

### Phase 1: 記事生成（draft.md）

```bash
NODE_OPTIONS=--use-system-ca npm run generate
```

`config/topics.yaml` の `status: pending` のトピックを最大5件読み込み、Claude 向けプロンプトを表示します。Claude Code が `public/{slug}/draft.md` を生成します。

### Phase 2: レビュー（review.md）

```bash
NODE_OPTIONS=--use-system-ca npm run review -- <slug>
```

`draft.md` の構造チェックを行い、レビュー用プロンプトを表示します。Claude Code が `public/{slug}/review.md` を生成します。

### Phase 3: リライト（rewrite.md）

```bash
NODE_OPTIONS=--use-system-ca npm run rewrite -- <slug>
```

`draft.md` と `review.md` を読み込み、修正用プロンプトを表示します。Claude Code が `public/{slug}/rewrite.md` を生成します。

### Phase 4: 採点（score.json）

```bash
NODE_OPTIONS=--use-system-ca npm run score -- <slug>
```

`rewrite.md` を採点し、`public/{slug}/score.json` を生成します。80点以上で PASS となります。

### Phase 5: 投稿（Qiita）

```bash
NODE_OPTIONS=--use-system-ca npm run publish -- <slug>
```

`score.json` が PASS の場合のみ、`rewrite.md` を `index.md` としてコピーし Qiita に投稿します。

### slug 未指定の場合

`review` / `rewrite` / `score` / `publish` は slug を省略すると対象候補を一覧表示します。

```bash
npm run review
# 対象候補:
#   2026-06-07_typescriptnodejs
```

---

## フォルダ構成

```
qiita-auto/
├── src/
│   ├── commands/          # npm run から呼ぶエントリポイント
│   │   ├── generate.ts
│   │   ├── review.ts
│   │   ├── rewrite.ts
│   │   ├── score.ts
│   │   └── publish.ts     # 予定
│   ├── generator/         # プロンプト構築ロジック
│   ├── reviewer/          # 構造チェック処理
│   └── utils/             # 共通ユーティリティ
├── public/                # 生成済み記事（Git管理外）
│   └── {slug}/
│       ├── draft.md       # Phase 1: 初稿
│       ├── review.md      # Phase 2: レビュー結果
│       ├── rewrite.md     # Phase 3: 修正稿
│       ├── score.json     # Phase 4: 採点結果
│       └── index.md       # Phase 5: 投稿用（publish時に自動生成）
├── templates/prompts/     # Claude 向けプロンプトテンプレート
├── config/topics.yaml     # 記事テーマ一覧
├── docs/article-rulebook.md  # 記事品質ルール
├── .env.example           # 環境変数サンプル
└── tsconfig.json
```

---

## 記事ルールブック

記事の品質基準は [`docs/article-rulebook.md`](docs/article-rulebook.md) を参照してください。

---

## Qiita CLI との連携

`public/{slug}/index.md` は [Qiita CLI](https://github.com/increments/qiita-cli) の規約に準拠しています。
`npm run publish` により `rewrite.md` から自動生成されます。
