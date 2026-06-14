以下のプロンプトに従い、記事を採点して score.json を生成してください。

**あなたが行うこと：**
1. 出力された採点プロンプトの基準に従い記事を採点する
2. 採点結果を `public/$ARGUMENTS/score.json` に以下の形式で保存する（80点以上でpass: true）:

```json
{
  "slug": "...",
  "title": "...",
  "total": <整数>,
  "pass": <true|false>,
  "criteria": {
    "technical_accuracy": <整数>,
    "beginner_readability": <整数>,
    "typos": <整数>,
    "code_accuracy": <整数>,
    "qiita_completeness": <整数>
  },
  "feedback": "...",
  "scored_at": "..."
}
```

**プロンプト出力：**

!NODE_OPTIONS=--use-system-ca npm run score -- $ARGUMENTS
