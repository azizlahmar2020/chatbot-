require("dotenv").config();

module.exports = {
  port: process.env.PORT || 3000,
  cohereApiKey: process.env.COHERE_API_KEY,
  baseUrl: "https://apex.oracle.com/pls/apex/naxxum/", };