import OpenAI from "openai";
import { NextResponse } from "next/server";
import { buildApplicationPrompt } from "@/lib/prompts";

const REQUIRED_FIELDS = [
  "resume",
  "jobDescription",
  "company",
  "jobTitle",
  "yearsExperience",
  "tone",
];

const OUTPUT_FIELDS = [
  "coverLetter250",
  "coverLetter400",
  "recruiterEmail",
  "linkedinMessage",
  "atsVersion",
];

function validateInput(body) {
  const missing = [];

  for (const field of REQUIRED_FIELDS) {
    const value = body[field];
    if (value === undefined || value === null || String(value).trim() === "") {
      missing.push(field);
    }
  }

  if (missing.length > 0) {
    return `Missing required fields: ${missing.join(", ")}`;
  }

  return null;
}

function parseGeneratedContent(content) {
  let parsed;

  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("OpenAI returned invalid JSON. Please try again.");
  }

  for (const field of OUTPUT_FIELDS) {
    if (!parsed[field] || typeof parsed[field] !== "string") {
      throw new Error(`OpenAI response is missing "${field}". Please try again.`);
    }
  }

  return {
    coverLetter250: parsed.coverLetter250,
    coverLetter400: parsed.coverLetter400,
    recruiterEmail: parsed.recruiterEmail,
    linkedinMessage: parsed.linkedinMessage,
    atsVersion: parsed.atsVersion,
  };
}

function getOpenAIErrorMessage(error) {
  if (error.status === 429) {
    return "Your OpenAI account has no remaining quota. Add billing or credits at platform.openai.com/account/billing, then try again.";
  }
  if (error.status === 401) {
    return "Invalid OpenAI API key. Check OPENAI_API_KEY in .env.local and restart the dev server.";
  }
  if (error.status === 403) {
    return "OpenAI access denied for this API key. Verify the key is active and has permission to use the API.";
  }
  return error.message || "OpenAI request failed. Please try again later.";
}

export async function POST(request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Server is missing OPENAI_API_KEY. Add it to .env.local." },
        { status: 500 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body." },
        { status: 400 }
      );
    }

    const validationError = validateInput(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const { resume, jobDescription, company, jobTitle, yearsExperience, tone } =
      body;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a helpful career assistant for early-career software engineers. Always respond with valid JSON only.",
        },
        {
          role: "user",
          content: buildApplicationPrompt({
            resume,
            jobDescription,
            company,
            jobTitle,
            yearsExperience,
            tone,
          }),
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "OpenAI returned an empty response. Please try again." },
        { status: 502 }
      );
    }

    const result = parseGeneratedContent(content);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Generate API error:", error);

    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: getOpenAIErrorMessage(error) },
        { status: error.status || 502 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
