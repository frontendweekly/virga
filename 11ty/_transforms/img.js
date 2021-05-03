const path = require('path');
const {URL} = require('url');
const {parseHTML} = require('linkedom');
const Image = require('@11ty/eleventy-img');

const shouldTransformHTML = (outputPath) =>
  outputPath && outputPath.endsWith('.html');

const isURL = (str) => {
  try {
    new URL(str);
    return true;
  } catch (e) {
    // invalid url OR local path
    return false;
  }
};

const imgOptions = {
  urlPath: '/images/',
  outputDir: './11ty/images/generated',
  widths: [1500, 750],
  formats: ['avif', 'webp', 'png'],
  dryRun: process.env.NODE_ENV === 'test',
  useCache: process.env.NODE_ENV === 'development',
};

const getImageMeta = (src, width, height) => {
  if (isURL(src)) {
    return Image.statsByDimensionsSync(src, width, height, imgOptions);
  } else {
    return Image.statsSync(
      path.join(process.cwd(), `/11ty/${src}`, imgOptions)
    );
  }
};

const buildPictureElem = (alt, metadata) => {
  const imageAttributes = {
    alt: alt,
    sizes: `(max-width: 768px) 100vw, 768px`,
    loading: `lazy`,
    decoding: `async`,
  };

  const {document} = parseHTML(Image.generateHTML(metadata, imageAttributes));
  return document.querySelector('picture');
};

const buildFigureElem = (document, title, picture) => {
  const figure = document.createElement('figure');
  const figCaption = document.createElement('figcaption');

  figCaption.innerHTML = title;
  figure.appendChild(picture.cloneNode(true));
  figure.appendChild(figCaption);
  picture.replaceWith(figure);
  return figure;
};

module.exports = function (content, outputPath) {
  if (!shouldTransformHTML(outputPath)) {
    return content;
  }

  const {document} = parseHTML(content);
  const articleImages = [...document.querySelectorAll('.c-post img')];

  if (articleImages.length) {
    articleImages.forEach((img) => {
      const src = img.getAttribute('src');
      const alt = img.getAttribute('alt');
      const title = img.getAttribute('title');
      const width = img.getAttribute('width');
      const height = img.getAttribute('height');

      Image(src, imgOptions);

      const metadata = getImageMeta(src, width, height);
      const picture = buildPictureElem(alt, metadata);

      // If an image has a title it means that the user added a caption
      // so replace the image with a figure containing that image and a caption
      if (title) {
        const figure = buildFigureElem(document, title, picture);
        img.replaceWith(figure);
      } else {
        img.replaceWith(picture);
      }
    });
  }

  return document.toString();
};
