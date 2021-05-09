const {
  dateToRfc3339,
  convertHtmlToAbsoluteUrls,
} = require('@11ty/eleventy-plugin-rss');

module.exports = class {
  async data() {
    return {
      permalink: `/feed.json`,
      eleventyExcludeFromCollections: true,
    };
  }

  async render(data) {
    // eslint-disable-next-line sonarjs/prefer-object-literal
    const feed = {};

    feed.version = 'https://jsonfeed.org/version/1.1';
    feed.user_comment = `This is a blog feed. You can add this to your feed reader using the following URL: ${data.site.url}/feed.json`;
    feed.title = `${data.site.name}`;
    feed.home_page_url = `${data.site.url}`;
    feed.feed_url = `${data.site.url}/feed.json`;
    feed.description = `${data.site.description}`;
    feed.favicon = `${data.site.url}/favicon.ico`;
    feed.authors = [
      {
        name: `${data.site.author.name}`,
        url: `${data.site.url}`,
      },
    ];

    feed.items = [];

    for (const post of data.collections.posts) {
      const absolutePostUrl = `${data.site.url}${post.url}`;

      const item = {
        id: absolutePostUrl,
        url: absolutePostUrl,
      };

      item.title = post.data.title;
      item.summary = post.data.desc;
      item.content_html = await convertHtmlToAbsoluteUrls(
        post.templateContent,
        absolutePostUrl,
        {closingSingleTag: 'slash'}
      );
      item.date_published = dateToRfc3339(post.data.date);
      item.authors = [
        {
          name: `${post.data.author}`,
        },
      ];

      feed.items.push(item);
    }

    return JSON.stringify(feed, null, 2);
  }
};
