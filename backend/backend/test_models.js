const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const modelsToTest = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-flash-latest',
  'gemini-3.5-flash'
];

async function testModels() {
  for (const modelName of modelsToTest) {
    try {
      console.log(`Testing ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Hello!");
      console.log(`✅ SUCCESS: ${modelName} returned: ${result.response.text()}`);
      break; // Stop at the first working model!
    } catch (e) {
      console.error(`❌ FAILED: ${modelName} - ${e.message}`);
    }
  }
}

testModels();
