const { PromptTemplate } = require("@langchain/core/prompts");

const promptTemplate = new PromptTemplate({
  template: `Voici une liste d'API REST disponibles sous format JSON :
{endpoints}

L'utilisateur a posé la question suivante : "{userInput}".
Analyse cette demande et identifie le ou les endpoints appropriés en tenant compte des paramètres dans l'URL.
Si plusieurs requêtes sont nécessaires, retourne la réponse sous forme d'un tableau JSON contenant chaque objet endpoint.
Retourne uniquement la réponse au format JSON EXACTEMENT comme indiqué ci-dessous :

Exemple avec une seule requête (GET sans paramètre) :
{{
  "endpoint": "/cours/",
  "method": "GET",
  "params": {{}}
}}

Exemple avec plusieurs requêtes (GET et PUT) :
[
  {{
    "endpoint": "/cours/237",
    "method": "GET",
    "params": {{ "id": "237" }}
  }},
  {{
    "endpoint": "/cours/232",
    "method": "PUT",
    "params": {{ "id": "232", "TITLE": "tiko" }}
  }}
]`,
  inputVariables: ["endpoints", "userInput"],
});

module.exports = promptTemplate;
