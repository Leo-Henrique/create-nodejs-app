import { errorLog } from "./logs";

export function onCancelPrompt() {
  errorLog("Script canceled.");
  process.exit(1);
}
