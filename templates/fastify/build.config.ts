import { readdirSync } from "fs";
import { resolve } from "path";
import { BuildOptions, defineBuildConfig } from "unbuild";
import packageJson from "./package.json";
import { compilerOptions } from "./tsconfig.json";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getAllFiles = (path: string) => {
  return readdirSync(path, {
    recursive: true,
    encoding: "utf-8",
  })
    .filter(reading => reading.endsWith(".ts"))
    .map(filename => `${path}/${filename}`);
};

const pathAliases = Object.keys(compilerOptions.paths).reduce(
  (resolvedAliases, alias) => {
    const unbuildAlias = alias.replace("/*", "");
    const unbuildPath = compilerOptions.paths[
      alias as keyof typeof compilerOptions.paths
    ][0].replace("/*", "");

    resolvedAliases[unbuildAlias] = resolve(
      compilerOptions.baseUrl,
      unbuildPath,
    );

    return resolvedAliases;
  },
  {} as BuildOptions["alias"],
);

export default defineBuildConfig({
  outDir: "./dist",
  entries: ["./src/infra/server.ts"],
  clean: true,
  alias: pathAliases,
  externals: Object.keys(packageJson.dependencies),
  rollup: {
    emitCJS: true,
    cjsBridge: true,
    inlineDependencies: true,
    output: {
      format: "cjs",
      entryFileNames: "[name].js",
      preserveModules: true,
      strict: false,
      exports: "named",
    },
    esbuild: {
      minifySyntax: true,
      treeShaking: true,
    },
  },
});
