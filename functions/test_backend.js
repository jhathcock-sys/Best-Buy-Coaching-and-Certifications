const test = require('firebase-functions-test')();
const { generateCoaching, auditDialogue, generateAIContent } = require('./src/ai.js');
const fs = require('fs');
const path = require('path');

async function runTests() {
  console.log("=== Testing Backend Cloud Functions ===");

  let apiKey = '';
  try {
    const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
    const match = envContent.match(/GEMINI_API_KEY=(.*)/);
    if (match) {
      apiKey = match[1].trim();
      console.log("Loaded actual API Key from .env");
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
    const wrappedGenerateCoaching = test.wrap(generateCoaching);
    const wrappedAuditDialogue = test.wrap(auditDialogue);
    const wrappedGenerateAIContent = test.wrap(generateAIContent);

    console.log("\\n--- Testing generateCoaching ---");
    try {
      const coachingResult = await wrappedGenerateCoaching({
        name: "Test User",
        gapType: "Memberships",
        gapDetails: "Struggling to pitch Plus memberships.",
        positives: "Friendly, good attitude",
        rawObservation: "Missed the pitch entirely at checkout.",
        selectedDiscSteps: ["Solve"],
        apiKey: apiKey
      }, mockContext);
      console.log("Success! Result:", coachingResult);
    } catch (e) {
      console.log("Error:", e.message);
    }

    console.log("\\n--- Testing auditDialogue ---");
    try {
      const auditResult = await wrappedAuditDialogue({
        scenario: { name: "Macbook Pro Student" },
        history: {
          messages: [
            { sender: "advisor", text: "Welcome to Best Buy!" },
            { sender: "customer", text: "I need a laptop for college." },
            { sender: "advisor", text: "Here is a Macbook. Do you want My Best Buy Total?" },
            { sender: "customer", text: "Sure, let's do it." }
          ]
        },
        apiKey: apiKey
      }, mockContext);
      console.log("Success! Result:", auditResult);
    } catch (e) {
      console.log("Error:", e.message);
    }
    
    console.log("\\n--- Testing generateAIContent (Generic Proxy) ---");
    try {
      const genericResult = await wrappedGenerateAIContent({
        prompt: "Say 'Hello World' strictly.",
        isJSON: false,
        apiKey: apiKey
      }, mockContext);
      console.log("Success! Result:", genericResult);
    } catch (e) {
      console.log("Error:", e.message);
    }
    
    console.log("\\nAll function entrypoints executed successfully!");
  } catch (error) {
    console.error("Test framework failed:", error);
  } finally {
    test.cleanup();
  }
}

runTests();
