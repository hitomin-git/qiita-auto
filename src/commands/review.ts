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

function buildReviewPrompt(slug: string): string {
  const templatePath = path.resolve(process.cwd(), "templates/prompts/review.txt");
  const template = fs.readFileSync(templatePath, "utf-8");
  const draft = loadDraft(slug);
  const title = extractFrontmatterField(draft, "title");
  const topics = loadTopics();
  const topic = topics.find((t) => t.title === title);
  const level = topic?.level ?? "beginner";

  return template
    .replace(/\{\{TITLE\}\}/g, title)
    .replace(/\{\{LEVEL\}\}/g, level)
    .replace(/\{\{DRAFT_CONTENT\}\}/g, draft);
}

function listReviewCandidates(): string[] {
  return listGeneratedSlugs().filter((s) => phaseFileExists(s, "draft.md"));
}

function main() {
  const slug = process.argv[2];

  if (!slug) {
    const candidates = listReviewCandidates();
    if (candidates.length === 0) {
      logger.warn("review対象の記事がありません（public/{slug}/index.md が存在するスラグが必要です）");
      process.exit(0);
    }
    logger.info("slug を指定して実行してください:");
    logger.info("  npm run review -- <slug>\n");
    logger.info("対象候補:");
    candidates.forEach((s) => console.log(`  ${s}`));
    process.exit(0);
  }

  if (!phaseFileExists(slug, "draft.md")) {
    logger.error(`draft.md が見つかりません: public/${slug}/draft.md`);
    process.exit(1);
  }

  if (phaseFileExists(slug, "review.md")) {
    logger.warn(`review.md はすでに存在します: public/${slug}/review.md`);
    logger.warn("上書きする場合は review.md を手動で削除してください");
    process.exit(1);
  }

  // 構造チェック（自動）
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

  // レビュープロンプト表示
  console.log("\n" + "=".repeat(60));
  console.log("以下のプロンプトを使って review.md を生成してください");
  console.log(`保存先: public/${slug}/review.md`);
  console.log("=".repeat(60) + "\n");
  console.log(buildReviewPrompt(slug));
  logger.info(`生成後: public/${slug}/review.md として保存してください`);
}

main();
