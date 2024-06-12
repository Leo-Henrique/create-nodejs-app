import { green, red, yellow } from "picocolors";

export function successLog(message: string, ...infos: string[]) {
  console.log(`${green("✔")} ${message}`);

  for (const info of infos) console.log(info);
}

export function warnLog(message: string, ...infos: string[]) {
  console.log(`${yellow("❗")} ${message}`);

  for (const info of infos) console.log(info);
}

export function errorLog(message: string, ...infos: string[]) {
  console.log(`${red("✖")} ${message}`);

  for (const info of infos) console.log(info);
}
