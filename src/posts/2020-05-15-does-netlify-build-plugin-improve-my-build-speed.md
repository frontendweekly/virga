---
title: Does Netlify Build Plugin improve my build speed?
desc: 'This is a story about untangling Netlify Build Plugin to improve my build speed.'
date: 2020-05-15T23:42:06.221Z
author: Yuya Saito
---

## ACT I: I'm still not sure saving 2 mins on build worth the time

Meet the Hero—their world, what they want, what they fear.{explanation}

My last journey was to [auto generate image from article data](https://virga.frontendweekly.tokyo/posts/2020-05-06-auto-generate-ogp-image-with-eleventy-and-puppeteer/) and by adding this feature, I've also added 2 mins of build time since generating screenshots takes time.

In the finale of my story, I've mentioned Netlify Build Plugins, and their capability to access to the cache between build.

I was going to wait for a blog post from Phil Hawksworth as he mentioned writing it on his Tweet, but it would be more fun for me to get my own hand dirty on this topic.

As always, I'm not sure how this story is going to end, but I'll record what happened to me along the way.

And this is where my journey begins.
This is a story about untangling Netlify Build Plugins so that I can create one to speed up my build.

### Inciting Incident: Figuring out Netlify Build Plugins

Your Hero's worst fears realized.{explanation}

Before I actually write some JavaScript(I'm assuming that is the language I can use to build Netlify Build Plugins), I need to find out about I can run Netlify Build Plugins locally.

Here are references I've found so far and I haven't read it all yet.

- [What are Netlify Build Plugins? Part 1 - How to Use Build Plugins](https://www.netlify.com/blog/2020/04/30/whats-a-netlify-build-plugin-series-part-1-using-build-plugins/)
- [Build Plugins | Netlify Docs](https://docs.netlify.com/configure-builds/build-plugins/#create-your-own)
- [netlify/build: Netlify Build Plugins. Join the early access beta 👉](https://github.com/netlify/build)
- [netlify/plugins: Netlify plugins directory](https://github.com/netlify/plugins)
- [netlify-labs/netlify-plugin-debug-cache: Debug & verify the contents of your Netlify build cache](https://github.com/netlify-labs/netlify-plugin-debug-cache)
- [jlengstorf/netlify-plugin-gatsby-cache](https://github.com/jlengstorf/netlify-plugin-gatsby-cache)

According to [netlify/build](https://github.com/netlify/build), after enabling Build Plugins at Netlify, what I need to do is add:

```text
[[plugins]]
  package = "netlify-plugin-debug-cache"
```

Something like this to my `netlify.toml`.

Before I've added above, I run `npx netlify build --dry` and that gave me this:

```shell
┌─────────────────────────────┐
│        Netlify Build        │
└─────────────────────────────┘

❯ Version
  @netlify/build 0.4.26

❯ Flags
  dry: true
  mode: cli

❯ Current directory
  /Users/studiomohawk/Sync/Hack/sixtysix

❯ Config file
  /Users/studiomohawk/Sync/Hack/sixtysix/netlify.toml

❯ Context
  production

❯ Netlify Build Commands
  For more information on build events see the docs https://github.com/netlify/build

  Running `netlify build` will execute this build flow

  ┌──────────────────┬──────────────────┐
  │ Event            │ Location         │
  └──────────────────┴──────────────────┘
  ┌──────────────────┐
  │ 1. onPreBuild  ↓ │ Plugin @netlify/plugin-functions-install-core
  └──────────────────┘
  ┌──────────────────┐
  │ 2. onBuild     ↓ │ build.command from netlify.toml
  └──────────────────┘
  ┌──────────────────┐
  │ 3. onPostBuild   │ Plugin @netlify/plugin-functions-core
  └──────────────────┘

  If this looks good to you, run `netlify build` to execute the build
```

This is what I get from the same command after I've added the configuration to `netlify.toml`.

```shell
┌─────────────────────────────┐
│        Netlify Build        │
└─────────────────────────────┘

❯ Version
  @netlify/build 0.4.26

❯ Flags
  dry: true
  mode: cli

❯ Current directory
  /Users/studiomohawk/Sync/Hack/sixtysix

❯ Config file
  /Users/studiomohawk/Sync/Hack/sixtysix/netlify.toml

❯ Context
  production

❯ Installing plugins
   - netlify-plugin-debug-cache

❯ Loading plugins
   - netlify-plugin-debug-cache@1.0.3

❯ Netlify Build Commands
  For more information on build events see the docs https://github.com/netlify/build

  Running `netlify build` will execute this build flow

  ┌──────────────────┬──────────────────┐
  │ Event            │ Location         │
  └──────────────────┴──────────────────┘
  ┌──────────────────┐
  │ 1. onPreBuild  ↓ │ Plugin @netlify/plugin-functions-install-core
  └──────────────────┘
  ┌──────────────────┐
  │ 2. onBuild     ↓ │ build.command from netlify.toml
  └──────────────────┘
  ┌──────────────────┐
  │ 3. onPostBuild ↓ │ Plugin @netlify/plugin-functions-core
  └──────────────────┘
  ┌──────────────────┐
  │ 4. onEnd         │ Plugin netlify-plugin-debug-cache
  └──────────────────┘

  If this looks good to you, run `netlify build` to execute the build
```

Nice.
It did automatically install the plugin as a npm module and looks like `netlify-plugin-debug-cache` is executed `onEnd` event.

When I do `npx netlify build` (without `--dry`), there is `cache-output.json` in my `dist` directory. Since I haven't save anything in cache yet, I have `[]` in my `cache-output.json`.

## ACT II: How to create own Netlify Build Plugin

The Hero makes a decision about how to resolve the problem created by the Inciting Incident.{explanation}

Now I've learned how to run a Netlify Build Plugin locally, let's dig a bit deeper. Next objective will be saving the cache, but before doing that I need to know how to create own Netlify Build Plugin.

According to [netlify/build](https://github.com/netlify/build#anatomy-of-a-plugin), a plugin consists of two files: a `manifest.yml` and a JavaScript file exporting an object, so I made those.

```shell
plugins
└── netlify-plugin-molle-cache
   ├── index.js
   └── manifest.yml
```

`manifest.yml` has:

```yml
name: netlify-plugin-molle-cache
```

`index.js` has:

```js
module.exports = {
  onPreBuild: () => {
    console.log('Hello world from onPreBuild event!');
  },
  onPostBuild: () => {
    console.log('Hello world from onPostBuild event!');
  },
  onEnd: () => {
    console.log('Hello world from onEnd event!');
  },
};
```

And I've updated `netlify.toml`:

```text
[[plugins]]
  package = "./plugins/netlify-plugin-molle-cache"
[[plugins]]
  package = "netlify-plugin-debug-cache"
```

Then again run `npx netlify build`.

```shell
┌─────────────────────────────────────────────────────────────────┐
│ 2. onPreBuild command from ./plugins/netlify-plugin-molle-cache │
└─────────────────────────────────────────────────────────────────┘

Hello world from onPreBuild event!
```

🎉 Yay.
I wish I could get this info by doing `npx netlify build --dry`, but worked as I've expected.

### First Reversal: how does Netlify Build Plugin cache thing works?

The Hero makes the first major progress in their journey.{explanation}

My objective is to save cache which means I need to save something. It really doesn't matter what that is since I'm just trying to figure out how Netlify Build Plugin cache thing works.

In the Tweet of Phil Hawksworth, he shared [this screenshot about cache](https://twitter.com/philhawksworth/status/1257284661874692097/photo/1) and looks like there is `utils.cache` available somewhere.

So let's find out what `utils` is:

```js
module.exports = {
  onPreBuild: () => {
    console.log('Hello world from onPreBuild event!');
  },
  onPostBuild: ({utils}) => {
    console.log('Hello world from onPostBuild event!');
    console.log(utils);
  },
};
```

This will log:

```shell
{
  build: {
    failBuild: [Function: failBuild],
    failPlugin: [Function: failPlugin],
    cancelBuild: [Function: cancelBuild]
  },
  git: {
    modifiedFiles: [],
    createdFiles: [],
    deletedFiles: [],
    commits: [],
    linesOfCode: 0,
    fileMatch: [Function: bound fileMatch]
  },
  cache: {
    save: [Function: save],
    restore: [Function: restore],
    remove: [Function: remove],
    has: [Function: has],
    list: [Function: list],
    getCacheDir: [Function: getCacheDir]
  },
  run: [Function: run] { command: [Function: runCommand] },
  functions: { add: [Function: add] }
}
```

Looks like I can use `util.cache.save()` to fulfill my objective, so my next action is figuring out what to save.

My ultimate objective here is to avoid taking screenshots as much as I can so that I can speed up my build.
So let's save screenshots which are saved at `dist/previews`.

There are [Plugin constants](https://github.com/netlify/build#plugin-constants) which allows me to access to a directory which contains the deploy-ready HTML files and assets generated by the build.

I've stolen and modified this snippet from [jlengstorf /netlify-plugin-gatsby-cache](https://github.com/jlengstorf/netlify-plugin-gatsby-cache/):

```js
module.exports = {
  onPreBuild: () => {
    console.log('Hello world from onPreBuild event!');
  },
  async onPostBuild({constants, utils}) {
    if (await utils.cache.save(constants.PUBLISH_DIR)) {
      console.log(`Stored the ${constants.PUBLISH_DIR} to speed up future builds.`);
    } else {
      console.log('Nothing found.');
    }
  },
};
```

`await utils.cache.save(constants.PUBLISH_DIR)` saves everything inside of `constants.PUBLISH_DIR` and will create a `cache` directory in a `.netlify` directory contains the cache.

This means I can remove `netlify-plugin-debug-cache` since I save this for debugging cache but `.netlify` has enough info to do that.

## Midpoint: Utilizing cache to prevent taking screenshots

The point of no return. Something big and unexpected happens, and now there's no going back to the Hero's normal life.{explanation}

Saving caches are only half the battle. I need to figure out how to restore them.
I think Eleventy doesn't come with "increment build", so I need a way to prevent taking screenshots if there are caches.

My `screenshot.11ty.js` has this as a main function.

```js
async render(data) {
  if (process.env.ELEVENTY_ENV === 'production') {
    const dom = markup(data.screenshot.data);
    return this.getscreenshot(dom.toString());
  }
}
```

So I need a new condition to prevent running those 2 functions.

`utils.cache.list()` returns list of cached file names in an array which can be executed on `onPreBuild`, so if I can write this to a file then I can load that file in `screenshot.11ty.js`.

It looks like a solid plan. Let's see if fits in reality.

### Finale: The answer is yes

The Hero confronts that obstacle by making a leap of faith that allows them to overcome it.{explanation}

And after an hour or so, I have finished modifying my plugin and `screenshot.11ty.js`:

- Plugin: [https://github.com/frontendweekly/molle/tree/master/packages/netlify-plugin-screenshot-cache](https://github.com/frontendweekly/molle/tree/master/packages/netlify-plugin-screenshot-cache)
- `screenshot.11ty.js`: [https://github.com/frontendweekly/sixtysix/blob/master/src/previews/screenshot.11ty.js](https://github.com/frontendweekly/sixtysix/blob/master/src/previews/screenshot.11ty.js)

So Does Netlify Build Plugin improve my build speed?

With caching, I've got `Build time: 1m. Total deploy time: 1m 1s` when there is no new quote. I have `Build time: 2m 56s. Total deploy time: 3m 11s` without caching.
If I have a new quote, I have `Build time: 1m. Total deploy time: 1m 3s`.

The answer is yes.

Netlify Build Plugins have lots of possibilities, and it is relatively easy to debug, so it's enjoyable to implement.
I'll see what could I done with this for Eleventy.

Well, then until next journey.
