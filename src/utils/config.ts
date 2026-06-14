/**
 * config.ts — 設定ファイル読み込みユーティリティ
 *
 * config/topics.yaml を読み込んで、記事トピックの一覧を返す。
 * topics.yaml には「どんな記事を書くか」の情報（タイトル・タグ・レベル・状態）が書かれており、
 * generate コマンドがこの情報をもとに記事生成プロンプトを組み立てる。
 *
 * topics.yaml の例:
 *   topics:
 *     - title: "TypeScript入門"
 *       tags: [TypeScript, Node.js]
 *       level: beginner
 *       status: pending       ← pending のものが記事生成対象になる
 */

import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";
import * as dotenv from "dotenv";

// .env ファイルから環境変数を読み込む（QIITA_TOKEN など）
dotenv.config();

/** 記事1件分のトピック情報 */
export interface Topic {
  title: string;
  tags: string[];
  /** 対象読者レベル */
  level: "beginner" | "intermediate" | "advanced";
  /** 記事の処理状態。pending → generated → published の順に進む */
  status: "pending" | "generated" | "published";
}

/** topics.yaml のルート構造 */
export interface TopicsConfig {
  topics: Topic[];
}

/**
 * config/topics.yaml を読み込んでトピック一覧を返す。
 * ファイルが存在しない場合は Node.js の標準エラーが発生する。
 */
export function loadTopics(): Topic[] {
  const configPath = path.resolve(process.cwd(), "config/topics.yaml");
  const raw = fs.readFileSync(configPath, "utf-8");
  const parsed = yaml.load(raw) as TopicsConfig;
  return parsed.topics;
}

/**
 * Anthropic API キーを環境変数から取得する。
 *
 * @remarks
 * 現在の運用では Claude Code（ログイン済みセッション）が記事生成を担うため、
 * このキーは直接使われない。将来 API を直接呼び出す実装（claudeClient.ts）に
 * 切り替えた際に使用する想定。
 */
export function getApiKey(): string {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error("ANTHROPIC_API_KEY が .env に設定されていません");
  }
  return key;
}
