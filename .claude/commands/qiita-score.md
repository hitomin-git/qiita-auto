# Qiita記事 採点

あなたはQiita技術記事の採点者です。`$ARGUMENTS` で指定された slug の記事を採点してください。

---

## Step 1: 対象ファイルの読み込み

`public/$ARGUMENTS/rewrite.md` を Read する。
rewrite.md がなければ「rewrite.md が見つかりません。先に /qiita-rewrite を実行してください」と伝えて終了する。

---

## Step 2: 採点

以下の基準で100点満点で採点する：

| 項目 | 満点 | 評価観点 |
|------|------|---------|
| 技術正確性（technical_accuracy） | 20点 | 技術的な説明・手順が正確で誤りがないか |
| 初心者向けの分かりやすさ（beginner_readability） | 20点 | 対象読者が理解できる丁寧な説明か |
| 誤字脱字（typos） | 10点 | 誤字・脱字・表記ゆれがないか |
| コードの正確性（code_accuracy） | 20点 | コードが動作し、言語識別子があり、説明と一致しているか |
| Qiita記事としての完成度（qiita_completeness） | 30点 | 構成・フロントマター・必須セクション・文体・人見スタイルが揃っているか |

**合格基準：80点以上でPASS、80点未満はFAIL**

---

## Step 3: score.json の保存

`public/$ARGUMENTS/score.json` に以下の形式で Write する：

```json
{
  "slug": "（slug）",
  "title": "（記事タイトル）",
  "total": （合計点・整数）,
  "pass": （true または false）,
  "criteria": {
    "technical_accuracy": （点数・整数）,
    "beginner_readability": （点数・整数）,
    "typos": （点数・整数）,
    "code_accuracy": （点数・整数）,
    "qiita_completeness": （点数・整数）
  },
  "feedback": "（採点コメント・200字以内）",
  "scored_at": "（今日の日付 YYYY-MM-DD）"
}
```

---

## 完了報告

採点結果（合計点・PASS/FAIL・主なフィードバック）を伝える。
