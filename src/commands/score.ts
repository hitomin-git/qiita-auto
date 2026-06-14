/**
 * score.ts — 採点プロンプト出力コマンド（Phase 4）
 *
 * 実行方法:
 *   NODE_OPTIONS=--use-system-ca npm run score -- <slug>
 *
 * やること:
 *   1. public/{slug}/rewrite.md（リライト済み記事）を読み込む
 *   2. 採点用プロンプトを組み立てて出力する
 *
 * このコマンド自体は score.json を生成しない。
 * 出力されたプロンプトを Claude Code が受け取り、採点結果を score.json に保存する。
 *
 * score.json の形式（100点満点・80点以上で PASS）:
 *   {
 *     "slug": "...",
 *     "title": "...",
 *     "total": 85,
 *     "pass": true,
 *     "criteria": {
 *       "technical_accuracy": 20,
 *       "beginner_readability": 20,
 *       "typos": 15,
 *       "code_accuracy": 15,
 *       "qiita_completeness": 15
 *     },
 *     "feedback": "全体的に...",
 *     "scored_at": "2026-06-07T..."
 *   }
 *
 * 【前後のフェーズ】
 *   rewrite（rewrite.md） → ★score（score.json） → publish
 */

import * as fs from "fs";
import * as path from "path";
import {
  listGeneratedSlugs,
  loadPhaseFile,
  phaseFileExists,
  extractFrontmatterField,
} from "../utils/fileManager";
import { logger } from "../utils/logger";

/**
 * rewrite.md を参照して採点プロンプトを組み立てる。
 * テンプレート変数: {{SLUG}}, {{TITLE}}, {{REWRITE_CONTENT}}, {{SCORED_AT}}
 */
function buildScorePrompt(slug: string): string {
  const templatePath = path.resolve(process.cwd(), "templates/prompts/score.txt");
  const template = fs.readFileSync(templatePath, "utf-8");
  const rewrite = loadPhaseFile(slug, "rewrite.md");
  const title = extractFrontmatterField(rewrite, "title");
  const scoredAt = new Date().toISOString(); // 採点日時（ISO 8601 形式）

  return template
    .replace(/\{\{SLUG\}\}/g, slug)
    .replace(/\{\{TITLE\}\}/g, title)
    .replace(/\{\{REWRITE_CONTENT\}\}/g, rewrite)
    .replace(/\{\{SCORED_AT\}\}/g, scoredAt);
}

/** rewrite.md があり score.json がまだないスラグ（= 採点対象の候補）を返す */
function listScoreCandidates(): string[] {
  return listGeneratedSlugs().filter(
    (s) => phaseFileExists(s, "rewrite.md") && !phaseFileExists(s, "score.json")
  );
}

function main() {
  const slug = process.argv[2];

  // slug 未指定の場合は候補一覧を表示して終了
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

  // 前フェーズ（rewrite）の成果物が存在するか確認
  if (!phaseFileExists(slug, "rewrite.md")) {
    logger.error(`rewrite.md が見つかりません: public/${slug}/rewrite.md`);
    logger.error(`先に npm run rewrite -- ${slug} を実行してください`);
    process.exit(1);
  }

  // すでに score.json がある場合は誤上書きを防ぐ
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
