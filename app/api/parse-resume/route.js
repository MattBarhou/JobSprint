import { NextResponse } from "next/server";
import { extractText, getDocumentProxy } from "unpdf";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

function normalizeResumeText(text) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are supported." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File must be 5 MB or smaller." },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "The file is empty." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocumentProxy(new Uint8Array(arrayBuffer));
    const { totalPages, text } = await extractText(pdf, { mergePages: true });
    const normalized = normalizeResumeText(text);

    if (!normalized) {
      return NextResponse.json(
        {
          error:
            "No text found in this PDF. It may be a scanned image — paste your resume instead.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      text: normalized,
      fileName: file.name,
      pageCount: totalPages,
    });
  } catch (error) {
    console.error("Parse resume error:", error);
    return NextResponse.json(
      {
        error:
          "Could not read this PDF. Try a different file or paste your resume.",
      },
      { status: 500 }
    );
  }
}
