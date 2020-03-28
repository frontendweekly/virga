const {resolve} = require('path');
const fs = require('fs');

const matter = require('gray-matter');
const slugify = require('slugify');
const arg = require('arg');

// Import data files
const {author} = require('../src/_data/site.json');

// Posts location
const POSTS_DIR = resolve(process.env.PWD, 'src/posts');

// Helper Function to return unknown errors
const handleError = (err) => {
  console.error(err);
  process.exit(1);
};

// Helper Function to format date into YYYY-MM-DD
const yyyymmddify = (date) => {
  return date.toISOString().split('T')[0];
};

// Command line Arguments
const args = arg({
  // Types
  '--title': String,
  '--date': String,
  '--author': String,

  // Aliases
  '-t': '--title',
  '-d': '--date',
  '-a': '--author',
});

const config = {
  title: args['--title'],
  date: args['--date'] || new Date(),
  author: args['--author'] || author.name,
};

// Generate FrontMatter
const frontMatter = () => {
  return matter.stringify('', {
    title: config.title,
    date: config.date,
    author: config.author,
  });
};

// Save md to `POST_DIR`
const savePost = () => {
  const filePath = `${POSTS_DIR}/${yyyymmddify(config.date)}-${slugify(config.title, {
    lower: true,
  })}.md`;
  try {
    console.log(`Creating new post: ${filePath}`);
    fs.writeFileSync(filePath, frontMatter(), 'utf-8');
  } catch (err) {
    handleError(err);
  }
};

savePost();
