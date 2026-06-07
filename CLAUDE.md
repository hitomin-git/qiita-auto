# qiita-auto: Qiita記事自動生成システム

Claude Codeを使ってQiita記事を自動生成・レビュー・投稿するプロジェクト。

## ワークフロー

```
/qiita-run              # topics.yaml の pending トピックから生成→投稿まで自動実行
/qiita-run <URL>        # 指定URLを参考に記事生成→投稿まで自動実行
/qiita-run <CSVファイル> # CSV内のURLを最大5件バッチ処理
```

CSVファイルは `sources/urls.csv` に配置する。形式:
```
url
https://example.com/article1
https://example.com/article2
```

## slash commands 一覧

| コマンド | 説明 |
|---------|------|
| `/qiita-run` | topics.yaml モード：pending → 生成 → review → rewrite → score → publish |
| `/qiita-run <URL>` | URL モード：URL取得 → 生成 → review → rewrite → score → publish |
| `/qiita-run sources/urls.csv` | CSV バッチモード：最大5件のURLを順番に処理 |
| `/qiita-generate` | pendingトピックの記事初稿を生成（draft.md）のみ |
| `/qiita-review <slug>` | draft.mdをレビュー（review.md）のみ |
| `/qiita-rewrite <slug>` | レビュー結果でリライト（rewrite.md）のみ |
| `/qiita-score <slug>` | 記事を採点（score.json）のみ |
| `/qiita-publish <slug>` | Qiitaに限定共有投稿のみ |

## ファイル構成

```
public/{slug}/
├── draft.md      # Phase 1: 初稿（generate）
├── review.md     # Phase 2: レビュー（review）
├── rewrite.md    # Phase 3: リライト（rewrite）
├── score.json    # Phase 4: 採点（score）
└── index.md      # Phase 5: 投稿用（publish時に自動生成）
```

## slug の命名規則

`src/utils/fileManager.ts` の `slugify()` 関数に従う:
- 形式: `{YYYY-MM-DD}_{title-lowercase-alphanumeric-hyphenated}`
- 例: `2026-06-07_typescript-nodejs-introduction`
- 最大50文字（日付含む）

## 重要なルール

- 記事品質基準は `docs/article-rulebook.md` を参照すること
- フロントマターは必ずQiita CLI形式（`private: false` を含む）で記述
- コードブロックには必ず言語識別子を付ける
- 見出しは `##` から始める（`#` はタイトル相当のため本文に使わない）
- 敬体（です・ます調）で統一する

## npm scripts

```bash
NODE_OPTIONS=--use-system-ca npm run generate        # 生成プロンプト表示
NODE_OPTIONS=--use-system-ca npm run review -- <slug>  # レビュープロンプト表示
NODE_OPTIONS=--use-system-ca npm run rewrite -- <slug> # リライトプロンプト表示
NODE_OPTIONS=--use-system-ca npm run score -- <slug>   # 採点プロンプト表示
NODE_OPTIONS=--use-system-ca npm run publish -- <slug> # Qiitaへ投稿実行
```
