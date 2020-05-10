---
title: Setting Up Webmention on Eleventy
desc: 'This is a story about setting up Webmention on Eleventy'
date: 2020-05-03T03:49:56.029Z
author: Yuya Saito
tags:
  - eleventy
  - webmention
---

## When you own your contents, then who owns reactions for them?

ACT I: Meet the Hero — their world, what they want, what they fear.{explanation}

[Frontend Weekly Tokyo](https://frontendweekly.tokyo/) was used to be on Medium, but it has gone a bit rogue in my opinion. Eleventy and Netlify allow me to own my contents with ease, so I've decided to give them a try.

Owning contents is the very foundation of IndieWeb. I wanted to expand my boundary a bit further.
"You are better connected" is one of three principles of IndieWeb which includes this statement:

> Even replies and likes on other services can come back to your site so they’re all in one place.
> — IndieWeb. [What is the IndieWeb?](https://indieweb.org/), (2020, Apr 13)

### Webmention is a Web standard to help me to connect

Inciting Incident: Your Hero's worst fears realized.{explanation}

So to answer the question, I should own reactions to my contents, but how can I do that?

This is what [Webmention](https://www.w3.org/TR/webmention/) tries to solve.

There are numbers of excellent tutorials on setting up Webmention on Eleventy and one I'm going to follow is [Static Indieweb pt2: Using Webmentions](https://mxb.dev/blog/using-webmentions-on-static-sites/) by Max Böck.

He also shares [a basic starter template for Eleventy blogs with added support for webmentions on GitHub](https://github.com/maxboeck/eleventy-webmentions).

I'll use these as my base to start the implementation.

And this is where my journey begins.
This is a story about implementing Webmention in Eleventy.

## Strategy to enable Webmention on Virga

ACT II: The Hero makes a decision about how to resolve the problem created by the Inciting Incident.{explanation}

### Diagnosis

To enable Webmention, I need to do 1) Receive, 2) Transform the data, 3) Display the data on Post pages.

- I want to make it as portable as I can so that I can use this implementation in all of my blogs
- 1\) will involve with making the data available to the next step
- 2\) could be done using filter which can be a plugin
- However, 3) it involves with template so making it as a plugin would be difficult

### Guiding Policy

