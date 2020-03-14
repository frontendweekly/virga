---
title: How Would I Extend Virga?
date: 2020-03-07
author: Yuya Saito
desc: Virga is a starter kit for who love to extend after all.
---

## Modification ideas for Virga

Virga is based on [Hylia](https://hylia.website/) without Netlify CMS bit and few modifications ([I did wrote about differences between the two](/2020-03-02-differences-between-hylia-and-virga/)).

Virga is pretty much ready for starting a blog, I think. I don't own a blog but I'm thinking about using Virga on [this site called Frontend Weekly Tokyo](https://frontendweekly.tokyo/) which was build using Hylia.

At Frontend Weekly Tokyo, I've done some modifications on Hylia. So these are good candidates to extend Virga, too.

- **Monetization** through service called [Coil](https://coil.com/about). I choose this because Coil is currently only provider for [Web Monetization spec](https://webmonetization.org/).
- **Webmentions**, although I need to patch few bugs, Webmentions is working on Virga. I've followed this [Max Böck's tutorial on setting up Webmentions on Eleventy](https://mxb.dev/blog/using-webmentions-on-static-sites/). Very detailed and helpful.
- **Auto Tweet using Netlify functions**. Netlify provides AWS Lambda as Netlify Functions so you achieve lots of thing via "serverless". On Frontend Weekly, Netlify Functions does Tweet when a post went public. Again, I've stole this [Max Böck's tutorial](https://mxb.dev/blog/syndicating-content-to-twitter-with-netlify-functions/).

## IndieWeb

> There are many reasons why you should use the IndieWeb.
> — Indieweb.org

Eleventy is very good at practicing IndieWeb since using it means you already own your content.

Virga surely not covering every aspect of IndieWeb but does offer a starting points.

### Place for your content

Netlify is good place to serve your content.
Virga has been configured to deploy to Netlify.
Netlify has DNS service so you can set up your custom domain very easily.

### Add info about yourself

Virga utilizes [`rel-author`](https://indieweb.org/rel-author) to help provide authorship information.

Virga is flexible when it comes to authorship. Any numbers of writer can can authorship via front matter data.

```text
---
title: How Would I Extend Virga?
date: 2020-03-07
author: Yuya Saito
desc: Virga is a starter kit for who love to extend after all.
---
```

If you omit `author` in front matter, Virga uses data from `src/_data/site.json`.

You could dig really deep on IndieWeb with Eleventy and Virga in that direction.
