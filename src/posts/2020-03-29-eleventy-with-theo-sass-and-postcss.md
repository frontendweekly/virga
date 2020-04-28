---
title: 'Eleventy with Theo, Sass and PostCSS'
date: 2020-03-29T04:12:48.591Z
author: Yuya Saito
desc: You can use Design Token in Eleventy and here's how I might do it
tags:
  - eleventy
  - design-token
  - sass
---

Eleventy is very flexible on how you want to process a file. In the recent post ["How Virga processes PostCSS"](/posts/2020-03-29-how-virga-processes-postcss/), I explained how I use JavaScript as Eleventy templates to process PostCSS.
With the same idea with little changes, you can do more complex process.

I'll demonstrate this in this post with using Theo, Sass and PostCSS(again).
Before I get into the details, I believe I owe an explanation on Theo and Sass.

If you want to see the example repo I have created for this post, It's at [11ty-theo-sass-postcss-example](https://github.com/frontendweekly/11ty-theo-sass-postcss-example).

## What is Theo?

Theo is an abstraction for transforming and formatting Design Tokens which is open sourced by Salesforce.

In short, Theo transforms yaml files which define Design Tokens into various formats like `sass variables`.

> Design tokens are the visual design atoms of the design system — specifically, they are named entities that store visual design attributes. We use them in place of hard-coded values (such as hex values for color or pixel values for spacing) in order to maintain a scalable and consistent visual system for UI development.
> — [Design Tokens](https://www.lightningdesignsystem.com/design-tokens/)

This is how Design Tokens are defined in Lightning Design System of Salesforce.

Design Tokens now have own [W3C Community Group](https://github.com/design-tokens/community-group) and I'm really excited about this.

## Dart Sass, not Node Sass

Have you noticed that Sass has changed its primary implementation of Sass?

Sass was originally written in Ruby and then LibSass is a C/C++ port of the Sass engine. LibSass is just a library, so it has been used with a wrapper like Node Sass.

Now Sass is written in Dart and it is the primary implementation of Sass which means it gets new features before any other implementation.

In this post, when I mention Sass, I'm taking about Dart Sass.

You can install Dart Sass via `npm`.

```
npm install sass (--save-deps|--save)
```

## Importing Theo's `yaml` into Sass

Theo provides a command line tool to transform `yaml` files into various format.

```
theo tokens.yml --format map.scss --dest .
```

Above command means `tokens.yml` file will be transformed into `map.scss` format and output file in `.` (which is same directly as the command executed).

The output file, in this case will be `tokens.map.scss` which contains something like this:

```sass
$tokens-map: (
  '${props}': (${value}),
);
```

However, Sass has `importer` option which can be utilized to do some thing like this in Sass file.

```sass
@import './tokens/token.yml';
```

`importer` executes JavaScript function(s) when a `@use` rule or an `@import` rule is encountered.
That means Sass can run `theo` in `importer` function to do the transformation.

```javascript
/* Stolen from https://basalt.io/blog/theo-design-tokens-using-node-sass-importer-for-any-build-method */
const {resolve, parse} = require('path');
const theo = require('theo');

/**
 * Theo Design Token Sass Importer
 * Import scss variables from Yaml files directly
 * @param {string} url - path to the file passed into import statement, i.e. `@import "design-tokens.yml";`
 * @param {string} prev - path to the file the import statement is located at, useful for calculating relative paths
 * @link <https://www.npmjs.com/package/theo>
 */
function theoImporter(url, prev) {
  // If the imported file doesn't end in `.yml` or `.yaml`, then `return null` early to tell node-sass that we're not going to do anything. It'll go on to the next function or just try to handle the import itself.

  if (!/\.ya?ml$/.test(url)) return null;

  // `prev` is the where it was imported from, we just want the directory it is in
  const prevDirectory = parse(prev).dir;
  // imports are almost always relative, so let's figure out how to get to there from here so we end up with an absolute url
  const designTokenFilePath = resolve(prevDirectory, url);

  const theoConverted = theo.convertSync({
    transform: {
      type: 'web',
      file: designTokenFilePath,
    },
    format: {
      // This can be any format Theo supports (or your own custom one!) <https://www.npmjs.com/package/theo#formats>
      // I'm choosing map.scss
      type: 'map.scss',
    },
  });

  return {
    contents: theoConverted,
  };
}

module.exports = theoImporter;
```

And you can "load" this `importer` function like:

```javascript
const theoImporter = require('../../_theo-importer');

const sassResult = sass.renderSync({
  file: rawFilepath,
  outputStyle: 'expanded',
  importer: [
    theoImporter, // Here
  ],
});
```

With this `importer`(and JavaScript API from Sass), I can use same technique from ["How Virga processes PostCSS"](/posts/2020-03-29-how-virga-processes-postcss/).

## Eleventy JavaScript Templates is powerful

So to recap, what I want to do is:

- `importer` function option in Sass will process Theo
- Sass will process `scss` to CSS
- CSS will be processed with Autoprefixer and cssnano

All this can be done with Eleventy JavaScript Templates.

[`sass.11ty.js` looks like this](https://github.com/frontendweekly/11ty-theo-sass-postcss-example/blob/master/src/_sass/sass.11ty.js).

I'll explain interesting parts.

```javascript
const sassResult = sass
  .renderSync({
    file: rawFilepath,
    outputStyle: 'expanded',
    importer: [theoImporter],
  })
  .css.toString();
```

As I showed few lines above, this is Sass JavaScript API which use `importer` option.

```javascript
module.exports = class {
  data() {
    return {
      permalink: `_css/${fileName.css}`,
    };
  }

  render(data) {
    return postcss(plugins)
      .process(sassResult, {
        from: rawFilepath,
      })
      .then((result) => result.css);
  }
};
```

And this is Eleventy JavaScript Templates part.
I was very happy since it looked like easy thing to do.

## But, `sass` command line doesn't come with `importer` option

`node-sass` cli does have `importer` option but Dart Sass doesn't.

```bash
# This works
node-sass --importer ./theo-importer.js src/_sass/main.scss src/_includes/assets/styles/main.css

# But this IS NOT
sass --importer ./theo-importer.js src/_sass/main.scss src/_includes/assets/styles/main.css
```

`importater` has been "Experimental" in `node-sass`. I'm not sure if Dart Sass will have this available in the future.
So I've decided to reuse `sass.11ty.js` to run from command line.
You can do `‌node src/_sass/sass.11ty.js` to invoke it.
And since I only run this from command line in production, I've added this lines of codes.

```javascript
if (process.env.ELEVENTY_ENV === 'production') {
  console.log(`Writing CSS to ${prodDistpath}...`);
  fs.writeFileSync(prodDistpath, sassResult);
}
```

Well, actually you'd need `fs.writeFileSync(prodDistpath, sassResult);` this line to make it work.
`postcss` CLI will pickup the file generated from above and do Autoprefixer and cssnano.

## How to run the example?

I have set up an example files on GitHub.

[https://github.com/frontendweekly/11ty-theo-sass-postcss-example](https://github.com/frontendweekly/11ty-theo-sass-postcss-example)

Fork this repo and clone it into your local machine then:

- `npm install`
- `npm start` for watching file changes and run build and server. CSS file will be at `dist/_css/main.css`
- (Quit the server) `npm run build:prpduction` will generate minified CSS file in `src/_includes/assets/styles/main.css`

I'm assuming you have `node` installed on your machine.
