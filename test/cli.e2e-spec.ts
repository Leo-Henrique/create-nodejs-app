import { CLEAN_TEMPLATE_PATH, GENERATED_APP_TARGET_ROOT_PATH } from "@/config";
import { execSync } from "child_process";
import { randomUUID } from "crypto";
import { readdir, rm } from "fs/promises";
import { resolve } from "path";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";

const projectName = `e2e-test-${randomUUID()}`;

const PROJECT_NAME_QUESTION = "What is your project name?";
const PACKAGE_MANAGER_QUESTION = "What is your favorite package manager?";
const TEMPLATE_QUESTION = "Select your template:";
const FRAMEWORK_QUESTION = "What is your favorite framework?";
const SUCCESS_MESSAGE = "Success in creating new app";

function run(args: string[] = []) {
  return execSync(`pnpm start ${args.join(" ")}`, { encoding: "utf-8" });
}

describe("[CLI] should be able to run and use program with a cli", () => {
  beforeAll(() => {
    execSync("pnpm build");
  });

  beforeEach(async () => {
    await rm(resolve(GENERATED_APP_TARGET_ROOT_PATH, projectName), {
      recursive: true,
      force: true,
    });
  });

  afterEach(async () => {
    await rm(resolve(GENERATED_APP_TARGET_ROOT_PATH, projectName), {
      recursive: true,
      force: true,
    });
  });

  it("should be able to create a project with a cli", async () => {
    const sut = run([
      "--name",
      projectName,
      "--package-manager",
      "pnpm",
      "--template",
      "clean",
    ]);

    expect(sut).toContain(SUCCESS_MESSAGE);

    // eslint-disable-next-line prefer-const
    let [folderNamesOfTargetFolder, cleanTemplateFiles, generatedProjectFiles] =
      await Promise.all([
        readdir(GENERATED_APP_TARGET_ROOT_PATH),
        readdir(CLEAN_TEMPLATE_PATH),
        readdir(resolve(GENERATED_APP_TARGET_ROOT_PATH, projectName)),
      ]);

    expect(folderNamesOfTargetFolder).toEqual(
      expect.arrayContaining([projectName]),
    );

    cleanTemplateFiles = cleanTemplateFiles.filter(path => {
      const ignorePaths = [
        "node_modules",
        "pnpm-lock.yaml",
        ".env",
        "dist",
        ".eslintcache",
      ];

      return !ignorePaths.includes(path);
    });

    expect(generatedProjectFiles).toEqual(cleanTemplateFiles);
  });

  it("should be able to prompt project name if no arguments or options supplied", async () => {
    const sut = run();

    expect(sut).toContain(PROJECT_NAME_QUESTION);
  });

  it("should be able to prompt package manager if not supplied", async () => {
    const sut = run(["--name", projectName]);

    expect(sut).toContain(PACKAGE_MANAGER_QUESTION);
  });

  it("should be able to prompt template if not supplied", async () => {
    const sut = run(["--name", projectName, "--package-manager", "pnpm"]);

    expect(sut).toContain(TEMPLATE_QUESTION);
  });

  it("should be able to prompt framework if not supplied and template is 'api'", async () => {
    const sut = run([
      "--name",
      projectName,
      "--package-manager",
      "pnpm",
      "--template",
      "api",
    ]);

    expect(sut).toContain(FRAMEWORK_QUESTION);
  });

  it("should not be able to prompt framework if template is 'clean'", async () => {
    const sut = run([
      "--name",
      projectName,
      "--package-manager",
      "pnpm",
      "--template",
      "clean",
    ]);

    expect(sut).toContain(SUCCESS_MESSAGE);
  });
});
