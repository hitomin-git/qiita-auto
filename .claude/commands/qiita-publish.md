記事をQiitaに限定共有投稿します。

**実行条件：**
- `public/$ARGUMENTS/score.json` が存在し `pass: true` であること
- `public/$ARGUMENTS/rewrite.md` が存在すること
- `.env` に `QIITA_TOKEN` が設定されていること

**投稿実行：**

!NODE_OPTIONS=--use-system-ca npm run publish -- $ARGUMENTS
