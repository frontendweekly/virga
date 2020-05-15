const signale = require('signale');
const CacheAsset = require('@11ty/eleventy-cache-assets');
const metadata = require('./site.json');

// Load .env variables with dotenv
require('dotenv').config();

// Configuration Parameters
const API_ORIGIN = 'https://webmention.io/api/mentions.jf2';
const TOKEN = process.env.WEBMENTION_IO_TOKEN;

async function fetchWebmentions() {
  const {webmention} = metadata;

  if (!webmention) {
    // If we dont have a domain name, abort
    signale.fatal(
      'unable to fetch webmentions: no webmention specified in src/_data/site.json.'
    );
    return false;
  }

  if (!TOKEN) {
    // If we dont have a domain access token, abort
    signale.fatal(
      'unable to fetch webmentions: no access token specified in environment.'
    );
    return false;
  }

  const url = `${API_ORIGIN}?domain=${webmention}&token=${TOKEN}&per-page=999&sort-by=published`;

  try {
    const response = await CacheAsset(url, {
      duration: '1d',
      type: 'json',
    });

    signale.info(
      `${response.children.length} webmentions fetched from {API_ORIGIN}?domain=${webmention}}`
    );
    return response;
  } catch (err) {
    signale.fatal(err);
    return null;
  }
}

module.exports = async function () {
  const feed = await fetchWebmentions();
  if (feed) {
    return feed.children;
  } else {
    return {};
  }
};
