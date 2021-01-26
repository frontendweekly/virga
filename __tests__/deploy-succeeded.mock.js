const {rest} = require('msw');
const {setupServer} = require('msw/node');

const mockFeed = {
  title: 'Virga',
  items: [
    {
      url: 'https://virga.frontendweekly.tokyo/posts/shareable-configs',
      title: 'Shareable Configs',
      summary:
        'A story about creating shareable configurations for ESLint, stylelint, Jest preset and Browserlist',
      // eslint-disable-next-line sonarjs/no-duplicate-string
      date_published: `${Date.now()}`,
      author: {
        name: 'Yuya Saito',
      },
    },
  ],
};

const server = setupServer(
  rest.get(
    'https://virga.frontendweekly.tokyo/feed.json',
    async (req, res, ctx) => {
      return res(ctx.json(mockFeed));
    }
  ),
  rest.get(
    'https://api.twitter.com/1.1/search/tweets.json',
    async (req, res, ctx) => {
      return res(
        ctx.json({
          statuses: [],
        })
      );
    }
  ),
  rest.post(
    'https://api.twitter.com/1.1/statuses/update.json',
    async (req, res, ctx) => {
      return res(
        ctx.json({
          id: 1347158802844422147,
        })
      );
    }
  )
);

module.exports = {
  mockFeed: mockFeed,
  server: server,
};
