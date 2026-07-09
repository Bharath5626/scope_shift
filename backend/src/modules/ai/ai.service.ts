process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const { GoogleGenAI } = require("@google/genai");

import {
  calculateCapacityMetricsNew,
  deriveConfidence,
} from "./scope-calculations";
import {
  safeParseJson,
  validateFeatureEstimateResponse,
  withTimeout,
  withRetry,
  AIValidationError,
  AITimeoutError,
  AIRateLimitError,
  AIResponseError,
  handleAIError,
  logAIError,
  logAISuccess,
  createAIFallbackResponse,
  type GeminiScopeResponse,
  type FeatureEstimate,
} from "./ai-utils";

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
  startDate?: string;
  projectType?: string;
};

const FALLBACK_FEATURES: Record<string, GeneratedFeature[]> = {
  saas: [
  {
    title: "Create Project Workspace",
    description: "Users can initialize and configure a new project workspace",
    category: "workflow",
    priority: "high",
  },
  {
    title: "Invite Collaborators",
    description: "Project owners can invite team members to collaborate",
    category: "workflow",
    priority: "high",
  },
  {
    title: "Manage Project Tasks",
    description: "Users can create and track tasks within a project workflow",
    category: "workflow",
    priority: "high",
  },
  {
    title: "Track Project Activity",
    description: "System records key actions and project events",
    category: "tracking",
    priority: "medium",
  },
  {
    title: "Export Project Data",
    description: "Users can export project data for reporting and analysis",
    category: "reporting",
    priority: "low",
  },
  {
    title: "Configure Project Settings",
    description: "Users can manage project-level configuration options",
    category: "configuration",
    priority: "medium",
  },
],
  ecommerce: [
    {
      title: "Product Catalog",
      description: "Browse and search products with filters and categories",
      category: "catalog",
      priority: "high",
    },
    {
      title: "Shopping Cart",
      description: "Add, update and remove items before checkout",
      category: "cart",
      priority: "high",
    },
    {
      title: "Checkout & Payment",
      description: "Secure multi-step checkout with payment gateway",
      category: "payments",
      priority: "high",
    },
    {
      title: "Order Management",
      description: "Track order status from placement to delivery",
      category: "orders",
      priority: "high",
    },
    {
      title: "User Authentication",
      description: "Register, login and manage account details",
      category: "authentication",
      priority: "medium",
    },
    {
      title: "Product Reviews & Ratings",
      description: "Customers can rate and review purchased products",
      category: "engagement",
      priority: "medium",
    },
    {
      title: "Inventory Management",
      description: "Stock levels, low-stock alerts and product availability",
      category: "admin",
      priority: "medium",
    },
    {
      title: "Discount & Coupon Codes",
      description: "Apply promotional codes at checkout",
      category: "promotions",
      priority: "low",
    },
  ],
  chatbot: [
    {
      title: "Conversational Interface",
      description: "Natural language chat UI for user interactions",
      category: "ui",
      priority: "high",
    },
    {
      title: "Intent Recognition",
      description: "Identify user intent from messages accurately",
      category: "nlp",
      priority: "high",
    },
    {
      title: "Context Management",
      description: "Maintain conversation context across multiple turns",
      category: "nlp",
      priority: "high",
    },
    {
      title: "Fallback Handling",
      description: "Graceful responses when intent is unclear",
      category: "nlp",
      priority: "medium",
    },
    {
      title: "Integration Webhooks",
      description: "Connect to third-party services and APIs",
      category: "integrations",
      priority: "medium",
    },
    {
      title: "Analytics Dashboard",
      description: "Track conversations, intents and user satisfaction",
      category: "reporting",
      priority: "medium",
    },
    {
      title: "Multi-channel Support",
      description: "Deploy on web, WhatsApp and Slack",
      category: "integrations",
      priority: "low",
    },
  ],
  landing_page: [
    {
      title: "Hero Section",
      description: "Compelling headline, subtext and primary call-to-action",
      category: "ui",
      priority: "high",
    },
    {
      title: "Features / Benefits Section",
      description: "Highlight key product features with icons or images",
      category: "ui",
      priority: "high",
    },
    {
      title: "Lead Capture Form",
      description: "Email signup or contact form with validation",
      category: "forms",
      priority: "high",
    },
    {
      title: "Social Proof / Testimonials",
      description: "Customer quotes and logos to build trust",
      category: "ui",
      priority: "medium",
    },
    {
      title: "Pricing Section",
      description: "Clear pricing tiers with feature comparisons",
      category: "ui",
      priority: "medium",
    },
    {
      title: "SEO Metadata",
      description: "Page title, description, Open Graph and sitemap",
      category: "seo",
      priority: "medium",
    },
    {
      title: "Analytics Integration",
      description: "Google Analytics or equivalent tracking",
      category: "analytics",
      priority: "low",
    },
  ],
};

