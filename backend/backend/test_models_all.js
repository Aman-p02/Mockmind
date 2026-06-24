const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const modelsToTest = [
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-1.0-pro',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-flash-latest',
  'gemini-3.5-flash'
];

async function testModels() {
  console.log("Starting model tests...");
  for (const modelName of modelsToTest) {
    try {
      console.log(`Testing ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Hello! Respond with exactly one word: Hi");
      console.log(`✅ SUCCESS: ${modelName} returned: ${result.response.text().trim()}`);
    } catch (e) {
      console.error(`❌ FAILED: ${modelName} - ${e.message}`);
    }
    // Wait 2 seconds between tests to avoid rapid rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

testModels();
