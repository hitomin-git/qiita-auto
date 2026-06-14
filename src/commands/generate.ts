/**
 * generate.ts — 記事生成プロンプト出力コマンド（topics.yaml モード）
 *
 * 実行方法:
 *   NODE_OPTIONS=--use-system-ca npm run generate
 *
 * やること:
 *   1. config/topics.yaml を読み込み、status が "pending" のトピックを抽出する
 *   2. 各トピックに対して、Claude Code へ渡す記事生成プロンプトを組み立てる
 *   3. プロンプトをターミナルに出力する（最大5件）
 *
 * このコマンド自体は記事を書かない。
 * 出力されたプロンプトを Claude Code が受け取り、記事を public/{slug}/draft.md に保存する。
 *
 * 【関連コマンドの流れ】
 *   generate → review → rewrite → score → publish
 */

import { loadTopics } from "../utils/config";
import { buildPrompt } from "../generator/articleBuilder";
import { slugify } from "../utils/fileManager";
import { logger } from "../utils/logger";

function main() {
  const topics = loadTopics();

  // status が "pending" のトピックのみ処理対象にする
  const pending = topics.filter((t) => t.status === "pending");

  if (pending.length === 0) {
    logger.warn("pending なトピックがありません（config/topics.yaml を確認してください）");
    process.exit(0);
  }

  logger.info(`${pending.length} 件の pending トピックが見つかりました`);
  logger.info("以下のプロンプトを Claude Code に渡して記事を生成してください\n");

  // 一度に処理するのは最大5件（大量生成を防ぐため）
  const targets = pending.slice(0, 5);

  targets.forEach((topic, i) => {
    const slug = slugify(topic.title);
    const prompt = buildPrompt(topic);

    // 各トピックのプロンプトを区切り線で囲んで出力
    console.log("=".repeat(60));
    console.log(`[${i + 1}/${targets.length}] ${topic.title}`);
    console.log(`slug:   ${slug}`);
    console.log(`保存先: public/${slug}/draft.md`);
    console.log(`        public/${slug}/image-prompts.md`);
    console.log("=".repeat(60));
    console.log(prompt);
    console.log();
  });

  logger.info("生成後: public/{slug}/draft.md に保存し、topics.yaml の status を generated に変更してください");
}

main();
