process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import { GoogleGenAI } from "@google/genai";

type AnalyzeScopeChangesInput = {
  originalScope: string[];
  updatedScope: string[];
};

type AnalyzeScopeChangesResult = {
  featureChanges: Array<{
    title: string;
    impactScore: number;
    changeType: string;
    explanation: string;
  }>;
  risks: Array<{
    title: string;
    description: string;
    severity: string;
  }>;
  recommendations: Array<{
    title: string;
    description: string;
    priority: string;
  }>;
  report: {
    reportType: string;
    summary: string;
  };
};

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

const fallbackResult: AnalyzeScopeChangesResult = {
  featureChanges: [],
  risks: [],
  recommendations: [],
  report: {
    reportType: "ANALYSIS",
    summary: "AI analysis unavailable",
  },
};

const extractJson = (text: string) => {
  const trimmed = text.trim();

  if (trimmed.startsWith("```")) {
    return trimmed
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/i, "")
      .trim();
  }

  return trimmed;
};

export const analyzeScopeChanges = async ({
  originalScope,
  updatedScope,
}: AnalyzeScopeChangesInput): Promise<AnalyzeScopeChangesResult> => {
  try {
    const prompt = `You are a senior software architect.

Original Scope:

${originalScope.map((item) => `- ${item}`).join("\n")}

Updated Scope:

${updatedScope.map((item) => `- ${item}`).join("\n")}

Compare both scopes.

Return ONLY valid JSON:

{
  "featureChanges": [
    {
      "title": "",
      "impactScore": 0,
      "changeType": "",
      "explanation": ""
    }
  ],
  "risks": [
    {
      "title": "",
      "description": "",
      "severity": ""
    }
  ],
  "recommendations": [
    {
      "title": "",
      "description": "",
      "priority": ""
    }
  ],
  "report": {
    "reportType": "ANALYSIS",
    "summary": ""
  }
}`;

    const response = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: prompt,
  config: {
    responseMimeType: "application/json",
    temperature: 0.2,
  },
});
console.log("RAW GEMINI RESPONSE:");
console.log(response.text);
    const parsed = JSON.parse(extractJson(response.text ?? ""));

    return {
      featureChanges: Array.isArray(parsed.featureChanges) ? parsed.featureChanges : [],
      risks: Array.isArray(parsed.risks) ? parsed.risks : [],
      recommendations: Array.isArray(parsed.recommendations)
        ? parsed.recommendations
        : [],
      report: parsed.report && typeof parsed.report === "object"
        ? parsed.report
        : fallbackResult.report,
    };
  } 
  catch (error: any) {
  console.error("========== GEMINI ERROR ==========");
  console.error(error);
  console.error("==================================");

  return fallbackResult;
  
}
};