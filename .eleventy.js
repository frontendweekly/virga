// Import plugins
const rssPlugin = require('@11ty/eleventy-plugin-rss');
const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');

// Import filters
const dateFilter = require('./src/_filters/date-filter.js');
const markdownFilter = require('./src/_filters/markdown-filter.js');
const w3DateFilter = require('./src/_filters/w3-date-filter.js');

// Import transforms
const htmlMinTransform = require('./src/_transforms/html-min-transform.js');
const parseTransform = require('./src/_transforms/parse-transform.js');

// Markdown Setting
const markdownIt = require('markdown-it');
const markdownItClassy = require('markdown-it-classy');
const markdownItFootnote = require('markdown-it-footnote');
const markdownItDeflist = require('markdown-it-deflist');
const markdownItAttribution = require('markdown-it-attribution');

// Import data files
const site = require('./src/_data/site.json');

module.exports = function(config) {
  // Watch postcss
  config.addWatchTarget('./src/_postcss/');

  // Plugins
  config.addPlugin(rssPlugin);
  config.addPlugin(syntaxHighlight);

  // Filters
  config.addFilter('dateFilter', dateFilter);
  config.addFilter('markdownFilter', markdownFilter);
  config.addFilter('w3DateFilter', w3DateFilter);
  config.addFilter('jsonify', value => JSON.stringify(value));

  // Transforms
  config.addTransform('htmlmin', htmlMinTransform);
  config.addTransform('parse', parseTransform);

  // Load markdown-it plugins
  config.setLibrary(
    'md',
    markdownIt({
      html: true,
      breaks: true,
      linkify: true
    })
      .use(markdownItClassy)
      .use(markdownItFootnote)
      .use(markdownItDeflist)
      .use(markdownItAttribution, {
        removeMarker: false
      })
  );

  // Passthrough copy
  config.addPassthroughCopy('src/images');
  config.addPassthroughCopy('src/favicon.*');
  config.addPassthroughCopy('src/humans.txt');
  config.addPassthroughCopy('src/fonts');
  config.addPassthroughCopy('src/scripts');

  // Layout aliases
  config.addLayoutAlias('home', 'layouts/home.njk');

  // Custom collections
  const now = new Date();
  const livePosts = post => post.date <= now && !post.data.draft;
  config.addCollection('posts', collection => {
    return [
      ...collection.getFilteredByGlob('./src/posts/*.md').filter(livePosts)
    ].reverse();
  });

  config.addCollection('postFeed', collection => {
    return [...collection.getFilteredByGlob('./src/posts/*.md').filter(livePosts)]
      .reverse()
      .slice(0, site.maxPostsPerPage);
  });

  return {
    dir: {
      input: 'src',
      output: 'dist'
    },
    markdownTemplateEngine: 'njk',
    passthroughFileCopy: true
  };
};
