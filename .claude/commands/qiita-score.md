以下のプロンプトに従い、記事を採点して score.json を生成してください。

**あなたが行うこと：**
1. 出力された採点プロンプトの基準に従い記事を採点する
2. 採点結果を `public/$ARGUMENTS/score.json` にJSON形式で保存する
   - 形式: `{"pass": true/false, "total": 0-100, "breakdown": {...}, "comment": "..."}`
   - 80点以上でpass: true

**プロンプト出力：**

!NODE_OPTIONS=--use-system-ca npm run score -- $ARGUMENTS
