import jsPDF from "jspdf";
import type { BucketList } from "../types/bucket-list";

interface StatsData {
  totalPlaces: number;
  highPriority: number;
  countries: number;
}

// ── Sanitize: map special unicode to ASCII, drop the rest ───────────────
function sanitize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip combining diacritics
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'") // smart single quotes
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"') // smart double quotes
    .replace(/[\u2013\u2014\u2015]/g, "-") // en/em dashes
    .replace(/\u2026/g, "...") // ellipsis
    .replace(/\u2022/g, "*") // bullet
    .replace(/\u00B7/g, "*") // middle dot
    .replace(/\u00A0/g, " ") // non-breaking space
    .replace(/[^\x20-\x7E]/g, "") // drop remaining non-ASCII (no ?)
    .trim();
}

// ── Strip HTML/JSX tags and decode common entities ────────────────────────
function stripHtml(text: string): string {
  return text
    .replace(/<[^>]*>/g, " ") // remove all tags
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s{2,}/g, " ") // collapse multiple spaces
    .trim();
}

// ── Load image URL → base64 ────────────────────────────────────────────────
async function loadImageAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

// ── Truncate text to maxWidth pts ──────────────────────────────────────────
function truncate(doc: jsPDF, text: string, maxWidth: number): string {
  if (doc.getTextWidth(text) <= maxWidth) return text;
  let t = text;
  while (t.length > 0 && doc.getTextWidth(t + "...") > maxWidth) {
    t = t.slice(0, -1);
  }
  return t + "...";
}

// ── Priority color ─────────────────────────────────────────────────────────
function priorityColor(p: string): [number, number, number] {
  if (p === "HIGH") return [239, 68, 68];
  if (p === "MEDIUM") return [245, 158, 11];
  if (p === "LOW") return [34, 197, 94];
  return [156, 163, 175];
}

// ── Group & sort by targetYear ─────────────────────────────────────────────
function groupByYear(items: BucketList[]): [string, BucketList[]][] {
  const map = new Map<string, BucketList[]>();
  for (const item of items) {
    const key = item.targetYear ? String(item.targetYear) : "TBD";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  }
  return [...map.entries()].sort(([a], [b]) => {
    if (a === "TBD") return 1;
    if (b === "TBD") return -1;
    return Number(a) - Number(b);
  });
}

