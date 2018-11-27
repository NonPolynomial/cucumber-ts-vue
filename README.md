# Cucumber TypeScript Vue

This project is a documentation for a possible solution to test [vue single file components (SFC)][vue-sfc] with [Cucumber][cucumber] and written in any language, which transpiles to JavaScript.

## Target

The solution chosen in this project should help to achieve following targets:

* writing tests with [Gherkin][gherkin]
* using [Cucumber](https://docs.cucumber.io/cucumber/) as Test runner
* write SPAs with [Vue][vue]
  * Components are written as [Vue SFC][vue-sfc]
* using a transpiler language like [TypeScript][ts]

### Disclaimer

This project will not include detailed explanations for how to write Vue with TypeScript and is only meant to test Vue SFC written in TypeScript.

# Transpiling

In this project we use [webpack] to achieve transpiling from one to another format or language.

## Transpiling Cucumber steps

In order to use Gherkin we need Cucumber which can understand Gherkin syntax.
You also have to define your different steps in so called step definitions / step files.

Our goal is to test multiple Vue SFCs with one or more feature files for each of them and vice versa.
It would be expensive to compile each step definition as a own entry point.

The solution is a single helper file which imports all step definitions and will serve as a single entry point for webpack.

In this project I created a `steps` folder beneath the `features` folder to write my step definitions.

There are all steps and a `index.js` which is my single entry file.
Cucumber automatically looks up the `features` folder to read all `*.feature` files in there.
For the step definitions Cucumber searches for a `features/step_definitions` folder, so I chose that path as my output.

```js
/** @file webpack.test.config.js */

module.exports = () => ({
  entry: './features/steps',
  output: {
    path: path.resolve(__dirname, 'features', 'step_definitions'),
    filename: 'steps.js',
    // ...
  },
  // ...
})
```

---

```
webpack --config webpack.test.config.js
```

will generate a file with all our step definitions in the following path:
`features/setp_definitions/steps.js`.

### Exclude node_modules / further explanations

To exclude node modules from being bundled we need to set the `externals` option.
In our example we are using `cucumber` as test runner and `chai` as assertion library.

So we need to set that `externals` option to:

```js
/** @file webpack.test.config.js */

module.exports = () => ({
  // ...
  externals: [
    'chai',
    'cucumber',
    // ...
  ],
  // ...
})
```

Because Cucumber is running in a node environment we need to set our `output.libraryTarget` option to `'commonjs2'` and our target option to `'node'`.

```js
/** @file webpack.test.config.js */

module.exports = () => ({
  // ...
  output: {
    // ...
    libraryTarget: 'commonjs2'
  },
  // ...
  target: 'node',
  // ...
})
```

```js
// so that this code
import { Given, When, Then } from 'cucumber';

// transpiles to
const { Given, When, Then } = require('cucumber');
```

## Transpiling Vue SFCs

We need to transpile Vue SFCs to normal JavaScript, because whether Typescript nor Cucumber understand `*.vue` files.

For that we need additional node modules:

* `vue-loader`
* `vue-template-compiler`

Now we have to write a webpack config and add our `vue-loader` to the `modules.rules` section and add the `VueLoaderPlugin` to our used plugins.

```js
/** @file webpack.test.config.js */

module.exports = () => ({
  plugins: [new VueLoaderPlugin()],
  module: {
    rules: [
      {
        test: [
          /\.vue$/
        ],
        loader: 'vue-loader'
      },
      // ...
    ]
  }
})
```

Now when we import Vue SFCs in our step definitions they will be transpiled to [standard vue-javascript-only render functions](https://vuejs.org/v2/guide/instance.html).

## Transpiling Languages

Cucumber is running in a node environment so we have to use CommonJS.
If you use ES6 module imports and exports you have to use babel or any other transpiler which can transpile it to CommonJS.

We use TypeScript in this example, but in the end you just have to switch some plugins and/or webpack-loaders.

--- 

For transpiling TypeScript we need the following node modules:

* `ts-loader`
  * `typescript`
* Some type definitions
  * `@types/chai`
  * `@types/cucumber`
* additionally to use Vue with TypeScript, we need some type definitions for that as well
  * `vue-property-decorator`

Now we need webpack to use ts-loader, so we add it to our `modules.rules` option.

```js
/** @file webpack.test.config.js */

module.exports = () => ({
  module: {
    rules: [
      // ...
      {
        test: [
          /\.ts$/
        ],
        exclude: [
          path.resolve(__dirname, 'node_modules')
        ],
        loader: 'ts-loader',
        options: {
          appendTsSuffixTo: [/\.vue$/],
          transpileOnly: true
        }
      }
    ]
  }
})
```

As you can see we set our loader options for the `ts-loader` with `transpileOnly` to save time while testing and add the `*.vue` extension to `appendTsSuffixTo`, that the ts-loader will be used for transpiling `*.vue` files which have `lang="ts"` set as script language.

# Usage

We have 3 NPM scripts:

* `"test": "cucumber-js"`
  * which starts `cucumber-js` and searches the `features` path for `*.feature` files and load all step definitions using this glob `features/step_definitions/**/*.js`.
* `"pretest": "webpack --config ./webpack.test.config.js"`
  * before we can test we need our `*.ts` and `*.vue` files transpiled to CommonJS, that Cucumber can understand it
  * this NPM script runs automatically before `test`
* `"posttest": "rm -rf ./features/step_definitions"`
  * after testing we don't need the generated `steps.js` anymore
  * this NPM script runs automatically after `test`

# Watching

`cucumber` itself has no watch task.
And in order to render Vue SFCs and TypeScript for step definitions, we need to run our NPM `test` script on every file change.

We need some tool to watch files and rerun `npm test`.
For these tasks we choose [`nodemon`][nodemon] and create a nodemon config file.

```json
{
  "ext": "js,ts,vue,feature",
  "watch": [
    "src/**/*",
    "features/**/*"
  ],
  "ignore": [
    "features/step_definitions/steps.js"
  ],
  "exec": "npm run test"
}
```



[cucumber]: https://docs.cucumber.io/cucumber/
[gherkin]: https://docs.cucumber.io/cucumber/
[nodemon]: https://nodemon.io
[ts]: https://www.typescriptlang.org/
[vue]: https://vuejs.org/
[vue-sfc]: https://vuejs.org/v2/guide/single-file-components.html
[webpack]: https://webpack.js.org
