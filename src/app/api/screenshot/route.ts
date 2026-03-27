import { NextResponse } from "next/server";
import { chromium } from "playwright";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let browser;

  try {
    const body = await req.json();
    const url = body?.url;
    const marked = Boolean(body?.marked);

    if (!url) {
      return NextResponse.json(
        { error: "Missing url" },
        { status: 400 }
      );
    }

    browser = await chromium.launch({
      headless: true,
    });

    const page = await browser.newPage({
      viewport: { width: 1440, height: 1024 },
      deviceScaleFactor: 1,
    });

    await page.goto(url, {
      waitUntil: "networkidle",
      timeout: 45000,
    });

    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });

    await page.waitForTimeout(1500);

    if (marked) {
      await page.evaluate(() => {
        const markers = [
          { top: 360, left: 800, label: "01" },
          { top: 570, left: 1320, label: "02" },
        ];

        markers.forEach((marker) => {
          const dot = document.createElement("div");
          dot.innerText = marker.label;
          dot.style.position = "absolute";
          dot.style.top = `${marker.top}px`;
          dot.style.left = `${marker.left}px`;
          dot.style.width = "44px";
          dot.style.height = "44px";
          dot.style.borderRadius = "9999px";
          dot.style.background = "#E5484D";
          dot.style.color = "#FFFFFF";
          dot.style.display = "flex";
          dot.style.alignItems = "center";
          dot.style.justifyContent = "center";
          dot.style.fontSize = "18px";
          dot.style.fontWeight = "700";
          dot.style.zIndex = "999999";
          dot.style.boxShadow = "0 8px 24px rgba(229,72,77,0.35)";
          document.body.appendChild(dot);
        });
      });

      await page.waitForTimeout(300);
    }

    const buffer = await page.screenshot({
      fullPage: true,
      type: "png",
    });

    const base64 = `data:image/png;base64,${buffer.toString("base64")}`;

    return NextResponse.json({ image: base64 });
  } catch (error) {
    console.error("Screenshot API error:", error);

    return NextResponse.json(
      { error: "Failed to generate screenshot" },
      { status: 500 }
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}