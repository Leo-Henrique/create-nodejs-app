import { copyTemplateCompose } from "@/compose-app/copy-template.compose";
import { replaceContentInFileCompose } from "@/compose-app/replace-content-in-file.compose";
import { TEMPLATES_PATH } from "@/config";
import { successLog } from "@/utils/logs";
import { onCancelPrompt } from "@/utils/on-cancel";
import { FileNameValidation } from "@/validations/file-name.validation";
import { TemplateNameValidation } from "@/validations/template-name-validation";
import { rename } from "fs/promises";
import { extname, resolve } from "path";
import { cyan } from "picocolors";
import prompts from "prompts";

interface CreateTemplateScriptOptions {
  mainFile: string;
}

export async function createTemplateScript(
  templateName: string,
  { mainFile }: CreateTemplateScriptOptions,
) {
  const templateNameValidation = new TemplateNameValidation();
  const fileNameValidation = new FileNameValidation();

  if (templateName) {
    await templateNameValidation.fromCli({ templateName });
  } else {
    const response = await prompts(
      {
        type: "text",
        name: "templateName",
        message: "Template name:",
        validate: async val =>
          await templateNameValidation.fromPrompt({ templateName: val }),
      },
      { onCancel: onCancelPrompt },
    );

    templateName = response.templateName;
  }

  if (mainFile) {
    await fileNameValidation.fromCli({ fileName: mainFile });
  } else {
    const response = await prompts(
      {
        type: "text",
        name: "mainFile",
        message: `Main file name (program input file, example: "index")`,
        initial: "index.ts",
        validate: async val =>
          await fileNameValidation.fromPrompt({ fileName: val }),
      },
      { onCancel: onCancelPrompt },
    );

    mainFile = response.mainFile;
  }

  mainFile = mainFile.replace(extname(mainFile), "");

  const generatedAppPath = resolve(TEMPLATES_PATH, templateName);

  await copyTemplateCompose(generatedAppPath, "clean");

  if (mainFile !== "index") {
    const defaultMainFilePath = resolve(generatedAppPath, "./src/index.ts");
    const newMainFilePath = resolve(
      generatedAppPath,
      "./src",
      `${mainFile}.ts`,
    );

    const packageJsonPath = resolve(generatedAppPath, "package.json");
    const buildConfigPath = resolve(generatedAppPath, "build.config.ts");

    await Promise.all([
      rename(defaultMainFilePath, newMainFilePath),
      replaceContentInFileCompose(packageJsonPath, [
        ["index.js", `${mainFile}.js`],
        ["index.ts", `${mainFile}.ts`],
      ]),
      replaceContentInFileCompose(buildConfigPath, [
        ["index.ts", `${mainFile}.ts`],
      ]),
    ]);
  }

  successLog(
    `Success in creating new template ${cyan(templateName)}!`,
    `> ${generatedAppPath}`,
  );
}
