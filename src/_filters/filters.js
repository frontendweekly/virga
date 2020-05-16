const sanitizeHTML = require('sanitize-html');

module.exports = {
  webmentionData: (data, url) => {
    // Extract webmentions by url
    const extractByURL = (item, url) => item['wm-target'] === url;

    // Extract webmentions by wm-property
    const extractByType = (item) => {
      const allowedTypes = ['repost-of', 'like-of', 'mention-of', 'in-reply-to'];
      return allowedTypes.includes(item['wm-property']);
    };

    // UI is expecting author
    const checkRequiredField = (item) => {
      const {author} = item;
      return !!author && !!author.name;
    };

    // published can be null if so assign it with wm-received
    const assignDate = (item) => {
      if (item.published) {
        return item;
      }
      item.published = item['wm-received'];
      return item;
    };

    // HTML is allowed but restricted
    const sanitizeContent = (item) => {
      if (!item.content) {
        return item;
      }
      const {html, text} = item.content;
      const clean = (content) =>
        sanitizeHTML(content, {
          allowedTags: ['b', 'i', 'em', 'strong', 'a'],
          allowedAttributes: {
            a: ['href'],
          },
        });

      item.content.value = html ? clean(html) : clean(text);

      return item;
    };

    return data
      .filter((entry) => extractByURL(entry, url))
      .filter(extractByType)
      .filter(checkRequiredField)
      .map(assignDate)
      .map(sanitizeContent);
  },
  webmentionProperty: (data, allowedTypes = []) => {
    const allowed = (item) => allowedTypes.includes(item['wm-property']);
    return data.filter(allowed);
  },
};
