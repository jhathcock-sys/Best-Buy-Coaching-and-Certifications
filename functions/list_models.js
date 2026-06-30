const fs = require('fs');
const path = require('path');

async function listModels() {
  let apiKey = '';
  try {
    const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
    const match = envContent.match(/GEMINI_API_KEY=(.*)/);
    if (match) {
      apiKey = match[1].trim();
    }
  } catch(e) {
    console.error("Could not read .env file");
    return;
  }

  if (!apiKey) {
    console.error("API key not found");
    return;
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    
    if (data.models) {
      console.log("=== AVAILABLE MODELS ===");
      data.models.forEach(m => {
        if (m.name.includes('pro') || m.name.includes('gemini')) {
          console.log(`- ${m.name} (Version: ${m.version}, Display: ${m.displayName})`);
          console.log(`  Supported methods: ${m.supportedGenerationMethods.join(', ')}`);
        }
      });
    } else {
      console.log("No models returned or error:", data);
    }
  } catch(e) {
    console.error("Fetch error:", e);
  }
}

listModels();
