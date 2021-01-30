const CacheAsset = require('@11ty/eleventy-cache-assets');
const fetch = require('node-fetch');
const site = require('./site.json');

module.exports = async function () {
  const speedifyUrl = 'https://speedify.frontendweekly.tokyo';
  const speedify = await CacheAsset(`${speedifyUrl}/api/urls.json`, {
    duration: '1d',
    type: 'json',
  });
  const urlWithOrigin = speedify[site.url + '/'];
  const hash = urlWithOrigin.hash;

  const response = await fetch(`${speedifyUrl}/api/${hash}.json`);
  const score = await response.json();

  const lighthouse = score.lighthouse;

  return Object.assign(lighthouse, {
    timestamp: score.timestamp,
    performance: parseInt(lighthouse.performance * 100, 10),
    accessibility: parseInt(lighthouse.accessibility * 100, 10),
    bestPractices: parseInt(lighthouse.bestPractices * 100, 10),
    seo: parseInt(lighthouse.seo * 100, 10),
  });
};
