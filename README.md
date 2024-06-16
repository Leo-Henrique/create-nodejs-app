# @leo-h/create-nodejs-app

![example](https://github.com/Leo-Henrique/create-nodejs-app/assets/72027449/2084fd9f-2e7a-4d2b-9111-8b8769825c7a)

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

## Features

- **Fast**: All templates use [tsx](https://tsx.is/) to run Node.js with TypeScript and [unbuild](https://github.com/unjs/unbuild) to build the application. Both tools use [esbuild](https://esbuild.github.io/), an extremely fast packager also used by tools like [Vite](https://vitejs.dev/).

- **Lint and code format**: All templates use [eslint](https://eslint.org/) to identify problems in the code and [prettier](https://prettier.io/) to ensure consistent code formatting. Both are integrated with [husky](https://typicode.github.io/husky/) and [lint-staged](https://github.com/lint-staged/lint-staged) to automatically run them before every commit you make with git.
