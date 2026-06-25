const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors')({ origin: true });

function getGeminiClient(clientApiKey = null) {
  const apiKey = clientApiKey || process.env.GEMINI_API_KEY || functions.config().gemini?.key;
  if (!apiKey) {
    throw new Error('Gemini API key is not configured in Cloud Functions.');
  }
  return new GoogleGenerativeAI(apiKey);
}

// 1. Generate Coaching Log via Gemini 3.5 Pro
exports.generateCoaching = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
      
      // Security Veto Fix: Validate Firebase ID Token
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Missing Bearer Token' });
      }
      const token = authHeader.split('Bearer ')[1];
      try {
        await admin.auth().verifyIdToken(token);
      } catch (err) {
        return res.status(403).json({ error: 'Forbidden: Invalid Token' });
      }

      const { name, gapType, gapDetails, positives, rawObservation, playbookSettings, selectedDiscSteps, apiKey } = req.body;
      const aiInstance = getGeminiClient(apiKey);
      const model = aiInstance.getGenerativeModel({ model: 'gemini-3.5-pro' });
      
      const stepsText = Array.isArray(selectedDiscSteps) ? selectedDiscSteps.join(', ') : (selectedDiscSteps || 'Solve');
      
      let fewShotTrainingText = '';
      if (playbookSettings?.trainingLogs?.length > 0) {
        fewShotTrainingText = `
          MATCH THESE EXEMPLARY COACHING LOGS EXACTLY:
          ${playbookSettings.trainingLogs.map((log, idx) => `EXEMPLAR LOG #${idx + 1}:\n${log}`).join('\n\n')}
        `;
      }

      const prompt = `
        You are an expert Retail Management Performance Coach...
        Employee Name: ${name || 'Unknown'}
        Focus Area: ${gapType || 'General'}
        Raw Input/Gap Details: ${gapDetails || 'Needs performance coaching'}
        Observed Strengths: ${positives || 'None provided.'}
        Raw Observation: ${rawObservation || 'None provided.'}
        Selected DISC Steps: ${stepsText}
        
        ${fewShotTrainingText}
        ${playbookSettings?.customSystemPrompt ? `ADDITIONAL CUSTOM COACHING GUIDELINES:\n${playbookSettings.customSystemPrompt}` : ''}
        
        Reply strictly in JSON matching:
        { "what": "string", "how": "string", "why": "string", "strengths": "string", "metricGap": "string", "expectation": "string", "validation": "string", "discStep": "Discover" }
      `;

      // QA Veto Fix: Add strict 30s timeout
      const requestOptions = { timeout: 30000 };
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          maxOutputTokens: 2048,
          temperature: 0.3,
          topK: 40,
          topP: 0.8
        }
      }, requestOptions);

      // AI Veto Fix: Safe parsing
      try {
        const data = JSON.parse(result.response.text());
        return res.status(200).json(data);
      } catch (parseError) {
        return res.status(500).json({ error: 'AI returned invalid JSON', raw: result.response.text() });
      }
    } catch (error) {
      console.error('Error generating coaching log:', error);
      return res.status(500).json({ error: error.message });
    }
  });
});

// 2. Audit dialogue and evaluate soft skills via Gemini 3.5 Pro
exports.auditDialogue = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

      // Security Veto Fix
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      try { await admin.auth().verifyIdToken(authHeader.split('Bearer ')[1]); } 
      catch { return res.status(403).json({ error: 'Forbidden' }); }

      const { history, scenario, playbookSettings, apiKey } = req.body;
      
      // QA Veto Fix: Null guards
      const messages = history?.messages || [];
      const dialogueStr = messages.map(m => `${m.sender}: ${m.text}`).join('\n');
      const allowedPhrases = playbookSettings?.allowedPhrases?.join(', ') || 'My Best Buy Total/Plus, GSP';
      const forbiddenPhrases = playbookSettings?.forbiddenPhrases?.join(', ') || 'warranty';

      const aiInstance = getGeminiClient(apiKey);
      const model = aiInstance.getGenerativeModel({ model: 'gemini-3.5-pro' });
      
      const evaluationPrompt = `
        Evaluate sales roleplay transcript (${scenario?.name || 'Unknown Scenario'}).
        Transcript:
        ${dialogueStr}
        Playbook standards: Allowed: ${allowedPhrases}. Prohibited: ${forbiddenPhrases}.
        Reply strictly in JSON containing: overallScore, passed, breakdown, values, growReport.
      `;

      const requestOptions = { timeout: 30000 };
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: evaluationPrompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          maxOutputTokens: 2048,
          temperature: 0.3
        }
      }, requestOptions);

      try {
        const data = JSON.parse(result.response.text());
        return res.status(200).json(data);
      } catch (parseError) {
        return res.status(500).json({ error: 'Invalid JSON', raw: result.response.text() });
      }
    } catch (error) {
      console.error('Error auditing dialogue:', error);
      return res.status(500).json({ error: error.message });
    }
  });
});

// 4. Generic Callable AI generation function
exports.generateAIContent = functions.https.onCall(async (data, context) => {
  // Security Veto Fix: Context Auth
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Endpoint requires authentication.');
  }

  const payload = data.data || data;
  try {
    const { prompt, systemInstruction, modelConfig, isJSON, isVision, base64Image, mimeType, isProMode, apiKey } = payload;
    if (!prompt || prompt.trim() === '') {
      throw new functions.https.HttpsError('invalid-argument', 'Prompt is empty.');
    }
    
    const aiInstance = getGeminiClient(apiKey);
    const modelName = isProMode ? 'gemini-3.5-pro' : 'gemini-3.5-flash';
    const model = aiInstance.getGenerativeModel({ model: modelName });
    
    const generationConfig = { maxOutputTokens: 4096 };
    if (isJSON) generationConfig.responseMimeType = 'application/json';
    if (modelConfig?.responseSchema) generationConfig.responseSchema = modelConfig.responseSchema;
    
    const parts = [];
    if (isVision && base64Image) {
      parts.push({ inlineData: { data: base64Image, mimeType: mimeType || 'image/jpeg' } });
    }
    if (systemInstruction) {
        parts.push({ text: `System Instruction: ${systemInstruction}\n\nUser Input: ${prompt}` });
    } else {
        parts.push({ text: prompt });
    }
    
    const requestOptions = { timeout: 30000 };
    const result = await model.generateContent({
      contents: [{ role: 'user', parts }],
      generationConfig
    }, requestOptions);
    
    return { text: result.response.text() };
  } catch (error) {
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError('internal', error.message);
  }
});

exports.auditStoreFloor = functions.https.onCall(async (data, context) => {
  // Security Veto Fix: Context Auth & RBAC check
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Endpoint requires authentication.');
  }
  
  if (context.auth.token.role !== 'manager') {
    throw new functions.https.HttpsError('permission-denied', 'Only active managers can perform floor audits.');
  }

  try {
    const { base64Image, mimeType, playbookSettings } = data.data || data;
    if (!base64Image) {
      throw new functions.https.HttpsError('invalid-argument', 'Image data is missing.');
    }

    const aiInstance = getGeminiClient(); // Use environment API key
    const model = aiInstance.getGenerativeModel({ model: 'gemini-3.5-flash' });
    
    const prompt = `
      You are a strict but fair Best Buy General Manager conducting a visual floor layout audit.
      Based on the provided image, give me an analysis of the store's visual merchandising, queuing, and layout.
      
      Respond strictly in JSON matching exactly this schema:
      {
        "status": "Green" | "Yellow" | "Red",
        "statusDetails": "A brief summary of the state of the floor.",
        "observations": ["Obs 1", "Obs 2"],
        "actionPlan": ["Action 1", "Action 2", "Action 3"]
      }
      
      Keep your observations and actions concise and retail-focused.
      ${playbookSettings?.customSystemPrompt ? `ADDITIONAL PLAYBOOK RULES:\n${playbookSettings.customSystemPrompt}` : ''}
    `;

    const requestOptions = { timeout: 30000 };
    const result = await model.generateContent({
      contents: [
        { 
          role: 'user', 
          parts: [
            { text: prompt },
            { inlineData: { data: base64Image, mimeType: mimeType || 'image/jpeg' } }
          ] 
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        maxOutputTokens: 1024,
        temperature: 0.2
      }
    }, requestOptions);
    
    const jsonStr = result.response.text();
    try {
      const parsed = JSON.parse(jsonStr);
      return parsed;
    } catch (e) {
      throw new functions.https.HttpsError('internal', 'AI returned invalid JSON');
    }
  } catch (error) {
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError('internal', error.message);
  }
});
