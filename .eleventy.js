// Import plugins
const rssPlugin = require('@11ty/eleventy-plugin-rss');
const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const molle = require('@frontendweekly/molle');
const collectionPost = require('@frontendweekly/collection-posts');
const collectionPostFeed = require('@frontendweekly/collection-postfeed');

// Import data files
const site = require('./11ty/_data/site.json');

module.exports = function (config) {
  // Watch postcss
  config.addWatchTarget('./11ty/_postcss/');

  // Plugins
  config.addPlugin(rssPlugin);
  config.addPlugin(syntaxHighlight);
  config.addPlugin(molle);

  // Passthrough copy
  config.addPassthroughCopy('11ty/images');
  config.addPassthroughCopy('11ty/favicon.*');
  config.addPassthroughCopy('11ty/humans.txt');

  // Layout aliases
  config.addLayoutAlias('home', 'layouts/home.njk');

  // Custom collections
  config.addCollection('posts', (collection) =>
    collectionPost(collection, './11ty/posts/*.md')
  );
  config.addCollection('postFeed', (collection) =>
    collectionPostFeed(collection, './11ty/posts/*.md', site.maxPostsPerPage)
  );

  return {
    dir: {
      input: '11ty',
      output: 'dist',
    },
    templateFormats: ['njk', 'md', '11ty.js'],
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk',
    passthroughFileCopy: true,
  };
};
