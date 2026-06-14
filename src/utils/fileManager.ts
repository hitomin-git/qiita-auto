/**
 * fileManager.ts — 記事ファイルの読み書きユーティリティ
 *
 * 記事は `public/{slug}/` ディレクトリの下にフェーズごとに保存される。
 *
 *   public/{slug}/
 *     ├── source.md       URLモード時：参考ページの抜粋
 *     ├── draft.md        Phase 1：初稿
 *     ├── image-prompts.md Phase 1：画像生成プロンプト集（手動利用）
 *     ├── review.md       Phase 2：レビュー結果
 *     ├── rewrite.md      Phase 3：リライト後の完成稿
 *     ├── score.json      Phase 4：採点結果（pass/fail）
 *     └── index.md        Phase 5：Qiita 投稿用ファイル（publish 時に生成）
 *
 * このファイルにある関数を使って、各コマンドがファイルの存在確認・読み込み・保存を行う。
 */

import * as fs from "fs";
import * as path from "path";

// ============================================================
// 書き込み系
// ============================================================

/**
 * 記事を public/{slug}/index.md として保存する。
 * publish コマンドが最終稿を Qiita CLI 用ファイルとして配置する際に使う。
 *
 * @returns 保存したファイルの絶対パス
 */
export function saveArticle(slug: string, content: string): string {
  const dir = path.resolve(process.cwd(), "public", slug);
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, "index.md");
  fs.writeFileSync(filePath, content, "utf-8");
  return filePath;
}

/**
 * 指定したフェーズファイルを保存する汎用関数。
 * 例: savePhaseFile("2026-06-07_example", "draft.md", "# タイトル...")
 *
 * @returns 保存したファイルの絶対パス
 */
export function savePhaseFile(slug: string, filename: string, content: string): string {
  const dir = path.resolve(process.cwd(), "public", slug);
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, filename);
  fs.writeFileSync(filePath, content, "utf-8");
  return filePath;
}

// ============================================================
// 読み込み系
// ============================================================

/**
 * public/{slug}/draft.md を読み込む。
 * review・rewrite・score コマンドが前フェーズの成果物を参照するために使う。
 */
export function loadDraft(slug: string): string {
  const filePath = path.resolve(process.cwd(), "public", slug, "draft.md");
  return fs.readFileSync(filePath, "utf-8");
}

/**
 * 指定したフェーズファイルを読み込む汎用関数。
 * 例: loadPhaseFile("2026-06-07_example", "review.md")
 */
export function loadPhaseFile(slug: string, filename: string): string {
  const filePath = path.resolve(process.cwd(), "public", slug, filename);
  return fs.readFileSync(filePath, "utf-8");
}

// ============================================================
// 存在確認・一覧取得
// ============================================================

/**
 * 指定したフェーズファイルが存在するかどうかを確認する。
 * 各コマンドが「前フェーズが完了しているか」をチェックするために使う。
 */
export function phaseFileExists(slug: string, filename: string): boolean {
  const filePath = path.resolve(process.cwd(), "public", slug, filename);
  return fs.existsSync(filePath);
}

/**
 * public/ 直下にあるすべてのスラグ（サブディレクトリ）を一覧で返す。
 * 各コマンドが「処理対象の候補一覧」を表示するために使う。
 */
export function listGeneratedSlugs(): string[] {
  const publicDir = path.resolve(process.cwd(), "public");
  if (!fs.existsSync(publicDir)) return [];
  return fs.readdirSync(publicDir).filter((name) => {
    const stat = fs.statSync(path.join(publicDir, name));
    return stat.isDirectory(); // ファイルではなくディレクトリのみを対象にする
  });
}

// ============================================================
// フロントマター解析
// ============================================================

/**
 * Markdown のフロントマター（--- で囲まれた YAML ブロック）から
 * 指定したフィールドの値を取り出す。
 *
 * 例:
 *   ---
 *   title: TypeScript入門
 *   ---
 *   extractFrontmatterField(content, "title") // → "TypeScript入門"
 */
export function extractFrontmatterField(content: string, field: string): string {
  const match = content.match(new RegExp(`^${field}:\\s*(.+)$`, "m"));
  return match ? match[1].trim() : "";
}

// ============================================================
// スラグ生成
// ============================================================

/**
 * 記事タイトルから URL-safe なスラグ（ディレクトリ名）を生成する。
 *
 * 形式: YYYY-MM-DD_{title-lowercase-alphanumeric-hyphenated}
 * 例:  2026-06-07_typescript-nodejs-introduction
 *
 * 変換ルール:
 *   1. 今日の日付をプレフィックスにする
 *   2. タイトルを小文字化
 *   3. 英数字・ハイフン以外の文字（日本語・記号など）を除去
 *   4. 空白をハイフンに変換
 *   5. 全体を最大50文字に切り詰める（日付部分を含む）
 */
export function slugify(title: string): string {
  const date = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
  const sanitized = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")   // 英数字・スペース・ハイフン以外を除去
    .replace(/\s+/g, "-")       // 空白をハイフンに変換
    .slice(0, 50);               // 最大50文字
  return `${date}_${sanitized}`;
}