// ═══════════════════════════════════════════════════════════════════════════
export async function generateBucketListPdf(
  items: BucketList[],
  stats: StatsData,
  userName?: string,
): Promise<string> {
  const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait" });

  const PAGE_W = 595.28;
  const PAGE_H = 841.89;
  const MARGIN = 36;
  const CONTENT_W = PAGE_W - MARGIN * 2;
  const FOOTER_H = 36;
  const HEADER_H = 44;

  const BLUE: [number, number, number] = [29, 78, 216];
  const PURPLE: [number, number, number] = [109, 40, 217];
  const GRAY_BG: [number, number, number] = [248, 250, 252];
  const GRAY_BD: [number, number, number] = [226, 232, 240];
  const GRAY_TX: [number, number, number] = [100, 116, 139];
  const DARK: [number, number, number] = [15, 23, 42];
  const WHITE: [number, number, number] = [255, 255, 255];

  let cursorY = 0;

  function addContinuationPage() {
    doc.addPage();
    doc.setFillColor(...GRAY_BG);
    doc.rect(0, 0, PAGE_W, HEADER_H, "F");
    doc.setDrawColor(...GRAY_BD);
    doc.setLineWidth(0.5);
    doc.line(0, HEADER_H, PAGE_W, HEADER_H);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...BLUE);
    doc.text("TripVault", MARGIN, 27);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GRAY_TX);
    doc.text(`  ${userName || "My"} Bucket List`, MARGIN + 44, 27);
    cursorY = HEADER_H + 20;
  }

  function ensureSpace(needed: number) {
    if (cursorY + needed > PAGE_H - FOOTER_H - 16) {
      addContinuationPage();
    }
  }

  // ══════════════════════════════════════════════
  // COVER HEADER
  // ══════════════════════════════════════════════
  doc.setFillColor(...BLUE);
  doc.rect(0, 0, PAGE_W, 210, "F");

  doc.setFillColor(...PURPLE);
  // @ts-ignore
  doc.setGState(new doc.GState({ opacity: 0.55 }));
  doc.triangle(PAGE_W * 0.38, 0, PAGE_W, 0, PAGE_W, 210, "F");
  // @ts-ignore
  doc.setGState(new doc.GState({ opacity: 1.0 }));

  doc.setFillColor(...WHITE);
  // @ts-ignore
  doc.setGState(new doc.GState({ opacity: 0.07 }));
  doc.circle(PAGE_W - 55, 35, 90, "F");
  doc.circle(55, 175, 60, "F");
  // @ts-ignore
  doc.setGState(new doc.GState({ opacity: 1.0 }));

  // @ts-ignore
  doc.setGState(new doc.GState({ opacity: 0.18 }));
  doc.setFillColor(...WHITE);
  doc.roundedRect(MARGIN, 24, 34, 34, 17, 17, "F");
  // @ts-ignore
  doc.setGState(new doc.GState({ opacity: 1.0 }));

  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...WHITE);
  doc.text("T", MARGIN + 12, 46);

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(219, 234, 254);
  doc.text("TripVault", MARGIN + 42, 46);

  // Title — hardcoded ASCII, no dynamic string that could have weird chars
  doc.setFontSize(34);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...WHITE);
  const titleText = userName ? `${userName}'s Bucket List` : "My Bucket List";
  doc.text(sanitize(titleText), MARGIN, 116);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(191, 219, 254);
  doc.text("Dream big. Plan well. Travel far.", MARGIN, 140);

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.setFontSize(9);
  doc.setTextColor(147, 197, 253);
  doc.text("Generated on " + today, MARGIN, 164);

  const cntTxt =
    items.length + (items.length !== 1 ? " Destinations" : " Destination");
  const badgeW = doc.getTextWidth(cntTxt) + 22;
  // @ts-ignore
  doc.setGState(new doc.GState({ opacity: 0.2 }));
  doc.setFillColor(...WHITE);
  doc.roundedRect(PAGE_W - MARGIN - badgeW, 24, badgeW, 22, 11, 11, "F");
  // @ts-ignore
  doc.setGState(new doc.GState({ opacity: 1.0 }));
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...WHITE);
  doc.text(cntTxt, PAGE_W - MARGIN - badgeW / 2, 39, { align: "center" });

  // ══════════════════════════════════════════════
  // STATS CARDS
  // ══════════════════════════════════════════════
  const STATS_Y = 228;
  const STAT_W = (CONTENT_W - 20) / 3;

  const statsConf: {
    label: string;
    value: number;
    color: [number, number, number];
    bg: [number, number, number];
  }[] = [
    {
      label: "Total Places",
      value: stats.totalPlaces,
      color: [14, 165, 233],
      bg: [240, 249, 255],
    },
    {
      label: "High Priority",
      value: stats.highPriority,
      color: [249, 115, 22],
      bg: [255, 247, 237],
    },
    {
      label: "Countries",
      value: stats.countries,
      color: [124, 58, 237],
      bg: [245, 243, 255],
    },
  ];

  statsConf.forEach((s, i) => {
    const x = MARGIN + i * (STAT_W + 10);
    doc.setFillColor(...s.bg);
    doc.setDrawColor(...GRAY_BD);
    doc.setLineWidth(0.5);
    doc.roundedRect(x, STATS_Y, STAT_W, 76, 8, 8, "FD");
    doc.setFillColor(...s.color);
    doc.roundedRect(x, STATS_Y, STAT_W, 4, 2, 2, "F");
    doc.setFontSize(26);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...s.color);
    doc.text(String(s.value), x + STAT_W / 2, STATS_Y + 36, {
      align: "center",
    });
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GRAY_TX);
    doc.text(s.label, x + STAT_W / 2, STATS_Y + 56, { align: "center" });
  });

  // ══════════════════════════════════════════════
  // YEAR-GROUPED CARDS
  // ══════════════════════════════════════════════
  cursorY = STATS_Y + 76 + 30;

  const grouped = groupByYear(items);
  const CARD_H = 130;
  const CARD_GAP = 10;
  const IMG_W = 100;
  const IMG_H = 106;

  for (const [year, yearItems] of grouped) {
    ensureSpace(32 + CARD_H + CARD_GAP);

    // Year pill
    const yearLabel =
      year === "TBD" ? "Target Year: TBD" : "Target Year: " + year;
    const pillW = doc.getTextWidth(yearLabel) + 35;

    doc.setFillColor(...BLUE);
    doc.roundedRect(MARGIN, cursorY, pillW, 24, 12, 12, "F");
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...WHITE);
    doc.text(yearLabel, MARGIN + 8, cursorY + 16);

    doc.setDrawColor(...GRAY_BD);
    doc.setLineWidth(0.8);
    doc.line(
      MARGIN + pillW + 10,
      cursorY + 12,
      MARGIN + CONTENT_W,
      cursorY + 12,
    );

    const cnt = yearItems.length;
    const cntLabel = cnt + (cnt > 1 ? " places" : " place");
    const cntW = doc.getTextWidth(cntLabel) + 16;
    doc.setFillColor(...GRAY_BG);
    doc.setDrawColor(...GRAY_BD);
    doc.setLineWidth(0.5);
    doc.roundedRect(MARGIN + pillW + 16, cursorY + 4, cntW, 16, 8, 8, "FD");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...GRAY_TX);
    doc.text(cntLabel, MARGIN + pillW + 16 + cntW / 2, cursorY + 15, {
      align: "center",
    });

    cursorY += 34;

    for (const item of yearItems) {
      ensureSpace(CARD_H + CARD_GAP);

      const vault = item.vault;
      const cx = MARGIN;
      const cy = cursorY;

      // Shadow
      // @ts-ignore
      doc.setGState(new doc.GState({ opacity: 0.15 }));
      doc.setFillColor(180, 195, 220);
      doc.roundedRect(cx + 2, cy + 3, CONTENT_W, CARD_H, 8, 8, "F");
      // @ts-ignore
      doc.setGState(new doc.GState({ opacity: 1.0 }));

      // Card bg
      doc.setFillColor(...WHITE);
      doc.setDrawColor(...GRAY_BD);
      doc.setLineWidth(0.5);
      doc.roundedRect(cx, cy, CONTENT_W, CARD_H, 8, 8, "FD");

      // Priority left bar
      const pc = priorityColor(item.priority);
      doc.setFillColor(...pc);
      doc.roundedRect(cx, cy, 5, CARD_H, 2, 2, "F");

      // ── Thumbnail ───────────────────────────────────────────────────
      const imgX = cx + 16;
      const imgY = cy + (CARD_H - IMG_H) / 2;

      const imgAttachment = vault.attachments?.find(
        (a: any) => a.type === "image",
      );
      let imageDrawn = false;

      if (imgAttachment?.url) {
        const b64 = await loadImageAsBase64(imgAttachment.url);
        if (b64) {
          doc.setFillColor(...GRAY_BG);
          doc.roundedRect(imgX, imgY, IMG_W, IMG_H, 6, 6, "F");
          try {
            doc.addImage(
              b64,
              "JPEG",
              imgX,
              imgY,
              IMG_W,
              IMG_H,
              undefined,
              "MEDIUM",
            );
            imageDrawn = true;
          } catch {
            /* fall through */
          }
        }
      }

      if (!imageDrawn) {
        doc.setFillColor(224, 231, 255);
        doc.roundedRect(imgX, imgY, IMG_W, IMG_H, 6, 6, "F");
        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(99, 102, 241);
        doc.text("No Image", imgX + IMG_W / 2, imgY + IMG_H / 2 + 5, {
          align: "center",
        });
      }

      // ── Text ─────────────────────────────────────────────────────────
      const tx = imgX + IMG_W + 16;
      const textW = CONTENT_W - IMG_W - 56;

      // Title — sanitize prevents garbled text
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...DARK);
      const title = sanitize(
        truncate(doc, vault.title || "Unknown Place", textW - 30),
      );
      doc.text(title, tx, cy + 23);

      // Location
      const rawLoc = vault.location?.label
        ? (vault.location.label.split(",").pop()?.trim() ??
          vault.location.label)
        : "Unknown Location";
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...GRAY_TX);
      doc.text("Location: " + sanitize(rawLoc), tx, cy + 44);

      // Description — strip HTML/JSX, wrap into multiple lines (no truncation)
      const desc: string | undefined = (vault as any).description;
      if (desc) {
        const cleanDesc = sanitize(stripHtml(desc));
        if (cleanDesc.length > 0) {
          doc.setFontSize(9);
          doc.setFont("helvetica", "italic");
          doc.setTextColor(148, 163, 184);
          // Split into wrapped lines manually
          const words = cleanDesc.split(" ");
          const lines: string[] = [];
          let currentLine = "";
          for (const word of words) {
            const test = currentLine ? currentLine + " " + word : word;
            if (doc.getTextWidth(test) <= textW) {
              currentLine = test;
            } else {
              if (currentLine) lines.push(currentLine);
              currentLine = word;
            }
          }
          if (currentLine) lines.push(currentLine);
          // Render up to 3 lines starting at cy+60
          const maxLines = 3;
          const lineH = 13;
          lines.slice(0, maxLines).forEach((line, li) => {
            doc.text(line, tx, cy + 60 + li * lineH);
          });
        }
      }

      // ── Chips ────────────────────────────────────────────────────────
      // IMPORTANT: set font BEFORE getTextWidth so measurements are correct
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");

      const CHIP_H = 16;
      const CHIP_PAD = 16;
      // Place chips below description lines; min at CARD_H-24
      const chipY = cy + CARD_H - 24;
      let chipX = tx;

      const prioLabel =
        item.priority.charAt(0) + item.priority.slice(1).toLowerCase();
      const prioTextW = doc.getTextWidth(prioLabel);
      const prioW = prioTextW + CHIP_PAD;
      // @ts-ignore
      doc.setGState(new doc.GState({ opacity: 0.15 }));
      doc.setFillColor(...pc);
      doc.roundedRect(chipX, chipY, prioW, CHIP_H, 4, 4, "F");
      // @ts-ignore
      doc.setGState(new doc.GState({ opacity: 1.0 }));
      doc.setTextColor(...pc);
      // Draw text at left-pad offset, not centered (avoids centering math errors)
      doc.text(prioLabel, chipX + CHIP_PAD / 2, chipY + 11);
      chipX += prioW + 8;

      if (item.targetYear) {
        const yrLabel = String(item.targetYear);
        const yrTextW = doc.getTextWidth(yrLabel);
        const yrW = yrTextW + CHIP_PAD;
        doc.setFillColor(238, 242, 255);
        doc.roundedRect(chipX, chipY, yrW, CHIP_H, 4, 4, "F");
        doc.setTextColor(...BLUE);
        doc.text(yrLabel, chipX + CHIP_PAD / 2, chipY + 11);
      }

      cursorY += CARD_H + CARD_GAP;
    }

    cursorY += 16;
  }

  // ══════════════════════════════════════════════
  // FOOTER — all pages
  // ══════════════════════════════════════════════
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFillColor(...GRAY_BG);
    doc.rect(0, PAGE_H - FOOTER_H, PAGE_W, FOOTER_H, "F");
    doc.setDrawColor(...GRAY_BD);
    doc.setLineWidth(0.4);
    doc.line(0, PAGE_H - FOOTER_H, PAGE_W, PAGE_H - FOOTER_H);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...BLUE);
    doc.text("TripVault", MARGIN, PAGE_H - 12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GRAY_TX);
    doc.text("  Your Travel Companion", MARGIN + 44, PAGE_H - 12);
    doc.text("Page " + p + " of " + totalPages, PAGE_W - MARGIN, PAGE_H - 12, {
      align: "right",
    });
  }

  return doc.output("datauristring");
}
