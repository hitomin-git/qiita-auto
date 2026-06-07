import * as fs from "fs";
import * as path from "path";
import axios from "axios";
import { load } from "cheerio";
import { savePhaseFile, phaseFileExists } from "../utils/fileManager";
import { logger } from "../utils/logger";

function slugFromUrl(url: string, title: string): string {
  const date = new Date().toISOString().slice(0, 10);

  const sanitizedTitle = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .slice(0, 40);

  if (sanitizedTitle.length >= 5) {
    return `${date}_${sanitizedTitle}`;
  }

  // Fallback: use URL hostname + path
  try {
    const parsed = new URL(url);
    const sanitizedUrl = (parsed.hostname + parsed.pathname)
      .replace(/[^\w]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40);
    return `${date}_${sanitizedUrl}`;
  } catch {
    return `${date}_article-${Date.now().toString(36).slice(-6)}`;
  }
}

async function fetchAndExtract(url: string): Promise<{ title: string; content: string }> {
  const res = await axios.get<string>(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; QiitaAutoBot/1.0)" },
    timeout: 15000,
  });

  const $ = load(res.data);

  // Remove noise elements
  $("script, style, nav, footer, header, aside, .sidebar, .menu, .navigation, .ad").remove();

  const title =
    $("title").text().trim() ||
    $("h1").first().text().trim() ||
    "無題";

  // Extract structured content from heading and paragraph elements
  const parts: string[] = [];
  const seen = new Set<string>();

  $("h1, h2, h3, p, li").each((_, el) => {
    const tag = ((el as unknown as { name: string }).name ?? "").toLowerCase();
    const text = $(el).text().replace(/\s+/g, " ").trim();
    if (!text || text.length < 10 || seen.has(text)) return;
    seen.add(text);

    if (tag === "h1") parts.push(`\n# ${text}`);
    else if (tag === "h2") parts.push(`\n## ${text}`);
    else if (tag === "h3") parts.push(`\n### ${text}`);
    else parts.push(text);
  });

  const content = parts.join("\n").slice(0, 6000);
  return { title, content };
}

function buildFetchPrompt(url: string, content: string, slug: string): string {
  const templatePath = path.resolve(process.cwd(), "templates/prompts/fetch.txt");
  const template = fs.readFileSync(templatePath, "utf-8");

  const headerPath = path.resolve(process.cwd(), "templates/header.md");
  const footerPath = path.resolve(process.cwd(), "templates/footer.md");
  const header = fs.readFileSync(headerPath, "utf-8").trim();
  const footer = fs.readFileSync(footerPath, "utf-8").trim();

  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const footerWithDate = footer.replace(/\{\{DATE\}\}/g, date);

  return template
    .replace(/\{\{SOURCE_URL\}\}/g, url)
    .replace(/\{\{SOURCE_CONTENT\}\}/g, content)
    .replace(/\{\{HEADER_CONTENT\}\}/g, header)
    .replace(/\{\{FOOTER_CONTENT\}\}/g, footerWithDate)
    .replace(/\{\{SLUG\}\}/g, slug);
}

async function main() {
  const url = process.argv[2];

  if (!url) {
    logger.error("URLを指定してください");
    logger.info("使い方: npm run fetch -- <URL>");
    logger.info("例:     npm run fetch -- https://example.com/article");
    logger.info("SSL エラーが出る場合: NODE_OPTIONS=--use-system-ca npm run fetch -- <URL>");
    process.exit(1);
  }

  logger.info(`ページを取得中: ${url}`);

  let title: string;
  let content: string;

  try {
    ({ title, content } = await fetchAndExtract(url));
    logger.success(`取得完了: ${title}`);
  } catch (err) {
    if (axios.isAxiosError(err)) {
      logger.error(`ページの取得に失敗しました: ${err.message}`);
      logger.info("SSL エラーの場合は NODE_OPTIONS=--use-system-ca npm run fetch -- <URL> で実行してください");
    } else {
      logger.error(`エラーが発生しました: ${String(err)}`);
    }
    process.exit(1);
  }

  const slug = slugFromUrl(url, title);

  if (phaseFileExists(slug, "source.md")) {
    logger.warn(`すでに取得済みです: public/${slug}/source.md`);
    logger.warn("再取得する場合は source.md を手動で削除してください");
    process.exit(1);
  }

  const sourceContent = [
    `# 参考ページ`,
    ``,
    `- URL: ${url}`,
    `- タイトル: ${title}`,
    `- 取得日: ${new Date().toISOString().slice(0, 10)}`,
    ``,
    `## 本文（抜粋）`,
    ``,
    content,
  ].join("\n");

  savePhaseFile(slug, "source.md", sourceContent);
  logger.success(`参考ページを保存しました: public/${slug}/source.md`);

  const prompt = buildFetchPrompt(url, content, slug);

  console.log("\n" + "=".repeat(60));
  console.log("以下のプロンプトを Claude Code に貼り付けて記事を生成してください");
  console.log(`slug:    ${slug}`);
  console.log(`保存先:  public/${slug}/draft.md`);
  console.log(`         public/${slug}/image-prompts.md`);
  console.log("=".repeat(60) + "\n");
  console.log(prompt);
}

main();
