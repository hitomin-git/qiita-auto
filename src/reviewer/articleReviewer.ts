export interface ReviewResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
}

export function reviewArticle(content: string): ReviewResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!content.startsWith("---")) {
    errors.push("フロントマターが見つかりません");
  }

  const h1Matches = content.match(/^# .+/gm) ?? [];
  if (h1Matches.length > 1) {
    errors.push(`h1（#）が複数あります（${h1Matches.length}箇所）。タイトル以外では使用しないでください`);
  }

  const codeBlocks = content.match(/```\n/g) ?? [];
  if (codeBlocks.length > 0) {
    warnings.push(`言語識別子のないコードブロックが ${codeBlocks.length} 箇所あります`);
  }

  // 日本語テキストに ** が直接隣接しているケースを検出（スペース必須）
  // 例: この**太字**テキスト → NG / この **太字** テキスト → OK
  const boldNoSpace = content.match(/[　-鿿＀-￯]\*\*|\*\*[　-鿿＀-￯]/g) ?? [];
  if (boldNoSpace.length > 0) {
    warnings.push(
      `日本語に隣接する **太字** にスペースがありません（${boldNoSpace.length} 箇所）。` +
      `「この**太字**テキスト」→「この **太字** テキスト」に修正してください`
    );
  }

  if (!/^## はじめに/m.test(content)) {
    warnings.push("「## はじめに」セクションが見つかりません");
  }

  if (!/^## まとめ/m.test(content)) {
    warnings.push("「## まとめ」セクションが見つかりません");
  }

  const bodyText = content.replace(/```[\s\S]*?```/g, "").replace(/---[\s\S]*?---/, "");
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
