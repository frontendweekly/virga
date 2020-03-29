const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const postcssrc = require('postcss-load-config');
const {plugins} = postcssrc.sync();

const fileName = {
  postcss: 'main.pcss',
  css: 'main.css',
};

module.exports = class {
  async data() {
    const rawFilepath = path.join(__dirname, `./${fileName.postcss}`);
    return {
      permalink: `css/${fileName.css}`,
      rawFilepath,
      rawCss: await fs.readFileSync(rawFilepath),
    };
  }

  async render({rawCss, rawFilepath}) {
    return postcss(plugins)
      .process(rawCss, {
        from: rawFilepath,
      })
      .then((result) => result.css);
  }
};
