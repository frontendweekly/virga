---
title: TROCT CSS Architecture
date: 2020-03-03
author: Yuya Saito
desc: TROCT is not even a word but this is how I apply ITCSS.
---

The title is just a click bait and I won't claim I invented this since it is just my way of applying the Inverted Triangle architecture (AKA ITCSS) which was first introduced by Harry Roberts.

In simplest words, ITCSS is a methodology for organizing CSS files within layers-from generic to explicit, and from low to high specificity.
If you want to learn more in depth, you should [check out Harry's talk](https://youtu.be/hz76JIU_xB0).

While ITCSS has 7 layers (Settings, Tools, Generic, Elements, Objects, Components, Utilities), TROCT has 5 layers which are:

- **T**okens
- **R**oots
- **O**bjects
- **C**omponents
- **T**ools

Before I explaining responsibilities for each layer, I'll show you how I'm applying it at this very project.

```shell
.
├── tokens
│  ├── _color.pcss
│  └── _space.pcss
├── roots
│  ├── _element.pcss
│  ├── _theme.pcss
│  └── _typography.pcss
├── objects
│  ├── _hr.pcss
│  ├── _layout.pcss
│  └── _skip-link.pcss
├── components
│  ├── _intro.pcss
│  ├── _navigation.pcss
│  ├── _post-list.pcss
│  ├── _post-meta.pcss
│  ├── _post.pcss
│  ├── _site-foot.pcss
│  └── _site-head.pcss
├── tools
│  ├── _prefers-reduced-motion.pcss
│  ├── _syntax-highlighting.pcss
│  └── _visually-hidden.pcss
├── main.pcss
```

Let's dig in to each layers.

### Tokens

Tokens layer is for Design tokens. Now Design tokens has [own W3C Community Group](https://github.com/design-tokens) and since the name comes from the Salesforce design system team, I'll quote the original definition here.

> Design tokens are the visual design atoms of the design system — specifically, they are named entities that store visual design attributes.

— Design Tokens - Lightning Design System - https://www.lightningdesignsystem.com/design-tokens/

I might be able to put these "tokens" into Roots, but I really love the principles of Design tokens so it stays.

### Roots

Responsibilities for Roots layer are same as Generic AND Elements in ITCSS.

In ITCSS, Generic houses all the very high-level, far reaching styles. it often contains things like normalize.css, CSS resets, and for example box-sizing rules.

And Elements refer to all un-classed HTML tags. Styles in here get applied to specific HTML tags, like headings, links, and lists. This is the last layer where we use type selectors.

It has both "very high-level and far reaching styles" and project default styles AKA "all un-classed HTML tags".
Both belongs to "roots" of project so that's where the name comes from.

`_element.pcss` has most styles for "all un-classed HTML tags" which also has "reset" or "normalize" rules.

> [Reset CSS] is a starting point, not a self-contained black box of no-touchiness.

— CSS Tools: Reset CSS - https://meyerweb.com/eric/tools/css/reset/

This is from Eric Meyer who introduced "Reset CSS" into this world so I'm following his words.

### Objects

This layer houses same responsibilities as ITCSS does which follow OOCSS (Object Oriented CSS) principles. They are small and reusable pieces with no aesthetics which can be used in UI composition.

### Components

This is same as ITCSS as well.
It houses specific UI components.

### Tools

This layer would be very confusing for those who are familiar with ITCSS.
In ITCSS, "Tools" means globally used mixins and functions for preprocessors like Sass.
But since I'm using PostCSS, I'm using the name "Tools" as "Utilities" and/or "Trumps" in ITCSS.

Reason behind this is, "Utilities" is hard for me to type and I always have to look up what "Trumps" means so in other word, it is "language barrier" for me so I want to change it so that it would be more easier for me.

## TROCT is ITCSS

ITCSS, at its core, is a set of principles to answer many of issues around writing scalable and predictable CSS in large projects.
So TROCT just applies those principles accordingly.

Just like how I had opened this post, title of this post is just a click bait. It's just showing example of ITCSS as I understand it.
