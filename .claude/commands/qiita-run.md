# Qiita記事 全自動実行

Qiita記事の生成から限定公開投稿まで自動実行します。ユーザーへの確認は一切行わず、各ステップを連続して最後まで実行してください。

---

## Step 0: モードの判定と記事準備

`$ARGUMENTS` を確認して実行モードを決める：

| 引数 | モード |
|------|--------|
| なし | **topics.yaml モード** |
| `http://` または `https://` で始まる | **URL モード** |
| `.csv` で終わる | **CSV バッチモード** |

### topics.yaml モード

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

→ **Step 1（レビュー）へ進む**

### URL モード

WebFetch で `$ARGUMENTS` のページを取得し、タイトルと本文を抽出する。

slug を `YYYY-MM-DD_（URLの末尾パスセグメント）` で決定する。

以下も Read する：
- `docs/hitomi-style-guide.md`
- `docs/article-rulebook.md`
- `templates/header.md`
- `templates/footer.md`

取得した参考ページをもとにオリジナルのQiita記事を執筆する（コピー禁止）。

以下に Write する：
- `public/{slug}/draft.md`
- `public/{slug}/image-prompts.md`

→ **Step 1（レビュー）へ進む**

### CSV バッチモード

`$ARGUMENTS` のファイルを Read してURL一覧を取得する（ヘッダー行・空行は無視、最大5件）。

各URLに対して **URL モード → Step 1〜4** を順番に実行する。1件完了してから次へ進む。

全件完了後、完了報告へ。

---

## Step 1: レビュー

`public/{slug}/draft.md` を Read する。

### 静的チェック

| 確認項目 | 種別 |
|---------|------|
| フロントマターが `---` で始まっているか | 🔴 エラー |
| H1（`#`）が本文中に複数ないか | 🔴 エラー |
| コードブロックに言語識別子があるか | 🟡 警告 |
| **太字** の前後にスペースがあるか | 🟡 警告 |
| `## はじめに` / `## まとめ` があるか | 🟡 警告 |

### 品質レビュー（docs/hitomi-style-guide.md に基づく）

- 「先輩が後輩に話す」温度感になっているか（教科書調は禁止）
- 会話例・実体験風エピソードがあるか
- 読者を責める表現がないか（「間違っています」「やってはいけません」は NG）
- まとめが「箇条書きおさらい」になっていないか（マインドセットで締める）
- 「明日できる具体的な行動」で終わっているか

`public/{slug}/review.md` に以下の形式で Write する：

```markdown
## 総評
（100〜200字）

## 静的チェック結果
### 🔴 エラー
- （なければ「なし」）
### 🟡 警告
- （なければ「なし」）

## 指摘事項
### 🔴 必須修正
- （なければ「なし」）
### 🟡 推奨修正
- （なければ「なし」）
### 🟢 良い点
- （評価できる点）
```

---

## Step 2: リライト

`public/{slug}/draft.md` と `public/{slug}/review.md` を Read する。

- 🔴 必須修正 → **全件必ず反映する**
- 🟡 推奨修正 → 内容を判断して反映する
- 🟢 良い点 → そのまま維持する

守ること：
- フロントマターの `id`・`updated_at` は変更しない
- 修正理由のコメントは書かず、完成版の記事本文のみ出力する
- **太字** の前後には半角スペース
- コードブロックに言語識別子を付ける

`public/{slug}/rewrite.md` に Write する。

---

## Step 3: 採点

`public/{slug}/rewrite.md` を Read して100点満点で採点する。

### 採点基準

| 項目 | 満点 | 評価観点 |
|------|------|---------|
| 技術正確性 | 20点 | 技術的な説明・手順が正確か |
| 初心者向けの分かりやすさ | 20点 | 対象読者が理解できる丁寧な説明か |
| 誤字脱字 | 10点 | 誤字・脱字・表記ゆれがないか |
| コードの正確性 | 20点 | コードが動作し、言語識別子があるか |
| Qiita記事としての完成度 | 30点 | 構成・人見スタイル・文体・必須セクションが揃っているか |

### 人見スタイルチェック（完成度 30点から減点）

| チェック項目 | 減点 |
|-------------|------|
| 会話例（実際のセリフ・発言例）がない | -10点 |
| まとめが箇条書きおさらいで終わっている | -8点 |
| 「明日できる具体的な一行動」で終わっていない | -5点 |
| 読者を責める表現がある | -5点/箇所 |
| 教科書調・業務文書調の文体が続く | -5点 |

**合格基準：80点以上でPASS**

`public/{slug}/score.json` に Write する：

```json
{
  "slug": "（slug）",
  "title": "（記事タイトル）",
  "total": （合計点・整数）,
  "pass": （true または false）,
  "criteria": {
    "technical_accuracy": （点数）,
    "beginner_readability": （点数）,
    "typos": （点数）,
    "code_accuracy": （点数）,
    "qiita_completeness": （点数）
  },
  "feedback": "（採点コメント・200字以内）",
  "scored_at": "（YYYY-MM-DD）"
}
```

**判定：**
- `pass: true` → Step 4（投稿）へ
- `pass: false` → `score.json` と `rewrite.md` を削除して Step 2 に戻る（最大3回）
- 3回FAILしたら停止して改善点を報告する

---

## Step 4: 投稿

`public/{slug}/rewrite.md` を Read し、`private: false` → `private: true` に変換して `public/{slug}.md` に Write する。

`.env` を Read して `QIITA_TOKEN` を取得し、Bash で実行する：

```bash
QIITA_TOKEN=<トークン> npx qiita publish {slug}
```

---

## 完了報告

投稿された slug と Qiita記事IDを報告する。
