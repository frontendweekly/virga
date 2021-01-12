const {mockFeed, server} = require('./deploy-succeeded.mock');
const {advanceTo, clear} = require('jest-date-mock');
const rewire = require('rewire');

const deploySucceeded = rewire('../functions/deploy-succeeded');
const isLessThan7DaysOld = deploySucceeded.__get__('isLessThan7DaysOld');
const doesSearchReturnZero = deploySucceeded.__get__('doesSearchReturnZero');
const prepareStatusText = deploySucceeded.__get__('prepareStatusText');
const publishPost = deploySucceeded.__get__('publishPost');

beforeAll(() => server.listen());

afterAll(() => {
  server.close();
  clear();
});

test('The most recent post is LESS than 7 days old', () => {
  // Arrange
  advanceTo(new Date(2021, 0, 1, 0, 0, 0));
  const now = new Date();

  const moreThan7Days = '2021-01-10T12:15:31.627Z';
  const lessThan7Days = '2021-01-06T12:15:31.627Z';

  // Assert
  expect(isLessThan7DaysOld(now, moreThan7Days)).toBe(false);
  expect(isLessThan7DaysOld(now, lessThan7Days)).toBe(true);
});

test('Twitter Search API returns ZERO result', async () => {
  // Arrange
  const query = 'TEST';
  // Act
  const actual = await doesSearchReturnZero(query);
  // Assert
  expect(actual).toBe(true);
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
  const statusText = `This is a test tweet with in 240 characters limit via Virga: https://virga.frontendweekly.tokyo/test-`;
  const actual = await publishPost(statusText);
  expect(actual).toMatchInlineSnapshot(`
    Object {
      "body": "Post \\"This is a test tweet with in 240 characters limit via Virga: https://virga.frontendweekly.tokyo/test-\\" successfully posted to Twitter.",
      "statusCode": 200,
    }
  `);
});
