以下のプロンプトに従い、記事のリライト（rewrite.md）を生成してください。

**あなたが行うこと：**
1. 出力されたリライトプロンプトと `docs/hitomi-style-guide.md` の指示に従い記事を改善する
2. review.md の指摘を反映しつつ、人見スタイル（先輩→後輩の温度感・会話例・読者を責めない・明日できる行動で締め）を強化する
3. リライト後の記事を `public/$ARGUMENTS/rewrite.md` に保存する

**プロンプト出力：**

!NODE_OPTIONS=--use-system-ca npm run rewrite -- $ARGUMENTS
