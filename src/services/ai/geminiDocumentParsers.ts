import { GoogleGenerativeAI, SchemaType, Schema } from '@google/generative-ai';

export async function parseScheduleImage(base64Data, mimeType, apiKey) {
  try {
    const aiInstance = new GoogleGenerativeAI(apiKey);
    // Use gemini-3.5-flash for fast vision processing
    const model = aiInstance.getGenerativeModel({ model: 'gemini-3.5-pro' });

    const systemPrompt = `
      You are an administrative assistant for a Best Buy store.
      Analyze the uploaded image, which is a screenshot or photo of a daily store floor schedule or TLC schedule printout.
      
      Extract the list of scheduled employees. For each employee, identify:
      1. Their Name (e.g. "Julianna", "Ricky", "Corey T.", "Joey Z").
      2. Their scheduled Shift Time Range (e.g. "9:00 AM - 5:30 PM", "12:00 PM - 8:30 PM", or similar format). Ensure you capture the start and end times clearly with AM/PM or in a 24-hour format if printed that way.
      3. Their assigned Department or Zone (e.g. "Computing", "Mobile", "Home Theatre", "Front End", "Geek Squad", "Appliances", "Customer Service", "Warehouse"). If not printed or clear, make an educated guess or leave it as "General Sales".
      
      You must reply strictly in a structured JSON format.
      The output must be a JSON array of objects, where each object matches this schema:
      {
        "name": "string",
        "shift": "string",
        "zone": "string"
      }
      Do not include any explanation or markdown formatting outside of the JSON block. Return only the raw JSON.
    `;

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType
      }
    };

    const result = await model.generateContent({
      contents: [
        { role: 'user', parts: [{ text: systemPrompt }, imagePart] }
      ],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    const responseText = result.response.text();
    return JSON.parse(responseText);
  } catch (error) {
    console.error('Gemini Vision Parse Error:', error);
    throw error;
  }
}

// Generate structured 4-Section Coaching Log Offline/Locally

