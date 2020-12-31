const posthtml = require('posthtml');
const posthtmlUrls = require('posthtml-urls');

module.exports = class {
  async data() {
    return {
      permalink: `/feed.json`,
      eleventyExcludeFromCollections: true,
    };
  }

  async prepareContent(content, baseURL) {
    const prep = posthtml().use(
      posthtmlUrls({
        eachURL: function (url) {
          url = url.trim();

          // #anchor in-page
          if (url.indexOf('#') === 0) {
            return url;
          }

          if (url.indexOf('http') === 0) {
            return url;
          }

          return `${baseURL}${url}`;
        },
      })
    );

    const processed = await prep.process(content);
    return processed.html.replace(/\n/g, ' ');
  }

  async render(data) {
    const feed = {};

    feed.version = 'https://jsonfeed.org/version/1';
    feed.user_comment = `This is a blog feed. You can add this to your feed reader using the following URL: ${data.site.url}/feed.json`;
    feed.title = `${data.site.name}`;
    feed.home_page_url = `${data.site.url}`;
    feed.feed_url = `${data.site.url}/feed.json`;
    feed.description = `${data.site.description}`;
    feed.favicon = `${data.site.url}/favicon.ico`;
    feed.author = {
      name: `${data.site.author.name}`,
      url: `${data.site.url}`,
    };

    feed.items = [];

    for (const post of data.collections.posts) {
      const absolutePostUrl = `${data.site.url}${post.filePathStem}`;

      const item = {
        id: absolutePostUrl,
        url: absolutePostUrl,
      };

      item.title = post.data.title;
      item.summary = post.data.desc;
      item.content_html = await this.prepareContent(post.templateContent);
      item.date_published = post.data.date;
      item.author = {
        name: `${post.data.author}`,
      };

      feed.items.push(item);
    }

    return JSON.stringify(feed, null, 2);
  }
};
