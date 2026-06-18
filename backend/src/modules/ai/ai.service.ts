process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import { GoogleGenAI } from "@google/genai";

export type GeneratedFeature = {
  title: string;
  description: string;
  category: string;
  priority: "low" | "medium" | "high";
};

type GenerateFeaturesInput = {
  name: string;
  description?: string;
  type?: string;
  techStack?: string;
  teamSize?: string;
  methodology?: string;
  experienceLevel?: string;
  deadline?: string;
  workingHours?: string;
};

const FALLBACK_FEATURES: Record<string, GeneratedFeature[]> = {
  saas: [
    { title: "User Registration & Login", description: "Allow users to create accounts and authenticate securely", category: "authentication", priority: "high" },
    { title: "Dashboard Overview", description: "Central dashboard showing key metrics and project status", category: "ui", priority: "high" },
    { title: "User Profile Management", description: "Users can update their name, email and preferences", category: "user-management", priority: "medium" },
    { title: "Subscription & Billing", description: "Manage plans, upgrades and payment processing", category: "billing", priority: "medium" },
    { title: "Email Notifications", description: "System and user-triggered email alerts", category: "notifications", priority: "medium" },
    { title: "Role-Based Access Control", description: "Admin, member and viewer permission levels", category: "authentication", priority: "medium" },
    { title: "Data Export", description: "Export project data as CSV or PDF", category: "reporting", priority: "low" },
    { title: "Audit Logs", description: "Track user actions and changes within the system", category: "security", priority: "low" },
  ],
  ecommerce: [
    { title: "Product Catalog", description: "Browse and search products with filters and categories", category: "catalog", priority: "high" },
    { title: "Shopping Cart", description: "Add, update and remove items before checkout", category: "cart", priority: "high" },
    { title: "Checkout & Payment", description: "Secure multi-step checkout with payment gateway", category: "payments", priority: "high" },
    { title: "Order Management", description: "Track order status from placement to delivery", category: "orders", priority: "high" },
    { title: "User Authentication", description: "Register, login and manage account details", category: "authentication", priority: "medium" },
    { title: "Product Reviews & Ratings", description: "Customers can rate and review purchased products", category: "engagement", priority: "medium" },
    { title: "Inventory Management", description: "Stock levels, low-stock alerts and product availability", category: "admin", priority: "medium" },
    { title: "Discount & Coupon Codes", description: "Apply promotional codes at checkout", category: "promotions", priority: "low" },
  ],
  chatbot: [
    { title: "Conversational Interface", description: "Natural language chat UI for user interactions", category: "ui", priority: "high" },
    { title: "Intent Recognition", description: "Identify user intent from messages accurately", category: "nlp", priority: "high" },
    { title: "Context Management", description: "Maintain conversation context across multiple turns", category: "nlp", priority: "high" },
    { title: "Fallback Handling", description: "Graceful responses when intent is unclear", category: "nlp", priority: "medium" },
    { title: "Integration Webhooks", description: "Connect to third-party services and APIs", category: "integrations", priority: "medium" },
    { title: "Analytics Dashboard", description: "Track conversations, intents and user satisfaction", category: "reporting", priority: "medium" },
    { title: "Multi-channel Support", description: "Deploy on web, WhatsApp and Slack", category: "integrations", priority: "low" },
  ],
  landing_page: [
    { title: "Hero Section", description: "Compelling headline, subtext and primary call-to-action", category: "ui", priority: "high" },
    { title: "Features / Benefits Section", description: "Highlight key product features with icons or images", category: "ui", priority: "high" },
    { title: "Lead Capture Form", description: "Email signup or contact form with validation", category: "forms", priority: "high" },
    { title: "Social Proof / Testimonials", description: "Customer quotes and logos to build trust", category: "ui", priority: "medium" },
    { title: "Pricing Section", description: "Clear pricing tiers with feature comparisons", category: "ui", priority: "medium" },
    { title: "SEO Metadata", description: "Page title, description, Open Graph and sitemap", category: "seo", priority: "medium" },
    { title: "Analytics Integration", description: "Google Analytics or equivalent tracking", category: "analytics", priority: "low" },
  ],
};

export const generateProjectFeatures = async (
  input: GenerateFeaturesInput
): Promise<GeneratedFeature[]> => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const client = new GoogleGenAI({ apiKey });
      const prompt = `You are a senior software architect. Generate a feature list for this project.

Project Details:
- Name: ${input.name}
- Description: ${input.description || "Not provided"}
- Type: ${input.type || "Web application"}
- Tech Stack: ${input.techStack || "Not specified"}
- Team Size: ${input.teamSize || "Not specified"}
- Methodology: ${input.methodology || "Not specified"}
- Experience Level: ${input.experienceLevel || "Not specified"}
- Deadline: ${input.deadline || "Not specified"}

Generate 6–10 realistic, specific features for this exact project. Each feature should be relevant to the project description.

Return ONLY valid JSON array:
[
  {
    "title": "Feature name (concise, 3-6 words)",
    "description": "One sentence explaining what this feature does",
    "category": "lowercase-category-slug",
    "priority": "high" | "medium" | "low"
  }
]`;

      const response = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json", temperature: 0.3 },
      });

      const text = (response.text ?? "").trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
      const parsed = JSON.parse(text);

      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((f: any) => ({
          title: String(f.title ?? "Untitled Feature"),
          description: String(f.description ?? ""),
          category: String(f.category ?? "general"),
          priority: (["low", "medium", "high"].includes(f.priority) ? f.priority : "medium") as "low" | "medium" | "high",
        }));
      }
    } catch (err) {
      console.error("Gemini feature generation failed, using fallback:", err);
    }
  }

  // Smart fallback based on project type
  const key = (input.type ?? "saas") as keyof typeof FALLBACK_FEATURES;
  return FALLBACK_FEATURES[key] ?? FALLBACK_FEATURES.saas;
};

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