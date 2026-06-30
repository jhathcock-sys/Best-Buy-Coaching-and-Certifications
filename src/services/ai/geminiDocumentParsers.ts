import { callFirebaseAI } from './core';
import DOMPurify from 'dompurify';

export async function parseScheduleImage(base64Data: string, mimeType: string, apiKey: string | undefined) {
  try {
    const systemPrompt = `
      You are an administrative assistant for a Best Buy store.
      Analyze the uploaded image, which is a screenshot or photo of a daily store floor schedule or TLC schedule printout.
      
      Extract the list of scheduled employees. For each employee, identify:
      1. Their Name (e.g. "Julianna", "Ricky", "Corey T.", "Joey Z").
      2. Their scheduled Shift Time Range (e.g. "9:00 AM - 5:30 PM", "12:00 PM - 8:30 PM", or similar format). Ensure you capture the start and end times clearly with AM/PM or in a 24-hour format if printed that way.
      3. Their assigned Department or Zone (e.g. "Computing", "Mobile", "Home Theatre", "Front End", "Geek Squad", "Appliances", "Customer Service", "Warehouse"). If not printed or clear, make an educated guess or leave it as "General Sales".
    `;

    const result = await callFirebaseAI({
      prompt: systemPrompt,
      isProMode: false,
      isJSON: true,
      isVision: true,
      base64Image: base64Data,
      mimeType: mimeType,
      apiKey: apiKey,
      schemaType: 'schedule'
    });

    const responseText = result.text;
    const parsedData = JSON.parse(responseText);
    
    if (Array.isArray(parsedData)) {
      interface ScheduleParsedItem {
        name?: string;
        shift?: string;
        zone?: string;
      }
      return parsedData.map((item: ScheduleParsedItem) => ({
        ...item,
        name: DOMPurify.sanitize(String(item.name || 'Unknown')),
        shift: DOMPurify.sanitize(String(item.shift || 'Unknown')),
        zone: DOMPurify.sanitize(String(item.zone || 'General Sales'))
      }));
    }
    return [];
  } catch (error) {
    console.error('Gemini Vision Parse Error:', error);
    throw error;
  }
}

// Generate structured 4-Section Coaching Log Offline/Locally

export const parseRentsDueDocumentGemini = async (base64Image: string | undefined, mimeType: string | undefined, textInput: string | undefined, apiKey: string | undefined) => {
  try {
    const keyToUse = apiKey || import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('bby_api_key');
    if (!keyToUse || keyToUse.trim().length < 10) {
      throw new Error("No Gemini API key available.");
    }

    const isProMode = !!base64Image;

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

    interface RentsDueParsedItem {
      name?: string;
      rph?: number;
      rphOwed?: number;
      rphStatus?: string;
      revenue?: number;
      revenueOwed?: number;
      revenueStatus?: string;
      apps?: number;
      appsOwed?: number;
      appsStatus?: string;
      memberships?: number;
      membershipsOwed?: number;
      membershipsStatus?: string;
      warranty?: number;
      warrantyGoal?: number;
      warrantyStatus?: string;
    }

    const sanitizeRentsDueObj = (obj: RentsDueParsedItem) => ({
      ...obj,
      name: DOMPurify.sanitize(String(obj.name || 'Unknown')),
      rph: obj.rph || 0,
      rphOwed: obj.rphOwed || 0,
      rphStatus: DOMPurify.sanitize(String(obj.rphStatus || 'off-track')),
      revenue: obj.revenue || 0,
      revenueOwed: obj.revenueOwed || 0,
      revenueStatus: DOMPurify.sanitize(String(obj.revenueStatus || 'off-track')),
      apps: obj.apps || 0,
      appsOwed: obj.appsOwed || 0,
      appsStatus: DOMPurify.sanitize(String(obj.appsStatus || 'off-track')),
      memberships: obj.memberships || 0,
      membershipsOwed: obj.membershipsOwed || 0,
      membershipsStatus: DOMPurify.sanitize(String(obj.membershipsStatus || 'off-track')),
      warranty: obj.warranty || 0,
      warrantyGoal: obj.warrantyGoal || 0,
      warrantyStatus: DOMPurify.sanitize(String(obj.warrantyStatus || 'off-track'))
    });

    let result;
    if (base64Image) {
      const textPart = textInput ? `User supplied text context: "${textInput}"` : "Please audit the image.";
      result = await callFirebaseAI({
        prompt: systemPrompt + '\n' + textPart,
        isProMode: true,
        isJSON: true,
        isVision: true,
        base64Image: base64Image,
        mimeType: mimeType,
        apiKey: keyToUse,
        schemaType: 'rents_due'
      });
      const parsedData = JSON.parse(result.text);
      return Array.isArray(parsedData) ? parsedData.map(sanitizeRentsDueObj) : [];
    } else {
      if (!textInput || !textInput.trim()) return [];

      const res = await callFirebaseAI({
        prompt: systemPrompt + '\nAnalyze this entire Rents Due performance report:\n' + textInput,
        isProMode: isProMode,
        isJSON: true,
        isVision: false,
        apiKey: keyToUse,
        schemaType: 'rents_due'
      });
      const parsed = JSON.parse(res.text);
      return Array.isArray(parsed) ? parsed.map(sanitizeRentsDueObj) : [];
    }
  } catch (error) {
    console.error('Rents Due Document Parsing Error:', error);
    throw error;
  }
};

// Generate Monthly 1-on-1 Performance Review

