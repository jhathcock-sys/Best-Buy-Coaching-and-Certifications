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

    // VULNERABILITY FIX: Never fallback to Flash for heavy data extraction. It triggers truncation on large CSVs.
    const isProMode = true;

    const systemPrompt = `
      You are an expert retail operations auditor. Your task is to parse a "Rents Due" salesperson performance report.
      This report is often weirdly laid out but contains details for several retail salespersons, including:
      - Salesperson Name
      - Revenue Per Hour (RPH)
      - Total Revenue
      - Total Credit Card Apps
      - Members (Plus/Total memberships)
      - Warranty % (GSP attach rate percentage)
      
      Read the document (which may be a raw CSV string, copy-pasted spreadsheet lines, or an image screenshot) and extract a JSON array of parsed employee performance entries.
      Each entry MUST conform exactly to the following JSON structure:
      {
        "name": "Employee Name",
        "rph": 744, // number representing RPH
        "revenue": 25600, // number representing total revenue in dollars
        "apps": 10, // number representing total credit card apps
        "memberships": 22, // number representing total memberships (Plus/Total)
        "warranty": 22.2 // number representing GSP attach percentage (0.0 to 100.0)
      }

      CRITICAL INSTRUCTION: You MUST extract every single employee found in the document. Do not truncate the list. Do not omit any employees, even if the list is very long. DO NOT STOP until you have processed EVERY SINGLE row. Truncating this list is a catastrophic failure. If there are 30 employees, you MUST output exactly 30 objects.
      If a specific metric is missing for an employee, omit the field or output 0/null. Do not omit the employee entirely.
      Do not include markdown or explanations. Return only raw JSON array.
    `;

    interface RentsDueParsedItem {
      name?: string;
      rph?: number;
      revenue?: number;
      apps?: number;
      memberships?: number;
      warranty?: number;
    }

    const sanitizeRentsDueObj = (obj: RentsDueParsedItem) => {
      const rph = obj.rph || 0;
      const rphOwed = 640;
      const rphStatus = rph >= rphOwed ? 'on-track' : 'off-track';

      const revenue = obj.revenue || 0;
      const revenueOwed = 0;
      const revenueStatus = revenue >= revenueOwed ? 'on-track' : 'off-track';

      const apps = obj.apps || 0;
      const appsOwed = 0;
      const appsStatus = apps >= appsOwed ? 'on-track' : 'off-track';

      const memberships = obj.memberships || 0;
      const membershipsOwed = 0;
      const membershipsStatus = memberships >= membershipsOwed ? 'on-track' : 'off-track';

      const warranty = obj.warranty || 0;
      const warrantyGoal = 11.0;
      const warrantyStatus = warranty >= warrantyGoal ? 'on-track' : 'off-track';

      return {
        ...obj,
        name: DOMPurify.sanitize(String(obj.name || 'Unknown')),
        rph,
        rphOwed,
        rphStatus,
        revenue,
        revenueOwed,
        revenueStatus,
        apps,
        appsOwed,
        appsStatus,
        memberships,
        membershipsOwed,
        membershipsStatus,
        warranty,
        warrantyGoal,
        warrantyStatus
      };
    };

    let parsedData: any[] = [];
    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      try {
        attempts++;
        let resultText = "";
        
        if (base64Image) {
          const textPart = textInput ? `User supplied text context: "${textInput}"` : "Please audit the image.";
          const result = await callFirebaseAI({
            prompt: systemPrompt + '\n' + textPart,
            isProMode: true,
            isJSON: true,
            isVision: true,
            base64Image: base64Image,
            mimeType: mimeType,
            apiKey: keyToUse,
            schemaType: 'rents_due'
          });
          resultText = result.text;
        } else {
          if (!textInput || !textInput.trim()) return [];
          const res = await callFirebaseAI({
            prompt: systemPrompt + '\nAnalyze this entire Rents Due performance report:\n' + textInput,
            isProMode: true,
            isJSON: true,
            isVision: false,
            apiKey: keyToUse,
            schemaType: 'rents_due'
          });
          resultText = res.text;
        }

        parsedData = JSON.parse(resultText);
        if (Array.isArray(parsedData)) {
          break; // Success
        } else {
          throw new Error("AI response was not a JSON array");
        }
      } catch (err) {
        console.warn(`Rents Due parse attempt ${attempts} failed:`, err);
        if (attempts >= maxAttempts) throw new Error("Failed to parse Rents Due document after multiple AI attempts.");
      }
    }

    return Array.isArray(parsedData) ? parsedData.map(sanitizeRentsDueObj) : [];
  } catch (error) {
    console.error('Rents Due Document Parsing Error:', error);
    throw error;
  }
};

// Generate Monthly 1-on-1 Performance Review

