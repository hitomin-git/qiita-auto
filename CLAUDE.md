# qiita-auto: Qiita記事自動生成システム

Claude Codeを使ってQiita記事を自動生成・レビュー・投稿するプロジェクト。
Node.jsコードは使わず、Claude Code のツール（Read/Write/WebFetch/Bash）で直接処理する。

## ワークフロー

```
/qiita-run              # topics.yaml の pending トピックから生成→投稿まで自動実行
/qiita-run <URL>        # 指定URLを参考に記事生成→投稿まで自動実行
/qiita-run sources/urls.csv # CSV内のURLを最大5件バッチ処理
```

## slash commands 一覧

| コマンド | 説明 |
|---------|------|
| `/qiita-run` | 全自動：topics.yaml の pending → 生成 → review → rewrite → score → publish |
| `/qiita-run <URL>` | 全自動：URL取得 → 生成 → review → rewrite → score → publish |
| `/qiita-run sources/urls.csv` | 全自動：CSVのURL最大5件をバッチ処理 |
| `/qiita-generate` | 初稿（draft.md）生成のみ |
| `/qiita-review <slug>` | レビュー（review.md）のみ |
| `/qiita-rewrite <slug>` | リライト（rewrite.md）のみ |
| `/qiita-score <slug>` | 採点（score.json）のみ |
| `/qiita-publish <slug>` | Qiitaに限定共有投稿のみ |

## ファイル構成

```
qiita-auto/
├── CLAUDE.md                   ← このファイル
├── .claude/commands/           ← slash commands（メインの指示書）
│   ├── qiita-run.md
│   ├── qiita-generate.md
│   ├── qiita-review.md
│   ├── qiita-rewrite.md
│   ├── qiita-score.md
│   └── qiita-publish.md
├── config/
│   └── topics.yaml             ← 記事ネタ管理
├── docs/
│   ├── hitomi-style-guide.md   ← 執筆スタイルガイド（必読）
│   └── article-rulebook.md     ← 記事品質基準
├── templates/
│   ├── header.md               ← 記事固定ヘッダー
│   └── footer.md               ← 記事固定フッター（{{DATE}} は YYYYMMDD に置換）
├── sources/
│   └── urls.csv                ← CSVバッチ処理用URLリスト
└── public/
    └── {slug}/
        ├── draft.md            ← Phase 1: 初稿
        ├── image-prompts.md    ← Phase 1: 画像生成プロンプト集
        ├── review.md           ← Phase 2: レビュー結果
        ├── rewrite.md          ← Phase 3: リライト後記事
        └── score.json          ← Phase 4: 採点結果
    └── {slug}.md               ← Phase 5: Qiita投稿用（publish時に生成）
```

## slug の命名規則

- 形式: `{YYYY-MM-DD}_{title-lowercase-alphanumeric-hyphenated}`
- 例: `2026-06-15_typescript-nodejs-introduction`
- 最大50文字（日付含む）

## 重要なルール

- 執筆スタイルは `docs/hitomi-style-guide.md` に従うこと（先輩→後輩の温度感・会話例・読者を責めない・マインドセットで締め）
- フロントマターは必ずQiita CLI形式（`private: false` を含む）で記述
- コードブロックには必ず言語識別子を付ける
- 見出しは `##` から始める（`#` はタイトル相当のため本文に使わない）
- 敬体（です・ます調）で統一する
- **太字** の前後には半角スペースを入れる（Qiita特有ルール）
- score.json は100点満点・80点以上でPASS（publish の条件）

## 環境設定

`.env` ファイルに以下を設定する：

```
QIITA_TOKEN=your_qiita_token_here
```
