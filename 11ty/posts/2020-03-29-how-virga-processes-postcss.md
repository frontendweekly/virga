---
title: 'How Virga processes PostCSS'
date: 2020-03-28T11:30:00.823Z
author: Yuya Saito
desc: Virga use PostCSS and here's how I'm processing it
tags:
  - eleventy
  - postcss
  - virga
---

"Eleventy is zero-config by default but has flexible configuration options.", according to [Eleventy Documentation](https://www.11ty.dev/docs/), which often means that you will most likely have to set up "configuration options" yourself.
One of the options I always set up is tooling around CSS.

[Virga](https://github.com/frontendweekly/virga) is based on [Hylia](https://github.com/hankchizljaw/hylia) and one of the reason why I've created Virga is to use PostCSS instead of Sass which is what Hylia uses.(I have written about ["Differences between Hylia and Virga"](/posts/2020-03-02-differences-between-hylia-and-virga/).)

In this post, I'll explain how Virga process PostCSS.

## Configurations

I have already [explained how Virga structures CSS](/posts/2020-03-03-TROCT-CSS-Architecture/).

In short, since Virga has several directories and files inside of them, `main.pcss` is there to "glue" them together.
Which is why I use [`postcss-import`](https://github.com/postcss/postcss-import) and the process starts from here.

PostCSS can be configured by having `.postcssrc.js` file(well, there are several ways). And here is Virga's one.

```javascript
// .postcssrc.js
module.exports = (ctx) => ({
  map: ctx.env !== 'production' ? {inline: true} : false,
  plugins: {
    'postcss-import': {},
    'postcss-preset-env': {
      stage: 1,
    },
    autoprefixer: {},
    cssnano: ctx.env === 'production' ? {} : false,
  },
});
```

Next step of process is to "convert modern CSS into something most browsers can understand, determining the polyfills you need based on your targeted browsers or runtime environments" via [`PostCSS Preset Env`](https://github.com/csstools/postcss-preset-env).
It is like [Babel](https://babeljs.io/) for CSS.

the third step is [`autoprefixer`](https://github.com/postcss/autoprefixer) which parses CSS and adds vendor prefixes to rules by Can I Use. Even though needs for "vendor prefixes" getting smaller now, I would still include this plugin.

The final step is [`cssnano`](https://github.com/cssnano/cssnano) which is a modular minifier, built on top of the PostCSS ecosystem.

```javascript
cssnano: ctx.env === 'production' ? {} : false;
```

Are you wondering what's with this line?
This is a condition to use `cssnano` or not based on environment variable. If it is `production` then use `cssnano` to minify CSS.

Unfortunately having `.postcssrc.js` isn't going to do all the process above so let's dig deeper.

## Development Build

A "build" process is to have a file(in this case, CSS) which will be load into browsers.
Virga does this at [`src/_postcss/postcss.11ty.js`](https://github.com/frontendweekly/virga/blob/master/src/_postcss/postcss.11ty.js) for development environment.

```javascript
const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const postcssrc = require('postcss-load-config');
const {plugins, options} = postcssrc.sync();

const fileName = {
  postcss: 'main.pcss',
  css: 'main.css',
};

module.exports = class {
  async data() {
    const rawFilepath = path.join(__dirname, `./${fileName.postcss}`);
    return {
      permalink: `css/${fileName.css}`,
      eleventyExcludeFromCollections: true,
      rawFilepath,
      rawCss: await fs.readFileSync(rawFilepath),
    };
  }

  async render({rawCss, rawFilepath}) {
    return postcss(plugins)
      .process(rawCss, {
        ...options,
        from: rawFilepath,
      })
      .then((result) => result.css);
  }
};
```

I stole this from [EleventyOne](https://github.com/philhawksworth/eleventyone) by Phil Hawksworth.
This file is processed by Eleventy. Although it doesn't look like a "template language", it actually is.

According to [Eleventy Documentation](https://www.11ty.dev/docs/languages/javascript/#classes), "Eleventy looks for classes that have a `render` method and uses `render` to return the content of the template."
Since YAML Front Matter is not supported in JavaScript template types. `data` method is there to pass `data` to control how this template will render(in other words, build) a file.
So according to this setting, the final css will be generated into ‌`dist/css/main.css`.

Finally, you would want to add `addWatchTarget` at `.eleventy.js` so that when the file or the files in this directory change Eleventy will trigger a build which would look like this:

```javascript
module.exports = function (config) {
  config.addWatchTarget('./src/_postcss/');
};
```

You can take a look at [actual `.eleventy.js` file here.](https://github.com/frontendweekly/virga/blob/master/.eleventy.js)

## Production Build

As for production build, Virga utilizes [`PostCSS CLI`](https://github.com/postcss/postcss-cli) to do the build.

Why do you separate the build process between development and production?
It is a very good question.

Hylia inlines all CSS into `<style>` in `<head>` and Virga does this too.
In development environment, Virga generates CSS into `dist/css/main.css` directly but In production, it is `src/_includes/assets/styles/main.css` so CSS file is in Eleventy Layouts.

```html
<style>
  {% raw %}{% include "assets/styles/main.css" %}{% endraw %}
</style>
```

By using `include` you can "inline" CSS like above.

```shell
"build:postcss": "cross-env NODE_ENV=production postcss src/_postcss/main.pcss -o src/_includes/assets/styles/main.css"
```

When you run `npm run build:postcss`, above command will be executed.
`-o src/_includes/assets/styles/main.css` does the "output" build css into `src/_includes/assets/styles/main.css`.

All in all, this is why Virga separate build process.
