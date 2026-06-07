import { loadTopics } from "../utils/config";
import { buildPrompt } from "../generator/articleBuilder";
import { logger } from "../utils/logger";

function main() {
  const topics = loadTopics();
  const pending = topics.filter((t) => t.status === "pending");

  if (pending.length === 0) {
    logger.warn("pending なトピックがありません（config/topics.yaml を確認してください）");
    process.exit(0);
  }

  logger.info(`${pending.length} 件の pending トピックが見つかりました`);
  logger.info("以下のプロンプトを Claude Code に渡して記事を生成してください\n");

  const targets = pending.slice(0, 5);
  targets.forEach((topic, i) => {
    const prompt = buildPrompt(topic);
    console.log(`${"=".repeat(60)}`);
    console.log(`【${i + 1}/${targets.length}】 ${topic.title}`);
    console.log(`${"=".repeat(60)}`);
    console.log(prompt);
    console.log();
  });

  logger.info("生成後: public/{slug}/index.md に保存し、topics.yaml の status を generated に変更してください");
}

main();
