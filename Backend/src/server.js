const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const cors = require("cors");
const { port } = require("../config");
const model = require("./models/llmModel");
const promptTemplate = require("./prompts/promptTemplate");
const { executeRequest } = require("./utils/utils");
const { HumanMessage } = require("@langchain/core/messages"); // Import unique

const app = express();

// Activer CORS pour Angular et Oracle APEX
app.use(cors({
  origin: ['http://localhost:4200', 'https://apex.oracle.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(bodyParser.json());

// Charger les endpoints depuis le fichier JSON
let endpoints;
try {
  const data = fs.readFileSync("endpoints_Cours.json", "utf8");
  endpoints = JSON.parse(data);
} catch (error) {
  console.error("Erreur de chargement du fichier JSON :", error);
  process.exit(1);
}


async function determineUserIntent(userInput) {
  try {
    const prompt = await promptTemplate.format({ 
      endpoints: JSON.stringify(endpoints, null, 2), 
      userInput 
    });
    
    // Utilisation correcte de HumanMessage
    const response = await model.invoke([new HumanMessage(prompt)]);
    
    console.log("Réponse de l'IA :", response.content);
    return JSON.parse(response.content);
  } catch (error) {
    console.error("Erreur d'analyse de l'intention :", error);
    throw error;
  }
}

// Endpoint pour traiter la demande utilisateur
app.post("/ask", async (req, res) => {
  const userInput = req.body.input;
  try {
    const endpointInfo = await determineUserIntent(userInput);
    res.status(200).json({
      response: "Prompt IA généré, veuillez valider ou modifier.",
      endpointInfo: endpointInfo
    });
  } catch (error) {
    res.status(400).json({
      response: `Erreur : ${error.message}`,
      details: error.response ? error.response.data : "Pas de détails"
    });
  }
});

// Nouvelle route /execute : exécute la requête avec l’endpointInfo validé
app.post("/execute", async (req, res) => {
  const endpointInfo = req.body.endpointInfo;
  try {
    let response;
    if (Array.isArray(endpointInfo)) {
      response = await Promise.all(endpointInfo.map(info => executeRequest(info)));
    } else {
      response = await executeRequest(endpointInfo);
    }
    res.status(200).json({
      response: "Requête effectuée avec succès.",
      data: response
    });
  } catch (error) {
    res.status(400).json({
      response: `Erreur : ${error.message}`,
      details: error.response ? error.response.data : "Pas de détails"
    });
  }
});

// Démarrer le serveur Express
app.listen(port, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${port}`);
});
