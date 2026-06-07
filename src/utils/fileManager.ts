import * as fs from "fs";
import * as path from "path";

export function saveArticle(slug: string, content: string): string {
  const dir = path.resolve(process.cwd(), "public", slug);
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, "index.md");
  fs.writeFileSync(filePath, content, "utf-8");
  return filePath;
}

export function loadArticle(slug: string): string {
  const filePath = path.resolve(process.cwd(), "public", slug, "index.md");
  return fs.readFileSync(filePath, "utf-8");
}

export function listGeneratedSlugs(): string[] {
  const publicDir = path.resolve(process.cwd(), "public");
  if (!fs.existsSync(publicDir)) return [];
  return fs.readdirSync(publicDir).filter((name) => {
    const stat = fs.statSync(path.join(publicDir, name));
    return stat.isDirectory();
  });
}

export function savePhaseFile(slug: string, filename: string, content: string): string {
  const dir = path.resolve(process.cwd(), "public", slug);
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, filename);
  fs.writeFileSync(filePath, content, "utf-8");
  return filePath;
}

export function loadPhaseFile(slug: string, filename: string): string {
  const filePath = path.resolve(process.cwd(), "public", slug, filename);
  return fs.readFileSync(filePath, "utf-8");
}

export function phaseFileExists(slug: string, filename: string): boolean {
  const filePath = path.resolve(process.cwd(), "public", slug, filename);
  return fs.existsSync(filePath);
}

export function extractFrontmatterField(content: string, field: string): string {
  const match = content.match(new RegExp(`^${field}:\\s*(.+)$`, "m"));
  return match ? match[1].trim() : "";
}

export function slugify(title: string): string {
  const date = new Date().toISOString().slice(0, 10);
  const sanitized = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 50);
  return `${date}_${sanitized}`;
}
