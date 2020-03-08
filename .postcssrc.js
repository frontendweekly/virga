module.exports = ctx => ({
  map: ctx.env === 'development' ? ctx.map : false,
  plugins: {
    'postcss-import': {},
    'postcss-preset-env': {
      stage: 1
    },
    autoprefixer: {},
    cssnano: ctx.env === 'production' ? {} : false
  }
});
