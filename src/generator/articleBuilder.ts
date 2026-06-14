/**
 * articleBuilder.ts — 記事生成プロンプトの組み立て
 *
 * topics.yaml から読み込んだトピック情報と、templates/prompts/ 以下のテンプレートを
 * 組み合わせて、Claude Code へ渡す記事生成プロンプトを作る。
 *
 * テンプレート変数の置換イメージ:
 *   {{TITLE}}          → "TypeScript 入門"
 *   {{LEVEL}}          → "beginner"
 *   {{TAGS}}           → "TypeScript, Node.js"
 *   {{TAGS_YAML}}      → "  - TypeScript\n  - Node.js"
 *   {{HEADER_CONTENT}} → templates/header.md の中身（全記事共通の導入文）
 *   {{FOOTER_CONTENT}} → templates/footer.md の中身（全記事共通の締め）
 *   {{SLUG}}           → "2026-06-07_typescript-nodejs-introduction"
 */

import * as fs from "fs";
import * as path from "path";
import { Topic } from "../utils/config";
import { slugify } from "../utils/fileManager";

/**
 * トピック情報からプロンプト文字列を生成して返す。
 *
 * @param topic       topics.yaml から読み込んだトピック1件
 * @param templateName テンプレートファイル名（拡張子なし）。デフォルトは "tech-intro"
 * @returns           Claude Code に渡す完成プロンプト文字列
 */
export function buildPrompt(topic: Topic, templateName = "tech-intro"): string {
  // テンプレートファイルを読み込む
  const templatePath = path.resolve(process.cwd(), `templates/prompts/${templateName}.txt`);
  let template = fs.readFileSync(templatePath, "utf-8");

  // フロントマターに必要な tags の YAML 形式を作る
  // 例: ["TypeScript", "Node.js"] → "  - TypeScript\n  - Node.js"
  const tagsYaml = topic.tags.map((t) => `  - ${t}`).join("\n");
  const slug = slugify(topic.title);

  // ヘッダー・フッターを読み込む
  const headerPath = path.resolve(process.cwd(), "templates/header.md");
  const footerPath = path.resolve(process.cwd(), "templates/footer.md");
  const header = fs.readFileSync(headerPath, "utf-8").trim();
  const footer = fs.readFileSync(footerPath, "utf-8").trim();

  // フッターの {{DATE}} を今日の日付（YYYYMMDD）に置換
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, ""); // "20260607"
  const footerWithDate = footer.replace(/\{\{DATE\}\}/g, date);

  // テンプレートの各変数を実際の値に置換して完成プロンプトを返す
  return template
    .replace(/\{\{TITLE\}\}/g, topic.title)
    .replace(/\{\{LEVEL\}\}/g, topic.level)
    .replace(/\{\{TAGS\}\}/g, topic.tags.join(", "))
    .replace(/\{\{TAGS_YAML\}\}/g, tagsYaml)
    .replace(/\{\{BACKGROUND\}\}/g, "プログラミング初学者")
    .replace(/\{\{HEADER_CONTENT\}\}/g, header)
    .replace(/\{\{FOOTER_CONTENT\}\}/g, footerWithDate)
    .replace(/\{\{SLUG\}\}/g, slug);
}
