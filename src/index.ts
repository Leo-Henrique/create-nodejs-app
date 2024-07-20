#!/usr/bin/env node
import "./config";

import { Command } from "commander";
import { resolve } from "path";
import { cyan } from "picocolors";
import prompts, { Choice } from "prompts";
import packageJson from "../package.json";
import { copyTemplateCompose } from "./compose-app/copy-template.compose";
import { replaceContentInFileCompose } from "./compose-app/replace-content-in-file.compose";
import { GENERATED_APP_TARGET_ROOT_PATH } from "./config";
import { successLog } from "./utils/logs";
import { onCancelPrompt } from "./utils/on-cancel";
import {
  FrameworkValidation,
  ValidFrameworks,
  frameworks,
} from "./validations/framework.validation";
import {
  PackageManagerValidation,
  ValidPackageManagers,
  packageManagers,
} from "./validations/package-manager.validation";
import { ProjectNameValidation } from "./validations/project-name-validation";
import {
  TemplateValidation,
  ValidTemplates,
  templates,
} from "./validations/template.validation";

interface CliOptions {
  name: string;
  packageManager: ValidPackageManagers;
  template: ValidTemplates;
  framework: ValidFrameworks;
}

const program = new Command()
  .name(packageJson.name)
  .description(packageJson.description);

program
  .argument(
    "[project-directory]",
    "Directory of the project from where the script was called.",
    ".",
  )
  .option("-n, --name <project-name>", "Name of the project.")
  .option(
    "--package-manager <package-manager>",
    "Package manager that will be used in the project.",
  )
  .option(
    "-t, --template <template-name>",
    "Template that will be used in the project.",
  )
  .option(
    "-f, --framework <framework-name>",
    "Framework that will be used in the project.",
  )
  .action(async (directory, options: CliOptions) => {
    const input = {
      projectName: {
        value: options.name,
        validation: ProjectNameValidation.create({
          name: options.name,
          directory,
        }),
      },
      packageManager: {
        value: options.packageManager,
        validation: PackageManagerValidation.create({
          packageManager: options.packageManager,
        }),
      },
      template: {
        value: options.template,
        validation: TemplateValidation.create({
          template: options.template,
        }),
      },
      framework: {
        value: options.framework,
        validation: FrameworkValidation.create({
          framework: options.framework,
        }),
      },
    };
    const inputFields = Object.keys(input) as (keyof typeof input)[];

    for (const field of inputFields) {
      const fieldData = input[field];

      if (fieldData.value) await fieldData.validation.fromCli();
    }

    const { projectName, packageManager, template, framework } = input;

    const promptsResponse = await prompts(
      [
        {
          type: !projectName.value ? "text" : null,
          name: "projectName",
          message: "What is your project name?",
          validate: async val =>
            await projectName.validation.fromPrompt({
              name: val,
              directory: directory,
            }),
        },
        {
          type: !packageManager.value ? "select" : null,
          name: "packageManager",
          message: "What is your favorite package manager?",
          choices: packageManagers as unknown as Choice[],
          initial: 2,
        },
        {
          type: !template.value && !framework.value ? "select" : null,
          name: "template",
          message: "Select your template:",
          choices: templates as unknown as Choice[],
        },
        {
          type: (_, answers) => {
            if (
              !framework.value &&
              (template.value === "api" || answers.template === "api")
            )
              return "select";

            return null;
          },
          name: "framework",
          message: "What is your favorite framework?",
          choices: frameworks as unknown as Choice[],
        },
      ],
      { onCancel: onCancelPrompt },
    );

    for (const field of inputFields) {
      const promptFieldResponse = promptsResponse[field];

      if (promptFieldResponse) input[field].value = promptFieldResponse;
    }

    if (framework.value) input.template.value = "api";

    const targetAppPath = resolve(
      GENERATED_APP_TARGET_ROOT_PATH,
      projectName.value,
    );

    await copyTemplateCompose(targetAppPath, framework.value ?? "clean");

    const packageJsonPath = resolve(targetAppPath, "package.json");
    const envExamplePath = resolve(targetAppPath, ".env.example");
    const huskyPreCommitPath = resolve(targetAppPath, ".husky/pre-commit");

    await Promise.all([
      replaceContentInFileCompose(packageJsonPath, [
        ["app-name", projectName.value],
      ]),
      replaceContentInFileCompose(envExamplePath, [
        ["app-name", projectName.value],
      ]),
      replaceContentInFileCompose(huskyPreCommitPath, [
        ["pnpm", packageManager.value],
      ]),
    ]);

    successLog(
      `Success in creating new app ${cyan(projectName.value)}!`,
      `> ${targetAppPath}`,
    );
  });

(async () => {
  await program.parseAsync(process.argv);
})();
