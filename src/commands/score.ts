import * as fs from "fs";
import * as path from "path";
import {
  listGeneratedSlugs,
  loadPhaseFile,
  phaseFileExists,
  extractFrontmatterField,
} from "../utils/fileManager";
import { logger } from "../utils/logger";

function buildScorePrompt(slug: string): string {
  const templatePath = path.resolve(process.cwd(), "templates/prompts/score.txt");
  const template = fs.readFileSync(templatePath, "utf-8");
  const rewrite = loadPhaseFile(slug, "rewrite.md");
  const title = extractFrontmatterField(rewrite, "title");
  const scoredAt = new Date().toISOString();

  return template
    .replace(/\{\{SLUG\}\}/g, slug)
    .replace(/\{\{TITLE\}\}/g, title)
    .replace(/\{\{REWRITE_CONTENT\}\}/g, rewrite)
    .replace(/\{\{SCORED_AT\}\}/g, scoredAt);
}

function listScoreCandidates(): string[] {
  return listGeneratedSlugs().filter(
    (s) => phaseFileExists(s, "rewrite.md") && !phaseFileExists(s, "score.json")
  );
}

function main() {
  const slug = process.argv[2];

  if (!slug) {
    const candidates = listScoreCandidates();
    if (candidates.length === 0) {
      logger.warn("score対象の記事がありません（rewrite.md が存在し score.json がないスラグが必要です）");
      process.exit(0);
    }
    logger.info("slug を指定して実行してください:");
    logger.info("  npm run score -- <slug>\n");
    logger.info("対象候補:");
    candidates.forEach((s) => console.log(`  ${s}`));
    process.exit(0);
  }

  if (!phaseFileExists(slug, "rewrite.md")) {
    logger.error(`rewrite.md が見つかりません: public/${slug}/rewrite.md`);
    logger.error(`先に npm run rewrite -- ${slug} を実行してください`);
    process.exit(1);
  }

  if (phaseFileExists(slug, "score.json")) {
    logger.warn(`score.json はすでに存在します: public/${slug}/score.json`);
    logger.warn("再採点する場合は score.json を手動で削除してください");
    process.exit(1);
  }

  console.log("=".repeat(60));
  console.log("以下のプロンプトを使って score.json を生成してください");
  console.log(`保存先: public/${slug}/score.json`);
  console.log("=".repeat(60) + "\n");
  console.log(buildScorePrompt(slug));
  logger.info(`生成後: public/${slug}/score.json として保存してください`);
  logger.info("80点以上で PASS、80点未満は FAIL となります");
}

main();
