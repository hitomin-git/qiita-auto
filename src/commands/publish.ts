import { execSync } from "child_process";
import * as dotenv from "dotenv";
import {
  listGeneratedSlugs,
  loadPhaseFile,
  phaseFileExists,
  savePhaseFile,
} from "../utils/fileManager";
import { logger } from "../utils/logger";

dotenv.config();

interface ScoreResult {
  pass: boolean;
  total: number;
}

function listPublishCandidates(): string[] {
  return listGeneratedSlugs().filter(
    (s) =>
      phaseFileExists(s, "score.json") &&
      phaseFileExists(s, "rewrite.md") &&
      !phaseFileExists(s, "index.md")
  );
}

function main() {
  const token = process.env.QIITA_TOKEN;
  if (!token) {
    logger.error("QIITA_TOKEN が .env に設定されていません");
    process.exit(1);
  }

  const slug = process.argv[2];

  if (!slug) {
    const candidates = listPublishCandidates();
    if (candidates.length === 0) {
      logger.warn("publish対象の記事がありません（score.jsonがPASSでrewrite.mdが存在するスラグが必要です）");
      process.exit(0);
    }
    logger.info("slug を指定して実行してください:");
    logger.info("  npm run publish -- <slug>\n");
    logger.info("対象候補:");
    candidates.forEach((s) => console.log(`  ${s}`));
    process.exit(0);
  }

  if (!phaseFileExists(slug, "score.json")) {
    logger.error(`score.json が見つかりません: public/${slug}/score.json`);
    logger.error(`先に npm run score -- ${slug} を実行してください`);
    process.exit(1);
  }

  const score: ScoreResult = JSON.parse(loadPhaseFile(slug, "score.json"));
  if (!score.pass) {
    logger.error(`採点結果が FAIL（${score.total}点）のため投稿できません`);
    logger.error("rewrite.md を修正して npm run score をやり直してください");
    process.exit(1);
  }

  if (!phaseFileExists(slug, "rewrite.md")) {
    logger.error(`rewrite.md が見つかりません: public/${slug}/rewrite.md`);
    process.exit(1);
  }

  // rewrite.md → index.md にコピー
  const rewriteContent = loadPhaseFile(slug, "rewrite.md");
  savePhaseFile(slug, "index.md", rewriteContent);
  logger.success(`rewrite.md → index.md にコピーしました`);

  // Qiita に投稿
  logger.info(`Qiita に投稿します: ${slug}`);
  try {
    execSync(`npx qiita publish ${slug}`, {
      env: { ...process.env, QIITA_TOKEN: token },
      stdio: "inherit",
    });
    logger.success(`投稿完了: ${slug}`);
  } catch {
    logger.error("Qiita への投稿に失敗しました");
    process.exit(1);
  }
}

main();
