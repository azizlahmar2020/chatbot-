const axios = require("axios");
const { baseUrl } = require("../../config");

async function executeRequest(endpointInfo) {
  if (Array.isArray(endpointInfo)) {
    // Traiter plusieurs requêtes en parallèle
    const results = await Promise.all(endpointInfo.map(info => executeRequestSingle(info)));
    return results;
  } else {
    return await executeRequestSingle(endpointInfo);
  }
}

async function executeRequestSingle(endpointInfo) {
  const axiosInstance = axios.create({
    timeout: 10000,
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
      "Content-Type": "application/json",
    },
  });

  try {
    let url = `${baseUrl}${endpointInfo.endpoint.replace(/^\/+/, "")}`;
    Object.entries(endpointInfo.params || {}).forEach(([key, value]) => {
      url = url.replace(new RegExp(`{${key}}`, "g"), value);
    });

    console.log("📡 URL appelée :", url);

    let response;

    switch (endpointInfo.method) {
      case "GET":
        response = await axiosInstance.get(url);
        console.log("📦 Réponse de l'API :", response.data);
        return response.data || [];

      case "POST":
        response = await axiosInstance.post(url, endpointInfo.params);
        return response.data;

      case "PUT":
        // 1. Charger les données existantes (GET du cours)
        const existingCourse = await axiosInstance.get(url);
        const existingData = existingCourse.data;

        // 2. Fusionner les données existantes avec les nouvelles
        const updatedData = {
          INSTRUCTOR_ID: '1', // ou à récupérer dynamiquement
          TITLE: endpointInfo.params.TITLE ?? endpointInfo.params.title ?? existingData.TITLE ?? existingData.title,
          PREREQUISITES: endpointInfo.params.PREREQUISITES ?? endpointInfo.params.prerequisites ?? existingData.PREREQUISITES ?? existingData.prerequisites,
CONTENT: endpointInfo.params.CONTENT ?? endpointInfo.params.content ?? existingData.CONTENT ?? existingData.content,
TARGET_AUDIENCE: endpointInfo.params.TARGET_AUDIENCE ?? endpointInfo.params.target_audience ?? existingData.TARGET_AUDIENCE ?? existingData.target_audience,
DESCRIPTION: endpointInfo.params.DESCRIPTION ?? endpointInfo.params.description ?? existingData.DESCRIPTION ?? existingData.description,
TAGS: endpointInfo.params.TAGS ?? endpointInfo.params.tags ?? existingData.TAGS ?? existingData.tags,
PRICE: endpointInfo.params.PRICE ?? endpointInfo.params.price ?? existingData.PRICE ?? existingData.price,
RATING: endpointInfo.params.RATING ?? endpointInfo.params.rating ?? existingData.RATING ?? existingData.rating,
STATUS: endpointInfo.params.STATUS ?? endpointInfo.params.status ?? existingData.STATUS ?? existingData.status,

        };

        // 3. Envoyer la requête PUT avec les données fusionnées
        response = await axiosInstance.put(url, updatedData);
        return response.data;

      case "DELETE":
        return fetch(url, { method: 'DELETE' });

      default:
        throw new Error(`Méthode HTTP non supportée : ${endpointInfo.method}`);
    }
  } catch (error) {
    console.error("❌ Erreur API :", error.response ? error.response.data : error.message);
    throw error;
  }
}


module.exports = { executeRequest };
