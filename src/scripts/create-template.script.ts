import { copyTemplateCompose } from "@/compose-app/copy-template.compose";
import { replaceContentInFileCompose } from "@/compose-app/replace-content-in-file.compose";
import { TEMPLATES_PATH } from "@/config";
import { successLog } from "@/utils/logs";
import { onCancelPrompt } from "@/utils/on-cancel";
import { filenameValidation } from "@/validations/filename.validation";
import { packageNameValidation } from "@/validations/package-name.validation";
import { readdir, rename } from "fs/promises";
import { extname, resolve } from "path";
import { cyan } from "picocolors";
import prompts from "prompts";

type Questions = "templateName" | "mainFilename";

const questions: Array<prompts.PromptObject<Questions>> = [
  {
    type: "text",
    name: "templateName",
    message: "Template name:",
    validate: async value => {
      const templateNamesThatAlreadyExists = await readdir(TEMPLATES_PATH);

      if (templateNamesThatAlreadyExists.includes(value)) {
        return "Template already exists.";
      }

      return packageNameValidation(value);
    },
  },
  {
    type: "text",
    name: "mainFilename",
    message: `Main filename (from "src" root folder):`,
    initial: "index.ts",
    format: value => value.replace(extname(value), ""),
    validate: filenameValidation,
  },
];

(async () => {
  const response = await prompts(questions, {
    onCancel: onCancelPrompt,
  });
  const generatedAppPath = resolve(TEMPLATES_PATH, response.templateName);

  await copyTemplateCompose(generatedAppPath, "clean");

  if (response.mainFilename !== "index") {
    const defaultMainFilePath = resolve(generatedAppPath, "./src/index.ts");
    const newMainFilePath = resolve(
      generatedAppPath,
      "./src",
      `${response.mainFilename}.ts`,
    );

    const packageJsonPath = resolve(generatedAppPath, "package.json");
    const buildConfigPath = resolve(generatedAppPath, "build.config.ts");

    await Promise.all([
      rename(defaultMainFilePath, newMainFilePath),
      replaceContentInFileCompose(packageJsonPath, [
        ["index.js", `${response.mainFilename}.js`],
        ["index.ts", `${response.mainFilename}.ts`],
      ]),
      replaceContentInFileCompose(buildConfigPath, [
        ["index.ts", `${response.mainFilename}.ts`],
      ]),
    ]);
  }

  successLog(
    `Success in creating new template ${cyan(response.templateName)}!`,
    `> ${generatedAppPath}`,
  );
})();
