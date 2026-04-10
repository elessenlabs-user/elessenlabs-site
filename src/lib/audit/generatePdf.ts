import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs/promises";
import path from "path";

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

async function fetchImageBytes(url: string) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch image: ${url}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

async function loadLogoBytes() {
  const logoPath = path.join(process.cwd(), "public", "logo.png");
  return fs.readFile(logoPath);
}

export async function generateAuditPdfBuffer({
  auditId,
  fullName,
  productUrl,
  auditContent,
  pages = [],
}: {
  auditId: string;
  fullName?: string | null;
  productUrl?: string | null;
  auditContent: string;
  pages?: Array<{
    url?: string;
    screenshot_url?: string | null;
    marked_screenshot_url?: string | null;
    evidence?: Array<{
      marker?: number;
      crop_url?: string | null;
      issue?: string;
      evidence?: string;
      fix?: string;
    }>;
  }>;
}) {
  const pdfDoc = await PDFDocument.create();

  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 48;
  const fontSize = 11;
  const lineHeight = 18;
  const contentWidth = pageWidth - margin * 2;

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
      maxWidth: contentWidth,
    });

    y -= opts?.gapAfter ?? lineHeight;
  }

  async function drawLogo() {
    try {
      const logoBytes = await loadLogoBytes();
      const logoImage = await pdfDoc.embedPng(logoBytes);
      const dims = logoImage.scale(0.22);

      page.drawImage(logoImage, {
        x: margin,
        y: y - dims.height,
        width: dims.width,
        height: dims.height,
      });

      y -= dims.height + 18;
    } catch (err) {
      console.error("PDF LOGO LOAD ERROR:", err);
    }
  }

  async function drawRemoteImagePage(imageUrl: string, heading?: string) {
    try {
      const imageBytes = await fetchImageBytes(imageUrl);

      let embeddedImage;
      try {
        embeddedImage = await pdfDoc.embedPng(imageBytes);
      } catch {
        embeddedImage = await pdfDoc.embedJpg(imageBytes);
      }

      const imgWidth = embeddedImage.width;
      const imgHeight = embeddedImage.height;

      newPage();

      if (heading) {
        drawLine(heading, {
          bold: true,
          size: 16,
          color: rgb(0.12, 0.12, 0.12),
          gapAfter: 20,
        });
      }

      const maxWidth = contentWidth;
      const maxHeight = pageHeight - 180;

      const widthScale = maxWidth / imgWidth;
      const heightScale = maxHeight / imgHeight;
      const scale = Math.min(widthScale, heightScale);

      const drawWidth = imgWidth * scale;
      const drawHeight = imgHeight * scale;

      page.drawImage(embeddedImage, {
        x: margin,
        y: y - drawHeight,
        width: drawWidth,
        height: drawHeight,
      });

      y -= drawHeight + 24;
    } catch (err) {
      console.error("PDF IMAGE EMBED ERROR:", imageUrl, err);
    }
  }

  await drawLogo();

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

  // Add screenshot pages after text content
  for (let i = 0; i < pages.length; i++) {
    const item = pages[i];

    if (item.marked_screenshot_url) {
      await drawRemoteImagePage(
        item.marked_screenshot_url,
        `Annotated Screenshot${item.url ? ` — ${item.url}` : ""}`
      );
    } else if (item.screenshot_url) {
      await drawRemoteImagePage(
        item.screenshot_url,
        `Screenshot${item.url ? ` — ${item.url}` : ""}`
      );
    }

    if (Array.isArray(item.evidence)) {
      for (let j = 0; j < item.evidence.length; j++) {
        const evidence = item.evidence[j];
        if (evidence.crop_url) {
          await drawRemoteImagePage(
            evidence.crop_url,
            `UI Evidence ${evidence.marker || j + 1}`
          );
        }
      }
    }
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}