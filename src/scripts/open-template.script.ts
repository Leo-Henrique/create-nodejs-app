import { TEMPLATES_PATH } from "@/config";
import { successLog, warnLog } from "@/utils/logs";
import { onCancelPrompt } from "@/utils/on-cancel";
import { toPascalCase } from "@/utils/to-pascal-case";
import { execSync } from "child_process";
import { readdirSync } from "fs";
import { resolve } from "path";
import { cyan } from "picocolors";
import prompts from "prompts";

type Questions = "templateName";

const questions: Array<prompts.PromptObject<Questions>> = [
  {
    type: "select",
    name: "templateName",
    message: "Template name:",
    choices: () => {
      const templateNames = readdirSync(TEMPLATES_PATH);

      return templateNames.map(name => ({
        title: toPascalCase(name),
        value: name,
      }));
    },
  },
];

(async () => {
  warnLog(`Work only in Visual Studio Code with "code" CLI enabled. \n`);

  const response = await prompts(questions, {
    onCancel: onCancelPrompt,
  });
  const templatePath = resolve(TEMPLATES_PATH, response.templateName);

  execSync(`code ${templatePath}`);

  successLog(
    `Success in open template ${cyan(response.templateName)}!`,
    `> ${templatePath}`,
  );
})();
