const test = require('firebase-functions-test')();
const { generateAIContent } = require('./src/ai.js');
const fs = require('fs');
const path = require('path');

async function runTests() {
  console.log("=== Testing Server-Side Native AI Backend ===");

  let apiKey = '';
  try {
    const envContent = fs.readFileSync(path.join(__dirname, '../.env'), 'utf8');
    const match = envContent.match(/VITE_GEMINI_API_KEY=(.*)/);
    if (match) {
      apiKey = match[1].trim();
    }
  } catch(e) {}

  const mockContext = {
    auth: {
      uid: "test-user-123",
      token: {
        role: "manager"
      }
    }
  };

  try {
    const wrappedGenerateAIContent = test.wrap(generateAIContent);

    console.log("\n--- Testing generateAIContent (schemaType: smart_zoning - SCHEMA-LESS JSON) ---");
    try {
      const result = await wrappedGenerateAIContent({
        prompt: "Return a JSON object matching {'Front': ['John', 'Jane'], 'Back': ['Bob']}. Do not add anything else.",
        isJSON: true,
        schemaType: "smart_zoning",
        apiKey: apiKey
      }, mockContext);
      console.log("Success! Smart Zoning Result:");
      console.dir(result, { depth: null });
    } catch (e) {
      console.log("Error:", e.message);
    }

    console.log("\n--- Testing generateAIContent (schemaType: UNKNOWN - SHOULD FAIL) ---");
    try {
      const failResult = await wrappedGenerateAIContent({
        prompt: "Hello",
        isJSON: true,
        schemaType: "fake_schema",
        apiKey: apiKey
      }, mockContext);
      console.log("Success! (Wait, this should have failed):", failResult);
    } catch (e) {
      console.log("Expected Error Caught:", e.message);
    }

    console.log("\nAll verification tests executed successfully!");
  } catch (error) {
    console.error("Test framework failed:", error);
  } finally {
    test.cleanup();
  }
}

runTests();
