以下のプロンプトに従い、Qiita記事の初稿を生成してください。

**あなたが行うこと：**
1. 出力されたプロンプトの指示通りに記事を執筆する
2. slugを決定する（形式: `{YYYY-MM-DD}_{title-lowercase-alphanumeric-hyphenated}`、例: `2026-06-07_typescript-nodejs-intro`）
3. `public/{slug}/draft.md` にQiitaフロントマター付きMarkdownで保存する
4. `config/topics.yaml` の該当トピックの `status` を `generated` に変更する

**プロンプト出力：**

!NODE_OPTIONS=--use-system-ca npm run generate
