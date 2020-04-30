const slugify = require('slugify');
const markdownIt = require('markdown-it')({
  html: true,
  breaks: true,
  linkify: true,
  typographer: true,
});

module.exports = {
  dateFilter: (value) => {
    // Stolen from https://stackoverflow.com/a/31615643
    const dateObject = new Date(value);

    const appendSuffix = (n) => {
      const s = ['th', 'st', 'nd', 'rd'];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const dayWithSuffix = appendSuffix(dateObject.getDate());

    return `${dayWithSuffix} ${
      months[dateObject.getMonth()]
    } ${dateObject.getFullYear()}`;
  },
  w3DateFilter: (value) => {
    const dateObject = new Date(value);
    return dateObject.toISOString();
  },
  markdownFilter: (value) => {
    return markdownIt.render(value);
  },
  tagsToSentence: (value = []) => {
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

    return (
      LinkedTags.slice(0, -1).join(', ') + ' and ' + LinkedTags[LinkedTags.length - 1]
    );
  },
  jsonify: (value) => JSON.stringify(value),
};
