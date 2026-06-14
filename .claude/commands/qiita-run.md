# Qiita記事 全自動実行

Qiita記事の生成から限定公開投稿まで自動実行します。ユーザーへの確認は一切行わず、各ステップを連続して最後まで実行してください。

---

## 引数の判定

`$ARGUMENTS` を確認して実行モードを決める：

| 引数 | モード |
|------|--------|
| なし | **topics.yaml モード** |
| `http://` または `https://` で始まる | **URL モード** |
| `.csv` で終わる | **CSV バッチモード** |

---

## 【topics.yaml モード】引数なし

### Step 1: 記事生成

`config/topics.yaml` を Read して `status: pending` のトピックを1件選ぶ。
なければ「pending なトピックがありません」と伝えて終了する。

以下も Read する：
- `docs/hitomi-style-guide.md`
- `docs/article-rulebook.md`
- `templates/header.md`
- `templates/footer.md`

slug を決定する（形式：`YYYY-MM-DD_title-lowercase-hyphenated`、最大50文字）。

記事を執筆し、以下に Write する：
- `public/{slug}/draft.md`（フロントマター付き記事全文）
- `public/{slug}/image-prompts.md`（画像生成プロンプト 3案×3箇所）

`config/topics.yaml` の該当トピックの `status` を `generated` に Edit する。

→ **Step 2（レビュー）へ進む**

---

## 【URL モード】URL が引数

### Step 1: URL から記事生成

WebFetch ツールで `$ARGUMENTS` のページを取得し、タイトルと本文を抽出する。

slug を決定する（URLの末尾パスセグメントを使う。例：`2026-06-15_my-article`）。

以下も Read する：
- `docs/hitomi-style-guide.md`
- `docs/article-rulebook.md`
- `templates/header.md`
- `templates/footer.md`

取得した参考ページの内容をもとに、オリジナルのQiita記事を執筆する（内容のコピーではなく、参考にして自分の言葉で書く）。

以下に Write する：
- `public/{slug}/draft.md`
- `public/{slug}/image-prompts.md`

→ **Step 2（レビュー）へ進む**

---

## 【CSV バッチモード】.csv ファイルが引数

`$ARGUMENTS` のファイルを Read してURL一覧を取得する。
ヘッダー行（`url`）と空行は無視する。最大5件まで処理する。

各URLに対して **【URL モード】Step 1〜5** を順番に実行する。
1件完了してから次のURLに進む。

全件完了後、処理結果（slug と Qiita記事ID の一覧）を報告する。

---

## Step 2: レビュー

`public/{slug}/draft.md` を Read する。

以下の静的チェックを実行する：
- フロントマターが `---` で始まっているか（なければエラー）
- H1が複数ないか（なければエラー）
- コードブロックに言語識別子があるか（なければ警告）
- **太字** の前後にスペースがあるか（なければ警告）
- `## はじめに` / `## まとめ` があるか（なければ警告）

`docs/hitomi-style-guide.md` の観点でレビューし、`public/{slug}/review.md` に Write する。

---

## Step 3: リライト

`public/{slug}/draft.md` と `public/{slug}/review.md` を Read する。

🔴 必須修正を全件反映、🟡 推奨修正を判断して反映してリライトし、`public/{slug}/rewrite.md` に Write する。

---

## Step 4: 採点

`public/{slug}/rewrite.md` を Read して100点満点で採点する。

| 項目 | 満点 |
|------|------|
| 技術正確性 | 20点 |
| 初心者向けの分かりやすさ | 20点 |
| 誤字脱字 | 10点 |
| コードの正確性 | 20点 |
| Qiita記事としての完成度 | 30点 |

`public/{slug}/score.json` に Write する（形式は qiita-score.md と同じ）。

**採点結果の判定：**
- `pass: true`（80点以上）→ Step 5へ進む
- `pass: false`（80点未満）→ `score.json` と `rewrite.md` を削除してStep 3に戻る（最大3回）
- 3回試してもFAILの場合 → 停止して改善点を報告する

---

## Step 5: Qiita投稿

`public/{slug}/rewrite.md` を Read し、`private: false` → `private: true` に変換して `public/{slug}.md` に Write する。

`.env` を Read して `QIITA_TOKEN` を取得する。

Bash で投稿する：
```bash
QIITA_TOKEN=<トークン> npx qiita publish {slug}
```

---

## 完了報告

投稿された slug と Qiita記事IDを報告する。
