import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";
import * as dotenv from "dotenv";

dotenv.config();

export interface Topic {
  title: string;
  tags: string[];
  level: "beginner" | "intermediate" | "advanced";
  status: "pending" | "generated" | "published";
}

export interface TopicsConfig {
  topics: Topic[];
}

export function loadTopics(): Topic[] {
  const configPath = path.resolve(process.cwd(), "config/topics.yaml");
  const raw = fs.readFileSync(configPath, "utf-8");
  const parsed = yaml.load(raw) as TopicsConfig;
  return parsed.topics;
}

export function getApiKey(): string {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error("ANTHROPIC_API_KEY が .env に設定されていません");
  }
  return key;
}
