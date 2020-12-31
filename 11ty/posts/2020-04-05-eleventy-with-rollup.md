---
title: 'Eleventy with Rollup'
date: 2020-04-05T11:13:14.711Z
author: Yuya Saito
desc: My favorite languages are HTML and CSS but sometimes I do need JavaScript and when I do I use Rollup
tags:
  - eleventy
  - bundler
---

I've written on ["Eleventy with Theo, Sass and PostCSS"](https://virga.frontendweekly.tokyo/posts/2020-03-29-eleventy-with-theo-sass-and-postcss/) which is about how to utilize Eleventy JavaScript Templates to build Theo, Sass and PostCSS.

This time, I'll demonstrate how to build JavaScript using Rollup with the same method I've mentioned above.

## What is Rollup?

According to Rollup guide:

> Rollup is a module bundler for JavaScript which compiles small pieces of code into something larger and more complex, such as a library or application.
> — [rollup.js/guide](https://rollupjs.org/guide/en/)

If you like to add some JavaScript into Eleventy, having Rollup to bundle JavaScript files comes in handy.

## Rollup config file

Rollup does recommend having a config file so...

```javascript
const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const {terser} = require('rollup-plugin-terser');

module.exports = {
  input: 'src/_js/main.js',
  plugins: [resolve(), commonjs()],
  output: {
    file: 'dist/_js/bundle.js',
    format: 'iife',
    sourcemap: true,
    plugins: [terser()],
  },
};
```

This is the config file for this example. You can do a lot in this config so if you're interested to learn, [please read official guide](https://rollupjs.org/guide/en/#configuration-files).

I'll use this in both Eleventy JavaScript Templates and CLI.

## Eleventy JavaScript Templates

Let's look at Eleventy JavaScript Templates.
I'd say 99% of this code comes [from the official guide](https://rollupjs.org/guide/en/#programmatically-loading-a-config-file).

```javascript
const rollup = require('rollup');
const loadConfigFile = require('rollup/dist/loadConfigFile');
const {resolve} = require('path');

const rollupConfigFile = resolve(__dirname, '../../rollup.config.js');

module.exports = class {
  async render(data) {
    // Stolen from:
    // https://rollupjs.org/guide/en/#programmatically-loading-a-config-file
    loadConfigFile(rollupConfigFile, {format: 'iife'}).then(
      async ({options, warnings}) => {
        const option = options[0];
        // "warnings" wraps the default `onwarn` handler passed by the CLI.
        // This prints all warnings up to this point:
        console.log(`We currently have ${warnings.count} warnings`);

        // This prints all deferred warnings
        warnings.flush();

        // options is an "inputOptions" object with an additional "output"
        // property that contains an array of "outputOptions".
        // The following will generate all outputs and write them to disk the same
        // way the CLI does it:
        const bundle = await rollup.rollup(option);
        await Promise.all(option.output.map(bundle.write));

        // You can also pass this directly to "rollup.watch"
        rollup.watch(option);
      }
    );
  }
};
```

So this code does "loadConfigFile":

```javascript
const loadConfigFile = require('rollup/dist/loadConfigFile');
...
const rollupConfigFile = resolve(__dirname, '../../rollup.config.js');
```

And "bundle" JavaScript:

```javascript
const bundle = await rollup.rollup(option);
```

And "write" file:

```javascript
await Promise.all(option.output.map(bundle.write));
```

This will also write a map file as well.

Finally, "watch" file changes:

```javascript
rollup.watch(option);
```

If you're familiar with CLI of Rollup, you might see the similarities.

### Usage of CLI for production build

```json
"scripts": {
  "build:js": "rollup -c"
}
```

`rollup -c` means build JavaScript files with the config file.
So if you've set up a config file, you can do production build very easily.
