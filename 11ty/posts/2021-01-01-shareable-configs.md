---
title: Shareable Configs
desc: 'A story about creating shareable configurations for ESLint, stylelint, Jest preset and Browserlist'
date: 2021-01-01T12:15:31.627Z
author: Yuya Saito
---

## Unstable Linting

Static testing AKA linting has been integrated with my development for some times; however, my configurations for ESLint and stylelint haven't had a single source of truth.

I've been copy and pasting configurations for long so that there are several versions of them.

In addition, I run linting as a part of tests using Jest runners, and I realized that I have several versions for Jest configuration.

I knew there are a way to create a shareable configuration for ESLint, but didn't know how.
I didn't know there are a way to do a shareable configuration for stylelint nor Jest.

I need a home for those configurations.

And this is where my journey begins.

This is a story about creating shareable configurations for ESLint, stylelint, Jest preset and Browserlist.

## ESLint

ESLint [has a dedicated page for shareable configs](https://eslint.org/docs/developer-guide/shareable-configs) therefore it is relatively easy to set it up.

### index.js for exporting configs

> Shareable configs are simply npm packages that export a configuration object. To start, create a Node.js module like you normally would. Make sure the module name begins with `eslint-config-`, such as `eslint-config-myconfig`.
> — “Shareable Configs.” ESLint, eslint.org/docs/developer-guide/shareable-configs.

"[A] configuration object" means what `.eslintrc.js` has in it. I had several of those scattering around all over my repositories, so I decided to start from scratch for new year.

I've used GitHub package instead of npm and that works great.

### Plugins

I'm using 11 plugins and here is 5 of them:

- [prettier/eslint-config-prettier](https://github.com/prettier/eslint-config-prettier): Turns off all rules that are unnecessary or might conflict with Prettier
- [mysticatea/eslint-plugin-node](https://github.com/mysticatea/eslint-plugin-node): Additional ESLint's rules for Node.js
- [amilajack/eslint-plugin-compat](https://github.com/amilajack/eslint-plugin-compat): Lint the browser compatibility
- [nodesecurity/eslint-plugin-security](https://github.com/nodesecurity/eslint-plugin-security): ESLint rules for helping identify potential security hotspots, but finds a lot of false positives which need triage by a human
- [jest-community/eslint-plugin-jest](https://github.com/jest-community/eslint-plugin-jest): ESLint plugin for Jest

### So `.eslintrc.js` has become one-liner

```js
module.exports = {
  extends: '@frontendweekly/eslint-config-molle',
};
```

Technically it is not a one-liner, but once I have set up my shareable config at GitHub package, all I need in `.eslintrc.js` is `extends` it.

## stylelint

Fortunately, stylelint has similar approach to ESLint one for creating a shareable config and [stylelint/stylelint-config-standard](https://github.com/stylelint/stylelint-config-standard) has great rules for writing CSS so I only have 5 plugins.

Again, I've used GitHub package instead of npm.

All in all, my `.stylelintrc.js` has:

```js
module.exports = {
  extends: '@frontendweekly/stylelint-config-molle',
};
```

## Jest

Last year, I've spent some time renewing my knowledge and skill for testing via [Testing Javascript by Kent C. Dodds](https://testingjavascript.com/).

I love tinkering with my config(that's why I'm writing this story), so "Configure Jest for Testing JavaScript Applications" is one of my favorite sections.

In that section, Kent C. Dodds showed real-world configuration for a large real-world application, and I have distilled it for my environment.

### Jest has `jest-preset.js`

First, Jest has `jest.config.js` so I thought I could use same approach as ESLint and stylelint for creating a shareable config.
Even though, I think I could make it work, but I've found a better way.

I've stumble upon `preset` when I'm reading Jest documentation.

> A preset that is used as a base for Jest's configuration. A preset should point to an npm module that has a jest-preset.json or jest-preset.js file at the root.
> — “Configuring Jest.” Jest, jestjs.io/docs/en/configuration.html.

In Jest world, I need `jest-preset.js` for a shareable config, yet differences between ESLint and stylelint basically end here.

Once I've set up `jest-preset.js`, my `jest.config.js` has:

```js
module.exports = {
  preset: '@frontendweekly/jest-preset-molle',
};
```

## Browserlist

My renewed ESLint and stylelint has rules for linting browser compatibilities so having a shared Browserlist setting comes in handy.

I've realized that I depend on Browserlist tightly, yet I only know a few things about it.
Naturally, I didn't know about its shareable configs capability.

However, how to set it up is quite similar to ESLint and stylelint.
Once I have `export`ed an array which has browsers queries at index.js, I need to import at `browserslistrc`.

```text
extends @frontendweekly/browserslist-config-molle
```

While I'm digging into Browserslist document, I did found a gem.

```shell
npx browserslist@latest --update-db
```

Browserslist relies on [caniuse-lite](https://github.com/ben-eb/caniuse-lite) for doing `last 2 versions` or `>1%` so about once a month I would need to run above command to update it.

As of the time of writing, [Browserslist is seeking help for its funding](https://browserl.ist/) and I'm considering to become a backer.

## MOLLE-rc

All of my shareable configs have now a home.

Since I mainly use it for my side project which is done in Eleventy, I consider it as a part of my [MOLLE](https://virga.frontendweekly.tokyo/posts/2020-04-30-creating-plugins-for-eleventy/) family.

[molle-rc](https://github.com/frontendweekly/molle-rc) is a new home.

*I don't recommend using them at all…this is my config for my side project.*

I use yarn 2 without Lerna for mono-repo setup for this, but that's another story.

I've spent some time to re-create new configs for ESLint, stylelint, Jest and Browserslist, and I'm happy for now.
I might add my prettier config to molle-rc later. 

Well, then until next journey. 
