import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

function cleanText(input: string) {
  return String(input || "")
    .replace(/\r/g, "")
    .replace(/\t/g, "  ")
    .trim();
}

function splitIntoLines(text: string, maxChars = 95) {
  const paragraphs = cleanText(text).split("\n");
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      lines.push("");
      continue;
    }

    const words = paragraph.split(/\s+/);
    let current = "";

    for (const word of words) {
      const next = current ? `${current} ${word}` : word;
      if (next.length > maxChars) {
        if (current) lines.push(current);
        current = word;
      } else {
        current = next;
      }
    }

    if (current) lines.push(current);
  }

  return lines;
}

export async function generateAuditPdfBuffer({
  auditId,
  fullName,
  productUrl,
  auditContent,
}: {
  auditId: string;
  fullName?: string | null;
  productUrl?: string | null;
  auditContent: string;
}) {
  const pdfDoc = await PDFDocument.create();

  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 48;
  const fontSize = 11;
  const lineHeight = 18;

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  function newPage() {
    page = pdfDoc.addPage([pageWidth, pageHeight]);
    y = pageHeight - margin;
  }

  function drawLine(
    text: string,
    opts?: {
      bold?: boolean;
      size?: number;
      color?: ReturnType<typeof rgb>;
      gapAfter?: number;
    }
  ) {
    const size = opts?.size ?? fontSize;
    const font = opts?.bold ? fontBold : fontRegular;
    const color = opts?.color ?? rgb(0.07, 0.07, 0.07);

    if (y < margin + size + 8) {
      newPage();
    }

    page.drawText(text, {
      x: margin,
      y,
      size,
      font,
      color,
      maxWidth: pageWidth - margin * 2,
    });

    y -= opts?.gapAfter ?? lineHeight;
  }

  const title = `Elessen Audit Report`;
  const subtitle = fullName ? `Prepared for ${fullName}` : "Prepared by Elessen Labs";

  drawLine(title, {
    bold: true,
    size: 22,
    color: rgb(1, 0.48, 0),
    gapAfter: 28,
  });

  drawLine(subtitle, { bold: true, size: 13, gapAfter: 20 });

  if (productUrl) {
    drawLine(`Product: ${productUrl}`, { gapAfter: 16 });
  }

  drawLine(`Audit ID: ${auditId}`, { gapAfter: 10 });
  drawLine(`Generated: ${new Date().toISOString()}`, { gapAfter: 24 });

  drawLine("Audit Findings", {
    bold: true,
    size: 15,
    gapAfter: 20,
  });

  const rawLines = splitIntoLines(auditContent, 95);

  for (const rawLine of rawLines) {
    const line = rawLine.trim();

    if (!line) {
      y -= 8;
      continue;
    }

    if (line.startsWith("## ")) {
      y -= 6;
      drawLine(line.replace(/^##\s+/, ""), {
        bold: true,
        size: 14,
        color: rgb(0.12, 0.12, 0.12),
        gapAfter: 18,
      });
      continue;
    }

    if (line.startsWith("- ") || line.startsWith("• ")) {
      drawLine(`• ${line.replace(/^(-|•)\s+/, "")}`, { gapAfter: 16 });
      continue;
    }

    drawLine(line, { gapAfter: 16 });
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}