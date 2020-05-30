// Stole from https://github.com/maxboeck/mxb/blob/master/_lambda/deploy-succeeded.js

const fetch = require('node-fetch');
const dotenv = require('dotenv');
const Twitter = require('twitter');

dotenv.config();

// URL of site JSON feed
const FEED_URL = 'https://virga.frontendweekly.tokyo/feed.json';

// Configure Twitter API Client
const twitter = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

// Helper Function to return unknown errors
const handleError = (err) => {
  console.error(err);
  const msg = Array.isArray(err) ? err[0].message : err.message;
  return {
    statusCode: 422,
    body: String(msg),
  };
};

// Helper Function to return function status
const status = (code, msg) => {
  console.log(msg);
  return {
    statusCode: code,
    body: msg,
  };
};

// Helper Function to calc date difference between published date and now
const differenceInDays = (publishedDate) =>
  Math.ceil((new Date() - new Date(publishedDate)) / 1000 / 60 / 60 / 24);

// Check existing posts
const processPosts = async (posts) => {
  const siteTitle = posts.title;
  const items = posts.items;

  if (!items.length) {
    return status(404, 'No posts found to process.');
  }

  // assume the last post is not yet syndicated
  const latestPost = items[0];

  // if the latest post is 7 days old, assume post is syndicated
  if (differenceInDays(latestPost.date_published) >= 7) {
    return status(400, 'Latest post was already syndicated. No action taken.');
  }

  try {
    // check twitter for any tweets containing post URL.
    // if there are none, publish it.
    const q = await twitter.get('search/tweets', {q: latestPost.url});
    if (q.statuses && q.statuses.length === 0) {
      return publishPost(siteTitle, latestPost);
    } else {
      return status(400, 'Latest post was already syndicated. No action taken.');
    }
  } catch (err) {
    return handleError(err);
  }
};

// Prepare the content string for tweet format
const prepareStatusText = (siteTitle, post) => {
  // Tweet will be
  // title === {{ post.data.title | truncate(60) | jsonify | safe }}
  // `${title} via ${siteTitle}: {$url}`
  // `${title} via ${siteTitle}: ${$url}`.length MUST be within maxLength
  const tweetMaxLength = 280;
  const urlLength = String(post.url).length;
  const titleLength = String(post.title).length;
  const siteTitleLength = String(siteTitle).length;
  const spaceLength = 2;
  const colon = 1;
  const maxLength =
    tweetMaxLength - titleLength - siteTitleLength - spaceLength - colon - urlLength;

  let tweetText = `${siteTitle}: ${post.title} `;

  // truncate text if its too long for a tweet.
  if (tweetText.length > maxLength) {
    tweetText = tweetText.substring(0, maxLength) + '...';
  }

  // include the post url at the end;
  tweetText += `${post.url}`;

  return tweetText;
};

// Push a new post to Twitter
const publishPost = async (siteTitle, post) => {
  try {
    const statusText = prepareStatusText(siteTitle, post);
    const tweet = await twitter.post('statuses/update', {
      status: statusText,
    });
    if (tweet) {
      return status(200, `Post ${post.title} successfully posted to Twitter.`);
    } else {
      return status(422, 'Error posting to Twitter API.');
    }
  } catch (err) {
    return handleError(err);
  }
};

// Main Lambda Function Handler
exports.handler = async () => {
  // Fetch the list of published posts to work on,
  // then process them to check if an action is necessary
  return fetch(FEED_URL)
    .then((response) => response.json())
    .then(processPosts)
    .catch(handleError);
};
