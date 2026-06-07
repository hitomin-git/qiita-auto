import * as fs from "fs";
import * as path from "path";
import { Topic } from "../utils/config";

export function buildPrompt(topic: Topic, templateName = "base"): string {
  const templatePath = path.resolve(
    process.cwd(),
    `templates/prompts/${templateName}.txt`
  );
  let template = fs.readFileSync(templatePath, "utf-8");

  const tagsYaml = topic.tags.map((t) => `  - ${t}`).join("\n");

  template = template
    .replace(/\{\{TITLE\}\}/g, topic.title)
    .replace(/\{\{LEVEL\}\}/g, topic.level)
    .replace(/\{\{TAGS\}\}/g, topic.tags.join(", "))
    .replace(/\{\{TAGS_YAML\}\}/g, tagsYaml)
    .replace(/\{\{BACKGROUND\}\}/g, "プログラミング初学者");

  return template;
}
