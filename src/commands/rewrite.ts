/**
 * rewrite.ts — リライトプロンプト出力コマンド（Phase 3）
 *
 * 実行方法:
 *   NODE_OPTIONS=--use-system-ca npm run rewrite -- <slug>
 *
 * やること:
 *   1. public/{slug}/draft.md（初稿）と public/{slug}/review.md（レビュー結果）を読み込む
 *   2. 両方の内容をテンプレートに埋め込んで、リライト用プロンプトを出力する
 *
 * このコマンド自体は rewrite.md を生成しない。
 * 出力されたプロンプトを Claude Code が受け取り、rewrite.md を保存する。
 *
 * 【前後のフェーズ】
 *   review（review.md） → ★rewrite（rewrite.md） → score → publish
 */

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

/**
 * draft.md・review.md・topics.yaml を参照してリライトプロンプトを組み立てる。
 * テンプレート変数: {{TITLE}}, {{LEVEL}}, {{DRAFT_CONTENT}}, {{REVIEW_CONTENT}}
 */
function buildRewritePrompt(slug: string): string {
  const templatePath = path.resolve(process.cwd(), "templates/prompts/rewrite.txt");
  const template = fs.readFileSync(templatePath, "utf-8");
  const draft = loadDraft(slug);
  const review = loadPhaseFile(slug, "review.md");

  // フロントマターからタイトルを取り出し、topics.yaml で対象読者レベルを調べる
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

/** draft.md と review.md の両方が存在するスラグ（= リライト対象の候補）を返す */
function listRewriteCandidates(): string[] {
  return listGeneratedSlugs().filter(
    (s) => phaseFileExists(s, "draft.md") && phaseFileExists(s, "review.md")
  );
}

function main() {
  const slug = process.argv[2];

  // slug 未指定の場合は候補一覧を表示して終了
  if (!slug) {
    const candidates = listRewriteCandidates();
    if (candidates.length === 0) {
      logger.warn("rewrite対象の記事がありません（draft.md と review.md の両方が必要です）");
      process.exit(0);
    }
    logger.info("slug を指定して実行してください:");
    logger.info("  npm run rewrite -- <slug>\n");
    logger.info("対象候補:");
    candidates.forEach((s) => console.log(`  ${s}`));
    process.exit(0);
  }

  // 前フェーズの成果物が存在するか確認
  if (!phaseFileExists(slug, "draft.md")) {
    logger.error(`draft.md が見つかりません: public/${slug}/draft.md`);
    process.exit(1);
  }
  if (!phaseFileExists(slug, "review.md")) {
    logger.error(`review.md が見つかりません: public/${slug}/review.md`);
    logger.error(`先に npm run review -- ${slug} を実行してください`);
    process.exit(1);
  }

  // すでに rewrite.md がある場合は誤上書きを防ぐ
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
