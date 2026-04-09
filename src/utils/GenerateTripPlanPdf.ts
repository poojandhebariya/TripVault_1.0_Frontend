import jsPDF from "jspdf";
import type { TripPlan } from "../types/trip";
import type { Place } from "../types/explore";

// ── Helpers ───────────────────────────────────────────────────────────────────
function sanitize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u2013\u2014\u2015]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/\u00A0/g, " ")
    .replace(/[^\x20-\x7E]/g, "")
    .trim();
}

// Word-wrap to maxW pts, returns lines
function wrap(doc: jsPDF, text: string, maxW: number): string[] {
  if (!text) return [];
  const words = sanitize(text).split(" ").filter(Boolean);
  const lines: string[] = [];
  let cur = "";
  for (const word of words) {
    const test = cur ? `${cur} ${word}` : word;
    if (doc.getTextWidth(test) <= maxW) {
      cur = test;
    } else {
      if (cur) lines.push(cur);
      cur = word;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

// Draw rounded rect; style "F" fill only, "FD" fill+stroke
function rRect(
  doc: jsPDF,
  x: number, y: number, w: number, h: number,
  fill: [number, number, number],
  stroke?: [number, number, number],
  r = 4
) {
  doc.setFillColor(...fill);
  if (stroke) {
    doc.setDrawColor(...stroke);
    doc.setLineWidth(0.4);
    doc.roundedRect(x, y, w, h, r, r, "FD");
  } else {
    doc.roundedRect(x, y, w, h, r, r, "F");
  }
}

// ─────────────────────────────────────────────────────────────────────────────
export async function generateTripPlanPdf(
  plan: TripPlan,
  place: Place
): Promise<string> {

  const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait" });

  // ── Page geometry ────────────────────────────────────────────────────────
  const PW = 595.28;   // page width
  const PH = 841.89;   // page height
  const M  = 38;       // left/right margin
  const CW = PW - M * 2;
  const FH = 30;       // footer height

  // ── Font metrics (jsPDF baseline = given Y) ───────────────────────────────
  //  FS_*  = font size in pts
  //  LH_*  = line height (advance after drawing one line)
  const FS_BODY  = 9;   const LH_BODY  = 13;
  const FS_SMALL = 8;   const LH_SMALL = 12;
  const FS_LABEL = 7.5; const LH_LABEL = 11;
  const FS_NAME  = 11;  const LH_NAME  = 15;
  const FS_META  = 8;   const LH_META  = 12;

  // ── Palette ──────────────────────────────────────────────────────────────
  const INDIGO:  [number,number,number] = [79,  70,  229];
  const VIOLET:  [number,number,number] = [109, 40,  217];
  const AMBER:   [number,number,number] = [180, 83,  9];
  const GREEN:   [number,number,number] = [22,  163, 74];
  const GBG:     [number,number,number] = [248, 250, 252];  // gray bg
  const GBD:     [number,number,number] = [215, 222, 234];  // gray border
  const GTX:     [number,number,number] = [100, 116, 139];  // gray text
  const DARK:    [number,number,number] = [15,  23,  42];
  const WHITE:   [number,number,number] = [255, 255, 255];
  const I_LIGHT: [number,number,number] = [238, 242, 255];  // indigo bg
  const A_LIGHT: [number,number,number] = [255, 251, 235];  // amber bg
  const A_BD:    [number,number,number] = [253, 230, 138];  // amber border
  const I_TXT:   [number,number,number] = [55,  48,  163];  // indigo dark text
  const A_TXT:   [number,number,number] = [146, 64,  14];   // amber dark text

  // ── Cursor ───────────────────────────────────────────────────────────────
  let y = 0;

  function addPage() {
    doc.addPage();
    // Thin header bar
    doc.setFillColor(...GBG);
    doc.rect(0, 0, PW, 34, "F");
    doc.setDrawColor(...GBD);
    doc.setLineWidth(0.4);
    doc.line(0, 34, PW, 34);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...INDIGO);
    doc.text("TripVault", M, 22);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GTX);
    doc.text(`  AI Trip Plan — ${sanitize(plan.destination)}`, M + 37, 22);
    y = 34 + 18;
  }

  // Ensure `needed` pts are available; if not, start a new page
  function need(needed: number) {
    if (y + needed > PH - FH - 10) addPage();
  }

  // ══════════════════════════════════════════════════════════════════════════
  // COVER
  // ══════════════════════════════════════════════════════════════════════════
  const COVER_H = 192;
  doc.setFillColor(...INDIGO);
  doc.rect(0, 0, PW, COVER_H, "F");

  // Violet diagonal
  doc.setFillColor(...VIOLET);
  // @ts-ignore
  doc.setGState(new doc.GState({ opacity: 0.42 }));
  doc.triangle(PW * 0.42, 0, PW, 0, PW, COVER_H, "F");
  // @ts-ignore
  doc.setGState(new doc.GState({ opacity: 1.0 }));

  // Decorative circles
  // @ts-ignore
  doc.setGState(new doc.GState({ opacity: 0.06 }));
  doc.setFillColor(...WHITE);
  doc.circle(PW - 55, 38, 80, "F");
  doc.circle(48, COVER_H - 28, 55, "F");
  // @ts-ignore
  doc.setGState(new doc.GState({ opacity: 1.0 }));

  // Branding
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(199, 210, 254);
  doc.text("TripVault  ·  AI Trip Planner", M, 28);

  // Destination title
  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...WHITE);
  doc.text(sanitize(plan.destination), M, 82);

  // Location
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(199, 210, 254);
  doc.text(sanitize(`${place.location}, ${place.country}`), M, 100);

  // Date
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
  doc.setFontSize(8);
  doc.setTextColor(165, 180, 252);
  doc.text(`Generated on ${today}`, M, 118);

  // Days badge
  const dLabel = `${plan.days.length} Day${plan.days.length > 1 ? "s" : ""}`;
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  const dW = doc.getTextWidth(dLabel) + 18;
  // @ts-ignore
  doc.setGState(new doc.GState({ opacity: 0.2 }));
  doc.setFillColor(...WHITE);
  doc.roundedRect(PW - M - dW, 12, dW, 18, 9, 9, "F");
  // @ts-ignore
  doc.setGState(new doc.GState({ opacity: 1.0 }));
  doc.setTextColor(...WHITE);
  doc.text(dLabel, PW - M - dW / 2, 25, { align: "center" });

  // ══════════════════════════════════════════════════════════════════════════
  // STATS STRIP
  // ══════════════════════════════════════════════════════════════════════════
  const GAP4 = 4; // gap between stat cards
  const SW = (CW - GAP4 * 3) / 4;  // stat card width

  const statsConf = [
    { label: "Duration",    val: `${plan.days.length} day${plan.days.length > 1 ? "s" : ""}`, c: INDIGO, bg: I_LIGHT },
    { label: "Est. Budget", val: sanitize(plan.estimatedBudget ?? "Varies"), c: GREEN,  bg: [240,253,244] as [number,number,number] },
    { label: "Best Season", val: sanitize(plan.bestSeason ?? "Year-round"),  c: AMBER,  bg: A_LIGHT },
    { label: "Pace",        val: sanitize(plan.pace ?? "Moderate"),          c: VIOLET, bg: [245,243,255] as [number,number,number] },
  ];

  // Measure tallest stat card
  doc.setFontSize(FS_BODY);
  doc.setFont("helvetica", "bold");
  let maxSH = 0;
  const statWraps = statsConf.map(s => {
    const lines = wrap(doc, s.val, SW - 16);
    const h = 10 + lines.length * LH_BODY + 4 + LH_SMALL + 8;
    if (h > maxSH) maxSH = h;
    return lines;
  });

  const SY = COVER_H + 18;
  statsConf.forEach((s, i) => {
    const sx = M + i * (SW + GAP4);
    rRect(doc, sx, SY, SW, maxSH, s.bg, GBD, 5);
    // top color bar
    doc.setFillColor(...s.c);
    doc.roundedRect(sx, SY, SW, 3, 1, 1, "F");

    // Value lines
    doc.setFontSize(FS_BODY);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...s.c);
    statWraps[i].forEach((ln, li) => {
      doc.text(ln, sx + SW / 2, SY + 10 + LH_BODY + li * LH_BODY, { align: "center" });
    });

    // Label
    doc.setFontSize(FS_SMALL);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GTX);
    doc.text(s.label, sx + SW / 2, SY + maxSH - 6, { align: "center" });
  });

  y = SY + maxSH + 26;

  // ══════════════════════════════════════════════════════════════════════════
  // HELPER: draw a sub-block (history or tip) inside an activity
  // Returns the height consumed (box height + gap_after).
  // ══════════════════════════════════════════════════════════════════════════
  function subBlock(
    by: number,          // top-left Y of this sub-block
    lines: string[],
    headerLabel: string,
    bgColor: [number,number,number],
    borderColor: [number,number,number] | undefined,
    headerColor: [number,number,number],
    txtColor: [number,number,number],
  ): number {
    // Heights:
    //  Padding top    = 8
    //  Header label   = LH_LABEL
    //  Content lines  = lines.length * LH_BODY
    //  Padding bottom = 7
    const boxH = 8 + LH_LABEL + lines.length * LH_BODY + 7;
    rRect(doc, M + 10, by, CW - 10, boxH, bgColor, borderColor, 4);

    // Left accent bar
    doc.setFillColor(...headerColor);
    doc.roundedRect(M + 10, by, 3, boxH, 1, 1, "F");

    // Header label
    doc.setFontSize(FS_LABEL);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...headerColor);
    doc.text(headerLabel, M + 18, by + 8 + LH_LABEL - 2);  // baseline inside

    // Content
    doc.setFontSize(FS_BODY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...txtColor);
    lines.forEach((ln, i) => {
      doc.text(ln, M + 18, by + 8 + LH_LABEL + (i + 1) * LH_BODY - 1);
    });

    return boxH + 5; // height consumed including gap after
  }

  // ══════════════════════════════════════════════════════════════════════════
  // DAY CARDS
  // ══════════════════════════════════════════════════════════════════════════
  for (const day of plan.days) {

    // Day heading
    need(34);
    doc.setFillColor(...INDIGO);
    doc.roundedRect(M, y, 36, 18, 9, 9, "F");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...WHITE);
    doc.text(`DAY ${day.day}`, M + 18, y + 12, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK);
    doc.text(sanitize(day.theme), M + 44, y + 12);
    y += 22;

    // Rule
    doc.setDrawColor(...GBD);
    doc.setLineWidth(0.5);
    doc.line(M, y, M + CW, y);
    y += 10;

    // ── Activities ──────────────────────────────────────────────────────────
    for (const act of day.activities) {

      const timeKey = (act.timeOfDay ?? "morning").toLowerCase();
      let timeColor: [number,number,number] = [180,83,9];
      if (timeKey === "afternoon") timeColor = [194,65,12];
      if (timeKey === "evening")   timeColor = VIOLET;
      if (timeKey === "night")     timeColor = INDIGO;

      // Pre-wrap all text
      doc.setFontSize(FS_BODY);
      doc.setFont("helvetica", "normal");
      const descLines = wrap(doc, act.description, CW - 22);
      const histLines = act.history ? wrap(doc, act.history, CW - 30) : [];
      const tipLines  = act.tip     ? wrap(doc, act.tip,     CW - 30) : [];

      // ── Calculate exact box height ──────────────────────────────────────
      //   Top pad          : PAD_T = 10
      //   Name row         : LH_NAME
      //   Meta row         : LH_META + 4 (gap after)
      //   Desc lines       : descLines.length * LH_BODY
      //   History sub-block: if present → 6 (gap before) + boxH + 5 (gap after)
      //     where boxH = 8 + LH_LABEL + histLines.length * LH_BODY + 7
      //   Tip sub-block    : same formula
      //   Bottom pad       : 10
      const PAD_T = 10; const PAD_B = 10;
      const histSubH = histLines.length > 0
        ? 6 + (8 + LH_LABEL + histLines.length * LH_BODY + 7) + 5
        : 0;
      const tipSubH  = tipLines.length > 0
        ? 5 + (8 + LH_LABEL + tipLines.length  * LH_BODY + 7) + 5
        : 0;

      const BLOCK_H =
        PAD_T +
        LH_NAME +
        LH_META + 4 +
        descLines.length * LH_BODY +
        histSubH +
        tipSubH +
        PAD_B;

      need(BLOCK_H + 6);

      // ── Draw block background ───────────────────────────────────────────
      rRect(doc, M, y, CW, BLOCK_H, WHITE, GBD, 5);

      // Left accent bar
      doc.setFillColor(...timeColor);
      doc.roundedRect(M, y, 3, BLOCK_H, 1, 1, "F");

      let by = y + PAD_T; // internal cursor

      // ── Name ─────────────────────────────────────────────────────────────
      doc.setFontSize(FS_NAME);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...DARK);
      const nameStr = sanitize(act.name);
      doc.text(nameStr, M + 12, by + LH_NAME - 3); // baseline near bottom of row
      // Must See inline badge
      if (act.mustSee) {
        const nx = M + 12 + doc.getTextWidth(nameStr) + 8;
        const mLabel = "MUST SEE";
        doc.setFontSize(FS_LABEL);
        doc.setFont("helvetica", "bold");
        const mW = doc.getTextWidth(mLabel) + 10;
        rRect(doc, nx, by + 2, mW, 12, A_LIGHT, A_BD, 3);
        doc.setTextColor(...AMBER);
        doc.text(mLabel, nx + 5, by + 11);
      }
      by += LH_NAME;

      // ── Meta ─────────────────────────────────────────────────────────────
      doc.setFontSize(FS_META);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...timeColor);
      let mx = M + 12;
      const tCap = (act.timeOfDay ?? "Morning").charAt(0).toUpperCase() +
                   (act.timeOfDay ?? "Morning").slice(1);
      doc.text(sanitize(tCap), mx, by + LH_META - 2);
      mx += doc.getTextWidth(sanitize(tCap)) + 5;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...GTX);
      if (act.duration) {
        const dur = "·  " + sanitize(act.duration);
        doc.text(dur, mx, by + LH_META - 2);
        mx += doc.getTextWidth(dur) + 5;
      }
      if (act.entryFee) {
        doc.text("·  Entry: " + sanitize(act.entryFee), mx, by + LH_META - 2);
      }
      by += LH_META + 4;

      // ── Description ──────────────────────────────────────────────────────
      doc.setFontSize(FS_BODY);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(51, 65, 85);
      descLines.forEach(ln => {
        doc.text(ln, M + 12, by + LH_BODY - 2);
        by += LH_BODY;
      });

      // ── History sub-block ────────────────────────────────────────────────
      if (histLines.length > 0) {
        by += 6;
        by += subBlock(by, histLines, "HISTORY", I_LIGHT, undefined, INDIGO, I_TXT);
      }

      // ── Tip sub-block ─────────────────────────────────────────────────────
      if (tipLines.length > 0) {
        by += 5;
        by += subBlock(by, tipLines, "TIP", A_LIGHT, A_BD, AMBER, A_TXT);
      }

      y += BLOCK_H + 8;
    } // end activities

    // ── Meal banner ───────────────────────────────────────────────────────────
    if (day.meal) {
      // Measure label width so we can wrap meal text in the remaining space
      doc.setFontSize(FS_SMALL);
      doc.setFont("helvetica", "bold");
      const lbl = "Local Cuisine:";
      const lblW = doc.getTextWidth(lbl);

      // Wrap meal text in the space to the right of the label
      doc.setFontSize(FS_BODY);
      doc.setFont("helvetica", "italic");
      const textStartX = M + 10 + lblW + 8;
      const mLines = wrap(doc, day.meal, CW - (textStartX - M) - 10);

      const PAD_V = 9;
      const mH = PAD_V + Math.max(1, mLines.length) * LH_BODY + PAD_V;
      need(mH + 6);
      rRect(doc, M, y, CW, mH, A_LIGHT, A_BD, 5);

      // Baseline for the FIRST line (label + first content line share this)
      const lineBaseline = y + PAD_V + LH_BODY - 2;

      // Label — bold, left side
      doc.setFontSize(FS_SMALL);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...AMBER);
      doc.text(lbl, M + 10, lineBaseline);

      // Meal text — italic, starts right after the label on the SAME baseline
      doc.setFontSize(FS_BODY);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(...A_TXT);
      mLines.forEach((ln, i) => {
        doc.text(ln, textStartX, lineBaseline + i * LH_BODY);
      });

      y += mH + 12;
    }

    // Dashed divider between days
    need(12);
    doc.setDrawColor(...GBD);
    doc.setLineWidth(0.45);
    doc.setLineDashPattern([3, 4], 0);
    doc.line(M, y, M + CW, y);
    doc.setLineDashPattern([], 0);
    y += 18;
  } // end days

  // ══════════════════════════════════════════════════════════════════════════
  // TRAVEL TIPS
  // ══════════════════════════════════════════════════════════════════════════
  if (plan.travelTips && plan.travelTips.length > 0) {
    need(36);
    // Section heading
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK);
    doc.text("Travel Tips", M, y);
    doc.setDrawColor(...GBD);
    doc.setLineWidth(0.5);
    doc.line(M + doc.getTextWidth("Travel Tips") + 8, y - 3, M + CW, y - 3);
    y += 14;

    for (const tip of plan.travelTips) {
      doc.setFontSize(FS_BODY);
      doc.setFont("helvetica", "normal");
      const tLines = wrap(doc, tip, CW - 24);
      if (tLines.length === 0) continue;

      // Box height: top-pad + all lines + bottom-pad
      const PAD = 8;
      const boxH = PAD + tLines.length * LH_BODY + PAD;
      need(boxH + 5);

      rRect(doc, M, y, CW, boxH, GBG, GBD, 4);

      // Bullet aligned with FIRST line baseline
      // First line baseline = y + PAD + LH_BODY - 2
      const firstLineY = y + PAD + LH_BODY - 2;
      // Bullet visual center ≈ firstLineY - (FS_BODY * 0.35) → roughly middle of cap-height
      const bulletY = firstLineY - Math.round(FS_BODY * 0.35);
      doc.setFillColor(...INDIGO);
      doc.circle(M + 9, bulletY, 3, "F");
      doc.setFillColor(...WHITE);
      doc.circle(M + 9, bulletY, 1.2, "F");

      // Text
      doc.setFontSize(FS_BODY);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(51, 65, 85);
      tLines.forEach((ln, i) => {
        doc.text(ln, M + 20, y + PAD + (i + 1) * LH_BODY - 2);
      });

      y += boxH + 5;
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // FOOTER — every page
  // ══════════════════════════════════════════════════════════════════════════
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFillColor(...GBG);
    doc.rect(0, PH - FH, PW, FH, "F");
    doc.setDrawColor(...GBD);
    doc.setLineWidth(0.4);
    doc.line(0, PH - FH, PW, PH - FH);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...INDIGO);
    doc.text("TripVault", M, PH - 9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GTX);
    doc.text("  AI-Powered Trip Planner", M + 36, PH - 9);
    doc.text(`Page ${p} of ${totalPages}`, PW - M, PH - 9, { align: "right" });
  }

  return doc.output("datauristring");
}
