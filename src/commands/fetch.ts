/**
 * fetch.ts — URL から記事生成プロンプト出力コマンド（URL モード）
 *
 * 実行方法:
 *   NODE_OPTIONS=--use-system-ca npm run fetch -- <URL>
 *
 * やること:
 *   1. 指定した URL のページを取得し、本文テキストを抽出する
 *   2. 抽出内容を public/{slug}/source.md に保存する（参考資料として残す）
 *   3. その内容をもとに Claude Code へ渡す記事生成プロンプトを組み立てて出力する
 *
 * topics.yaml にトピックを登録しなくても、URL を指定するだけで記事生成を始められる。
 * スクレイピングした内容は "参考情報" として使い、コピーではなくオリジナル記事を書かせる。
 *
 * 【関連コマンドの流れ】
 *   fetch → review → rewrite → score → publish
 */

import * as fs from "fs";
import * as path from "path";
import axios from "axios";
import { load } from "cheerio";
import { savePhaseFile, phaseFileExists } from "../utils/fileManager";
import { logger } from "../utils/logger";

// ============================================================
// スラグ生成（URL から）
// ============================================================

/**
 * URL とタイトルから記事のスラグ（ディレクトリ名）を生成する。
 *
 * 優先順位:
 *   1. URL の末尾パスセグメント（例: example.com/article-name → "article-name"）
 *   2. ホスト名＋パス全体を結合したもの
 *   3. 生成できない場合はタイムスタンプをもとにしたランダム文字列
 */
function slugFromUrl(url: string, _title: string): string {
  const date = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

  try {
    const parsed = new URL(url);
    // URL の末尾セグメントを取り出す（例: /blog/my-article → "my-article"）
    const segments = parsed.pathname.split("/").filter((s) => s.length > 0);
    const lastSegment = segments[segments.length - 1] ?? "";

    // 英数字・ハイフン以外を除去して安全なスラグにする
    const sanitized = lastSegment
      .toLowerCase()
      .replace(/[^\w-]/g, "-")
      .replace(/-+/g, "-")    // 連続するハイフンを1つにまとめる
      .replace(/^-|-$/g, "")  // 先頭・末尾のハイフンを除去
      .slice(0, 45);

    if (sanitized.length >= 5) {
      return `${date}_${sanitized}`;
    }

    // 末尾セグメントが短すぎる場合はホスト名＋パス全体を使う
    const fullPath = (parsed.hostname + parsed.pathname)
      .replace(/[^\w]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 45);
    if (fullPath.length >= 5) {
      return `${date}_${fullPath}`;
    }
  } catch {
    // URL パースに失敗した場合はフォールバック
  }

  // 最終フォールバック: タイムスタンプベースのランダム文字列
  return `${date}_article-${Date.now().toString(36).slice(-6)}`;
}

// ============================================================
// ページ取得・テキスト抽出
// ============================================================

/**
 * URL のページを取得し、本文テキストを抽出して返す。
 *
 * cheerio（サーバーサイド jQuery）を使って HTML を解析し、
 * ナビゲーションや広告などのノイズ要素を除去してから本文を抽出する。
 *
 * @returns タイトルと本文テキスト（最大 6000 文字）
 */
async function fetchAndExtract(url: string): Promise<{ title: string; content: string }> {
  const res = await axios.get<string>(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; QiitaAutoBot/1.0)" },
    timeout: 15000,
  });

  const $ = load(res.data);

  // ノイズ要素（ナビ・フッター・広告・サイドバー）を除去
  $("script, style, nav, footer, header, aside, .sidebar, .menu, .navigation, .ad").remove();

  // ページタイトルを取得（<title> → <h1> の順で優先）
  const title =
    $("title").text().trim() ||
    $("h1").first().text().trim() ||
    "無題";

  // 見出し・段落・リスト項目からテキストを抽出（重複除去あり）
  const parts: string[] = [];
  const seen = new Set<string>(); // 同じ文章が繰り返し出てくるのを防ぐ

  $("h1, h2, h3, p, li").each((_, el) => {
    const tag = ((el as unknown as { name: string }).name ?? "").toLowerCase();
    const text = $(el).text().replace(/\s+/g, " ").trim();
    if (!text || text.length < 10 || seen.has(text)) return; // 短すぎる・重複はスキップ
    seen.add(text);

    // 見出しには Markdown の記法を付ける
    if (tag === "h1") parts.push(`\n# ${text}`);
    else if (tag === "h2") parts.push(`\n## ${text}`);
    else if (tag === "h3") parts.push(`\n### ${text}`);
    else parts.push(text);
  });

  // プロンプトに含める本文は最大 6000 文字（トークン節約のため）
  const content = parts.join("\n").slice(0, 6000);
  return { title, content };
}

// ============================================================
// プロンプト組み立て
// ============================================================

/**
 * URL モード用の記事生成プロンプトを組み立てる。
 * templates/prompts/fetch.txt をベースに各変数を置換して返す。
 */
function buildFetchPrompt(url: string, content: string, slug: string): string {
  const templatePath = path.resolve(process.cwd(), "templates/prompts/fetch.txt");
  const template = fs.readFileSync(templatePath, "utf-8");

  const headerPath = path.resolve(process.cwd(), "templates/header.md");
  const footerPath = path.resolve(process.cwd(), "templates/footer.md");
  const header = fs.readFileSync(headerPath, "utf-8").trim();
  const footer = fs.readFileSync(footerPath, "utf-8").trim();

  const date = new Date().toISOString().slice(0, 10).replace(/-/g, ""); // "20260607"
  const footerWithDate = footer.replace(/\{\{DATE\}\}/g, date);

  return template
    .replace(/\{\{SOURCE_URL\}\}/g, url)
    .replace(/\{\{SOURCE_CONTENT\}\}/g, content)
    .replace(/\{\{HEADER_CONTENT\}\}/g, header)
    .replace(/\{\{FOOTER_CONTENT\}\}/g, footerWithDate)
    .replace(/\{\{SLUG\}\}/g, slug);
}

// ============================================================
// エントリポイント
// ============================================================

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

  // すでに取得済みの場合は上書きを防ぐ
  if (phaseFileExists(slug, "source.md")) {
    logger.warn(`すでに取得済みです: public/${slug}/source.md`);
    logger.warn("再取得する場合は source.md を手動で削除してください");
    process.exit(1);
  }

  // 参考ページの内容を source.md として保存（後から確認できるように）
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

  // プロンプトをターミナルに出力（Claude Code がこれを読んで記事を書く）
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
