const {join} = require('path');

/** Regular Expression that matches all images inside of a HTML page. */
const imageRegex = /<img src="(.*)" alt="(.*)">/g;

/**
 * Method that inlines the images inside of a compiled markdown file.
 */
module.exports = (htmlContent, guideDirectory, bucketName) => {
  return htmlContent.replace(imageRegex, (match, url, title) => {
    if (!url.startsWith('http')) {
      const imagePath = join(guideDirectory, url);
      return `<img src="http://storage.googleapis.com/${bucketName}/${imagePath}" alt="${title}">`;
    } else {
      return `<img src="${url}" alt="${title}">`;
    }
  });
};
