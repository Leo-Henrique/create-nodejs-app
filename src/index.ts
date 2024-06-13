#!/usr/bin/env node
import { successLog } from "@/utils/logs";
import { onCancelPrompt } from "@/utils/on-cancel";
import { existsSync } from "fs";
import { mkdir, readdir } from "fs/promises";
import { resolve } from "path";
import { cyan } from "picocolors";
import prompts, { PromptType } from "prompts";
import { copyTemplateCompose } from "./compose-app/copy-template.compose";
import { replaceContentInFileCompose } from "./compose-app/replace-content-in-file.compose";
import { GENERATED_APP_ROOT_PATH } from "./config";
import { env } from "./env";
import { packageNameValidation } from "./validations/package-name.validation";

type Questions = "projectName" | "packageManager" | "template" | "framework";

const isApiTemplate = (type: PromptType) => {
  return (_: string, answers: prompts.Answers<Questions>) => {
    return answers.template === "api" ? type : null;
  };
};

const questions: Array<prompts.PromptObject<Questions>> = [
  {
    type: "text",
    name: "projectName",
    message: "What is your project name?",
    validate: async val => {
      const generatedAppNames = await readdir(GENERATED_APP_ROOT_PATH);

      if (generatedAppNames.includes(val)) {
        return "Already exists a folder with same name in current directory.";
      }

      return packageNameValidation(val);
    },
  },
  {
    type: "select",
    name: "packageManager",
    message: "What is your favorite package manager?",
    choices: [
      { title: "NPM", value: "npm" },
      { title: "Yarn", value: "yarn" },
      { title: "PNPM", value: "pnpm" },
    ],
    initial: 2,
  },
  {
    type: "select",
    name: "template",
    message: "Select your template:",
    choices: [
      { title: "Clean", value: "clean" },
      { title: "API", value: "api" },
    ],
  },
  {
    type: isApiTemplate("select"),
    name: "framework",
    message: "What is your favorite framework:",
    choices: [
      { title: "Fastify", value: "fastify" },
      { title: "Nest", value: "nest", disabled: true },
      { title: "tRPC", value: "trpc", disabled: true },
    ],
    initial: 0,
  },
];

(async () => {
  if (env.NODE_ENV === "development" && !existsSync(GENERATED_APP_ROOT_PATH)) {
    await mkdir(GENERATED_APP_ROOT_PATH, { recursive: true });
  }

  const response = await prompts(questions, { onCancel: onCancelPrompt });
  const generatedAppPath = resolve(
    GENERATED_APP_ROOT_PATH,
    response.projectName,
  );

  await copyTemplateCompose(
    generatedAppPath,
    response.framework ? response.framework : "clean",
  );

  const packageJsonPath = resolve(generatedAppPath, "package.json");
  const envExamplePath = resolve(generatedAppPath, ".env.example");
  const huskyPreCommitPath = resolve(generatedAppPath, ".husky/pre-commit");

  await Promise.all([
    replaceContentInFileCompose(packageJsonPath, [
      ["app-name", response.projectName],
    ]),
    replaceContentInFileCompose(envExamplePath, [
      ["app-name", response.projectName],
    ]),
    replaceContentInFileCompose(huskyPreCommitPath, [
      ["pnpm", response.packageManager],
    ]),
  ]);

  successLog(
    `Success in creating new app ${cyan(response.projectName)}!`,
    `> ${generatedAppPath}`,
  );
})();
