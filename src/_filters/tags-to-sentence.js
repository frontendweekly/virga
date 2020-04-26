const slugify = require('slugify');

module.exports = function tagsToSentence(value = []) {
  if (value.length === 0) {
    return;
  }

  // Transform value into <a href="{{value | slug}}">value</a>
  const LinkedTags = value.map((element) => {
    const linkSlug = slugify(element);
    return `<a href="${linkSlug}">${element}</a>`;
  });

  if (LinkedTags.length === 1) {
    return LinkedTags[0];
  }

  return LinkedTags.slice(0, -1).join(', ') + ' and ' + LinkedTags[LinkedTags.length - 1];
};
