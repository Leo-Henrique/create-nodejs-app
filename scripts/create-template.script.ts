import { copyTemplateCompose } from "@/compose-app/copy-template.compose";
import { replaceContentInFileCompose } from "@/compose-app/replace-content-in-file.compose";
import { TEMPLATES_PATH } from "@/config";
import { successLog } from "@/utils/logs";
import { onCancelPrompt } from "@/utils/on-cancel";
import { FileNameValidation } from "@/validations/file-name.validation";
import { TemplateNameValidation } from "@/validations/template-name.validation";
import { rename } from "fs/promises";
import { extname, resolve } from "path";
import { cyan } from "picocolors";
import prompts from "prompts";

interface CreateTemplateScriptOptions {
  mainFile: string;
}

export async function createTemplateScript(
  templateNameArgument: string,
  options: CreateTemplateScriptOptions,
) {
  const input = {
    templateName: {
      value: templateNameArgument,
      validation: TemplateNameValidation.create({
        templateName: templateNameArgument,
      }),
    },
    mainFile: {
      value: options.mainFile,
      validation: FileNameValidation.create({
        fileName: options.mainFile,
      }),
    },
  };
  const inputFields = Object.keys(input) as (keyof typeof input)[];

  for (const field of inputFields) {
    const fieldData = input[field];

    if (fieldData.value) await fieldData.validation.fromCli();
  }

  const { templateName, mainFile } = input;

  const promptsResponse = await prompts(
    [
      {
        type: !templateName.value ? "text" : null,
        name: "templateName",
        message: "Template name:",
        validate: async val =>
          await templateName.validation.fromPrompt({ templateName: val }),
      },
      {
        type: !mainFile.value ? "text" : null,
        name: "mainFile",
        message: `Main file name (program input file, example: "index")`,
        initial: "index.ts",
        validate: async val =>
          await mainFile.validation.fromPrompt({ fileName: val }),
      },
    ],
    { onCancel: onCancelPrompt },
  );

  for (const field of inputFields) {
    const promptFieldResponse = promptsResponse[field];

    if (promptFieldResponse) input[field].value = promptFieldResponse;
  }

  mainFile.value = mainFile.value.replace(extname(mainFile.value), "");

  const generatedTemplatePath = resolve(TEMPLATES_PATH, templateName.value);

  await copyTemplateCompose(generatedTemplatePath, "clean");

  if (mainFile.value !== "index") {
    const defaultMainFilePath = resolve(
      generatedTemplatePath,
      "./src/index.ts",
    );
    const newMainFilePath = resolve(
      generatedTemplatePath,
      "./src",
      `${mainFile.value}.ts`,
    );

    const packageJsonPath = resolve(generatedTemplatePath, "package.json");
    const buildConfigPath = resolve(generatedTemplatePath, "build.config.ts");

    await Promise.all([
      rename(defaultMainFilePath, newMainFilePath),
      replaceContentInFileCompose(packageJsonPath, [
        ["index.js", `${mainFile.value}.js`],
        ["index.ts", `${mainFile.value}.ts`],
      ]),
      replaceContentInFileCompose(buildConfigPath, [
        ["index.ts", `${mainFile.value}.ts`],
      ]),
    ]);
  }

  successLog(
    `Success in creating new template ${cyan(templateName.value)}!`,
    `> ${generatedTemplatePath}`,
  );
}
