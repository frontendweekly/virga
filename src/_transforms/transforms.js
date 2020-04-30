const htmlmin = require('html-minifier');
const parse = require('./parse-transform');

module.exports = {
  htmlmin: (value, outputPath) => {
    if (outputPath.indexOf('.html') > -1) {
      return htmlmin.minify(value, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
        minifyCSS: false,
      });
    }

    return value;
  },
  parse: parse,
};
