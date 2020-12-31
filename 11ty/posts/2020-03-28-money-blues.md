---
title: Money Blues
date: 2020-03-28T09:07:19.154Z
author: Yuya Saito
desc: Virga is now used for my personal blog and Coil for experimenting web monetized standard
tags:
  - virga
---

I have decided that I'll use [Virga](https://github.com/frontendweekly/virga) for my personal blog, so I have added `paymentPointer` in `src/_data/site.json` which is to experiment web monetized content in your browser while supporting sites by using [Coil](https://coil.com/).

Coil is very cool since:

- its goal is to make it based on [an actual web standard](https://webmonetization.org/docs/explainer.html)
- it is very easy to set up; create an account on Coil(it's free) and add a `<meta>` tag in the `<head>` of your site

Example:

```html
<meta
  name="monetization"
  content="$pay.stronghold.co/1a1d5ecbf6f988e4be3abc11cfb0a0b912d"
/>
```

Honestly, I don't intend to earn money at all.
I want to support the web standard.

If you were to decide to fork Virga to start your own blog, do please replace `paymentPointer` value in `src/_data/site.json` otherwise your hard work will be contributing my earning.

Chris Coyier from CSS Tricks has covered about Coil on ["Site Monetization with Coil (and Removing Ads for Supporters)"](https://css-tricks.com/site-monetization-with-coil-and-removing-ads-for-supporters/). You should check out the article and hope you would experiment with Coil.

By the way, the title of this post is form Bob Dylan's song.
