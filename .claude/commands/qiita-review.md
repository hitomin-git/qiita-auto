以下のプロンプトに従い、記事のレビュー（review.md）を生成してください。

**あなたが行うこと：**
1. 出力されたレビュープロンプトの指示通りに記事をレビューする
2. レビュー結果を `public/$ARGUMENTS/review.md` に保存する

**プロンプト出力：**

!NODE_OPTIONS=--use-system-ca npm run review -- $ARGUMENTS
