const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors')({ origin: true });

admin.initializeApp();

// Helper to get Gemini client
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY || functions.config().gemini?.key;
  if (!apiKey) {
    throw new Error('Gemini API key is not configured in Cloud Functions. Please set GEMINI_API_KEY.');
  }
  return new GoogleGenerativeAI(apiKey);
}

// 1. Generate Coaching Log via Gemini 3.1 Pro
exports.generateCoaching = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
      }

      const { name, gapType, gapDetails, positives, rawObservation, playbookSettings, selectedDiscSteps } = req.body;
      const aiInstance = getGeminiClient();
      
      // Using gemini-3.5-pro flagship model
      const model = aiInstance.getGenerativeModel({ model: 'gemini-3.5-pro' });
      
      const stepsText = Array.isArray(selectedDiscSteps) ? selectedDiscSteps.join(', ') : (selectedDiscSteps || 'Solve');
      
      let fewShotTrainingText = '';
      if (playbookSettings && playbookSettings.trainingLogs && playbookSettings.trainingLogs.length > 0) {
        fewShotTrainingText = `
          MATCH THESE EXEMPLARY COACHING LOGS EXACTLY:
          Below are actual examples of high-quality coaching logs previously written by this store's leadership. You must replicate their exact tone of voice, formatting structures, depth of explanation, Best Buy terminology (like "human" and "make it easy"), and overall layout:
          
          ${playbookSettings.trainingLogs.map((log, idx) => `EXEMPLAR LOG #${idx + 1}:\n${log}`).join('\n\n')}
        `;
      }

      const prompt = `
        You are an expert Retail Management Performance Coach and administrative assistant specializing in Best Buy's employee development frameworks. Your role is to help a Store Supervisor instantly generate structured, actionable coaching plans for employees based on the store's specific frameworks.
        
        Employee Name: ${name}
        Focus Area (Metric Gap): ${gapType}
        Raw Input/Gap Details: ${gapDetails || 'Needs performance coaching to meet store targets'}
        Observed Strengths: ${positives || 'Highly friendly and connects well with customers.'}
        Raw Observation / Floor Behavior: ${rawObservation || 'None provided.'}
        Selected DISC Steps to Focus On: ${stepsText}
        
        ${fewShotTrainingText}

        ${playbookSettings && playbookSettings.customSystemPrompt ? `ADDITIONAL CUSTOM COACHING GUIDELINES:\n${playbookSettings.customSystemPrompt}` : ''}
        
        ### 1. THE SALES FRAMEWORK (DISC):
        When analyzing the scenario or coaching focus, you must ground your recommendations in the DISC selling process defined below. Pay specific attention to the steps selected by the supervisor (${stepsText}):
        * **Discover**: Asking open-ended questions to gain insight into the customer's needs/solutions, uncovering their current membership status, and early-introducing the Best Buy Credit Card.
        * **Inspire**: Building excitement through physical or experiential product demonstrations (e.g., testing a soundbar, demoing Microsoft 365 features, putting a device directly in the customer’s hands).
        * **Solve**: Building the complete solution. This includes pitching Geek Squad Protection (GSP), applicable services, necessary accessories, and the appropriate My Best Buy membership offerings.
        * **Close**: Securing the business and finalizing the transition to checkout (e.g., "I can ring you out right here," "I'll grab that box for you," or leveraging supply chain by ordering for home delivery/store pickup).
        
        Ground your recommendations and the 'how' scripting directly in these selected steps: ${stepsText}.

        Translate this input into a highly structured coaching plan using the exact framework below:
        
        ### 2. THE OUTPUT STRUCTURE:
        Every coaching plan you generate must map to this exact layout:
        - **what**: 1-2 bullet points explicitly detailing the specific area, tool, pitch, or DISC step the employee needs to focus on during their interactions.
        - **how**: 1-2 bullet points describing the exact, actionable behavior change. You MUST include specific wording, scripting, or phrasing examples the employee should use on the floor.
        - **why**: 1-2 bullet points explaining the business or customer impact, directly tied to a key metric (e.g., Membership Efficiency, BP Efficiency, Paid Member Services, GSP Attachment, or Net Promoter Score).
        - **expectation** (Behavior): 1-2 bullet points summarizing the exact, observable behavior change that marks a successful transition on the sales floor.
        - **validation**: A clear statement detailing when and how the supervisor will actively observe, follow up, and validate that the coached behavior is being utilized.
        
        ### OPERATIONAL RULES:
        1. **Tone**: Direct, professional, floor-ready, and encouraging. Use retail-accurate terminology (e.g., Core, Blue Shirts, Code 1s, Walk out Working).
        2. **Missing Information**: If the supervisor provides a quick, raw note that lacks context for a section (like the Validation timeline), make a logical, high-standard retail assumption, but highlight it (e.g. by adding "[Verify this date/count]") so the supervisor can quickly edit it.
        
        You must reply strictly in a structured JSON format matching this schema:
        {
          "what": "string",
          "how": "string",
          "why": "string",
          "strengths": "string",
          "metricGap": "string",
          "expectation": "string",
          "validation": "string",
          "discStep": "Discover" | "Inspire" | "Solve" | "Close"
        }
      `;

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      });

      const data = JSON.parse(result.response.text());
      return res.status(200).json(data);
    } catch (error) {
      console.error('Error generating coaching log:', error);
      return res.status(500).json({ error: error.message });
    }
  });
});

// 2. Audit dialogue and evaluate soft skills via Gemini 3.1 Pro
exports.auditDialogue = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
      }

      const { history, scenario, playbookSettings } = req.body;
      const aiInstance = getGeminiClient();
      const model = aiInstance.getGenerativeModel({ model: 'gemini-3.5-pro' });

      const dialogueStr = history.messages.map(m => `${m.sender}: ${m.text}`).join('\n');
      
      const evaluationPrompt = `
        You are a Best Buy Sales Evaluator and Coach. Evaluate the following sales roleplay transcript between a Sales Advisor and a Customer (${scenario.name}) focusing heavily on soft skills (empathy, building rapport, active listening).
        
        Transcript:
        ${dialogueStr}
        
        Playbook standards:
        - Allowed Terms: ${playbookSettings.allowedPhrases ? playbookSettings.allowedPhrases.join(', ') : 'My Best Buy Total/Plus, GSP'}
        - Prohibited Terms: ${playbookSettings.forbiddenPhrases ? playbookSettings.forbiddenPhrases.join(', ') : 'warranty'}

        Evaluate on a 0-100 scale for each Best Buy Sales Flow Step:
        - Connect: Greeting, welcoming, building emotional connection/rapport.
        - Discover: Probing questions, understanding the 'why' and context of college.
        - Recommend: Correct product suggestion, mentioning My Best Buy memberships.
        - Protect: Recommending Geek Squad Protection (GSP) or AppleCare.
        - Close: Offering Best Buy Credit Card financing/rewards, and asking for the sale.

        Specifically grade these soft skills:
        - Empathy: Validating concerns, addressing objections with understanding.
        - Active Listening: Recalling details from early dialogue (e.g. referencing the son's college major, or specific PS5 gaming needs).
        - Rapport: Showing genuine care, not being transactional or pushy.

        Evaluate on Best Buy's core values:
        - Be Human
        - Make It Easy
        - Show What's Possible

        Provide the coaching feedback using the GROW framework:
        - Goal: The ideal standard.
        - Reality: What the advisor actually did well or missed.
        - Options: 3 concrete action steps they can take next time.
        - Will: A call to action.

        You must reply strictly in structured JSON matching this schema:
        {
          "overallScore": number (0-100),
          "passed": boolean (overallScore >= 80),
          "breakdown": {
            "connect": number,
            "discover": number,
            "recommend": number,
            "protect": number,
            "close": number
          },
          "values": {
            "beHuman": number,
            "makeItEasy": number,
            "showWhatPossible": number
          },
          "growReport": {
            "goal": "string",
            "reality": "string",
            "options": ["string", "string", "string"],
            "will": "string"
          }
        }
      `;

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: evaluationPrompt }] }],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      });

      const data = JSON.parse(result.response.text());
      return res.status(200).json(data);
    } catch (error) {
      console.error('Error auditing dialogue:', error);
      return res.status(500).json({ error: error.message });
    }
  });
});

// 3. Verify certification claims securely on the backend
exports.verifyCertification = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
      }

      const { score, scenarioId, employeeName } = req.body;
      
      if (typeof score !== 'number' || score < 0 || score > 100) {
        return res.status(400).json({ error: 'Invalid score value' });
      }

      const passed = score >= 80;
      
      // Simple server-side cryptographic tamper-proof validation signature
      const crypto = require('crypto');
      const secret = process.env.GEMINI_API_KEY || 'bbycoaching_secret_fallback';
      const hash = crypto.createHmac('sha256', secret)
                         .update(`${scenarioId}-${score}-${employeeName}-${passed}`)
                         .digest('hex');

      return res.status(200).json({
        verified: passed,
        score,
        scenarioId,
        signature: hash,
        verifiedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error verifying certification:', error);
      return res.status(500).json({ error: error.message });
    }
  });
});

// 4. Generic Callable AI generation function to replace client-side SDK usage
exports.generateAIContent = functions.https.onCall(async (data, context) => {
  try {
    const { prompt, systemInstruction, modelConfig, isJSON, isVision, base64Image, mimeType, isProMode } = data;
    const aiInstance = getGeminiClient();
    
    // Choose model
    const modelName = isProMode ? 'gemini-3.5-pro' : 'gemini-3.5-flash';
    const model = aiInstance.getGenerativeModel({ model: modelName });
    
    const generationConfig = {};
    if (isJSON) {
      generationConfig.responseMimeType = 'application/json';
    }
    if (modelConfig && modelConfig.responseSchema) {
      generationConfig.responseSchema = modelConfig.responseSchema;
    }
    
    const parts = [];
    if (isVision && base64Image) {
      parts.push({
        inlineData: {
          data: base64Image,
          mimeType: mimeType || 'image/jpeg'
        }
      });
    }
    
    // In Gemini API, systemInstruction is usually set during model instantiation, or as a combined prompt.
    // If we have a systemInstruction, we'll append it to the text.
    if (systemInstruction) {
        parts.push({ text: `System Instruction: ${systemInstruction}\n\nUser Input: ${prompt}` });
    } else {
        parts.push({ text: prompt });
    }
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts }],
      generationConfig
    });
    
    return { text: result.response.text() };
  } catch (error) {
    console.error('generateAIContent error:', error);
    // Throw a generic error for the client
    throw new functions.https.HttpsError('internal', error.message || 'An error occurred while generating AI content.');
  }
});

