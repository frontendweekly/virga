const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const postcssrc = require('postcss-load-config');
const {plugins, options} = postcssrc.sync();

const fileName = {
  postcss: 'main.pcss',
  css: 'main.css',
};

module.exports = class {
  async data() {
    const rawFilepath = path.join(__dirname, `./${fileName.postcss}`);
    return {
      permalink: `css/${fileName.css}`,
      eleventyExcludeFromCollections: true,
      rawFilepath,
      rawCss: await fs.readFileSync(rawFilepath),
    };
  }

  async render({rawCss, rawFilepath}) {
    return postcss(plugins)
      .process(rawCss, {
        ...options,
        from: rawFilepath,
      })
      .then((result) => result.css);
  }
};
