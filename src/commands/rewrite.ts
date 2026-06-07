import * as fs from "fs";
import * as path from "path";
import {
  listGeneratedSlugs,
  loadDraft,
  loadPhaseFile,
  phaseFileExists,
  extractFrontmatterField,
} from "../utils/fileManager";
import { loadTopics } from "../utils/config";
import { logger } from "../utils/logger";

function buildRewritePrompt(slug: string): string {
  const templatePath = path.resolve(process.cwd(), "templates/prompts/rewrite.txt");
  const template = fs.readFileSync(templatePath, "utf-8");
  const draft = loadDraft(slug);
  const review = loadPhaseFile(slug, "review.md");
  const title = extractFrontmatterField(draft, "title");
  const topics = loadTopics();
  const topic = topics.find((t) => t.title === title);
  const level = topic?.level ?? "beginner";

  return template
    .replace(/\{\{TITLE\}\}/g, title)
    .replace(/\{\{LEVEL\}\}/g, level)
    .replace(/\{\{DRAFT_CONTENT\}\}/g, draft)
    .replace(/\{\{REVIEW_CONTENT\}\}/g, review);
}

function listRewriteCandidates(): string[] {
  return listGeneratedSlugs().filter(
    (s) => phaseFileExists(s, "draft.md") && phaseFileExists(s, "review.md")
  );
}

function main() {
  const slug = process.argv[2];

  if (!slug) {
    const candidates = listRewriteCandidates();
    if (candidates.length === 0) {
      logger.warn("rewrite対象の記事がありません（index.md と review.md の両方が必要です）");
      process.exit(0);
    }
    logger.info("slug を指定して実行してください:");
    logger.info("  npm run rewrite -- <slug>\n");
    logger.info("対象候補:");
    candidates.forEach((s) => console.log(`  ${s}`));
    process.exit(0);
  }

  if (!phaseFileExists(slug, "draft.md")) {
    logger.error(`draft.md が見つかりません: public/${slug}/draft.md`);
    process.exit(1);
  }

  if (!phaseFileExists(slug, "review.md")) {
    logger.error(`review.md が見つかりません: public/${slug}/review.md`);
    logger.error(`先に npm run review -- ${slug} を実行してください`);
    process.exit(1);
  }

  if (phaseFileExists(slug, "rewrite.md")) {
    logger.warn(`rewrite.md はすでに存在します: public/${slug}/rewrite.md`);
    logger.warn("上書きする場合は rewrite.md を手動で削除してください");
    process.exit(1);
  }

  console.log("=".repeat(60));
  console.log("以下のプロンプトを使って rewrite.md を生成してください");
  console.log(`保存先: public/${slug}/rewrite.md`);
  console.log("=".repeat(60) + "\n");
  console.log(buildRewritePrompt(slug));
  logger.info(`生成後: public/${slug}/rewrite.md として保存してください`);
}

main();