/**
 * Calculate working days between two dates, excluding weekends.
 * Includes both start and end dates.
 * Returns at least 1 day when startDate === deadline (if weekday).
 * Throws error if deadline < startDate.
 * Throws error if same-day project falls on weekend (no working days available).
 */
export function calculateWorkingDays(startDate: Date, endDate: Date): number {
  if (endDate < startDate) {
    throw new Error("Deadline must be on or after start date");
  }

  // If same day, return 1 (inclusive) for weekday, reject for weekend
  if (startDate.getTime() === endDate.getTime()) {
    const dayOfWeek = startDate.getDay();
    // If it's a weekend (0=Sunday, 6=Saturday), reject as invalid
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      throw new Error("Same-day project cannot be scheduled on a weekend");
    }
    return 1;
  }

  let workingDays = 0;
  let currentDate = new Date(startDate);
  const endDateCopy = new Date(endDate);

  // Include both start and end dates
  while (currentDate <= endDateCopy) {
    const dayOfWeek = currentDate.getDay();
    // 0 = Sunday, 6 = Saturday
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // If no working days found (e.g., entire range is weekends), reject
  if (workingDays === 0) {
    throw new Error("Project range must include at least one working day");
  }

  return workingDays;
}

export type ScopeAnalysisResult = {
  scopeScore: number;
  estimatedHours: number;
  availableHours: number;
  effectiveAvailableHours: number;
  estimatedWeeks: number;
  deadlineFeasible: boolean;
  capacityUtilization: number;
  capacityBuffer: number;
  capacityBufferPercent: number;
  confidence: number;
  riskLevel: "Low" | "Medium" | "High";
  projectHealth: "Healthy" | "Manageable" | "Tight" | "At Risk";
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

export const analyzeProjectScope = async (
project: {
  name: string;
  description?: string | null;
  type: string;
  techStack?: string;
  teamSize?: string;
  methodology?: string;
  startDate?: string;
  deadline?: string;
  workingHours?: string;
  projectType?: string;
}, features: FeatureInput[], newFeatures: { projectId: string; id: string; description: string | null; type: string; title: string; category: string; priority: string; order: number; }[],
): Promise<ScopeAnalysisResult> => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("AI service is not configured. Please contact support.");
  }

  if (features.length === 0) {
    throw new Error("No features to analyze. Please add features first.");
  }

  try {
    const client = new GoogleGenAI({ apiKey });
    const featureList = features
      .map(
        (f) =>
          `- ${f.title} [${f.category}, ${f.priority} priority]${f.description ? `: ${f.description}` : ""}`,
      )
      .join("\n");

    const prompt = `You are a Principal Software Engineering Manager and Estimation Lead responsible for delivering realistic engineering effort estimates.

Your responsibility is to analyze the COMPLETE project context and feature scope to estimate engineering effort, complexity, risks, and provide recommendations.

You MUST use ALL provided project inputs when estimating effort, complexity, and risks.

Do NOT estimate based only on feature count.

You must consider:

- Business requirements
- Project domain
- Technical complexity
- Development methodology
- Working hours available
- Technology stack limitations
- Generated feature scope

The final analysis must reflect both PROJECT CONTEXT and FEATURE COMPLEXITY.

---

## IMPORTANT: YOUR RESPONSIBILITIES

You are NOT responsible for project timeline calculations.

You are NOT responsible for estimated weeks.

You are NOT responsible for team capacity calculations.

You are NOT responsible for delivery forecasting.

You are ONLY responsible for:

1. Estimating complexity of individual features
2. Estimating development effort of individual features
3. Identifying technical risks
4. Providing engineering recommendations

The backend system will calculate all project-level metrics including:
- Total project hours (sum of feature estimates)
- Estimated weeks (based on team capacity)
- Risk level (based on capacity utilization)
- Scope score (based on feature complexity)
- Effort breakdown (derived from feature estimates)
- Project health, confidence, and utilization

DO NOT provide project-level estimates. Focus ONLY on feature-level engineering judgment.

---

## Project Context

### Core Project Information

- Name: ${project.name}
- Description: ${project.description || "Not provided"}
- Type: ${project.type}
- Project Type: ${project.projectType || "Not specified"}

### Team & Delivery Constraints

- Team Size: ${project.teamSize || "Not specified"}
- Methodology: ${project.methodology || "Not specified"}
- Start Date: ${project.startDate || "Not specified"}
- Deadline: ${project.deadline || "Not specified"}
- Working Hours Per Day: ${project.workingHours || "Not specified"}

### Technical Context

- Tech Stack: ${project.techStack || "Not specified"}

---

## Generated Feature Scope

Total Features: ${features.length}

${featureList}

---

## IMPORTANT ANALYSIS REQUIREMENTS

You MUST consider:

### Project Description
Use the project description to understand:
- business domain
- user workflows
- external integrations
- data complexity

### Tech Stack
Use the tech stack to evaluate:
- implementation complexity
- integration effort
- deployment effort
- testing effort

### Team Size
Use team size to understand parallel development capabilities.

### Methodology
Adjust effort estimates based on delivery model:

- Agile → sprint overhead + iterative delivery
- Scrum → planning/review overhead
- Kanban → reduced planning overhead
- Waterfall → higher upfront design effort

### Working Hours
Use working hours to understand daily throughput capacity.

### Start Date and Deadline
Use these to understand timeline pressure.

If timeline appears tight:
- increase complexity estimates
- include timeline-related risk factors

### Generated Features
Analyze:
- feature count
- feature dependencies
- integration points
- workflow complexity
- priority distribution

Do NOT estimate purely from number of features.
Consider actual implementation complexity.

---

## Output Constraints (STRICT)

Return ONLY valid JSON. No markdown, no commentary.

---

## Output Schema

{
  "featureEstimates": [
    {
      "feature": "<exact feature title from the list above>",
      "complexity": "Simple" | "Medium" | "Complex" | "Very Complex",
      "estimatedHours": <integer hours for this specific feature>
    }
  ],
  "riskFactors": [
    "<4 specific risks tied to architecture, dependencies, or system scaling>"
  ],
  "recommendations": [
    "<4 actionable engineering strategies to reduce timeline or risk>"
  ]
}

---

## Validation Rules (must satisfy internally before responding)

- You MUST provide an estimate for EVERY feature in the list above
- Use the EXACT feature title from the provided list
- estimatedHours should be realistic for a single feature (typically 4-80 hours)
- complexity should reflect implementation difficulty
- riskFactors must be feature-specific (no generic risks)
- recommendations must be execution-level actions, not advice
- DO NOT include any project-level metrics (total hours, weeks, risk level, etc.)`;

    const response = await withRetry(
      () => withTimeout(
        client.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: { responseMimeType: "application/json", temperature: 0.2 },
        }),
        90000 // 90 second timeout
      ),
      {
        maxRetries: 3,
        retryableErrors: ['timeout', '429', '500', '503', 'ECONNRESET', 'ETIMEDOUT'],
        delays: [1000, 2000],
      }
    ) as { text?: string };

    const text = response.text ?? "";
    
    // Use safe JSON parsing
    const parseResult = safeParseJson(text);
    if (!parseResult.success) {
      logAIError({
        operation: 'analyzeProjectScope',
        errorType: 'ParseError',
        errorMessage: parseResult.error,
        timestamp: new Date().toISOString(),
      });
      throw new AIResponseError('Failed to parse AI response', new Error(parseResult.error));
    }

    // Validate response structure
    const validationResult = validateFeatureEstimateResponse(parseResult.data, features.length);
    if (!validationResult.valid) {
      logAIError({
        operation: 'analyzeProjectScope',
        errorType: 'ValidationError',
        errorMessage: 'AI response validation failed',
        validationErrors: validationResult.errors,
        timestamp: new Date().toISOString(),
      });
      throw new AIValidationError('AI returned invalid data', validationResult.errors);
    }

    const parsed = parseResult.data as GeminiScopeResponse;

    // Validate inputs
    const teamSize = Number(project.teamSize);
    if (!teamSize || teamSize <= 0) {
      throw new Error("Team size must be a positive number");
    }

    const workingHoursPerDay = Number(project.workingHours) || 8; // Default to 8 hours if not set
    if (workingHoursPerDay <= 0) {
      throw new Error("Working hours per day must be a positive number");
    }

    const startDate = project.startDate ? new Date(project.startDate) : null;
    const deadline = project.deadline ? new Date(project.deadline) : null;

    // Validate dates
    if (!startDate || isNaN(startDate.getTime())) {
      throw new Error("Start date is required for analysis");
    }

    if (!deadline || isNaN(deadline.getTime())) {
      throw new Error("Deadline is required for analysis");
    }

    // Use new capacity calculation engine (deterministic, no AI involvement)
    const capacityMetrics = calculateCapacityMetricsNew({
      teamSize,
      workingHoursPerDay,
      startDate,
      deadline,
      featureEstimates: parsed.featureEstimates,
    });

    // Derive complexity from total estimated hours (deterministic)
    let complexityLevel: "Low" | "Medium" | "High";
    let complexityScore: number = 0;

    // Derive risk level from capacity utilization (deterministic)
    let riskLevel: "Low" | "Medium" | "High";
    if (capacityMetrics.capacityUtilization < 70) {
      riskLevel = "Low";
    } else if (capacityMetrics.capacityUtilization <= 90) {
      riskLevel = "Medium";
    } else {
      riskLevel = "High";
    }

    // Derive confidence using pure function
    const riskFactorCount = Array.isArray(parsed.riskFactors) ? parsed.riskFactors.length : 0;
    const confidence = deriveConfidence({
      complexityScore,
      riskFactorCount,
    });

    // Derive project health from buffer percent
    let projectHealth: "Healthy" | "Manageable" | "Tight" | "At Risk";
    if (capacityMetrics.bufferPercent > 20) {
      projectHealth = "Healthy";
    } else if (capacityMetrics.bufferPercent >= 10) {
      projectHealth = "Manageable";
    } else if (capacityMetrics.bufferPercent >= 0) {
      projectHealth = "Tight";
    } else {
      projectHealth = "At Risk";
    }

    // Use capacity engine effort breakdown directly
    const effortBreakdown = {
      development: capacityMetrics.rawDevelopmentHours,
      testing: capacityMetrics.testingHours,
      integration: capacityMetrics.integrationHours,
      documentation: capacityMetrics.documentationHours,
    };

    // Calculate scope score from utilization (deterministic)
    const scopeScore = Math.min(95, parseFloat(((capacityMetrics.estimatedHours / capacityMetrics.productiveHours) * 100).toFixed(2)));
    
    // Use same formula for complexity score for consistency
    complexityScore = scopeScore;
    complexityLevel = complexityScore >= 70 ? "High" : complexityScore >= 45 ? "Medium" : "Low";

    // Log successful AI operation
    logAISuccess({
      operation: 'analyzeProjectScope',
      timestamp: new Date().toISOString(),
    });

    return {
      scopeScore,
      estimatedHours: capacityMetrics.estimatedHours,
      availableHours: capacityMetrics.availableHours,
      effectiveAvailableHours: capacityMetrics.productiveHours,
      estimatedWeeks: capacityMetrics.estimatedWeeks,
      deadlineFeasible: capacityMetrics.timelineFit !== "OVER_CAPACITY",
      capacityUtilization: capacityMetrics.capacityUtilization,
      capacityBuffer: capacityMetrics.bufferHours,
      capacityBufferPercent: capacityMetrics.bufferPercent,
      confidence,
      riskLevel,
      projectHealth,
      effortBreakdown,
      complexity: {
        level: complexityScore >= 70 ? "High" : complexityScore >= 45 ? "Medium" : "Low",
        score: complexityScore,
      },
      riskFactors: Array.isArray(parsed.riskFactors)
        ? parsed.riskFactors.slice(0, 4).map(String)
        : [],
      recommendations: Array.isArray(parsed.recommendations)
        ? parsed.recommendations.slice(0, 4).map(String)
        : [],
    };
  } catch (err: unknown) {
    console.error("========== RAW GEMINI ERROR (analyzeProjectScope) ==========");
    console.error(err);
    console.error("==========================================================");

    const userMessage = handleAIError(err);
    
    logAIError({
      operation: 'analyzeProjectScope',
      errorType: err instanceof Error ? err.constructor.name : 'Unknown',
      errorMessage: err instanceof Error ? err.message : String(err),
      timestamp: new Date().toISOString(),
    });
    
    throw new Error(userMessage);
  }
};

