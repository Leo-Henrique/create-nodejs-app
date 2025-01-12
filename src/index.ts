#!/usr/bin/env node
import "./config";

import { Command } from "commander";
import { rename } from "fs/promises";
import { basename, dirname, resolve } from "path";
import { cyan } from "picocolors";
import prompts, { Choice } from "prompts";
import packageJson from "../package.json";
import { copyTemplateCompose } from "./compose-app/copy-template.compose";
import { replaceContentInFileCompose } from "./compose-app/replace-content-in-file.compose";
import { GENERATED_APP_TARGET_ROOT_PATH } from "./config";
import { ValidationData } from "./core/validation";
import { successLog } from "./utils/logs";
import { onCancelPrompt } from "./utils/on-cancel";
import {
  BackEndFrameworkValidation,
  BackEndValidFrameworks,
  backEndFrameworks,
} from "./validations/back-end-framework.validation";
import {
  FrontEndFrameworkValidation,
  FrontEndValidFrameworks,
  frontEndFrameworks,
} from "./validations/front-end-framework.validation";
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
  packageManager: ValidPackageManagers;
  template: ValidTemplates;
  framework: BackEndValidFrameworks | FrontEndValidFrameworks;
}

type InputsByCliDefinition = {
  [K: string]: {
    value: string;
    validation: ValidationData | null;
  };
};

const program = new Command()
  .name(packageJson.name)
  .description(packageJson.description);

program
  .argument(
    "[project-directory]",
    "Name of the project or relative path of the project considering where the script was called.",
  )
  .option(
    "-pm, --package-manager <package-manager>",
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
  .action(async (projectDirectoryArgument, options: CliOptions) => {
    const inputsByCli = {
      projectDirectory: {
        value: projectDirectoryArgument,
        validation: ProjectNameValidation.create({
          path: projectDirectoryArgument,
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
        validation:
          options.template === "api"
            ? BackEndFrameworkValidation.create({
                framework: options.framework,
              })
            : options.template === "front-end"
              ? FrontEndFrameworkValidation.create({
                  framework: options.framework,
                })
              : null,
      },
    } satisfies InputsByCliDefinition;

    const inputByCliFields = Object.keys(
      inputsByCli,
    ) as (keyof typeof inputsByCli)[];

    for (const inputByCliField of inputByCliFields) {
      const inputByCli = inputsByCli[inputByCliField];

      if (!inputByCli.value || !inputByCli.validation) continue;

      await inputByCli.validation.fromCli();
    }

    const { projectDirectory, packageManager, template, framework } =
      inputsByCli;

    const promptsResponse = await prompts(
      [
        {
          type: !projectDirectory.value ? "text" : null,
          name: "projectDirectory",
          message: "What is your project name?",
          validate: async val =>
            (await projectDirectory.validation?.fromPrompt({ path: val })) ??
            true,
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
            const templatesThatAllowToChooseFramework = ["api", "front-end"];

            if (
              !framework.value &&
              (templatesThatAllowToChooseFramework.includes(template.value) ||
                templatesThatAllowToChooseFramework.includes(answers.template))
            )
              return "select";

            return null;
          },
          name: "framework",
          message: "What is your favorite framework?",
          choices: (_, answers) => {
            if (answers.template === "api")
              return backEndFrameworks as unknown as Choice[];

            if (answers.template === "front-end")
              return frontEndFrameworks as unknown as Choice[];

            return [...backEndFrameworks, ...frontEndFrameworks] as Choice[];
          },
        },
      ],
      { onCancel: onCancelPrompt },
    );

    for (const inputByCliField of inputByCliFields) {
      const promptFieldResponse =
        promptsResponse[inputByCliField as keyof typeof promptsResponse];

      if (promptFieldResponse)
        inputsByCli[inputByCliField].value = promptFieldResponse;
    }

    if (framework.value) inputsByCli.template.value = "api";

    const projectName = basename(projectDirectory.value);

    projectDirectory.value = resolve(
      GENERATED_APP_TARGET_ROOT_PATH,
      projectDirectory.value,
    );

    await copyTemplateCompose(
      projectDirectory.value,
      framework.value ?? "clean",
    );

    const packageJsonPath = resolve(projectDirectory.value, "package.json");
    const envExamplePath = resolve(projectDirectory.value, ".env.example");
    const huskyPreCommitPath = resolve(
      projectDirectory.value,
      ".husky/pre-commit",
    );
    const gitignorePath = resolve(projectDirectory.value, "gitignore");
    const npmrcPath = resolve(projectDirectory.value, "npmrc");

    await Promise.all([
      replaceContentInFileCompose(packageJsonPath, [["app-name", projectName]]),
      replaceContentInFileCompose(envExamplePath, [["app-name", projectName]]),
      replaceContentInFileCompose(huskyPreCommitPath, [
        ["pnpm", packageManager.value],
      ]),
      rename(gitignorePath, resolve(dirname(gitignorePath), ".gitignore")),
      rename(npmrcPath, resolve(dirname(npmrcPath), ".npmrc")),
    ]);

    successLog(
      `Success in creating new app ${cyan(projectName)}!`,
      `> ${projectDirectory.value}`,
    );
  });

(async () => {
  await program.parseAsync(process.argv);
})();
