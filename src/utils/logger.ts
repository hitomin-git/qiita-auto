const RESET = "\x1b[0m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const CYAN = "\x1b[36m";

export const logger = {
  info: (msg: string) => console.log(`${CYAN}[INFO]${RESET} ${msg}`),
  success: (msg: string) => console.log(`${GREEN}[OK]${RESET}   ${msg}`),
  warn: (msg: string) => console.log(`${YELLOW}[WARN]${RESET} ${msg}`),
  error: (msg: string) => console.error(`${RED}[ERR]${RESET}  ${msg}`),
};
