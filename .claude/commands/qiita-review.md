以下のプロンプトに従い、記事のレビュー（review.md）を生成してください。

**あなたが行うこと：**
1. 出力されたレビュープロンプトの指示通りに記事をレビューする
2. `docs/hitomi-style-guide.md` の観点（先輩→後輩の温度感・会話例・読者を責めない・明日できる行動で締め）も含めて評価する
3. レビュー結果を `public/$ARGUMENTS/review.md` に保存する

**プロンプト出力：**

!NODE_OPTIONS=--use-system-ca npm run review -- $ARGUMENTS
