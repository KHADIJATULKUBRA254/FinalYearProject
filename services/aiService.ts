
import { GoogleGenAI, Type } from "@google/genai";
import { FinancialData } from "../types";

export const analyzeFinancialPDF = async (pdfBase64: string): Promise<FinancialData> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined") {
    throw new Error("API Key missing. Please check your environment variables or .env file.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Using gemini-3-flash-preview for high speed and better handling of large (300pg) documents
  const modelName = 'gemini-3-flash-preview';
  
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: pdfBase64,
            },
          },
          {
            text: `You are an expert financial analyst. I have uploaded a full annual report. 
            Ignore all marketing content, images, and general text.
            
            Step 1: Locate the 'Statement of Financial Position' (Balance Sheet) and 'Profit and Loss Account'.
            Step 2: Extract key data for 'Current Year' and 'Previous Year'. 
            Step 3: Focus on: Total Assets, Total Liabilities, Revenue, and Net Profit (Profit after Tax).
            Step 4: Return the data in the specified JSON format. Ensure numbers are extracted as actual numbers (integers or floats).
            
            Provide a 5-line professional investor summary analyzing growth, profitability, and financial stability based on these numbers.`
          }
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            company_name: { type: Type.STRING },
            reporting_year: { type: Type.STRING },
            currency: { type: Type.STRING },
            metrics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  current_year: { type: Type.NUMBER },
                  previous_year: { type: Type.NUMBER },
                  unit: { type: Type.STRING }
                },
                required: ["label", "current_year", "previous_year", "unit"]
              }
            },
            investor_summary: { type: Type.STRING }
          },
          required: ["company_name", "reporting_year", "metrics", "investor_summary"]
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("AI returned an empty response.");
    
    return JSON.parse(text) as FinancialData;
  } catch (err: any) {
    console.error("AI Service Error:", err);
    throw new Error(err.message || "Failed to process document");
  }
};
