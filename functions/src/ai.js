const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');
const cors = require('cors')({ origin: true });

function getSchemaForType(schemaType) {
  switch (schemaType) {
    case 'schedule':
      return {
        type: SchemaType.ARRAY,
        description: "List of scheduled employees",
        items: {
          type: SchemaType.OBJECT,
          properties: {
            name: { type: SchemaType.STRING },
            shift: { type: SchemaType.STRING },
            zone: { type: SchemaType.STRING }
          },
          required: ["name", "shift", "zone"]
        }
      };
    case 'rents_due':
      return {
        type: SchemaType.ARRAY,
        description: "List of parsed salesperson performance entries",
        items: {
          type: SchemaType.OBJECT,
          properties: {
            name: { type: SchemaType.STRING },
            rph: { type: SchemaType.NUMBER },
            rphOwed: { type: SchemaType.NUMBER },
            rphStatus: { type: SchemaType.STRING },
            revenue: { type: SchemaType.NUMBER },
            revenueOwed: { type: SchemaType.NUMBER },
            revenueStatus: { type: SchemaType.STRING },
            apps: { type: SchemaType.NUMBER },
            appsOwed: { type: SchemaType.NUMBER },
            appsStatus: { type: SchemaType.STRING },
            memberships: { type: SchemaType.NUMBER },
            membershipsOwed: { type: SchemaType.NUMBER },
            membershipsStatus: { type: SchemaType.STRING },
            warranty: { type: SchemaType.NUMBER },
            warrantyGoal: { type: SchemaType.NUMBER },
            warrantyStatus: { type: SchemaType.STRING }
          },
          required: ["name"]
        }
      };
    case 'action_plan':
      return {
        type: SchemaType.OBJECT,
        properties: {
          type: { type: SchemaType.STRING },
          status: { type: SchemaType.STRING },
          reason: { type: SchemaType.STRING },
          dateCreated: { type: SchemaType.STRING },
          planText: { type: SchemaType.STRING }
        },
        required: ["type", "status", "reason", "dateCreated", "planText"]
      };
    case 'scenario':
      return {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          name: { type: SchemaType.STRING },
          category: { type: SchemaType.STRING },
          difficulty: { type: SchemaType.STRING },
          greeting: { type: SchemaType.STRING },
          customerNeeds: { type: SchemaType.STRING },
          objections: {
            type: SchemaType.OBJECT,
            properties: {
              memberships: { type: SchemaType.STRING },
              protection: { type: SchemaType.STRING },
              creditCard: { type: SchemaType.STRING }
            },
            required: ["memberships", "protection", "creditCard"]
          },
          keywords: {
            type: SchemaType.OBJECT,
            properties: {
              connect: { type: SchemaType.STRING },
              discover: { type: SchemaType.STRING },
              recommend: { type: SchemaType.STRING },
              protect: { type: SchemaType.STRING }
            },
            required: ["connect", "discover", "recommend", "protect"]
          }
        },
        required: ["title", "name", "category", "difficulty", "greeting", "customerNeeds", "objections", "keywords"]
      };
    case 'audit_floor':
      return {
        type: SchemaType.OBJECT,
        properties: {
          status: { type: SchemaType.STRING },
          statusDetails: { type: SchemaType.STRING },
          observations: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          actionPlan: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
        },
        required: ["status", "statusDetails", "observations", "actionPlan"]
      };
    case 'audit_performance':
      return {
        type: SchemaType.OBJECT,
        properties: {
          overallSummary: { type: SchemaType.STRING },
          topPerformers: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          gapClusters: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                name: { type: SchemaType.STRING },
                employees: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                focusBehavior: { type: SchemaType.STRING },
                coachingTip: { type: SchemaType.STRING }
              },
              required: ["name", "employees", "focusBehavior", "coachingTip"]
            }
          },
          recommendedActionTimeline: { type: SchemaType.STRING }
        },
        required: ["overallSummary", "topPerformers", "gapClusters", "recommendedActionTimeline"]
      };
    case 'audit_nps':
      return {
        type: SchemaType.OBJECT,
        properties: {
          rating: { type: SchemaType.NUMBER },
          comment: { type: SchemaType.STRING },
          associateName: { type: SchemaType.STRING },
          department: { type: SchemaType.STRING },
          rootCause: { type: SchemaType.STRING },
          coachingScript: { type: SchemaType.STRING },
          checkItems: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
        },
        required: ["rating", "comment", "associateName", "department", "rootCause", "coachingScript", "checkItems"]
      };
    case 'floor_simulator':
      return {
        type: SchemaType.OBJECT,
        properties: {
          shiftLogs: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                hour: { type: SchemaType.STRING },
                zone: { type: SchemaType.STRING },
                event: { type: SchemaType.STRING },
                advisorResponse: { type: SchemaType.STRING },
                impact: { type: SchemaType.STRING }
              },
              required: ["hour", "zone", "event", "advisorResponse", "impact"]
            }
          },
          scorecard: {
            type: SchemaType.OBJECT,
            properties: {
              revenue: { type: SchemaType.NUMBER },
              revenueGoal: { type: SchemaType.NUMBER },
              memberships: { type: SchemaType.NUMBER },
              creditCards: { type: SchemaType.NUMBER },
              csat: { type: SchemaType.NUMBER },
              placementScore: { type: SchemaType.NUMBER },
              placementReview: { type: SchemaType.STRING }
            },
            required: ["revenue", "revenueGoal", "memberships", "creditCards", "csat", "placementScore", "placementReview"]
          }
        },
        required: ["shiftLogs", "scorecard"]
      };
    case 'customer_simulator':
      return {
        type: SchemaType.OBJECT,
        properties: {
          responseText: { type: SchemaType.STRING },
          currentActiveStep: { type: SchemaType.STRING },
          completedSteps: {
            type: SchemaType.OBJECT,
            properties: {
              connect: { type: SchemaType.BOOLEAN },
              discover: { type: SchemaType.BOOLEAN },
              recommend: { type: SchemaType.BOOLEAN },
              protect: { type: SchemaType.BOOLEAN },
              close: { type: SchemaType.BOOLEAN }
            },
            required: ["connect", "discover", "recommend", "protect", "close"]
          }
        },
        required: ["responseText", "currentActiveStep", "completedSteps"]
      };
    case 'employee_simulator_response':
      return {
        type: SchemaType.OBJECT,
        properties: {
          responseText: { type: SchemaType.STRING },
          currentCoachStep: { type: SchemaType.STRING },
          completedCoachSteps: {
            type: SchemaType.OBJECT,
            properties: {
              goal: { type: SchemaType.BOOLEAN },
              reality: { type: SchemaType.BOOLEAN },
              options: { type: SchemaType.BOOLEAN },
              will: { type: SchemaType.BOOLEAN }
            },
            required: ["goal", "reality", "options", "will"]
          }
        },
        required: ["responseText", "currentCoachStep", "completedCoachSteps"]
      };
    case 'employee_simulator_evaluation':
      return {
        type: SchemaType.OBJECT,
        properties: {
          score: { type: SchemaType.NUMBER },
          passed: { type: SchemaType.BOOLEAN },
          feedback: { type: SchemaType.STRING },
          details: {
            type: SchemaType.OBJECT,
            properties: {
              empathy: { type: SchemaType.NUMBER },
              structure: { type: SchemaType.NUMBER },
              actionable: { type: SchemaType.NUMBER }
            },
            required: ["empathy", "structure", "actionable"]
          }
        },
        required: ["score", "passed", "feedback", "details"]
      };
    case 'coaching_target':
      return {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            name: { type: SchemaType.STRING },
            reason: { type: SchemaType.STRING },
            recommendedAction: { type: SchemaType.STRING }
          },
          required: ["name", "reason", "recommendedAction"]
        }
      };
    case 'rent_recovery':
      return {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            id: { type: SchemaType.STRING },
            assignee: { type: SchemaType.STRING },
            priority: { type: SchemaType.STRING },
            type: { type: SchemaType.STRING },
            description: { type: SchemaType.STRING },
            status: { type: SchemaType.STRING }
          },
          required: ["id", "assignee", "priority", "type", "description", "status"]
        }
      };
    case 'break_schedule':
      return {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            employee: { type: SchemaType.STRING },
            breakTime: { type: SchemaType.STRING },
            type: { type: SchemaType.STRING },
            coverage: { type: SchemaType.STRING }
          },
          required: ["employee", "breakTime", "type", "coverage"]
        }
      };
    case 'conversational_analytics':
      return {
        type: SchemaType.OBJECT,
        properties: {
          chartType: { type: SchemaType.STRING, description: "The type of chart to display: 'bar', 'metric', or 'line'" },
          title: { type: SchemaType.STRING, description: "A concise, descriptive title for the chart" },
          narrativeSummary: { type: SchemaType.STRING, description: "A short, insightful summary of what the data shows answering the user's question" },
          dataPoints: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                label: { type: SchemaType.STRING, description: "X-axis label or metric name" },
                value: { type: SchemaType.NUMBER, description: "Y-axis value or metric value" },
                colorAccent: { type: SchemaType.STRING, description: "Optional hex color code for this specific data point, e.g. '#2563EB'" }
              },
              required: ["label", "value"]
            }
          },
          format: { type: SchemaType.STRING, description: "How to format the values: 'currency', 'number', or 'percentage'" }
        },
        required: ["chartType", "title", "narrativeSummary", "dataPoints", "format"]
      };
    case 'smart_zoning':
    case 'aura_batch_insights':
    case 'customer_simulation_step':
    case 'employee_coaching_step':
    case 'evaluate_coaching_session':
    case 'store_shift_simulation':
    case 'audit_performance_workbook':
    case 'audit_five_star_survey':
      // Return null to allow flexible JSON objects without strict schemas for complex unstructured maps.
      // (Bypasses the strict throw check below by letting these explicitly exist, but we must update the generationConfig logic to accept null from valid cases)
      return null;
    default:
      return undefined;
  }
}

