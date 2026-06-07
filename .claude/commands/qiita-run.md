Qiita記事の生成から限定公開投稿まで自動実行します。

## 引数の判定

`$ARGUMENTS` を確認して、以下のモードを選択してください：

| 引数 | モード |
|---|---|
| なし | **topics.yaml モード**（pending トピックを処理） |
| `http://` または `https://` で始まる | **URL モード**（1件のURLから記事生成） |
| `.csv` で終わる | **CSV バッチモード**（ファイル内のURLを順番に処理、最大5件） |

---

## 【topics.yaml モード】引数なし

### Step 1: 記事生成

!NODE_OPTIONS=--use-system-ca npm run generate

出力されたプロンプトの指示に従い、記事を執筆してください。

- slug を決定する（形式: `YYYY-MM-DD_title-lowercase-hyphenated`）
- `public/{slug}/draft.md` にQiitaフロントマター付きMarkdownで保存
- `config/topics.yaml` の該当トピックの `status` を `generated` に変更
- 決定した slug を記憶する（以降のステップで使用）

生成後、**[URL モード] Step 2以降** に進んでください（slug は今決めたものを使用）。

---

## 【URL モード】URLが引数 / またはtopics.yamlモードのStep 1完了後

### Step 1（URL モードのみ）: URL取得・記事生成

!NODE_OPTIONS=--use-system-ca npm run fetch -- $ARGUMENTS

出力されたプロンプトと slug を確認してください。
プロンプトの指示に従い、以下の2ファイルを生成・保存してください：

- `public/{slug}/draft.md`（フロントマター付き記事全文）
- `public/{slug}/image-prompts.md`（画像生成プロンプト 3案×3箇所）

### Step 2: レビュー

!NODE_OPTIONS=--use-system-ca npm run review -- {slug}

出力されたプロンプトに従ってレビューし、`public/{slug}/review.md` に保存してください。

### Step 3: リライト

!NODE_OPTIONS=--use-system-ca npm run rewrite -- {slug}

出力されたプロンプトに従いリライト記事を作成し、`public/{slug}/rewrite.md` に保存してください。

### Step 4: 採点

!NODE_OPTIONS=--use-system-ca npm run score -- {slug}

出力されたプロンプトに従い採点し、`public/{slug}/score.json` に保存してください。

**採点結果の判定：**
- `pass: true`（80点以上）→ Step 5へ進む
- `pass: false`（80点未満）→ `public/{slug}/score.json` と `public/{slug}/rewrite.md` を削除してStep 3に戻る（最大3回）
- 3回試してもFAILの場合 → ここで停止し、改善が必要な点を報告する

### Step 5: Qiita 投稿

!NODE_OPTIONS=--use-system-ca npm run publish -- {slug}

Qiitaに限定共有（private: true）で投稿します。

完了後、投稿された slug と Qiita の URL を報告してください。

---

## 【CSV バッチモード】.csv ファイルが引数

CSVファイル（`$ARGUMENTS`）を読み込み、URLを順番に処理してください。

### CSVファイルの読み込み

!type $ARGUMENTS

上記コマンドの出力を確認し、URL の一覧を取得してください。

- ヘッダー行（`url` という行）は無視する
- 空行は無視する
- 最大5件まで処理する（5件を超える場合は先頭5件のみ）
- 処理済みのURL は後で確認できるよう記録しておく

### 各URLの処理

取得した各URLに対して、**【URL モード】Step 1〜5** をそのまま実行してください。
1件完了してから次のURLに進んでください。

全件完了後、処理結果（slug と Qiita URL の一覧）を報告してください。
