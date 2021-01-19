const {mockFeed, server} = require('./deploy-succeeded.mock');
const {advanceTo, clear} = require('jest-date-mock');
const rewire = require('rewire');

const deploySucceeded = rewire('../functions/deploy-succeeded');
const handleError = deploySucceeded.__get__('handleError');
const fetchFeed = deploySucceeded.__get__('fetchFeed');
const differenceInDays = deploySucceeded.__get__('differenceInDays');
const gateway = deploySucceeded.__get__('gateway');
const prepareStatusText = deploySucceeded.__get__('prepareStatusText');
const publishPost = deploySucceeded.__get__('publishPost');

beforeAll(() => server.listen());

afterAll(() => {
  server.close();
});

test('The most recent post is LESS than 7 days old', () => {
  // Arrange
  advanceTo(new Date(2021, 0, 1, 0, 0, 0));
  const now = new Date();
  const lessThan7Days = '2021-01-06T12:15:31.627Z';

  // Act
  const actual = differenceInDays(now, lessThan7Days);

  // Assert
  expect(actual).toBeLessThanOrEqual(7);

  clear();
});

describe('Prepare a status text for a tweet', () => {
  test('Status should NOT be truncated', () => {
    // Arrange
    const ingredient = {
      status: 'This is a test tweet with in 240 characters limit',
      url: 'https://virga.frontendweekly.tokyo/test-',
      siteName: 'Virga',
    };
    // Act
    const actual = prepareStatusText(ingredient);
    // Assert
    const expected =
      'This is a test tweet with in 240 characters limit via Virga: https://virga.frontendweekly.tokyo/test-';
    expect(actual).toEqual(expected);
  });

  test(`Status should be truncated and won't exceed 280 characters limit`, () => {
    // Arrange
    const ingredient = {
      status:
        'This is a test tweet over 240 characters limit. This is a test tweet over 240 characters limit. This is a test tweet over 240 characters limit.',
      url: 'https://virga.frontendweekly.tokyo/test-',
      siteName: 'Virga',
    };
    // Act
    const actual = prepareStatusText(ingredient);
    // Assert
    const expected =
      'This is a test tweet over 240 characters limit. This is a test tweet over... via Virga: https://virga.frontendweekly.tokyo/test-';
    expect(actual).toEqual(expected);
    expect(String(actual).length).toBeLessThanOrEqual(280);
  });
});

test('publishPost works', async () => {
  const ingredient = {
    status:
      'This is a test tweet over 240 characters limit. This is a test tweet over 240 characters limit. This is a test tweet over 240 characters limit.',
    url: 'https://virga.frontendweekly.tokyo/test-',
    siteName: 'Virga',
  };
  const actual = await publishPost(ingredient);
  expect(actual).toMatchInlineSnapshot(`
    Object {
      "body": "Post \\"This is a test tweet over 240 characters limit. This is a test tweet over... via Virga: https://virga.frontendweekly.tokyo/test-\\" successfully posted to Twitter.",
      "statusCode": 200,
    }
  `);
});

test('integration test', async () => {
  advanceTo(new Date(2021, 0, 19, 0, 0, 0));
  const actual = await fetchFeed().then(gateway).catch(handleError);

  expect(actual).toMatchInlineSnapshot(`
    Object {
      "body": "Post \\"Shareable Configs via undefined: https://virga.frontendweekly.tokyo/posts/shareable-configs\\" successfully posted to Twitter.",
      "statusCode": 200,
    }
  `);

  clear();
});
