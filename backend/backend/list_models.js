const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function main() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  // Actually, we can fetch models using fetch since SDK might not expose ListModels directly
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await res.json();
    const generateContentModels = data.models.filter(m => m.supportedGenerationMethods.includes('generateContent'));
    console.log("Supported Models for generateContent:");
    generateContentModels.forEach(m => console.log(m.name.replace('models/', '')));
  } catch (err) {
    console.error("Error fetching models:", err);
  }
}
main();
