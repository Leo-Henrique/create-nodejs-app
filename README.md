# @leo-h/create-nodejs-app

<div align="center">
	<img src="https://github.com/Leo-Henrique/create-nodejs-app/assets/72027449/f62187c5-8667-4cf4-b121-0043aceb164e"
	alt="Script usage example" />
</div>

Create a Node.js application with TypeScript with just one command and without worrying about environment or framework configurations. Dedicate your energy only to the business rules of your application.

## Get started

With NPM:

```bash
npm create @leo-h/nodejs-app
```

With Yarn:

```bash
yarn create @leo-h/nodejs-app
```

With PNPM:

```bash
pnpm create @leo-h/nodejs-app
```

## CLI

You can create the project non-interactively through the CLI. Arguments or options not provided will still be asked if it is mandatory information for creation.

```bash
Usage: @leo-h/create-nodejs-app [options] [project-directory]

Arguments:
  project-directory                    Name of the project or relative path of the project considering where the script was called.

Options:
  -pm, --package-manager <package-manager>  Package manager that will be used in the project.
  -t, --template <template-name>       Template that will be used in the project.
  -f, --framework <framework-name>     Framework that will be used in the project.
  -h, --help                           display help for command
```

## Features

- **Fast**: All templates use either [esbuild](https://esbuild.github.io/) or [SWC](https://swc.rs/) to compile and build TypeScript. Both are extremely fast and are used by tools like [Vite](https://vitejs.dev/) (esbuild) and [Next.js](https://nextjs.org/) (SWC).

- **Lint and code format**: All templates use [eslint](https://eslint.org/) to identify problems in the code and [prettier](https://prettier.io/) to ensure consistent code formatting. Both are integrated with [husky](https://typicode.github.io/husky/) and [lint-staged](https://github.com/lint-staged/lint-staged) to automatically run them before every commit you make with git.

- **Tests**: To encourage the use of tests, all templates already have a pre-configured unit testing setup with [Vitest](https://vitest.dev/). The API templates also come with end-to-end usage example tests, including all utility tools like [Supertest](https://github.com/ladjs/supertest#readme) and [Faker.js](https://fakerjs.dev/).