- Let's not just "copy and paste" Max Böck's implementation. Steal it, modify it and own it
- See if [`eleventy-cache-assets`](https://github.com/11ty/eleventy-cache-assets) can be used to minimize my implementation

### Actions

- 1\) Receive: - Use [webmention.io](https://webmention.io/) as my endpoint - Use `_data/webmention.js` to fetch the data - Try out [`eleventy-cache-assets`](https://github.com/11ty/eleventy-cache-assets)
- 2\) Transform: Create filters - Use [`webmentionsForUrl`](https://github.com/maxboeck/eleventy-webmentions/blob/master/.eleventy.js#L39-L88) as the base
- 3\) Display: Create templates - See [Fat marker sketch](http://localhost:8080/posts/2020-05-03-setting-up-webmentions-on-eleventy/#heading-ui:-fat-marker-sketch)

#### UI: [Fat marker sketch](https://basecamp.com/shapeup/1.3-chapter-04#fat-marker-sketches)

![Webmention sketch](/images/webmention-varga.png 'Fat marker sketch')

### Receiving Webmention

First Reversal: The Hero makes the first major progress in their journey.{explanation}

In order to receive webmentions, I need to declare an endpoint to accept them.
I could host this on my server, but for Eleventy (in the case of static sites), I need a third-party service for this.
Which is where [webmention.io](https://webmention.io/) comes in.

#### Sign in with webmention.io

Webmention.io is a free service and using [IndieAuth](https://indieauth.com/) to sign in.

I could sign it in using Twitter or GitHub, but I will use my e-mail to sign in.

```json
"author": {
  "name": "Yuya Saito",
  "mail": "hello@studiomohawk.com"
}
```

I have this field filled at `_data/site.json` which in result outputs `<link rel="me" href="mailto:{{ author.mail }}">` so I can go ahead enter my URL at [Webmention.io](https://webmention.io/).

#### Accepting Webmentions

After successful sign in, Webmention.io will navigate me to `https://webmention.io/settings` and there is it a snippet to copy & paste. Handy.

```html
<link rel="webmention" href="https://webmention.io/virga.frontendweekly.com/webmention" />
<link rel="pingback" href="https://webmention.io/virga.frontendweekly.com/xmlrpc" />
```

I can copy & paste this into `<head>`.

#### But, will anybody send Webmention?

When I'm writing this I've already finished implementing a part where I fetch webmentions, so I can answer this question.

Answer is no. At least, not for me.
So I need another tool. [Bridgy](https://brid.gy/).

> Bridgy is another free service that can monitor your Twitter, Facebook or Instagram activity and send a webmention for every like, reply or repost you receive.
> — Max Böck. [Static Indieweb pt2: Using Webmentions](https://mxb.dev/blog/using-webmentions-on-static-sites/), (2019, Jan 10)

I went to Bridgy and connected with my Twitter account.
I have THREE(!) webmentions (which are not mine) on virga.frontendweekly.tokyo.
Well, three is better than zero.

Because you see, this story about implementing Webmentions on Eleventy is actually the second try for me.
What happened to the first one?
I DIDN'T have any webmentions on Virga, so I couldn't go further.

Having a not so popular blog which tries to tell a story about Webmention turned out to be a challenge, I must say.

#### Fetching Webmentions

I have rediscovered the power of Eleventy when I look at the starter template by Max Böck.

I can use JavaScript at `src/_data` to fetch data, and the object will be available to all templates. I somehow believed that data in `src/_date` have to be JSON, but they just need to return object.

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

- Fetching webmentions occurs only in production.
- Fetched webmentions are cached.
- If there are cached data, it fetches data from `lastFetched`.

This is brilliant, but I wanted to try [`eleventy-cache-assets`](https://github.com/11ty/eleventy-cache-assets) for more versatility.

#### Swap the cache implementation with [`eleventy-cache-assets`](https://github.com/11ty/eleventy-cache-assets)

Zach Leatherman has shared [`eleventy-cache-assets`](https://github.com/11ty/eleventy-cache-assets) a couple weeks ago.

I can use this to remove `writeToCache()` and `readFromCache()` functions from Max Böck's original.

```js
// url is API endpoint
const response = await CacheAsset(url, {
  duration: '1d',
  type: 'json',
});
```

This means cache this request to `url` for 1 day and save it as json.
I could still use `process.env.ELEVENTY_ENV === 'production'` to prevent running in PROD, but this will be cached for 1 day, so I don't think I need to worry about performance anymore.

I wish there is a way to `read` the cache data, or maybe there already is.

## Transform the data

Midpoint: The point of no return. Something big and unexpected happens, and now there's no going back to the Hero's normal life.{c-post\_\_explanation}

Now I need transform this fetched data to be UI ready.

```json
{
  "type": "entry",
  "author": {
    "type": "card",
    "name": "Yuya Saito",
    "photo": "https://webmention.io/avatar/pbs.twimg.com/b80465a02c7f06aa18d2116b0661ca1e7965c7b81f79d6ec217db070ae6dc5ae.png",
    "url": "https://twitter.com/cssradar"
  },
  "url": "https://twitter.com/cssradar/status/1256682246607474688",
  "published": "2020-05-02T20:29:30+00:00",
  "wm-received": "2020-05-02T20:59:36Z",
  "wm-id": 790847,
  "wm-source": "https://brid-gy.appspot.com/repost/twitter/frontend_weekly/1256607056313888770/1256682246607474688",
  "wm-target": "https://virga.frontendweekly.tokyo/posts/2020-04-30-creating-plugins-for-eleventy/",
  "content": {
    "text": "Virga: Creating Plugins for Eleventy virga.frontendweekly.tokyo/posts/2020-04-…"
  },
  "repost-of": "https://virga.frontendweekly.tokyo/posts/2020-04-30-creating-plugins-for-eleventy/",
  "wm-property": "repost-of",
  "wm-private": false
}
```

This is one of the Webmentions I received. (Well, I send this one.)
Let's look at `wm-property` field since this piece of data will define how to display the data.

According to webmention.io's README, there are 6 properties:

- in-reply-to
- like-of
- repost-of
- bookmark-of
- mention-of
- rsvp

I don't know what `rsvp` is, and I'll ignore that and `bookmark-of` for now.
In the world of Twitter, `repost-of` is Retweet, and I can tell others by its name.

Before I start transforming the data, I need to know how I would transform them so here there are:

IF `wm-property` === `repost-of` AND `like-of`, I want something like this:

![repost-of and like-of](/images/repost-like-of-webmention-varga.png 'Fat marker sketch for repost-of and like-of')

ELSE IF `wm-property` === `mention-of` AND `in-reply-to`, I want something like this:

![mention-of and in-reply-to](/images/in-reply-to-mention-of-webmention-varga.png 'Fat marker sketch for mention-of and in-reply-to')

### HTML, CSS and filter

Low Point: The Hero loses all hope, believes all is lost. But out of this darkness comes a plan to win the movie.{explanation}

#### Filter: `webmentionData()`

Webmention.io gives me Webmention data associated with my domain which is fetch by `src/_data/webmentions.js`.
In another word, the data have all the Webmentions for Virga, but my plan is to display Webmentions related to articles.

`webmentionData()` filter does exactly this and is almost same as [Max Böck's](https://github.com/maxboeck/eleventy-webmentions/blob/master/.eleventy.js#L39-L88).

#### HTML(Nunjucks) & CSS

When it comes to build UIs, HTML is the center of my universe. However, I need contents when I design UIs and when I design, I do it using HTML & CSS with a help with fat marker sketches. (I've started to use [Excalidraw](https://excalidraw.com/) for doing this recently.)

I've made the fat marker sketch in strategy phase because it helps me navigate.
`src/_data/webmentions.js` and `webmentionData()` have given me contents I need for design.

Now it's time to do HTML. Don't think about the style yet, but think about structure. I mean, really. Think hard until I could almost start to see HTML when I look at the fat marker sketch.

Structuring means almost same as naming because naming means almost same as finding patterns and patterns "[...] describe[s] the problem and solution to that problem, in such way that you can use this solution a million times over, without ever doing it the same way twice." (Christopher Alexander, Sara Ishikawa and Murray Silverstein, A Pattern Language: Towns, Buildings, Construction. (1977)).

![UI I've ended up with](/images/2020-05-05-fQ4kWrUv@2x.png 'Final UI')

This is the UI what I've ended up with for now.  
I have introduced 3 objects([Media Object](http://www.stubbornella.org/content/2010/06/25/the-media-object-saves-hundreds-of-lines-of-code/), [Sidebar](https://every-layout.dev/layouts/sidebar/) and [Switcher](https://every-layout.dev/layouts/switcher/), which I've ended up not using it) to CSS. I have also learned how to use [macro](https://mozilla.github.io/nunjucks/templating.html#macro).

## Finale

The Hero confronts that obstacle by making a leap of faith that allows them to overcome it.{explanation}

- One of the hardest things in this journey which I've mentioned earlier is I don't have many Webmentions to display 😢.
- All the code to fetch and display Webmention is only on Virga for now, but I want this in all of my blogs, so I'll figure out how to port this to MOLLE.
- I wish there is a way to make a plugin for the template (Second time.) - Could shortcodes grant me this with?
- I've used Three-act structure to guide me write this story. I should have Act Ⅲ but climax of this story is all in UI.

Well, then until next journey.
