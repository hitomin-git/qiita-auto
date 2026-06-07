// TODO: Phase 3 以降で実装予定（Claude API を直接呼び出す場合）
// 現在の運用: Claude Code がこのセッション内で記事を生成し public/ に保存する
//
// 将来の実装予定:
//   import Anthropic from "@anthropic-ai/sdk";
//   export async function generateArticle(prompt: string): Promise<string>

export async function generateArticle(_prompt: string): Promise<string> {
  throw new Error("claudeClient は未実装です（現在は Claude Code で記事を直接生成してください）");
}
