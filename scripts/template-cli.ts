import { Command } from "commander";
import { createTemplateScript } from "./create-template.script";
import { openTemplateScript } from "./open-template.script";

const program = new Command()
  .name("template")
  .description(
    "CLI utility to manipulate templates quickly and maintain shared patterns between templates.",
  );

program
  .command("create")
  .description("Create a new template cloning 'templates/clean'.")
  .argument("[template-name]", `"Name of template.`)
  .option(
    "--main-file <file-name>",
    `Name of the program input file (example: "index").`,
  )
  .action(createTemplateScript);

program
  .command("open")
  .description(
    `Open a template (work only in Visual Studio Code with "code" CLI enabled). `,
  )
  .argument("[template-name]", `"Name of template.`)
  .action(openTemplateScript);

(async () => {
  await program.parseAsync(process.argv);
})();
