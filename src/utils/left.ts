import { errorLog } from "./logs";

export function left(message: string) {
  errorLog(message);
  process.exit(1);
}
