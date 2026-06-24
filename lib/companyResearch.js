import {
  getCachedCompanyResearch,
  setCachedCompanyResearch,
} from "@/lib/companyCache";
import { callOpenAI } from "@/lib/openai";

export function buildCompanyResearchPrompt(company) {
  return `Research the tech company "${company}" for a software engineering job applicant.

Return valid JSON only with this structure:
{
  "company": "${company}",
  "overview": "2-3 sentences on what the company does",
  "culture": "1-2 sentences on engineering culture and values",
  "techFocus": "1-2 sentences on their tech stack or engineering focus",
  "whyEngineersJoin": "1-2 sentences on why developers want to work there",
  "canadaNotes": "1 sentence on Canadian presence, offices, or market relevance — or 'N/A' if not applicable"
}

Rules:
- Stick to well-known, factual information. If unsure about a detail, keep it general.
- Do NOT invent recent news, funding rounds, or specific metrics.
- Focus on information useful for writing a cover letter or outreach message.
- Keep each field concise.`;
}

export function parseCompanyResearch(content, company) {
  let parsed;

  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("Company research returned invalid JSON.");
  }

  const fields = [
    "overview",
    "culture",
    "techFocus",
    "whyEngineersJoin",
    "canadaNotes",
  ];

  for (const field of fields) {
    if (!parsed[field] || typeof parsed[field] !== "string") {
      throw new Error(`Company research is missing "${field}".`);
    }
  }

  return {
    company: parsed.company || company,
    overview: parsed.overview,
    culture: parsed.culture,
    techFocus: parsed.techFocus,
    whyEngineersJoin: parsed.whyEngineersJoin,
    canadaNotes: parsed.canadaNotes,
    cachedAt: new Date().toISOString(),
  };
}

export function formatCompanyResearchForPrompt(research) {
  if (!research) {
    return "";
  }

  return `Company research (use to personalize — do not invent facts beyond this):
- Overview: ${research.overview}
- Culture: ${research.culture}
- Tech focus: ${research.techFocus}
- Why engineers join: ${research.whyEngineersJoin}
- Canada notes: ${research.canadaNotes}`;
}

export async function getCompanyResearch(openai, company) {
  const cached = await getCachedCompanyResearch(company);
  if (cached) {
    return cached;
  }

  const content = await callOpenAI(openai, [
    {
      role: "system",
      content:
        "You provide concise, factual company research for job applicants. Always respond with valid JSON only.",
    },
    {
      role: "user",
      content: buildCompanyResearchPrompt(company),
    },
  ]);

  const research = parseCompanyResearch(content, company);
  await setCachedCompanyResearch(company, research);
  return research;
}
