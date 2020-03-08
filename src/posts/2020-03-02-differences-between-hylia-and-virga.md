---
title: Differences between Hylia and Virga
date: 2020-03-01
author: Yuya Saito
desc: Virga is based on Hylia but there are some differences you should know
---

## Credit where credit's due.

First of all, Hylia is a great Eleventy starter kit and I've learned a lot about Eleventy from this kit so I thank Andy Bell for creating and sharing Hylia.

## If Hylia were great, why Virga exists?

Easy and short answer is because this is how I learn new stuff.

I've been reading a lot good things about Eleventy but I haven't have chance to get my hand on it.

I had been running this blog(sorta) called ["Frontend Weekly"](https://frontendweekly.tokyo/) for while on Medium but I've wanted to go back hosting it on my own.

So I've decided to get my hand dirty once for all to use Eleventy to host my blog.

Hylia is very easy to learn and it is also easy to extend for my own needs yet I want to change a few thing about it.

## What Virga had done differently from Hylia

While Hylia uses Sass, Virga uses PostCSS.  
I've used Sass in production and I do think it's great companion for writing CSS but relying heavily on Sass make me feel like I've detached from reality of CSS.

I realized that I haven't used new CSS spec like Custom Properties, Custom Media Queries and/or `:matches` pseudo-class because I don't really need to since I've already "using" them in Sass.

So in Virga, I've decided to use PostCSS with [PostCSS Preset Env](https://preset-env.cssdb.org/) alone(well, plus [Autoprefixer](https://autoprefixer.github.io/), [postcss-import](https://github.com/postcss/postcss-import) and [cssnano](https://cssnano.co/)) so I can write CSS.

Other than the choice of preprocesser, Virga and Hylia is almost same.
There are slight differences in directory structure but those are come from personal preference.

Oh, I've dropped few small features from Hylia, too.
The most notable would be use of Netlify CMS.

I'm not sure why you choose Virga over Hylia, to be honest, but if you do, please be aware those differences.

Virga is incomplete and minimum on purpose so that I can extend it faster.

## What's with the name?

As you can probably tell, I'm not native English speaker and I have no idea Virga is meteorological term(well, I've never heard the term in Japanese, which is my native language, either).

Virga comes from a name of backpack by Granite Gear which I own and love. I actually have color scheme set up taken from the bag.
While I've ended up not using the scheme, the name stuck.
