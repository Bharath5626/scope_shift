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

export type ScopeAnalysisResult = {
  scopeScore: number;
  estimatedHours: number;
  estimatedWeeks: number;
  riskLevel: "Low" | "Medium" | "High";
  effortBreakdown: {
    development: number;
    testing: number;
    integration: number;
    documentation: number;
  };
  complexity: {
    level: "Low" | "Medium" | "High";
    score: number;
  };
  riskFactors: string[];
  recommendations: string[];
};

type FeatureInput = {
  title: string;
  description?: string | null;
  category: string;
  priority: string;
};

const computeFallbackAnalysis = (
  features: FeatureInput[]
): ScopeAnalysisResult => {
  const count = features.length;
  const highPriority = features.filter((f) => f.priority === "high").length;
  const totalHours = Math.round(count * 16);
  const devHours = Math.round(totalHours * 0.6);
  const testHours = Math.round(totalHours * 0.17);
  const intHours = Math.round(totalHours * 0.13);
  const docHours = totalHours - devHours - testHours - intHours;
  const weeks = Math.max(1, Math.ceil(totalHours / 40));
  const riskLevel: "Low" | "Medium" | "High" =
    highPriority >= 3 || count >= 8 ? "High" : count >= 4 ? "Medium" : "Low";
  const complexityScore = Math.min(95, 30 + count * 7);
  const complexityLevel: "Low" | "Medium" | "High" =
    complexityScore >= 70 ? "High" : complexityScore >= 45 ? "Medium" : "Low";
  const scopeScore = Math.min(95, 20 + count * 9);

  const riskFactorPool: Record<string, string[]> = {
    authentication: ["Session management complexity", "Security compliance requirements"],
    billing: ["Payment gateway integration", "Subscription state edge cases"],
    integrations: ["External service reliability", "API rate limiting"],
    general: ["Scope creep risk", "Dependency management", "Cross-browser compatibility"],
    default: ["Timeline constraints", "Technical debt accumulation", "Change in user flow"],
  };
  const uniqueCategories = [...new Set(features.map((f) => f.category))];
  const riskFactors: string[] = [];
  for (const cat of uniqueCategories) {
    const pool = riskFactorPool[cat] ?? riskFactorPool.general;
    riskFactors.push(pool[0]);
    if (riskFactors.length >= 4) break;
  }
  while (riskFactors.length < 4)
    riskFactors.push(riskFactorPool.default[riskFactors.length % 3]);

  const recommendationPool: Record<string, string[]> = {
    saas: [
      "Define clear API contracts before implementation begins",
      "Implement caching early to avoid performance bottlenecks",
      "Set up error monitoring (e.g. Sentry) from day one",
      "Design for horizontal scaling from the start",
    ],
    ecommerce: [
      "Optimise the checkout flow to reduce cart abandonment",
      "Test all payment flows thoroughly in a staging environment",
      "Add inventory webhooks for real-time stock updates",
      "Implement product search with proper indexing",
    ],
    chatbot: [
      "Log all conversations for training data collection",
      "Add a human escalation fallback for low-confidence responses",
      "Test with diverse user inputs and edge cases",
      "Monitor intent confidence scores over time",
    ],
    landing_page: [
      "A/B test the hero section CTA for conversion",
      "Optimise images for Core Web Vitals",
      "Add schema markup for improved SEO",
      "Set up conversion tracking from day one",
    ],
    general: [
      "Start with a minimal viable scope and expand iteratively",
      "Establish clear acceptance criteria for each feature",
      "Schedule weekly scope review meetings to catch drift early",
      "Document all third-party dependencies and their SLAs",
    ],
  };

  const typeKey = "general";
  const recommendations = (recommendationPool[typeKey] ?? recommendationPool.general).slice(0, 4);

  return {
    scopeScore,
    estimatedHours: totalHours,
    estimatedWeeks: weeks,
    riskLevel,
    effortBreakdown: {
      development: devHours,
      testing: testHours,
      integration: intHours,
      documentation: docHours,
    },
    complexity: { level: complexityLevel, score: complexityScore },
    riskFactors: riskFactors.slice(0, 4),
    recommendations,
  };
};

export const analyzeProjectScope = async (
  project: { name: string; description?: string | null; type: string },
  features: FeatureInput[]
): Promise<ScopeAnalysisResult> => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && features.length > 0) {
    try {
      const client = new GoogleGenAI({ apiKey });
      const featureList = features
        .map((f) => `- ${f.title} [${f.category}, ${f.priority} priority]${f.description ? `: ${f.description}` : ""}`)
        .join("\n");

      const prompt = `You are a senior software project estimator. Analyze this project and its features to produce effort estimates and risk analysis.

Project: ${project.name}
Description: ${project.description || "Not provided"}
Type: ${project.type}

Features (${features.length} total):
${featureList}

Based on these features, return ONLY valid JSON matching exactly this shape:
{
  "scopeScore": <integer 20-95, overall scope complexity score as a percentage>,
  "estimatedHours": <integer, total estimated development hours>,
  "estimatedWeeks": <integer, realistic calendar weeks to deliver>,
  "riskLevel": "Low" | "Medium" | "High",
  "effortBreakdown": {
    "development": <integer hours>,
    "testing": <integer hours>,
    "integration": <integer hours>,
    "documentation": <integer hours>
  },
  "complexity": {
    "level": "Low" | "Medium" | "High",
    "score": <integer 10-95, complexity score for visualization>
  },
  "riskFactors": [<4 concise risk factor strings specific to this project>],
  "recommendations": [<4 concise actionable recommendation strings to reduce risk or improve delivery>]
}

Make all numbers realistic for a ${project.type} project with ${features.length} features.`;

      const response = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json", temperature: 0.2 },
      });

      const text = (response.text ?? "").trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
      const parsed = JSON.parse(text);

      return {
        scopeScore: Number(parsed.scopeScore) || 60,
        estimatedHours: Number(parsed.estimatedHours) || 80,
        estimatedWeeks: Number(parsed.estimatedWeeks) || 2,
        riskLevel: (["Low", "Medium", "High"].includes(parsed.riskLevel) ? parsed.riskLevel : "Medium") as "Low" | "Medium" | "High",
        effortBreakdown: {
          development: Number(parsed.effortBreakdown?.development) || 48,
          testing: Number(parsed.effortBreakdown?.testing) || 16,
          integration: Number(parsed.effortBreakdown?.integration) || 10,
          documentation: Number(parsed.effortBreakdown?.documentation) || 6,
        },
        complexity: {
          level: (["Low", "Medium", "High"].includes(parsed.complexity?.level) ? parsed.complexity.level : "Medium") as "Low" | "Medium" | "High",
          score: Number(parsed.complexity?.score) || 60,
        },
        riskFactors: Array.isArray(parsed.riskFactors) ? parsed.riskFactors.slice(0, 4).map(String) : [],
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations.slice(0, 4).map(String) : [],
      };
    } catch (err) {
      console.error("Gemini scope analysis failed, using fallback:", err);
    }
  }

  return computeFallbackAnalysis(features);
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