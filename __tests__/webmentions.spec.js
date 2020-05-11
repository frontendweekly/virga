const wm = require('../src/_data/webmentions');

const fixture = {
  type: 'feed',
  name: 'Webmentions',
  children: [
    {
      type: 'entry',
      author: {
        type: 'card',
        name: 'Yuya Saito',
        photo:
          'https://webmention.io/avatar/pbs.twimg.com/b80465a02c7f06aa18d2116b0661ca1e7965c7b81f79d6ec217db070ae6dc5ae.png',
        url: 'https://twitter.com/cssradar',
      },
      url: 'https://twitter.com/cssradar/status/1257518673171890176',
      published: '2020-05-05T03:53:09+00:00',
      'wm-received': '2020-05-05T08:22:57Z',
      'wm-id': 792554,
      'wm-source':
        'https://brid-gy.appspot.com/post/twitter/frontend_weekly/1257518673171890176',
      'wm-target':
        'https://virga.frontendweekly.tokyo/posts/2020-04-30-creating-plugins-for-eleventy/',
      content: {
        html:
          'Test Tweet: Webmention `mention-of`\n\n<a href="https://virga.frontendweekly.tokyo/posts/2020-04-30-creating-plugins-for-eleventy/">virga.frontendweekly.tokyo/posts/2020-04-…</a>',
        text:
          'Test Tweet: Webmention `mention-of`\n\nvirga.frontendweekly.tokyo/posts/2020-04-…',
      },
      'mention-of':
        'https://virga.frontendweekly.tokyo/posts/2020-04-30-creating-plugins-for-eleventy/',
      'wm-property': 'mention-of',
      'wm-private': false,
    },
  ],
};

describe('webmentions', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  test('it should be same as fixture', async () => {
    // Arrange
    fetch.mockResponseOnce(JSON.stringify(fixture));
    // Act
    const mentions = await wm();
    // Assert
    expect(mentions).toEqual(expect.objectContaining(fixture.children));
  });
});
