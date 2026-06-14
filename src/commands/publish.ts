/**
 * publish.ts — Qiita 投稿コマンド（Phase 5 / 最終フェーズ）
 *
 * 実行方法:
 *   NODE_OPTIONS=--use-system-ca npm run publish -- <slug>
 *
 * やること:
 *   1. score.json を確認し、PASS（80点以上）かどうかをチェックする
 *   2. rewrite.md を public/{slug}.md としてコピーする（Qiita CLI が読むファイル形式）
 *      このとき private: true に変換して「限定共有」状態で投稿する
 *   3. `npx qiita publish {slug}` を実行して Qiita へ投稿する
 *
 * 品質ゲート:
 *   score.json が存在しない、または pass: false の場合は投稿を中断する。
 *   これにより、品質基準を満たしていない記事が誤って公開されるのを防ぐ。
 *
 * 投稿形式:
 *   private: true（限定共有）で投稿する。公開にする場合は Qiita の管理画面で変更する。
 *
 * 【前後のフェーズ】
 *   score（score.json PASS） → ★publish（Qiita へ投稿）
 */

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import * as dotenv from "dotenv";
import {
  listGeneratedSlugs,
  loadPhaseFile,
  phaseFileExists,
} from "../utils/fileManager";
import { logger } from "../utils/logger";

// .env から QIITA_TOKEN を読み込む
dotenv.config();

/** score.json の型定義 */
interface ScoreResult {
  pass: boolean;
  total: number;
}

/** 投稿先ファイルのパスを返す（public/{slug}.md） */
function publishFilePath(slug: string): string {
  return path.resolve(process.cwd(), "public", `${slug}.md`);
}

/** 投稿済みファイルが存在するかどうかを確認する */
function publishFileExists(slug: string): boolean {
  return fs.existsSync(publishFilePath(slug));
}

/**
 * 投稿可能な記事（score.json が PASS かつ rewrite.md があり未投稿）の一覧を返す。
 * slug 未指定時の候補表示に使う。
 */
function listPublishCandidates(): string[] {
  return listGeneratedSlugs().filter(
    (s) =>
      phaseFileExists(s, "score.json") &&
      phaseFileExists(s, "rewrite.md") &&
      !publishFileExists(s)
  );
}

function main() {
  // QIITA_TOKEN が設定されていなければ即エラー
  const token = process.env.QIITA_TOKEN;
  if (!token) {
    logger.error("QIITA_TOKEN が .env に設定されていません");
    process.exit(1);
  }

  const slug = process.argv[2];

  // slug 未指定の場合は投稿候補一覧を表示して終了
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

  // ── 品質ゲート: score.json が PASS かどうか確認 ──────────
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

  // ── rewrite.md → public/{slug}.md へコピー ──────────────
  // Qiita CLI は public/{slug}.md を読んで投稿する
  // private: false → private: true に変換して限定共有にする
  // organization_url_name が設定されていれば null にクリアする
  const rewriteContent = loadPhaseFile(slug, "rewrite.md");
  const publishContent = rewriteContent
    .replace(/^private:\s*false$/m, "private: true")
    .replace(/^organization_url_name:\s*(?!null)\S+$/m, "organization_url_name: null");

  fs.writeFileSync(publishFilePath(slug), publishContent, "utf-8");
  logger.success(`rewrite.md → public/${slug}.md にコピーしました（限定共有: private: true）`);

  // ── Qiita CLI で投稿実行 ─────────────────────────────────
  logger.info(`Qiita に投稿します: ${slug}`);
  try {
    execSync(`npx qiita publish ${slug}`, {
      env: { ...process.env, QIITA_TOKEN: token },
      stdio: "inherit", // ターミナルへ出力をそのまま流す
    });
    logger.success(`投稿完了: ${slug}`);
  } catch {
    logger.error("Qiita への投稿に失敗しました");
    process.exit(1);
  }
}

main();
