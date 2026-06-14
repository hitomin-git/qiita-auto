/**
 * review.ts — レビュープロンプト出力コマンド（Phase 2）
 *
 * 実行方法:
 *   NODE_OPTIONS=--use-system-ca npm run review -- <slug>
 *
 * やること:
 *   1. public/{slug}/draft.md を読み込み、機械的な構造チェックを実行する
 *      （フロントマター・h1 重複・コードブロックの言語識別子など）
 *   2. チェック結果をターミナルに出力する
 *   3. AI レビュー用プロンプトを組み立てて出力する
 *
 * このコマンド自体は review.md を生成しない。
 * 出力されたプロンプトを Claude Code が受け取り、review.md を public/{slug}/review.md に保存する。
 *
 * 【前後のフェーズ】
 *   generate/fetch（draft.md） → ★review（review.md） → rewrite → score → publish
 */

import * as fs from "fs";
import * as path from "path";
import {
  listGeneratedSlugs,
  loadDraft,
  phaseFileExists,
  extractFrontmatterField,
} from "../utils/fileManager";
import { reviewArticle } from "../reviewer/articleReviewer";
import { loadTopics } from "../utils/config";
import { logger } from "../utils/logger";

/**
 * draft.md と topics.yaml を参照してレビュープロンプトを組み立てる。
 * テンプレート変数: {{TITLE}}, {{LEVEL}}, {{DRAFT_CONTENT}}
 */
function buildReviewPrompt(slug: string): string {
  const templatePath = path.resolve(process.cwd(), "templates/prompts/review.txt");
  const template = fs.readFileSync(templatePath, "utf-8");
  const draft = loadDraft(slug);

  // フロントマターからタイトルを取り出し、topics.yaml で対象読者レベルを調べる
  const title = extractFrontmatterField(draft, "title");
  const topics = loadTopics();
  const topic = topics.find((t) => t.title === title);
  const level = topic?.level ?? "beginner"; // topics.yaml に登録がない場合は beginner

  return template
    .replace(/\{\{TITLE\}\}/g, title)
    .replace(/\{\{LEVEL\}\}/g, level)
    .replace(/\{\{DRAFT_CONTENT\}\}/g, draft);
}

/** draft.md が存在するスラグ（= レビュー対象の候補）を一覧で返す */
function listReviewCandidates(): string[] {
  return listGeneratedSlugs().filter((s) => phaseFileExists(s, "draft.md"));
}

function main() {
  const slug = process.argv[2];

  // slug 未指定の場合は候補一覧を表示して終了
  if (!slug) {
    const candidates = listReviewCandidates();
    if (candidates.length === 0) {
      logger.warn("review対象の記事がありません（public/{slug}/draft.md が存在するスラグが必要です）");
      process.exit(0);
    }
    logger.info("slug を指定して実行してください:");
    logger.info("  npm run review -- <slug>\n");
    logger.info("対象候補:");
    candidates.forEach((s) => console.log(`  ${s}`));
    process.exit(0);
  }

  // 前フェーズ（generate）の成果物が存在するか確認
  if (!phaseFileExists(slug, "draft.md")) {
    logger.error(`draft.md が見つかりません: public/${slug}/draft.md`);
    process.exit(1);
  }

  // すでに review.md がある場合は誤上書きを防ぐ
  if (phaseFileExists(slug, "review.md")) {
    logger.warn(`review.md はすでに存在します: public/${slug}/review.md`);
    logger.warn("上書きする場合は review.md を手動で削除してください");
    process.exit(1);
  }

  // ── Step 1: 機械的な構造チェック（自動） ──────────────────
  const content = loadDraft(slug);
  const result = reviewArticle(content);

  logger.info(`【構造チェック】 ${slug}`);
  if (result.errors.length > 0) {
    result.errors.forEach((e) => logger.error(e));
  }
  if (result.warnings.length > 0) {
    result.warnings.forEach((w) => logger.warn(w));
  }
  if (result.passed) {
    logger.success(`構造チェック OK${result.warnings.length > 0 ? `（警告 ${result.warnings.length} 件）` : ""}`);
  } else {
    logger.error(`構造チェック NG（エラー ${result.errors.length} 件）`);
  }

  // ── Step 2: AI レビュー用プロンプトを出力 ─────────────────
  console.log("\n" + "=".repeat(60));
  console.log("以下のプロンプトを使って review.md を生成してください");
  console.log(`保存先: public/${slug}/review.md`);
  console.log("=".repeat(60) + "\n");
  console.log(buildReviewPrompt(slug));
  logger.info(`生成後: public/${slug}/review.md として保存してください`);
}

main();
