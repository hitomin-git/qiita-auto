# qiita-auto

Claude Code を使って Qiita 記事を自動生成・レビュー・投稿するツールです。

Node.js のコードは使わず、Claude Code のツール（Read / Write / WebFetch / Bash）で直接処理します。

---

## セットアップ

```bash
# 1. Qiita CLI をグローバルインストール（初回のみ）
npm install -g @qiita/qiita-cli

# 2. 環境変数ファイルを作成
cp .env.example .env
# .env を開いて QIITA_TOKEN を設定する
```

> **注意:** このプロジェクトに `package.json` はありません。`npm install` は不要です。

---

## 使い方

Claude Code（`claude` コマンド）を起動してスラッシュコマンドを実行します。

```
/qiita-run              # topics.yaml の pending トピックから生成→投稿まで自動実行
/qiita-run <URL>        # 指定URLを参考に記事生成→投稿まで自動実行
/qiita-run sources/urls.csv # CSV内のURLを最大5件バッチ処理
```

### スラッシュコマンド一覧

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

---

## フォルダ構成

```
qiita-auto/
├── .claude/commands/           # スラッシュコマンド定義（Claude Code が読む）
│   ├── qiita-run.md
│   ├── qiita-generate.md
│   ├── qiita-review.md
│   ├── qiita-rewrite.md
│   ├── qiita-score.md
│   └── qiita-publish.md
├── config/
│   └── topics.yaml             # 記事ネタ管理
├── docs/
│   ├── hitomi-style-guide.md   # 執筆スタイルガイド
│   └── article-rulebook.md     # 記事品質基準
├── templates/
│   ├── header.md               # 記事固定ヘッダー
│   └── footer.md               # 記事固定フッター
├── sources/
│   └── urls.csv                # CSVバッチ処理用URLリスト
├── public/
│   └── {slug}/
│       ├── draft.md            # Phase 1: 初稿
│       ├── review.md           # Phase 2: レビュー結果
│       ├── rewrite.md          # Phase 3: リライト後記事
│       └── score.json          # Phase 4: 採点結果
│   └── {slug}.md               # Phase 5: Qiita投稿用
├── .env                        # QIITA_TOKEN を記載（Git管理外）
├── .env.example                # 環境変数サンプル
└── CLAUDE.md                   # Claude Code 向け指示書
```

---

## 記事生成フロー

```
generate → review → rewrite → score → publish
```

すべて Claude Code が自動実行します。各フェーズのファイルは `public/{slug}/` に保存されます。採点は100点満点・95点以上でPASSとなり投稿に進みます。

---

## 参考

- [Qiita CLI](https://github.com/increments/qiita-cli)
- [Claude Code](https://claude.ai/code)
