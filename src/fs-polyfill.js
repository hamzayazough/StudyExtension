// Import the encoder data from gpt-3-encoder package.
const encoderData = require("gpt-3-encoder/encoder.json");

module.exports = {
  readFileSync: function (file, encoding) {
    if (file.endsWith("encoder.json")) {
      return JSON.stringify(encoderData);
    }
    return "";
  }
};
