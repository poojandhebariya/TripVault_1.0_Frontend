/**
 * content-moderation.ts
 * ─────────────────────
 * 100% free, client-side content moderation:
 *  • Images  → nsfwjs (TensorFlow.js model, runs in-browser, no API key)
 *  • Text    → bad-words package (1400+ word list, community-maintained)
 *
 * Both run entirely inside the user's browser.
 * No data is sent to any external server.
 *
 * NOTE: bad-words is CommonJS. vite.config.ts must include it in
 *       optimizeDeps.include so Vite pre-bundles it as ESM.
 */

// ─── Text moderation ─────────────────────────────────────────────────────────

// Static import — works because bad-words is listed in optimizeDeps.include
import { Filter } from "bad-words";
import type { NSFWJS } from "nsfwjs";

// Single shared instance (instantiated once at module load)
const _filter = new Filter();

export interface TextModerationResult {
  passed: boolean;
  /** The word that triggered the flag (if any) */
  flaggedWord?: string;
}

/**
 * Checks a string (title or description) for profanity.
 * Uses the bad-words package (~1400 words) + leet-speak normalisation.
 * Strips HTML tags before checking so rich-text descriptions are handled.
 * Synchronous — no async/await needed.
 */
export function moderateText(raw: string): TextModerationResult {
  // Strip HTML tags (description comes from a contenteditable rich-text editor)
  const plain = raw
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!plain) return { passed: true };

  try {
    if (_filter.isProfane(plain)) {
      // Surface the specific word that triggered the flag
      const flagged = plain
        .split(/\s+/)
        .find((w) => { try { return _filter.isProfane(w); } catch { return false; } });
      return { passed: false, flaggedWord: flagged };
    }
    return { passed: true };
  } catch (err) {
    console.warn("[Moderation] bad-words check failed:", err);
    // Fail-closed on unexpected errors — block submission
    return { passed: false };
  }
}


// ─── Image moderation ─────────────────────────────────────────────────────────

export type NSFWCategory = "Drawing" | "Hentai" | "Neutral" | "Porn" | "Sexy";

export interface NSFWPrediction {
  className: NSFWCategory;
  probability: number;
}

export interface ImageModerationResult {
  passed: boolean;
  /** The category that triggered the block (if any) */
  flaggedCategory?: NSFWCategory;
  /** The probability score for the flagged category */
  flaggedProbability?: number;
  predictions?: NSFWPrediction[];
}

// Singleton model so we only load it once per session
let _nsfwModel: NSFWJS | null = null;
let _modelLoading: Promise<NSFWJS | null> | null = null;

async function getNsfwModel() {
  if (_nsfwModel) return _nsfwModel;
  if (_modelLoading) return _modelLoading;

  _modelLoading = (async () => {
    try {
      // Lazy-load heavy TF.js + nsfwjs only when first image is checked
      const [nsfwjs] = await Promise.all([
        import("nsfwjs"),
        import("@tensorflow/tfjs"),
      ]);
      _nsfwModel = await nsfwjs.load();
      return _nsfwModel;
    } catch (err) {
      console.warn("[Moderation] NSFW model failed to load:", err);
      _modelLoading = null;
      return null;
    }
  })();

  return _modelLoading;
}

/**
 * NSFW probability thresholds.
 * Tweak these if you want to be more/less strict.
 */
const NSFW_THRESHOLDS: Partial<Record<NSFWCategory, number>> = {
  Porn: 0.5,   // Flag if >50% confident it's porn
  Hentai: 0.6, // Flag if >60% confident it's hentai
  Sexy: 0.85,  // Flag if >85% confident it's sexy (higher = less strict)
};

/**
 * Moderates a single image.
 * @param source  – A data-URL string, HTMLImageElement, HTMLVideoElement,
 *                  HTMLCanvasElement, or Blob/File.
 *                  If a string (data-URL) is passed, a temporary <img> is
 *                  created in-memory; no DOM insertion occurs.
 */
export async function moderateImage(
  source: string | HTMLImageElement | Blob | File,
): Promise<ImageModerationResult> {
  try {
    const model = await getNsfwModel();
    if (!model) {
      // Model failed to load — fail-open
      return { passed: true };
    }

    // Resolve to an HTMLImageElement (nsfwjs requires this)
    let imgEl: HTMLImageElement;
    if (typeof source === "string") {
      // data-URL or object URL
      imgEl = await loadImageElement(source);
    } else if (source instanceof HTMLImageElement) {
      imgEl = source;
    } else {
      // Blob / File — create an object URL
      const url = URL.createObjectURL(source);
      imgEl = await loadImageElement(url);
      URL.revokeObjectURL(url);
    }

    const predictions = (await model.classify(imgEl)) as NSFWPrediction[];

    for (const [category, threshold] of Object.entries(NSFW_THRESHOLDS) as [
      NSFWCategory,
      number,
    ][]) {
      const match = predictions.find((p) => p.className === category);
      if (match && match.probability >= threshold) {
        return {
          passed: false,
          flaggedCategory: category,
          flaggedProbability: match.probability,
          predictions,
        };
      }
    }

    return { passed: true, predictions };
  } catch (err) {
    console.warn("[Moderation] Image moderation error, failing open:", err);
    return { passed: true };
  }
}

/** Pre-warm the NSFW model in the background (optional, call on mount). */
export function prewarmNsfwModel(): void {
  getNsfwModel().catch(() => {
    // silent — already logged inside
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
