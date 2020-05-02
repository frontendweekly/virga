---
title: Creating Plugins for Eleventy
desc: 'A story about creating plugins for Eleventy'
date: 2020-04-30T10:46:06.237Z
author: Yuya Saito
tags:
	- eleventy
---

## Preface

Before I introduced my story about creating plugins for Eleventy, let me write about How I'm imaging to publish stories on Virga.

Virga was born to learn about Eleventy, so I forked [Hylia](https://hylia.website/) as a starting point so Virga is also a starter kit for Eleventy. I'm using it for 2 other blogs([Frontend Weekly Tokyo](https://frontendweekly.tokyo/) and [Sixty Six](https://sixtysix.frontendweekly.tokyo/)) and I've started use Virga as a blog since I didn't think anyone actually using this as a starter kit.

I've written a few articles mostly about Virga itself and I have nothing to left to write.
Now I need to think about what I'm going to write. I know. This is where blogging becomes difficult, right?

So here it is, this is what I'm doing about it.

I write a story about what I'm going to implement and I write about it as I do. I don't even know how this story is going to be and that I think makes it interesting.
This is like a diary but I'll call it a story anyway.

This is a story about implementing plugins for Eleventy.

## MOLLE (`/ˈmɒl.liː/`)

What do I want for plugins? And what does "plugins" mean in Eleventy?
To answer the latter, I'm using plugins such as [`eleventy-plugins-rss`](https://github.com/11ty/eleventy-plugin-rss) and [`eleventy-plugin-syntaxhighlight`](https://github.com/11ty/eleventy-plugin-syntaxhighlight) but I haven't look at how they work.

[`eleventy-plugin-blog-tools`](https://github.com/brob/eleventy-plugin-blog-tools) by Bryan Robinson is why I thought about making plugin at first.

I have 3 blogs including this one and they all use same 5 filters and 2 transforms. I update these scarcely but whenever I do, I have to do it 3 times.

This is the very problem I'm trying to fix it with my soon to be created plugins and this is where MOLLE comes in.

MOLLE is where I place my tiny plugins and I want to tryout monorepo using [Lerna](https://lerna.js.org/). While I could have published my plugins at npm, but I also want to try [GitHub Packages](https://github.com/features/packages).

This is where my journey begins.

What's with the name?
MOLLE is an acronym for Modular Lightweight Load-carrying Equipment and according to Wikipedia, "It is used to define the current generation of load-bearing equipment and backpacks used by a number of NATO armed forces, especially the British Army and the United States Army."
I think the name rings true to what it's going to achieve.

## Figuring out Lerna

> Lerna is a tool that optimizes the workflow around managing multi-package repositories with git and npm.
> — [Lerna](https://lerna.js.org/)

In my word, Lerna will help me to manage multi-package in one repository.
I won't go into deep dive on Lerna since I'm figuring it out right now.

While [official GitHub repo page](https://github.com/lerna/lerna) offers detailed documentation, I've grasped the gist of it by reading 2 articles below:

- [What is a mono-repository and why you should try Lerna](https://dev.to/anonimoconiglio/what-is-a-mono-repository-and-why-you-should-try-lerna-57lm) by Santiago
- [Using Lerna to manage your JavaScript monorepo](https://dev.to/jody/using-lerna-to-manage-your-javascript-monorepo-4eoo) by Jody Heavener

I want to choose which plugin to install even though I need most of plugins to run my blogs. Therefore each of my plugins are going to have different version. This is what "Independent mode" means in Lerna.
And that's what `lerna init --independent` does.

There are many commands available on Lerna, but so far I've only used `lerna publish` which publishes updated packages to the registry.

I'm going to need to learn more about Lerna but I initialized it and am able to publish my packages to GitHub Packages (with couple of mistakes along the way, of course).

My current config for Lerna looks like this:

```json
{
  "npmClient": "npm",
  "command": {
    "publish": {
      "ignoreChanges": ["ignored-file", "*.md"],
      "message": "chore(release): publish",
      "registry": "https://npm.pkg.github.com"
    }
  },
  "packages": ["packages/*"],
  "version": "independent"
}
```

## Configuring for GitHub Packages

Publishing a package to GitHub Packages is same process as npm org and I already have done it before at work.

I needed to generate GitHub Personal Token since I forgot I already had one for GitHub Packages (Dear future me, you should save tokens on 1 password whenever you make new one).

I need have `.npmrc` at my project root which have this.

```text
//npm.pkg.github.com/:_authToken=${GITHUB_PKG_TOKEN}
registry=https://npm.pkg.github.com/frontendweekly
```

I use [direnv](https://github.com/direnv/direnv) to load and unload environment variables so actual value of `${GITHUB_PKG_TOKEN}` is in `.envrc` file.

I haven't figure out how to use GitHub Actions to automate publishing a package yet but that's something I am going to do in future.

## What makes it a plugin in Eleventy?

According to official document, "Plugins are custom code that Eleventy can import into a project from an external repository."

```js
const pluginRss = require('@11ty/eleventy-plugin-rss');
module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(pluginRss);
};
```

And this is how a plugin might be "imported" from an "external repository".

I've read some of plugins' code but I didn't know why I want to do `addPluin()` when you could do `addFilter()` or `addTransform()`?

[`eleventy-plugin-blog-tools`](https://github.com/brob/eleventy-plugin-blog-tools) by Bryan Robinson offers 5 shortcodes, 2 filters and 1 collection as a plugin and I can import all by doing `addPluin()` which is handy for sure.

And I could do that by setting up `.eleventy.js` as I would normally do in Eleventy.
Now I see what makes a plugin a plugin.

I've already have 4 packages ported to MOLLE and I've published each packages but those packages don't have `.eleventy.js`.
I should have come to that realization before publishing packages, however I have a good idea to save my mistake.

Published packages are going to stay as there are. Just packages. But I can import them individually if I want.
And I'll make a new package which will be a proper Eleventy plugin, which has all filters and transforms.

## Making of Eleventy plugin

I've already have [published 4 packages on GitHub](https://github.com/orgs/frontendweekly/packages) so I would say it's good time to make an Eleventy plugins.

As Joe Armstrong who is a creator of Erlang wrote "The first in acquiring any new skill is not being able to do your own thing but being able to reproduce what other people before you.", I've looked at how [`eleventy-plugins-rss`](https://github.com/11ty/eleventy-plugin-rss) implements a plugin and stole useful bits (Thank you, Mr. Zach Leatherman) and ended up like this:

```text
.
├── example/
├── node_modules
├── .eleventy.js
├── .eleventyignore
├── .npmignore
├── LICENSE.md
├── package-lock.json
├── package.json
└── README.md
```

Inside of `.eleventy.js`, I have:

```js
const filterDateOrdinalSuffix = require('../filter-date-with-ordinal-suffix');
const filterDateIso = require('../filter-date-iso');
const transformHtmlMin = require('../transform-htmlmin');
const transformEnhancePostHtml = require('../transform-enhance-post-html');

module.exports = function (eleventyConfig) {
  eleventyConfig.addFilter('dateOrdinalSuffixFilter', filterDateOrdinalSuffix);
  eleventyConfig.addFilter('dateIsoFilter', filterDateIso);
  eleventyConfig.addTransform('htmlmin', transformHtmlMin);
  eleventyConfig.addTransform('enhancePostHtml', transformEnhancePostHtml);
};
```

And this is how I would use it:

```js
const molle = require('@frontendweekly/molle');

module.exports = function (config) {
  config.addPlugin(molle);
};
```

Although I haven't use it on my blog yet, I have an `example` dir to confirm it seems working as intended.

## Coming back to Lerna

As I've mentioned above, I have this in `.eleventy.js`.  
Should I make those `require`s from registry?
The answer is Yes because I want to update individual packages without breaking `molle`.

```js
const filterDateOrdinalSuffix = require('../filter-date-ordinal-suffix');
const filterDateIso = require('../filter-date-iso');
const transformHtmlMin = require('../transform-htmlmin');
const transformEnhancePostHtml = require('../transform-enhance-post-html');
```

I made the change and run `npx lerna bootstrap`.
I don't know what exactly `lerna bootstrap` does and I thought it'll install all packages I've specified in the code.

Nope.

Looks like I need to do that manually so I did:

```bash
npx lerna add @frontendweekly/filter-date-ordinal-suffix packages/molle --registry https://npm.pkg.github.com
npx lerna add @frontendweekly/filter-date-iso packages/molle --registry https://npm.pkg.github.com
npx lerna add @frontendweekly/transform-enhance-post-html packages/molle --registry https://npm.pkg.github.com
# ... and other dependecies
```

It seems like I have to do this for every dependencies I need to add, but this does the tricks.

## Taking out MOLLE for spin

```bash
npm install @frontendweekly/molle --save
```

and add this at `.eleventy.js` and of course, removing local filters and transforms...

```js
const molle = require('@frontendweekly/molle');

module.exports = function (config) {
  config.addPlugin(molle);
};
```

... and It works 🎉

MOLLE now lives in [https://github.com/frontendweekly/molle](https://github.com/frontendweekly/molle) and I'm using it on Virga as I write this very sentence.

## Retrospect

- Two of the hard things in this journey were coming up with the name "MOLLE" and Lerna
- I actually didn't write any new code. I've moved them to new place but while doing it, I've added unit tests for most of them
- GitHub Packages is good. I didn't have to think about it after I have configuration for it
- I wish there is a way to make a plugin for template
- I have few more pieces of codes I need to move to MOLLE

Well, then until next journey.