export const generateProjectFeatures = async (
  input: GenerateFeaturesInput,
): Promise<GeneratedFeature[]> => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("AI service is not configured. Please contact support.");
  }

  try {
    const client = new GoogleGenAI({ apiKey });
   const prompt = `
You are a Principal Software Architect and Technical Project Manager with 15+ years of experience designing and estimating production-grade software systems.

Your task is to generate a realistic engineering scope breakdown for the software project described below.

The generated features will be used by an AI project estimation engine to calculate:

- Development effort
- Required productive hours
- Timeline feasibility
- Project risk
- Scope creep impact
- Delay prediction

Therefore, generate features as IMPLEMENTABLE SOFTWARE CAPABILITIES, not user stories.

Think like:
- Software Architect
- Engineering Manager
- Technical Lead

Do NOT think like:
- UX designer
- Marketing person
- Product copywriter

---

# PROJECT CONTEXT

## Required Information

Project Name:
${input.name}

Project Description:
${input.description || "Not provided"}

Project Type:
${input.projectType || "Not specified"}

Technology Stack:
${input.techStack}

Team Size:
${input.teamSize}

Start Date:
${input.startDate}

Deadline:
${input.deadline}

Development Methodology:
${input.methodology || "Not specified"}

Working Hours Per Day:
${input.workingHours || "Not specified"}

---

# CORE OBJECTIVE

Generate the engineering scope required to build this product.

Features must represent meaningful software capabilities such as:

- Application modules
- Backend capabilities
- Frontend capabilities
- Database capabilities
- External integrations
- Security capabilities
- Infrastructure capabilities
- Testing capabilities
- Deployment capabilities

The output will become the baseline scope for project estimation.

---

# FEATURE GENERATION PROCESS

Before generating features, internally analyze:

## 1. Identify Product Domain

Understand what industry/business this software belongs to.

Examples:

Healthcare:
- Patient management
- Medical records
- Appointments
- Billing
- Pharmacy
- Laboratory

E-commerce:
- Products
- Inventory
- Orders
- Payments
- Shipping
- Customers

Education:
- Courses
- Students
- Enrollment
- Assessments
- Progress tracking

Banking:
- Accounts
- Transactions
- Loans
- Compliance

Do not allow generic software patterns to override the actual domain.

---

## 2. Identify Required Engineering Modules

Break the product into:

### Core Business Modules
The main functionality that makes the product valuable.

Examples:
- Product Catalog
- Patient Records
- Course Management
- Order Processing


### Supporting Modules

Examples:
- Notifications
- Search
- Reporting
- Reviews
- Communication


### Technical Foundation Modules

Examples:
- Authentication & Authorization
- Database Design
- API Development
- Frontend Development
- Testing & Quality Assurance
- Deployment & Configuration

---

# IMPORTANT DOMAIN RULE

Generated features MUST belong to the actual project domain.

Do NOT generate generic SaaS/project-management features unless the project itself is a project management system.

Invalid example:

Project:
Hospital Management System

Wrong:

- Create Tasks
- Manage Projects
- Kanban Boards
- Team Collaboration
- Track Employee Progress


Correct:

- Patient Management
- Doctor Management
- Appointment Management
- Electronic Medical Records
- Prescription Management
- Laboratory Management
- Pharmacy Management
- Billing Management

---

# FEATURE GRANULARITY RULE

A feature represents an engineering scope item.

A feature should be large enough to require meaningful development effort.

Good:

- Payment Gateway Integration
- Inventory Management System
- Authentication & Authorization
- Patient Record Management
- Search & Filtering Engine
- Notification Service


Bad:

- Click Login Button
- Appointment Page
- Product Screen
- Create Button Component
- Database Table Creation

---

# TECH STACK AWARENESS

Use the technology stack only to judge feasibility and complexity.

Do NOT generate low-level implementation tasks.

Bad:

- Create React Components
- Setup Express Routes
- Configure MySQL Tables


Good:

- Frontend Application Development
- API Development
- Database Design & Migration

---

# DELIVERY CONSTRAINT AWARENESS

Consider:

- Team size
- Timeline
- Deadline
- Working hours

If the timeline is short:

- Focus on MVP modules
- Remove enterprise-level features
- Avoid unnecessary integrations


If the timeline is longer:

- Include supporting capabilities
- Include operational modules
- Include reporting and automation where relevant

---

# COMMON DOMAIN EXAMPLES

Use these only as guidance.

## E-Commerce

Possible features:

- Authentication & Authorization
- User Management
- Product Catalog Management
- Category Management
- Inventory Management
- Shopping Cart
- Order Processing
- Payment Integration
- Shipping & Delivery Management
- Review & Rating System
- Wishlist Management
- Coupon & Discount Management
- Notification Service
- Admin Management
- Reporting & Analytics
- Search & Filtering
- Database Design & Migration
- API Development
- Frontend Application Development
- Testing & Quality Assurance
- Deployment & Configuration


## Hospital Management

Possible features:

- Authentication & Authorization
- User and Staff Management
- Patient Management
- Doctor Management
- Appointment Management
- Electronic Medical Records
- Prescription Management
- Laboratory Management
- Pharmacy Management
- Billing Management
- Insurance Management
- Notification Service
- Reporting & Analytics
- Database Design & Migration
- API Development
- Frontend Application Development
- Testing & Quality Assurance
- Deployment & Configuration


## SaaS Application

Possible features:

- Authentication & Authorization
- User Management
- Subscription Management
- Core Application Module
- Payment Integration
- Notification Service
- Analytics
- Admin Management
- API Development
- Database Design
- Frontend Development
- Testing
- Deployment


---

# FEATURE TITLE RULES

Titles must:

- Represent engineering capabilities
- Be concise
- Be understandable by developers and project managers
- Usually contain 2-6 words

Good:

- Payment Gateway Integration
- Inventory Management System
- User Authentication
- Order Processing
- Database Design & Migration


Bad:

- Buy Product
- Book Appointment
- View Dashboard
- Manage Things

---

# DESCRIPTION RULES

Descriptions must:

- Explain the engineering capability
- Be one sentence
- Describe business value
- Avoid low-level implementation details


Good:

"Enables customers to securely complete transactions using supported payment providers."

Bad:

"Uses Stripe API with webhook handlers."

---

# CATEGORY RULES

Categories should represent engineering scope areas.

Allowed examples:

- authentication
- user-management
- core-module
- database
- api
- frontend
- backend
- integration
- security
- notification
- reporting
- analytics
- testing
- deployment


Avoid:

- page
- screen
- button
- ui-component

---

# PRIORITY RULES

high:
Required for the product's main functionality.

medium:
Important supporting capability.

low:
Optional enhancement.

---

# COMPLEXITY RULES

Estimate implementation complexity.

Allowed values:

low:
Simple feature with limited dependencies.

medium:
Multiple workflows or moderate business logic.

high:
Complex business rules, external integrations, AI, payments, real-time systems, or large data processing.

---

# FINAL VALIDATION

Before returning:

Remove any feature that is:

- Generic
- Unrelated to the project domain
- Only a UI element
- A user action instead of a software capability
- A duplicate
- Too small to estimate separately

Quality is more important than filling the list.

Generate between 12 and 20 features.

---

# OUTPUT FORMAT

Return ONLY valid JSON array.

CRITICAL REQUIREMENTS:
- NO markdown code blocks
- NO explanations before or after the JSON
- NO comments within the JSON
- NO trailing commas
- Ensure proper JSON syntax: use double quotes for strings, proper comma separation
- The response must start with [ and end with ]
- Each object must have all required fields: title, description, category, priority, complexity

Format:

[
 {
  "title":"Payment Gateway Integration",
  "description":"Enables customers to securely complete transactions using supported payment providers.",
  "category":"integration",
  "priority":"high",
  "complexity":"high"
 }
]

`;

    const response = await withRetry(
      () => withTimeout(
        client.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: { responseMimeType: "application/json", temperature: 0.3 },
        }),
        90000 // 90 second timeout
      ),
      {
        maxRetries: 3,
        retryableErrors: ['timeout', '429', '500', '503', 'ECONNRESET', 'ETIMEDOUT'],
        delays: [1000, 2000],
      }
    ) as { text?: string };

    const text = (response.text ?? "")
      .trim()
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/i, "")
      .trim();

    // Log raw response for debugging
    console.log("========== RAW AI RESPONSE ==========");
    console.log(text.substring(0, 2000)); // Log first 2000 chars
    console.log("====================================");

    // Use safe JSON parsing
    const parseResult = safeParseJson(text);
    if (!parseResult.success) {
      logAIError({
        operation: 'generateProjectFeatures',
        errorType: 'ParseError',
        errorMessage: parseResult.error,
        timestamp: new Date().toISOString(),
      });
      throw new AIResponseError('Failed to parse AI response', new Error(parseResult.error));
    }

    const parsed = parseResult.data;

    // Validate response is an array
    if (!Array.isArray(parsed) || parsed.length === 0) {
      logAIError({
        operation: 'generateProjectFeatures',
        errorType: 'ValidationError',
        errorMessage: 'AI response must be a non-empty array',
        timestamp: new Date().toISOString(),
      });
      throw new AIValidationError('AI returned invalid feature data', ['Response must be a non-empty array']);
    }

    // Log successful AI operation
    logAISuccess({
      operation: 'generateProjectFeatures',
      timestamp: new Date().toISOString(),
    });

    return parsed.map((f: any) => ({
        title: String(f.title ?? "Untitled Feature"),
        description: String(f.description ?? ""),
        category: String(f.category ?? "general"),
        priority: (["low", "medium", "high"].includes(f.priority)
          ? f.priority
          : "medium") as "low" | "medium" | "high",
      }));
  } catch (err: unknown) {
  console.error("========== RAW GEMINI ERROR ==========");
  console.error(err);
  console.error("======================================");

  const userMessage = handleAIError(err);

  logAIError({
    operation: 'analyzeProjectScope',
    errorType: err instanceof Error ? err.constructor.name : 'Unknown',
    errorMessage: err instanceof Error ? err.message : String(err),
    timestamp: new Date().toISOString(),
  });

  throw new Error(userMessage);
}
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
    const prompt = `You are a Principal Software Architect and Change Impact Analyst responsible for evaluating scope changes in production software systems.

Your job is to perform a precise comparison between two project scopes and identify functional, technical, and delivery impacts.

---

## Input

### Original Scope
${originalScope.map((item) => `- ${item}`).join("\n")}

### Updated Scope
${updatedScope.map((item) => `- ${item}`).join("\n")}

---

## Analysis Rules (CRITICAL)

You must compare scopes using semantic matching, not exact string matching.

### Step 1: Feature Mapping
- Match features even if wording differs
- Detect:
  - renamed features
  - split features
  - merged features
  - removed features
  - newly added features

### Step 2: Change Classification (changeType)
Use ONLY these values:
- "ADDED"
- "REMOVED"
- "MODIFIED"
- "MOVED_SCOPE" (feature exists but significantly redefined)
- "UNCHANGED" (only include if explicitly necessary)

---

### Step 3: Impact Scoring (0–100)

impactScore must follow:

- 0–20 → negligible change (UI tweaks, wording changes)
- 21–40 → small functional adjustment
- 41–60 → moderate backend or logic change
- 61–80 → major architectural or workflow change
- 81–100 → critical system redesign, scalability or data model impact

Impact must consider:
- backend changes
- data model changes
- API changes
- workflow changes
- integration changes

---

### Step 4: Risk Evaluation

Each risk must be:
- directly caused by scope delta
- technically specific (not generic like “delays may happen”)
- tied to system behavior or delivery complexity

Severity values:
- "Low"
- "Medium"
- "High"

---

### Step 5: Recommendations

Must be:
- actionable engineering decisions
- focused on reducing scope risk or complexity
- aligned with real development workflows

Avoid vague advice like “improve planning”

---

## Output Constraints (STRICT)

Return ONLY valid JSON.
No markdown, no explanation, no extra keys.

---

## Output Schema

{
  "featureChanges": [
    {
      "title": "concise feature name",
      "impactScore": 0,
      "changeType": "ADDED | REMOVED | MODIFIED | MOVED_SCOPE | UNCHANGED",
      "explanation": "clear technical explanation of what changed and why it matters"
    }
  ],
  "risks": [
    {
      "title": "short risk title",
      "description": "specific technical or delivery risk tied to scope change",
      "severity": "Low | Medium | High"
    }
  ],
  "recommendations": [
    {
      "title": "action title",
      "description": "clear engineering or planning action",
      "priority": "Low | Medium | High"
    }
  ],
  "report": {
    "reportType": "SCOPE_CHANGE_ANALYSIS",
    "summary": "high-level summary of what changed and overall impact"
  }
}

---

## Final Instruction

Be precise and conservative.
If uncertain, assume higher impact rather than underestimating system complexity.
Ensure all changes are explicitly justified from the input scopes.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
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
      featureChanges: Array.isArray(parsed.featureChanges)
        ? parsed.featureChanges
        : [],
      risks: Array.isArray(parsed.risks) ? parsed.risks : [],
      recommendations: Array.isArray(parsed.recommendations)
        ? parsed.recommendations
        : [],
      report:
        parsed.report && typeof parsed.report === "object"
          ? parsed.report
          : fallbackResult.report,
    };
  } catch (error: any) {
    console.error("========== GEMINI ERROR ==========");
    console.error(error);
    console.error("==================================");

    return fallbackResult;
  }
};
