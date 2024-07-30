import {
  CLEAN_TEMPLATE_PATH,
  GENERATED_APP_TARGET_ROOT_PATH,
  TEMPLATES_PATH,
} from "@/config";
import { execSync } from "child_process";
import { randomUUID } from "crypto";
import { existsSync } from "fs";
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
    await rm(resolve(GENERATED_APP_TARGET_ROOT_PATH), {
      recursive: true,
      force: true,
    });
  });

  afterEach(async () => {
    await rm(resolve(GENERATED_APP_TARGET_ROOT_PATH), {
      recursive: true,
      force: true,
    });
  });

  it("should be able to create a project with a cli", async () => {
    const sut = run([
      projectName,
      "--package-manager",
      "pnpm",
      "--template",
      "clean",
    ]);
    const folderNamesOfTargetFolder = await readdir(
      GENERATED_APP_TARGET_ROOT_PATH,
    );

    expect(sut).toContain(SUCCESS_MESSAGE);
    expect(folderNamesOfTargetFolder).toEqual(
      expect.arrayContaining([projectName]),
    );
  });

  it("should be able to create a project with a custom directory", async () => {
    const customPath = `e2e-test-${randomUUID()}/folder/${projectName}`;
    const sut = run([
      customPath,
      "--package-manager",
      "pnpm",
      "--template",
      "clean",
    ]);
    const hasGeneratedProjectPath = existsSync(
      resolve(GENERATED_APP_TARGET_ROOT_PATH, customPath),
    );

    expect(sut).toContain(SUCCESS_MESSAGE);
    expect(hasGeneratedProjectPath).toBeTruthy();
  });

  it("should be able to prompt project name if no arguments or options supplied", async () => {
    const sut = run();

    expect(sut).toContain(PROJECT_NAME_QUESTION);
  });

  it("should be able to prompt package manager if not supplied", async () => {
    const sut = run([projectName]);

    expect(sut).toContain(PACKAGE_MANAGER_QUESTION);
  });

  it("should be able to prompt template if not supplied", async () => {
    const sut = run([projectName, "--package-manager", "pnpm"]);

    expect(sut).toContain(TEMPLATE_QUESTION);
  });

  it("should be able to prompt framework if not supplied and template is 'api'", async () => {
    const sut = run([
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
      projectName,
      "--package-manager",
      "pnpm",
      "--template",
      "clean",
    ]);

    expect(sut).toContain(SUCCESS_MESSAGE);
  });

  describe("Variants", () => {
    const ignoreUnusedPaths = (paths: string[]) => {
      return paths.filter(path => {
        return ![
          "node_modules",
          "pnpm-lock.yaml",
          ".env",
          "dist",
          ".eslintcache",
        ].includes(path);
      });
    };

    it("should be able to create a project with a clean template", async () => {
      const sut = run([
        projectName,
        "--package-manager",
        "pnpm",
        "--template",
        "clean",
      ]);

      expect(sut).toContain(SUCCESS_MESSAGE);

      let [
        cleanTemplateFiles,
        generatedProjectFiles, // eslint-disable-line prefer-const
      ] = await Promise.all([
        readdir(CLEAN_TEMPLATE_PATH),
        readdir(resolve(GENERATED_APP_TARGET_ROOT_PATH, projectName)),
      ]);

      cleanTemplateFiles = ignoreUnusedPaths(cleanTemplateFiles);

      expect(generatedProjectFiles).toEqual(cleanTemplateFiles);
    });

    it("should be able to create a project with a fastify framework", async () => {
      const sut = run([
        projectName,
        "--package-manager",
        "pnpm",
        "--framework",
        "fastify",
      ]);

      expect(sut).toContain(SUCCESS_MESSAGE);

      let [
        fastifyTemplateFiles,
        generatedProjectFiles, // eslint-disable-line prefer-const
      ] = await Promise.all([
        readdir(resolve(TEMPLATES_PATH, "fastify")),
        readdir(resolve(GENERATED_APP_TARGET_ROOT_PATH, projectName)),
      ]);

      fastifyTemplateFiles = ignoreUnusedPaths(fastifyTemplateFiles);

      expect(generatedProjectFiles).toEqual(fastifyTemplateFiles);
    });

    it("should be able to create a project with a nest framework", async () => {
      const sut = run([
        projectName,
        "--package-manager",
        "pnpm",
        "--framework",
        "nest",
      ]);

      expect(sut).toContain(SUCCESS_MESSAGE);

      let [
        nestTemplateFiles,
        generatedProjectFiles, // eslint-disable-line prefer-const
      ] = await Promise.all([
        readdir(resolve(TEMPLATES_PATH, "nest")),
        readdir(resolve(GENERATED_APP_TARGET_ROOT_PATH, projectName)),
      ]);

      nestTemplateFiles = ignoreUnusedPaths(nestTemplateFiles);

      expect(generatedProjectFiles).toEqual(nestTemplateFiles);
    });
  });
});
