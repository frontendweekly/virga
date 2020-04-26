---
title: Setting Up Webmentions on Eleventy. Part 1
desc: 'This is the first of two series article about how to set up Webmentions on Eleventy'
date: 2020-04-26T03:49:56.029Z
author: Yuya Saito
tags:
  - eleventy
  - indieweb
  - webmention
draft: true
---

> Webmention is a simple way to notify any URL when you mention it on your site. From the receiver's perspective, it's a way to request notifications when other sites mention it.
> — W3C. [Webmention](https://www.w3.org/TR/webmention/), (2017, Jan 12)

In other word, "an @ mention that works across websites", according to [Rony Ngala](https://twitter.com/rngala/status/852354426983591937).

I have implemented Webmentions on Eleventy at [my other site called Frontend Weekly Tokyo](https://frontendweekly.tokyo/) so I'm going to do it again on Virga for record keeping sake.

There are numbers of excellent tutorials on setting up webmention on Eleventy and one that I'm following is [Static Indieweb pt2: Using Webmentions](https://mxb.dev/blog/using-webmentions-on-static-sites/) by Max Böck.

He also shares [a basic starter template for Eleventy blogs with added support for webmentions on GitHub](https://github.com/maxboeck/eleventy-webmentions).

I'll base this template to add support for webmention on Virga.

## Webmention.io to Declare an Endpoint to Accept Webmentions

> Webmention.io is a hosted service created to easily receive webmentions on any web page.
> — Aaron Parecki. [Webmention.io](https://webmention.io/)

In order to receive webmentions, I need to declare an endpoint to accept them.
I could host this on my server, but for Eleventy(in the case of static sites), I need a third-party service for this.
Which is what [webmention.io](https://webmention.io/) is.

### Sign in with webmention.io

Webmention.io is a free service and using [IndieAuth](https://indieauth.com/) for signing in.
If you are using Virga and your `src/site.json` has

```json
"author": {
  "name": "Yuya Saito",
  "mail": "hello@studiomohawk.com"
}
```

this field filled then you can go ahead enter your URL at [Webmention.io](https://webmention.io/).

```html
<!-- 
src/_includes/partials/global/meta-info.njk
will have this if you've filled author.mail in src/site.json
-->
{% raw %}<link rel="me" href="mailto:{{ site.author.mail }}" />{% endraw %}
```

You can sign in with GitHub or Twitter as well.

```html
<link rel="me" href="https://yourgithub.github.com" />
<link rel="me" href="https://twitter/yourtwitteracount" />
```

You'll have to fill your website URL in the services you choose to use for signing in for Webmention.io.

If you have multiple websites like me, I would suggest to use Email to sign in.

### Accepting Webmentions

After successful sign in, Webmention.io will navigate you `https://webmention.io/settings`.

In order to accept Webmentions, you need to add:

```html
<link rel="webmention" href="https://webmention.io/yoursite.domain/webmention" />
<link rel="pingback" href="https://webmention.io/yoursite.domain/xmlrpc" />
```

which you can copy & paste into `<head>`.

If you are using Virga, you need to fill the key for `webmention` field at your `src/site.json` like below:

```
"webmention": "virga.frontendweekly.tokyo"
```

The key has to be your URL without `https://` bit.

You might want to copy the API Key at `https://webmention.io/settings` since you're gonna need one soon after.
(Don't worry you can always go back there.)

### Fetching Webmentions

I have rediscover the power of Eleventy when I implementing this using the starter template by Max Böck.

You can use JavaScript at `src/_date` to fetch data and the object it obtains will be available to all templates.

Max Böck has utilize this to fetch webmentions data from Webmention.io API.
His [example code is here](https://github.com/maxboeck/eleventy-webmentions/blob/master/_data/webmentions.js).

My favorite bit from his code is here:

```js
module.exports = async function () {
  const cache = readFromCache();
  const {lastFetched} = cache;

  // Only fetch new mentions in production
  if (process.env.ELEVENTY_ENV === 'production' || !lastFetched) {
    const feed = await fetchWebmentions(lastFetched);

    if (feed) {
      const webmentions = {
        lastFetched: new Date().toISOString(),
        children: mergeWebmentions(cache, feed),
      };

      writeToCache(webmentions);
      return webmentions;
    }
  }

  console.log(`${cache.children.length} webmentions loaded from cache`);
  return cache;
};
```

Fetching webmentions occurs only in production.

According to my Eleventy log, running this JavaScript costs 924ms last time I run which is a lot when you're in development therefore this code ensures to use cache when in development.

Note to those who "just" copied the code(who is me), data will be empty UNTIL you build it in production mode.

Even after I've build Eleventy in production, I have no webmentions on this blog which makes it very hard to continue writing this tutorial since I have you write about how I display webmentions.

I'll write the other part of this tutorial when I have webmentions so those who are impatient(I won't judge you), you should continue with [Max Böck's tutorial](https://github.com/maxboeck/eleventy-webmentions).
