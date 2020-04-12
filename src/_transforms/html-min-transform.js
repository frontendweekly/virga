const htmlmin = require('html-minifier');

module.exports = function htmlMinTransform(value, outputPath) {
  if (outputPath.indexOf('.html') > -1) {
    return htmlmin.minify(value, {
      useShortDoctype: true,
      removeComments: true,
      collapseWhitespace: true,
      minifyCSS: false,
    });
  }
  return value;
};
