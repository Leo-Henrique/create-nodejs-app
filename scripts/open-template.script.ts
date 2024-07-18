import { TEMPLATES_PATH } from "@/config";
import { left } from "@/utils/left";
import { successLog } from "@/utils/logs";
import { onCancelPrompt } from "@/utils/on-cancel";
import { toPascalCase } from "@/utils/to-pascal-case";
import { execSync } from "child_process";
import { readdirSync } from "fs";
import { readdir } from "fs/promises";
import { resolve } from "path";
import { cyan } from "picocolors";
import prompts from "prompts";

export async function openTemplateScript(templateName: string) {
  if (templateName) {
    const templateNames = await readdir(TEMPLATES_PATH);

    if (!templateNames.includes(templateName))
      return left(`Template with name "${templateName}" not found.`);
  } else {
    const response = await prompts(
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
      { onCancel: onCancelPrompt },
    );

    templateName = response.templateName;
  }

  const templatePath = resolve(TEMPLATES_PATH, templateName);

  execSync(`code ${templatePath}`);

  successLog(
    `Success in open template ${cyan(templateName)}!`,
    `> ${templatePath}`,
  );
}
