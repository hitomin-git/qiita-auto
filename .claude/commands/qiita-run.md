# Qiita記事 全自動実行

Qiita記事の生成から限定公開投稿まで自動実行します。
**構成案の確認（Step 1）でのみユーザーの入力を待ちます。確認後は最後まで自動実行します。**

---

## Step 0: モードの判定と前準備

`$ARGUMENTS` を確認して実行モードを決める：

| 引数 | モード |
|------|--------|
| なし | **topics.yaml モード** |
| `http://` または `https://` で始まる | **URL モード** |
| `.csv` で終わる | **CSV バッチモード** |

以下を Read する：
- `docs/hitomi-style-guide.md`
- `docs/article-rulebook.md`
- `templates/header.md`
- `templates/footer.md`

### topics.yaml モード

`config/topics.yaml` を Read して `status: pending` のトピックを1件選ぶ。
なければ「pending なトピックがありません」と伝えて終了する。

slug を決定する（形式：`YYYY-MM-DD_title-lowercase-hyphenated`、最大50文字）。

→ **Step 1（構成案提示）へ進む**

### URL モード

WebFetch で `$ARGUMENTS` のページを取得し、タイトルと本文を抽出する。

slug を `YYYY-MM-DD_（URLの末尾パスセグメント）` で決定する。

→ **Step 1（構成案提示）へ進む**

### CSV バッチモード

`$ARGUMENTS` のファイルを Read してURL一覧を取得する（ヘッダー行・空行は無視、最大5件）。

各URLに対して **URL モード → Step 1〜5** を順番に実行する（1件ずつ構成案確認を取る）。1件完了してから次へ進む。

全件完了後、完了報告へ。

---

## Step 1: 記事構成案の提示（ユーザー確認待ち）

以下の構成案をチャットに出力し、ユーザーの確認・修正指示を待つ。

```
## 記事構成案

**仮タイトル：** （タイトル）
**対象読者：** （一言で）

### 見出し構成
1. ## はじめに — （1行概要）
2. ## （セクション名） — （1行概要）
3. ## （セクション名） — （1行概要）
4. ## （セクション名） — （1行概要）
5. ## まとめ — （1行概要）

### 会話例のシチュエーション
（先輩・後輩の会話を入れる場面と内容案）

### 締めの「明日できる一行動」案
（具体的な一文）

---
この構成でよければ「OK」、修正があれば内容を教えてください。
```

ユーザーから OK または修正指示を受け取ったら、その内容を反映して Step 2 へ進む。

---

## Step 2: 記事の執筆（generate）

### フロントマター

```
---
title: （タイトル）
tags:
  - （タグ1）
  - （タグ2）
private: false
updated_at: ''
id: null
organization_url_name: prum
slide: false
ignorePublish: false
---
```

### 記事の構成

フロントマターの直後から `## はじめに` で始める（`# タイトル` は書かない。Qiita がフロントマターのタイトルを自動表示するため重複になる）。

1. `## はじめに` — `templates/header.md` の内容をそのまま挿入する
   - 直後にアイキャッチ画像プレースホルダー：
     ```
     <!-- 🖼️ IMAGE:EYECATCH | 画像生成プロンプトは image-prompts.md を参照 -->
     ![アイキャッチ](IMAGE_EYECATCH_URL)
     ```
2. 本文セクション（`##` × 3〜5個）
   - 中盤の最重要セクション直後にメイン画像プレースホルダー：
     ```
     <!-- 🖼️ IMAGE:MAIN | 画像生成プロンプトは image-prompts.md を参照 -->
     ![メイン画像](IMAGE_MAIN_URL)
     ```
3. `## まとめ`
   - まとめ内にまとめ画像プレースホルダー：
     ```
     <!-- 🖼️ IMAGE:FOOTER | 画像生成プロンプトは image-prompts.md を参照 -->
     ![まとめ画像](IMAGE_FOOTER_URL)
     ```
   - `templates/footer.md` を末尾に挿入する

執筆スタイル（docs/hitomi-style-guide.md に従う）：
- 先輩が後輩に話す温度感（教科書調は禁止）
- 会話例・実体験風エピソードを入れる
- 読者を責めない
- まとめはマインドセットで締める（箇条書きおさらいは禁止）
- 明日できる具体的な一行動で終わる

以下に Write する：
- `public/{slug}/draft.md`（フロントマター付き記事全文）
- `public/{slug}/image-prompts.md`（画像生成プロンプト 3案×3箇所）

topics.yaml モードの場合：`config/topics.yaml` の該当トピックの `status` を `generated` に Edit する。

---

## Step 3: レビュー

`public/{slug}/draft.md` を Read する。

### 静的チェック

| 確認項目 | 種別 |
|---------|------|
| フロントマターが `---` で始まっているか | 🔴 エラー |
| 本文先頭に `# タイトル` がないか | 🔴 エラー |
| H1（`#`）が本文中にないか | 🔴 エラー |
| コードブロックに言語識別子があるか | 🟡 警告 |
| **太字** の前後にスペースがあるか | 🟡 警告 |
| `## はじめに` / `## まとめ` があるか | 🟡 警告 |

### 品質レビュー（docs/hitomi-style-guide.md に基づく）

- 「先輩が後輩に話す」温度感になっているか（教科書調は禁止）
- 会話例・実体験風エピソードがあるか
- 読者を責める表現がないか
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

## Step 4: リライト

`public/{slug}/draft.md` と `public/{slug}/review.md` を Read する。

- 🔴 必須修正 → **全件必ず反映する**
- 🟡 推奨修正 → 内容を判断して反映する
- 🟢 良い点 → そのまま維持する

守ること：
- フロントマターの `id`・`updated_at` は変更しない
- 修正理由のコメントは書かず、完成版の記事本文のみ出力する
- **太字** の前後には半角スペース
- コードブロックに言語識別子を付ける
- 本文先頭に `# タイトル` を書かない

`public/{slug}/rewrite.md` に Write する。

---

## Step 5: 採点

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

**合格基準：95点以上でPASS**

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
- `pass: true`（95点以上）→ Step 6（投稿）へ
- `pass: false`（95点未満）→ `score.json` と `rewrite.md` を削除して Step 4 に戻る（最大3回）
- 3回FAILしたら停止して改善点を報告する

---

## Step 6: 投稿

`public/{slug}/rewrite.md` を Read し、以下の変換をして `public/{slug}.md` に Write する：

- `private: false` → `private: true`（限定共有）
- `organization_url_name: prum` → `organization_url_name: null`（限定共有時は組織紐づけ不可）

Bash で実行する（`.env` を直接 source することでトークンをコマンド文字列に含めない）：

```bash
export $(grep -v '^#' .env | xargs) && npx qiita publish {slug}
```

---

## 完了報告

投稿された slug と Qiita記事IDを報告する。
