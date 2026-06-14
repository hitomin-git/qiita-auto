/**
 * logger.ts — ターミナル出力ユーティリティ
 *
 * このプロジェクトでは npm run *** を実行するたびにターミナルへログを出力する。
 * 重要度に応じて色分けすることで、エラーや警告を一目で判別できるようにしている。
 *
 * 使い方:
 *   import { logger } from "../utils/logger";
 *   logger.info("処理中...");   // 水色
 *   logger.success("完了");    // 緑
 *   logger.warn("注意");       // 黄色
 *   logger.error("失敗");      // 赤
 */

// ANSIエスケープコード（ターミナルの文字色を変える制御文字）
const RESET  = "\x1b[0m";   // 色をリセット
const GREEN  = "\x1b[32m";  // 成功
const YELLOW = "\x1b[33m";  // 警告
const RED    = "\x1b[31m";  // エラー
const CYAN   = "\x1b[36m";  // 情報

export const logger = {
  /** 通常の進捗メッセージ（水色） */
  info:    (msg: string) => console.log(`${CYAN}[INFO]${RESET} ${msg}`),
  /** 処理が正常完了したとき（緑） */
  success: (msg: string) => console.log(`${GREEN}[OK]${RESET}   ${msg}`),
  /** 注意が必要だが処理は継続できるとき（黄色） */
  warn:    (msg: string) => console.log(`${YELLOW}[WARN]${RESET} ${msg}`),
  /** 処理を中断すべきエラー（赤・stderr へ出力） */
  error:   (msg: string) => console.error(`${RED}[ERR]${RESET}  ${msg}`),
};
