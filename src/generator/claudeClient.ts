/**
 * claudeClient.ts — Claude API 直接呼び出しクライアント（将来実装予定）
 *
 * 【現在の運用】
 *   Claude Code（ログイン済みセッション）がプロンプトを受け取り、
 *   直接 public/{slug}/draft.md などに記事を書き込む。
 *   API キーは不要で、claude.ai の Pro/Max サブスクリプション枠で動く。
 *
 * 【このファイルの将来の役割】
 *   Web アプリ化などで Claude API を直接呼び出す実装に切り替えた際、
 *   ここに @anthropic-ai/sdk を使った generateArticle 関数を実装する。
 *
 *   実装イメージ:
 *     import Anthropic from "@anthropic-ai/sdk";
 *     export async function generateArticle(prompt: string): Promise<string> {
 *       const client = new Anthropic();
 *       const message = await client.messages.create({ ... });
 *       return message.content[0].text;
 *     }
 */

/**
 * @deprecated 現在は未実装。Claude Code セッション内で記事を直接生成してください。
 */
export async function generateArticle(_prompt: string): Promise<string> {
  throw new Error(
    "claudeClient は未実装です。\n" +
    "現在の運用: Claude Code が記事を直接 public/{slug}/draft.md に保存してください。"
  );
}
