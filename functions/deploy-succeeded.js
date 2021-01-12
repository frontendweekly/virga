const fetch = require('node-fetch');
const Twitter = require('twitter-lite');
require('dotenv-flow').config({
  default_node_env: 'development',
});

// Helper functions
/// Helper Function to return unknown errors
const handleError = (err) => {
  console.error(err);
  const msg = Array.isArray(err) ? err[0].message : err.message;
  return {
    statusCode: 422,
    body: String(msg),
  };
};

/// Helper Function to return function status
const status = (code, msg) => {
  console.log(msg);
  return {
    statusCode: code,
    body: msg,
  };
};

// Configure Twitter API Client
const twitter = new Twitter({
  subdomain: 'api',
  version: '1.1',
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

// Fetch JSON Feed
const fetchFeed = async () => {
  /// URL of site JSON feed
  const FEED_URL = 'https://virga.frontendweekly.tokyo/feed.json';
  const response = await fetch(FEED_URL);
  return response.json();
};

// Gateway
const gateway = async (feed) => {
  if (!feed.items.length) {
    return status(404, 'No posts found to process.');
  }

  // assume the last post is not yet syndicated
  const latestPost = feed.items[0];

  const isLessThan7DaysOld = (compare) => {
    return (
      Math.ceil((new Date() - new Date(compare)) / 1000 / 60 / 60 / 24) >= -7
    );
  };

  const doesSearchReturnZero = async (query) => {
    try {
      // check twitter for any tweets containing post URL.
      // if there are none, publish it.
      const q = await twitter.get('search/tweets', {q: query});
      if (q.statuses && q.statuses.length === 0) {
        return true;
      } else {
        return status(
          400,
          'Latest post was already syndicated. No action taken.'
        );
      }
    } catch (err) {
      return handleError(err);
    }
  };

  if (!isLessThan7DaysOld(latestPost.date_published) >= 7) {
    return status(
      400,
      'Latest post is 7 days old, assuming already syndicated. No action taken.'
    );
  }

  if (await doesSearchReturnZero(latestPost.url)) {
    return {
      status: latestPost.title,
      url: latestPost.url,
      siteName: feed.title,
    };
  }
};

// Create a text for a tweet. Remember there is 280 characters limit on Twitter
const prepareStatusText = (ingredient = {}) => {
  // A tweet will be
  // `${status} via ${siteName}: {$url}`
  // I'm assuming URL won't exceed 40 characters.
  const tweetMaxLength = 240;
  const statusLength = String(ingredient.status).length;
  const siteNameLength = String(ingredient.siteName).length;
  const spacesAndPunctuation = 7;
  const maxLength =
    tweetMaxLength - statusLength - siteNameLength - spacesAndPunctuation;

  let tweetText = `${ingredient.status}`;

  // truncate text if its too long for a tweet.
  if (tweetText.length > maxLength - siteNameLength - spacesAndPunctuation) {
    tweetText =
      tweetText.substring(
        0,
        maxLength - siteNameLength - spacesAndPunctuation
      ) + '...';
  }

  // append the other part;
  tweetText += ` via ${ingredient.siteName}: ${ingredient.url}`;

  return tweetText;
};

// Push a new post to Twitter
const publishPost = async (statusText) => {
  try {
    const tweet = await twitter.post('statuses/update', {
      status: statusText,
    });
    if (tweet) {
      return status(
        200,
        `Post "${statusText}" successfully posted to Twitter.`
      );
    } else {
      return status(422, 'Error posting to Twitter API.');
    }
  } catch (err) {
    return handleError(err);
  }
};

// Lambda Function Handler
exports.handler = async () => {
  return fetchFeed.then(gateway).then(prepareStatusText).then(publishPost);
};
