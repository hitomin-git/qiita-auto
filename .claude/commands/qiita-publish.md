# Qiita記事 投稿

`$ARGUMENTS` で指定された slug の記事をQiitaに限定共有で投稿します。

---

## Step 1: 品質ゲートの確認

`public/$ARGUMENTS/score.json` を Read する。

- ファイルが存在しなければ「score.json がありません。先に /qiita-score を実行してください」と伝えて終了する。
- `pass` が `false` であれば「採点結果がFAIL（〇〇点）のため投稿できません。/qiita-rewrite → /qiita-score をやり直してください」と伝えて終了する。

---

## Step 2: 投稿用ファイルの作成

`public/$ARGUMENTS/rewrite.md` を Read し、以下の変換をして `public/$ARGUMENTS.md` に Write する：

- `private: false` → `private: true`（限定共有）
- `organization_url_name: prum` → `organization_url_name: null`（限定共有時は組織紐づけ不可）

---

## Step 3: Qiitaへの投稿

Bash で以下を実行する（`.env` を直接 source することでトークンをコマンド文字列に含めない）：

```bash
export $(grep -v '^#' .env | xargs) && npx qiita publish $ARGUMENTS
```

---

## 完了報告

投稿完了後、slug と記事URLを報告する。
