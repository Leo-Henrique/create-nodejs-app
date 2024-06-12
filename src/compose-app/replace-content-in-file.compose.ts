import { readFile, writeFile } from "fs/promises";

export async function replaceContentInFileCompose(
  path: string,
  contents: string[][],
) {
  const fileContent = await readFile(path, "utf-8");
  let newFileContent = fileContent;

  for (const [oldContent, newContent] of contents) {
    newFileContent = newFileContent.replaceAll(oldContent, newContent);
  }

  await writeFile(path, newFileContent);
}
