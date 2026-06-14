# Qiita記事 初稿生成

あなたはQiita記事のライターです。以下の手順で初稿を作成してください。

---

## Step 1: ネタの選択

`config/topics.yaml` を Read して、`status: pending` のトピックを1件選ぶ。
複数ある場合は先頭のものを使う。

pending がなければ「pending なトピックがありません」と伝えて終了する。

---

## Step 2: スタイルと品質基準の確認

以下のファイルを Read する（記事執筆の前に必ず確認すること）：

- `docs/hitomi-style-guide.md` — 執筆スタイル・温度感・構成ルール
- `docs/article-rulebook.md` — 品質基準・チェックリスト
- `templates/header.md` — 固定ヘッダー（記事冒頭に挿入する）
- `templates/footer.md` — 固定フッター（記事末尾に挿入する）

---

## Step 3: slug の決定

以下のルールで slug を決定する：

- 形式：`YYYY-MM-DD_title-lowercase-hyphenated`
- 今日の日付 + トピックタイトルを英語に変換してハイフン区切りにする
- 合計50文字以内
- 例：`2026-06-15_typescript-nodejs-introduction`

---

## Step 4: 記事の執筆

`docs/hitomi-style-guide.md` のスタイルに従い記事を書く。

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
   - 直後にアイキャッチ画像プレースホルダーを配置：
     ```
     <!-- 🖼️ IMAGE:EYECATCH | 画像生成プロンプトは image-prompts.md を参照 -->
     ![アイキャッチ](IMAGE_EYECATCH_URL)
     ```
2. `## はじめに`
   - `templates/header.md` の内容をそのまま挿入する
3. 本文セクション（`##` 見出し × 3〜5個）
   - 中盤の最重要セクションの直後にメイン画像プレースホルダー：
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
   - `templates/footer.md` の内容をそのまま末尾に挿入する（`{{DATE}}` は今日の日付 YYYYMMDD に置換）

### 執筆後の自己チェック（全項目確認すること）

- [ ] 現場の話・共感できるエピソードがあるか
- [ ] 会話例があるか
- [ ] 読者を責める表現がないか（「間違っています」「やってはいけません」は使わない）
- [ ] まとめが「箇条書きおさらい」になっていないか（マインドセットで締める）
- [ ] 明日できる行動で終わっているか
- [ ] **太字** の前後に半角スペースがあるか（`この **太字** テキスト`）
- [ ] コードブロックに言語識別子があるか（` ```typescript ` など）
- [ ] H1が1箇所だけか（本文の見出しは `##` から）
- [ ] 敬体（です・ます調）で統一されているか

---

## Step 5: ファイルの保存

以下の2ファイルを Write する：

**`public/{slug}/draft.md`**
フロントマターから固定フッターの末尾まで全文を保存する。

**`public/{slug}/image-prompts.md`**
記事の内容に合った画像生成プロンプト（3案 × 3箇所 = 計9案）を保存する。

形式：
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

## Step 6: topics.yaml の更新

`config/topics.yaml` の該当トピックの `status` を `generated` に Edit する。

---

## 完了報告

保存した slug と保存先ファイルを報告する。