function getGeminiClient(clientApiKey = null) {
  const apiKey = clientApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key is not configured in Cloud Functions.');
  }
  return new GoogleGenerativeAI(apiKey);
}

// 1. Generate Coaching Log via Gemini 3.5 Pro
exports.generateCoaching = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Endpoint requires authentication.');
    }

    const payload = (data.data || data) || {};
    const { name, gapType, gapDetails, positives, rawObservation, playbookSettings, selectedDiscSteps, apiKey } = payload;
    const aiInstance = getGeminiClient(apiKey);
    const model = aiInstance.getGenerativeModel({ model: 'gemini-pro-latest' });
    
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

    const requestOptions = { timeout: 58000 };
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            what: { type: 'STRING' },
            how: { type: 'STRING' },
            why: { type: 'STRING' },
            strengths: { type: 'STRING' },
            metricGap: { type: 'STRING' },
            expectation: { type: 'STRING' },
            validation: { type: 'STRING' },
            discStep: { type: 'STRING' }
          },
          required: ["what", "how", "why", "strengths", "metricGap", "expectation", "validation", "discStep"]
        },
        maxOutputTokens: 8192,
        temperature: 0.3,
        topK: 40,
        topP: 0.8
      }
    }, requestOptions);

    let jsonStr = '';
    try {
      jsonStr = result.response.text();
    } catch (safetyError) {
      throw new functions.https.HttpsError('internal', 'Safety block or empty response.');
    }

    try {
      return JSON.parse(jsonStr);
    } catch (parseError) {
      throw new functions.https.HttpsError('internal', 'AI returned invalid JSON: ' + jsonStr);
    }
  } catch (error) {
    console.error('Error generating coaching log:', error);
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// 2. Audit dialogue and evaluate soft skills via Gemini 3.5 Pro
exports.auditDialogue = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Endpoint requires authentication.');
    }

    const payload = (data.data || data) || {};
    const { history, scenario, playbookSettings, apiKey } = payload;
    
    const messages = history?.messages || [];
    const dialogueStr = messages.map(m => `${m.sender}: ${m.text}`).join('\n');
    const allowedPhrases = playbookSettings?.allowedPhrases?.join(', ') || 'My Best Buy Total/Plus, GSP';
    const forbiddenPhrases = playbookSettings?.forbiddenPhrases?.join(', ') || 'warranty';

    const aiInstance = getGeminiClient(apiKey);
    const model = aiInstance.getGenerativeModel({ model: 'gemini-pro-latest' });
    
    const evaluationPrompt = `
      Evaluate sales roleplay transcript (${scenario?.name || 'Unknown Scenario'}).
      Transcript:
      ${dialogueStr}
      Playbook standards: Allowed: ${allowedPhrases}. Prohibited: ${forbiddenPhrases}.
      Reply strictly in JSON containing: overallScore, passed, breakdown, values, growReport.
    `;

    const requestOptions = { timeout: 58000 };
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: evaluationPrompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            overallScore: { type: 'NUMBER' },
            passed: { type: 'BOOLEAN' },
            breakdown: { type: 'STRING' },
            values: { type: 'STRING' },
            growReport: { type: 'STRING' }
          },
          required: ["overallScore", "passed", "breakdown", "values", "growReport"]
        },
        maxOutputTokens: 8192,
        temperature: 0.3
      }
    }, requestOptions);

    let jsonStr = '';
    try {
      jsonStr = result.response.text();
    } catch (safetyError) {
      throw new functions.https.HttpsError('internal', 'Safety block or empty response.');
    }

    try {
      return JSON.parse(jsonStr);
    } catch (parseError) {
      throw new functions.https.HttpsError('internal', 'Invalid JSON: ' + jsonStr);
    }
  } catch (error) {
    console.error('Error auditing dialogue:', error);
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// 4. Generic Callable AI generation function
exports.generateAIContent = functions.https.onCall(async (data, context) => {
  // Security Veto Fix: Context Auth
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Endpoint requires authentication.');
  }

  const payload = (data.data || data) || {};
  try {
    const { prompt, systemInstruction, modelConfig, isJSON, isVision, base64Image, mimeType, isProMode, apiKey, schemaType } = payload;
    if (!prompt || prompt.trim() === '') {
      throw new functions.https.HttpsError('invalid-argument', 'Prompt is empty.');
    }
    
    const aiInstance = getGeminiClient(apiKey);
    const modelName = isProMode ? 'gemini-pro-latest' : 'gemini-3.5-flash';
    
    const modelOptions = { model: modelName };
    if (systemInstruction) {
      modelOptions.systemInstruction = systemInstruction;
    }
    const model = aiInstance.getGenerativeModel(modelOptions);
    
    const generationConfig = { maxOutputTokens: 8192 };
    
    if (modelConfig) {
      if (modelConfig.temperature !== undefined) generationConfig.temperature = modelConfig.temperature;
      if (modelConfig.topK !== undefined) generationConfig.topK = modelConfig.topK;
      if (modelConfig.topP !== undefined) generationConfig.topP = modelConfig.topP;
      if (modelConfig.maxOutputTokens !== undefined) generationConfig.maxOutputTokens = modelConfig.maxOutputTokens;
    }

    if (isJSON) {
      generationConfig.responseMimeType = 'application/json';
      let schema = undefined;
      if (schemaType) {
        schema = getSchemaForType(schemaType);
      }
      if (schema === undefined && modelConfig?.responseSchema) {
        schema = modelConfig.responseSchema;
      }
      
      if (schema !== undefined) {
        if (schema !== null) {
          generationConfig.responseSchema = schema;
        }
        // If schema is strictly null, it is an explicitly allowed schema-less JSON generation.
      } else {
        throw new functions.https.HttpsError('invalid-argument', 'JSON generation requires a valid schemaType or modelConfig.responseSchema.');
      }
    }
    
    const parts = [];
    if (isVision && base64Image) {
      parts.push({ inlineData: { data: base64Image, mimeType: mimeType || 'image/jpeg' } });
    }
    parts.push({ text: prompt });
    
    const requestOptions = { timeout: 58000 };
    const result = await model.generateContent({
      contents: [{ role: 'user', parts }],
      generationConfig
    }, requestOptions);
    
    return { text: result.response.text() };
  } catch (error) {
    if (error.status === 429 || (error.message && error.message.includes('429'))) {
      throw new functions.https.HttpsError('resource-exhausted', error.message);
    }
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
    const { base64Image, mimeType, playbookSettings } = (data.data || data) || {};
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

    const requestOptions = { timeout: 58000 };
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
        responseSchema: {
          type: 'OBJECT',
          properties: {
            status: { type: 'STRING' },
            statusDetails: { type: 'STRING' },
            observations: { type: 'ARRAY', items: { type: 'STRING' } },
            actionPlan: { type: 'ARRAY', items: { type: 'STRING' } }
          },
          required: ["status", "statusDetails", "observations", "actionPlan"]
        },
        maxOutputTokens: 8192,
        temperature: 0.2
      }
    }, requestOptions);
    
    let jsonStr = '';
    try {
      jsonStr = result.response.text();
    } catch (e) {
      throw new functions.https.HttpsError('internal', 'Safety violation or empty response from AI.');
    }
    
    try {
      const parsed = JSON.parse(jsonStr);
      return parsed;
    } catch (e) {
      throw new functions.https.HttpsError('internal', 'AI returned invalid JSON: ' + jsonStr);
    }
  } catch (error) {
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError('internal', error.message);
  }
});
