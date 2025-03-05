const { ChatCohere } = require("@langchain/cohere");
const { cohereApiKey } = require("../../config.js");

const model = new ChatCohere({
  apiKey: cohereApiKey,
});

module.exports = model;