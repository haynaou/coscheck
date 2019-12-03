const tesseract = require("node-tesseract-ocr");

const config = {
  lang: "eng",
  oem: 1,
  psm: 3
};

const trimSpace = (str = '') => {
  return (
    str
      // convert breaklines and extra whitespace to single whitespace
      .replace(/  +|[\r\n\x0B\x0C\u0085\u2028\u2029]+/g, " ")
      // remove whitespace at the begining and the end
      .replace(/^\s+|\s+$/g, "")
  );
}

const parseImage = imageFilePath => {
  return tesseract
    .recognize(imageFilePath, config)
    .then(text => trimSpace(text))
    .catch(error => console.log('Error:', error.message));
};

module.exports = {
  parseImage
};