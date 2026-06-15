# Qiita記事 初稿生成

指定されたトピックまたはURLをもとに、Qiita記事の初稿（draft.md）と画像生成プロンプト（image-prompts.md）を作成します。

---

## Step 0: モードの判定

`$ARGUMENTS` を確認する：

| 引数 | モード |
|------|--------|
| なし | **topics.yaml モード** |
| `http://` または `https://` で始まる | **URL モード** |

### topics.yaml モード

`config/topics.yaml` を Read して `status: pending` のトピックを1件選ぶ。
pending がなければ「pending なトピックがありません」と伝えて終了する。

slug を決定する（形式：`YYYY-MM-DD_title-lowercase-hyphenated`、最大50文字）。

`config/topics.yaml` の該当トピックの `status` を `generated` に Edit する。

→ **Step 1（スタイル確認）へ進む**

### URL モード

WebFetch で `$ARGUMENTS` のページを取得し、タイトルと本文を抽出する。

slug を `YYYY-MM-DD_（URLの末尾パスセグメント）` で決定する。

→ **Step 1（スタイル確認）へ進む**

---

## Step 1: スタイルと品質基準の確認

以下を Read する：

- `docs/hitomi-style-guide.md` — 執筆スタイル・温度感・構成ルール
- `docs/article-rulebook.md` — 品質基準
- `templates/header.md` — 固定ヘッダー
- `templates/footer.md` — 固定フッター（`{{DATE}}` は YYYYMMDD に置換）

---

## Step 2: 記事の執筆

### フロントマター（必ず以下の形式で書く）

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

1. `# タイトル`（H1はここだけ）
   - 直後にアイキャッチ画像プレースホルダー：
     ```
     <!-- 🖼️ IMAGE:EYECATCH | 画像生成プロンプトは image-prompts.md を参照 -->
     ![アイキャッチ](IMAGE_EYECATCH_URL)
     ```
2. `## はじめに` — `templates/header.md` の内容をそのまま挿入する
3. 本文セクション（`##` × 3〜5個）
   - 中盤の最重要セクション直後にメイン画像プレースホルダー：
     ```
     <!-- 🖼️ IMAGE:MAIN | 画像生成プロンプトは image-prompts.md を参照 -->
     ![メイン画像](IMAGE_MAIN_URL)
     ```
4. `## まとめ`
   - まとめ内にまとめ画像プレースホルダー：
     ```
     <!-- 🖼️ IMAGE:FOOTER | 画像生成プロンプトは image-prompts.md を参照 -->
     ![まとめ画像](IMAGE_FOOTER_URL)
     ```
   - `templates/footer.md` を末尾に挿入する

### 執筆スタイル（docs/hitomi-style-guide.md に必ず従う）

- 先輩エンジニアが後輩に話す温度感で書く（教科書調は禁止）
- 会話例・実体験風エピソードを入れる
- 読者を責めない（「間違っています」「やってはいけません」は使わない）
- まとめはマインドセット・意識の変化で締める（箇条書きおさらいは禁止）
- 明日できる具体的な一行動で終わる

### 執筆後の自己チェック

- [ ] 会話例・現場エピソードがあるか
- [ ] 読者を責める表現がないか
- [ ] まとめが「箇条書きおさらい」になっていないか
- [ ] 明日できる行動で終わっているか
- [ ] **太字** の前後に半角スペースがあるか
- [ ] コードブロックに言語識別子があるか
- [ ] H1が1箇所だけか
- [ ] 敬体（です・ます調）で統一されているか

---

## Step 3: ファイルの保存

以下の2ファイルを Write する：

**`public/{slug}/draft.md`** — フロントマターから固定フッターの末尾まで全文

**`public/{slug}/image-prompts.md`** — 画像生成プロンプト（3案 × 3箇所）

```markdown
# 画像生成プロンプト集

記事タイトル: （タイトル）

## アイキャッチ画像（3案）
> 記事全体を象徴する印象的なシーン

1. （英語プロンプト案1）
2. （英語プロンプト案2）
3. （英語プロンプト案3）

## メイン画像（3案）
> 記事の核心を体験しているシーン

1. （英語プロンプト案1）
2. （英語プロンプト案2）
3. （英語プロンプト案3）

## まとめ画像（3案）
> 達成感・次への一歩・行動を促す前向きなシーン

1. （英語プロンプト案1）
2. （英語プロンプト案2）
3. （英語プロンプト案3）
```

プロンプトには必ず含める：
`anime style illustration, Japanese anime art, young female engineer, modern Japanese office, Reiwa era, expressive character, clean linework, vibrant colors`

---

## 完了報告

保存した slug と保存先ファイルを報告する。
