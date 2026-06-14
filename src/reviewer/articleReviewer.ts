/**
 * articleReviewer.ts — 記事の静的チェック（自動検査）
 *
 * Claude Code が記事を生成した後、AI によるレビューの前に
 * 機械的にチェックできる項目を自動検査する。
 *
 * 検査する内容:
 *   🔴 エラー（必須修正）: フロントマターなし、h1 タグの重複
 *   🟡 警告（推奨修正）: 言語識別子なしのコードブロック、日本語隣接の太字スペース漏れ、
 *                        「はじめに」「まとめ」セクションなし、本文が短すぎる
 *
 * レビューコマンド（review.ts）がこの検査を最初に実行し、
 * AI プロンプトを表示する前に結果をターミナルへ出力する。
 */

export interface ReviewResult {
  /** すべてのエラーが0件のとき true */
  passed: boolean;
  /** 必須修正項目（これがあると品質基準を満たせない） */
  errors: string[];
  /** 推奨修正項目（なくても動くが品質が下がる） */
  warnings: string[];
}

/**
 * 記事の Markdown 文字列を受け取り、静的チェックを実行する。
 *
 * @param content - draft.md または rewrite.md の全文
 * @returns エラー・警告の一覧と passed フラグ
 */
export function reviewArticle(content: string): ReviewResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // ─── エラーチェック ─────────────────────────────────────────

  // フロントマターが存在するか（--- で始まる YAML ブロック）
  if (!content.startsWith("---")) {
    errors.push("フロントマターが見つかりません");
  }

  // h1（# 見出し）が複数ある場合はエラー
  // Qiita ではタイトルが h1 相当なので、本文中に h1 を使うとレイアウトが崩れる
  const h1Matches = content.match(/^# .+/gm) ?? [];
  if (h1Matches.length > 1) {
    errors.push(`h1（#）が複数あります（${h1Matches.length}箇所）。タイトル以外では使用しないでください`);
  }

  // ─── 警告チェック ─────────────────────────────────────────

  // 言語識別子のないコードブロック（``` だけの行）
  // Qiita ではシンタックスハイライトが効かなくなる
  const codeBlocks = content.match(/```\n/g) ?? [];
  if (codeBlocks.length > 0) {
    warnings.push(`言語識別子のないコードブロックが ${codeBlocks.length} 箇所あります`);
  }

  // 日本語テキストに **太字** が直接隣接しているケースを検出
  // Qiita の Markdown パーサーでは日本語直後の ** が太字として認識されないことがある
  //
  // NG: この**太字**テキスト  → スペースなし
  // OK: この **太字** テキスト → 前後にスペースあり
  //
  // 正規表現の意味:
  //   [　-鿿＀-￯] ... CJK 統合漢字・ひらがな・カタカナ等の Unicode 範囲
  //   \*\*[^\s*]   ... ** の直後に空白以外の文字（= 開き ** の前にスペースなし）
  //   [^\s*]\*\*[　-鿿＀-￯] ... ** の直前に空白以外（= 閉じ ** の後にスペースなし）
  const boldNoSpace = content.match(/[　-鿿＀-￯]\*\*[^\s*]|[^\s*]\*\*[　-鿿＀-￯]/g) ?? [];
  if (boldNoSpace.length > 0) {
    warnings.push(
      `日本語に隣接する **太字** にスペースがありません（${boldNoSpace.length} 箇所）。` +
      `「この**太字**テキスト」→「この **太字** テキスト」に修正してください`
    );
  }

  // 必須セクションの存在チェック
  if (!/^## はじめに/m.test(content)) {
    warnings.push("「## はじめに」セクションが見つかりません");
  }
  if (!/^## まとめ/m.test(content)) {
    warnings.push("「## まとめ」セクションが見つかりません");
  }

  // 本文の文字数チェック（コードブロックとフロントマターを除外して計算）
  const bodyText = content
    .replace(/```[\s\S]*?```/g, "")  // コードブロックを除去
    .replace(/---[\s\S]*?---/, "");  // フロントマターを除去
  const charCount = bodyText.length;
  if (charCount < 800) {
    warnings.push(`本文が短すぎます（${charCount}字）。目安は 1,000字以上です`);
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings,
  };
}
