const ocrSpaceApi = require("ocr-space-api");
const isNil = require('lodash/isNil');

const options = {
  apikey: process.env.OCR_API_KEY,
  language: "eng",
  imageFormat: "image/png",
  isOverlayRequired: true
};

if (isNil(options.apikey)) {
  throw new Error('Missing OCR Space API Key');
}

const parseImage = (imageFilePath) => {
  return ocrSpaceApi
    .parseImageFromLocalFile(imageFilePath, options)
    .then(parsedResult => {
      console.log("parsedText: \n", parsedResult.parsedText);
      console.log("ocrParsedResult: \n", parsedResult.ocrParsedResult);
      return parsedResult;
    });
}

module.exports = {
  parseImage
};
