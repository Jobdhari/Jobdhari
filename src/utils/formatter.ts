// /src/utils/formatter.ts
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";

/**
 * Extract text from supported resume file formats
 */
export async function extractText(file: File): Promise<string> {
  const type = file.type;

  if (type === "application/pdf") {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((it: any) => it.str).join(" ") + "\n";
    }
    return text;
  }

  if (
    type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const arrayBuffer = await file.arrayBuffer();
    const { value } = await mammoth.extractRawText({ arrayBuffer });
    return value;
  }

  throw new Error("Unsupported file type");
}

/**
 * Normalize resume content to a clean JobDhari layout
 */
export function formatResume(rawText: string): string {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l);

  const formatted = lines
    .map((line) => {
      if (/experience/i.test(line)) return "\n🧑‍💼 Experience";
      if (/education/i.test(line)) return "\n🎓 Education";
      if (/skills?/i.test(line)) return "\n🧠 Skills";
      return line;
    })
    .join("\n");

  return formatted;
}