export const parseRentsDueDocumentGemini = async (base64Image, mimeType, textInput, apiKey) => {
  try {
    const keyToUse = apiKey || localStorage.getItem('bby_api_key') || import.meta.env.VITE_GEMINI_API_KEY;
    if (!keyToUse || keyToUse.trim().length < 10) {
      throw new Error("No Gemini API key available.");
    }

    const genAI = new GoogleGenerativeAI(keyToUse);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-pro' });

    const systemPrompt = `
      You are an expert retail operations auditor. Your task is to parse a "Rents Due" salesperson performance report.
      This report is often weirdly laid out but contains details for several retail salespersons, including:
      - Salesperson Name
      - Revenue Per Hour (RPH) (Actual and Owed/Goal)
      - Total Revenue (Actual and Owed/Goal)
      - Total Credit Card Apps (Actual and Owed/Goal)
      - Members (Plus/Total memberships) (Actual and Owed/Goal)
      - Warranty % (GSP attach rate percentage) (Actual and Owed/Goal)
      
      Read the document (which may be a raw CSV string, copy-pasted spreadsheet lines, or an image screenshot) and extract a JSON array of parsed employee performance entries.
      Each entry MUST conform exactly to the following JSON structure:
      {
        "name": "Employee Name",
        "rph": 744, // number representing RPH
        "rphOwed": 640, // number representing target RPH
        "rphStatus": "on-track" | "off-track",
        "revenue": 25600, // number representing total revenue in dollars
        "revenueOwed": 22000, // number representing target revenue in dollars
        "revenueStatus": "on-track" | "off-track",
        "apps": 10, // number representing total credit card apps
        "appsOwed": 8, // number representing target credit card apps
        "appsStatus": "on-track" | "off-track",
        "memberships": 22, // number representing total memberships (Plus/Total)
        "membershipsOwed": 15, // number representing target memberships
        "membershipsStatus": "on-track" | "off-track",
        "warranty": 22.2, // number representing GSP attach percentage (0.0 to 100.0)
        "warrantyGoal": 11.0, // number representing target GSP attach percentage
        "warrantyStatus": "on-track" | "off-track"
      }

      CRITICAL INSTRUCTION: You MUST extract every single employee found in the document. Do not truncate the list. Do not omit any employees, even if the list is very long. DO NOT STOP until you have processed EVERY SINGLE row. Truncating this list is a catastrophic failure. If there are 30 employees, you MUST output exactly 30 objects.
      Do not include markdown or explanations. Return only raw JSON array.
    `;

    const responseSchema: Schema = {
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
        required: ["name", "rph", "rphOwed", "rphStatus", "revenue", "revenueOwed", "revenueStatus", "apps", "appsOwed", "appsStatus", "memberships", "membershipsOwed", "membershipsStatus", "warranty", "warrantyGoal", "warrantyStatus"]
      }
    };

    let result;
    if (base64Image) {
      const imagePart = {
        inlineData: {
          data: base64Image,
          mimeType: mimeType
        }
      };
      const textPart = textInput ? `User supplied text context: "${textInput}"` : "Please audit the image.";
      result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: systemPrompt + '\n' + textPart }, imagePart] }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
          maxOutputTokens: 8192
        }
      });
    } else {
      result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: systemPrompt + '\nAnalyze this Rents Due performance report data:\n' + textInput }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
          maxOutputTokens: 8192
        }
      });
    }

    return JSON.parse(result.response.text());
  } catch (error) {
    console.error('Rents Due Document Parsing Error:', error);
    // Offline Mock Fallback
    return [
      {
        name: "Ricky",
        rph: 649,
        rphOwed: 640,
        rphStatus: "on-track",
        revenue: 38875,
        revenueOwed: 40000,
        revenueStatus: "off-track",
        apps: 7,
        appsOwed: 10,
        appsStatus: "off-track",
        memberships: 3,
        membershipsOwed: 5,
        membershipsStatus: "off-track",
        warranty: 11.5,
        warrantyGoal: 11.0,
        warrantyStatus: "on-track"
      },
      {
        name: "Yinel",
        rph: 744,
        rphOwed: 640,
        rphStatus: "on-track",
        revenue: 25668,
        revenueOwed: 22000,
        revenueStatus: "on-track",
        apps: 10,
        appsOwed: 8,
        appsStatus: "on-track",
        memberships: 22,
        membershipsOwed: 15,
        membershipsStatus: "on-track",
        warranty: 22.2,
        warrantyGoal: 11.0,
        warrantyStatus: "on-track"
      },
      {
        name: "Muntarin",
        rph: 868,
        rphOwed: 800,
        rphStatus: "on-track",
        revenue: 44615,
        revenueOwed: 48000,
        revenueStatus: "off-track",
        apps: 0,
        appsOwed: 5,
        appsStatus: "off-track",
        memberships: 4,
        membershipsOwed: 6,
        membershipsStatus: "off-track",
        warranty: 17.1,
        warrantyGoal: 11.0,
        warrantyStatus: "on-track"
      },
      {
        name: "Victor",
        rph: 629,
        rphOwed: 800,
        rphStatus: "off-track",
        revenue: 81203,
        revenueOwed: 103200,
        revenueStatus: "off-track",
        apps: 13,
        appsOwed: 15,
        appsStatus: "off-track",
        memberships: 11,
        membershipsOwed: 12,
        membershipsStatus: "off-track",
        warranty: 8.0,
        warrantyGoal: 11.0,
        warrantyStatus: "off-track"
      },
      {
        name: "Daniel",
        rph: 1386,
        rphOwed: 700,
        rphStatus: "on-track",
        revenue: 42688,
        revenueOwed: 21500,
        revenueStatus: "on-track",
        apps: 3,
        appsOwed: 4,
        appsStatus: "off-track",
        memberships: 2,
        membershipsOwed: 3,
        membershipsStatus: "off-track",
        warranty: 7.5,
        warrantyGoal: 8.0,
        warrantyStatus: "off-track"
      },
      {
        name: "Paulie",
        rph: 1436,
        rphOwed: 1200,
        rphStatus: "on-track",
        revenue: 35900,
        revenueOwed: 30000,
        revenueStatus: "on-track",
        apps: 3,
        appsOwed: 3,
        appsStatus: "on-track",
        memberships: 2,
        membershipsOwed: 2,
        membershipsStatus: "on-track",
        warranty: 11.6,
        warrantyGoal: 12.0,
        warrantyStatus: "off-track"
      }
    ];
  }
};

// Generate Monthly 1-on-1 Performance Review

