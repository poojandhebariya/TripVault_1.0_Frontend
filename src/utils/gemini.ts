import type { Place } from "../types/explore";
import type { TripPlan } from "../types/trip";

// ─── Groq API (Free, No Credit Card) ─────────────────────────────────────────
// Sign up at: https://console.groq.com → "API Keys" → "Create API Key"
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY as string;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile"; // Free tier, 30 RPM, 14,400 req/day

// ─── Country → Currency lookup ────────────────────────────────────────────────
// Maps country name (as stored in Place.country) to its currency symbol + code
const COUNTRY_CURRENCY: Record<string, { symbol: string; code: string; name: string }> = {
  "India": { symbol: "₹", code: "INR", name: "Indian Rupee" },
  "Japan": { symbol: "¥", code: "JPY", name: "Japanese Yen" },
  "China": { symbol: "¥", code: "CNY", name: "Chinese Yuan" },
  "United States": { symbol: "$", code: "USD", name: "US Dollar" },
  "United Kingdom": { symbol: "£", code: "GBP", name: "British Pound" },
  "France": { symbol: "€", code: "EUR", name: "Euro" },
  "Germany": { symbol: "€", code: "EUR", name: "Euro" },
  "Italy": { symbol: "€", code: "EUR", name: "Euro" },
  "Spain": { symbol: "€", code: "EUR", name: "Euro" },
  "Greece": { symbol: "€", code: "EUR", name: "Euro" },
  "Portugal": { symbol: "€", code: "EUR", name: "Euro" },
  "Netherlands": { symbol: "€", code: "EUR", name: "Euro" },
  "Austria": { symbol: "€", code: "EUR", name: "Euro" },
  "Belgium": { symbol: "€", code: "EUR", name: "Euro" },
  "Finland": { symbol: "€", code: "EUR", name: "Euro" },
  "Norway": { symbol: "kr", code: "NOK", name: "Norwegian Krone" },
  "Sweden": { symbol: "kr", code: "SEK", name: "Swedish Krona" },
  "Denmark": { symbol: "kr", code: "DKK", name: "Danish Krone" },
  "Iceland": { symbol: "kr", code: "ISK", name: "Icelandic Króna" },
  "Switzerland": { symbol: "CHF", code: "CHF", name: "Swiss Franc" },
  "Australia": { symbol: "A$", code: "AUD", name: "Australian Dollar" },
  "New Zealand": { symbol: "NZ$", code: "NZD", name: "New Zealand Dollar" },
  "Canada": { symbol: "C$", code: "CAD", name: "Canadian Dollar" },
  "Brazil": { symbol: "R$", code: "BRL", name: "Brazilian Real" },
  "Mexico": { symbol: "MX$", code: "MXN", name: "Mexican Peso" },
  "Argentina": { symbol: "ARS$", code: "ARS", name: "Argentine Peso" },
  "Chile": { symbol: "CLP$", code: "CLP", name: "Chilean Peso" },
  "Colombia": { symbol: "COP$", code: "COP", name: "Colombian Peso" },
  "Peru": { symbol: "S/", code: "PEN", name: "Peruvian Sol" },
  "Thailand": { symbol: "฿", code: "THB", name: "Thai Baht" },
  "Indonesia": { symbol: "Rp", code: "IDR", name: "Indonesian Rupiah" },
  "Vietnam": { symbol: "₫", code: "VND", name: "Vietnamese Dong" },
  "Malaysia": { symbol: "RM", code: "MYR", name: "Malaysian Ringgit" },
  "Philippines": { symbol: "₱", code: "PHP", name: "Philippine Peso" },
  "South Korea": { symbol: "₩", code: "KRW", name: "South Korean Won" },
  "Singapore": { symbol: "S$", code: "SGD", name: "Singapore Dollar" },
  "Egypt": { symbol: "E£", code: "EGP", name: "Egyptian Pound" },
  "Morocco": { symbol: "MAD", code: "MAD", name: "Moroccan Dirham" },
  "South Africa": { symbol: "R", code: "ZAR", name: "South African Rand" },
  "Kenya": { symbol: "KSh", code: "KES", name: "Kenyan Shilling" },
  "Tanzania": { symbol: "TSh", code: "TZS", name: "Tanzanian Shilling" },
  "Rwanda": { symbol: "RF", code: "RWF", name: "Rwandan Franc" },
  "Ethiopia": { symbol: "Br", code: "ETB", name: "Ethiopian Birr" },
  "Nigeria": { symbol: "₦", code: "NGN", name: "Nigerian Naira" },
  "Ghana": { symbol: "GH₵", code: "GHS", name: "Ghanaian Cedi" },
  "Turkey": { symbol: "₺", code: "TRY", name: "Turkish Lira" },
  "United Arab Emirates": { symbol: "AED", code: "AED", name: "UAE Dirham" },
  "Saudi Arabia": { symbol: "SAR", code: "SAR", name: "Saudi Riyal" },
  "Israel": { symbol: "₪", code: "ILS", name: "Israeli Shekel" },
  "Oman": { symbol: "OMR", code: "OMR", name: "Omani Rial" },
  "Jordan": { symbol: "JD", code: "JOD", name: "Jordanian Dinar" },
  "Qatar": { symbol: "QAR", code: "QAR", name: "Qatari Riyal" },
  "Bahrain": { symbol: "BD", code: "BHD", name: "Bahraini Dinar" },
  "Kuwait": { symbol: "KD", code: "KWD", name: "Kuwaiti Dinar" },
  "Russia": { symbol: "₽", code: "RUB", name: "Russian Ruble" },
  "Poland": { symbol: "zł", code: "PLN", name: "Polish Zloty" },
  "Czech Republic": { symbol: "Kč", code: "CZK", name: "Czech Koruna" },
  "Croatia": { symbol: "€", code: "EUR", name: "Euro" },
  "Hungary": { symbol: "Ft", code: "HUF", name: "Hungarian Forint" },
  "Romania": { symbol: "lei", code: "RON", name: "Romanian Leu" },
  "Ukraine": { symbol: "₴", code: "UAH", name: "Ukrainian Hryvnia" },
  "Nepal": { symbol: "रू", code: "NPR", name: "Nepalese Rupee" },
  "Sri Lanka": { symbol: "Rs", code: "LKR", name: "Sri Lankan Rupee" },
  "Bangladesh": { symbol: "৳", code: "BDT", name: "Bangladeshi Taka" },
  "Pakistan": { symbol: "Rs", code: "PKR", name: "Pakistani Rupee" },
  "Uzbekistan": { symbol: "soʻm", code: "UZS", name: "Uzbekistani Som" },
  "Kazakhstan": { symbol: "₸", code: "KZT", name: "Kazakhstani Tenge" },
  "Mongolia": { symbol: "₮", code: "MNT", name: "Mongolian Tögrög" },
  "Costa Rica": { symbol: "₡", code: "CRC", name: "Costa Rican Colón" },
  "Seychelles": { symbol: "SR", code: "SCR", name: "Seychellois Rupee" },
  "Bhutan": { symbol: "Nu", code: "BTN", name: "Bhutanese Ngultrum" },
  "Serbia": { symbol: "din", code: "RSD", name: "Serbian Dinar" },
  "Albania": { symbol: "L", code: "ALL", name: "Albanian Lek" },
};

/**
 * Resolves the local currency info for a given place.
 * Priority: place.overview.currency → country map → fallback string
 */
const getLocalCurrency = (place: Place): string => {
  // 1. Use the currency string already stored in overview (e.g. "Indian Rupee (₹)")
  if (place.overview?.currency) {
    return place.overview.currency;
  }
  // 2. Look up from our country map
  const entry = COUNTRY_CURRENCY[place.country];
  if (entry) {
    return `${entry.symbol} (${entry.code} – ${entry.name})`;
  }
  // 3. Generic fallback
  return `the local currency of ${place.country}`;
};

/**
 * Returns just the currency symbol for a given place (used in example values in the prompt).
 */
const getCurrencySymbol = (place: Place): string => {
  const entry = COUNTRY_CURRENCY[place.country];
  return entry?.symbol ?? "";
};

/**
 * Builds a structured prompt for the LLM to generate a day-by-day trip plan.
 */
const buildTripPlanPrompt = (place: Place, days: number): string => {
  const localCurrency = getLocalCurrency(place);
  const symbol = getCurrencySymbol(place);
  const exampleBudget = symbol ? `${symbol}5,000–${symbol}8,000 per person` : "5,000–8,000 in local currency per person";
  const exampleFee = symbol ? `${symbol}500 or Free` : "local price or Free";

  return `You are an expert travel planner. Generate a detailed ${days}-day trip itinerary for "${place.name}" located in ${place.location}, ${place.country}.

Return ONLY a valid JSON object (no markdown, no explanation, no code fences) matching this exact structure:
{
  "destination": "${place.name}",
  "estimatedBudget": "IMPORTANT: You MUST ONLY use the currency ${localCurrency}. Example format: '${exampleBudget}'. DO NOT use USD. DO NOT output the $ symbol unless it is part of the local currency. DO NOT say 'equivalent to USD'.",
  "bestSeason": "e.g. October to March",
  "pace": "Relaxed or Moderate or Intensive",
  "travelTips": ["tip1", "tip2", "tip3", "tip4", "tip5"],
  "days": [
    {
      "day": 1,
      "theme": "Short exciting theme for the day",
      "highlights": ["Tag1", "Tag2"],
      "meal": "A specific local dish or restaurant recommendation",
      "activities": [
        {
          "name": "Attraction or Activity Name",
          "description": "2-3 sentence vivid description of the experience",
          "timeOfDay": "morning or afternoon or evening or night",
          "duration": "e.g. 2 hours",
          "history": "1-2 sentences of historical or cultural significance",
          "tip": "A specific practical visitor tip",
          "mustSee": true,
          "entryFee": "MUST be in ${localCurrency}. Example: '${exampleFee}'. Never use USD."
        }
      ]
    }
  ]
}

Rules:
- Generate exactly ${days} day objects in the days array.
- Each day must have 3-4 activities spread across different times of day.
- Make descriptions vivid, engaging, and specific to this exact destination.
- Include history for at least 2 activities per day.
- Tips should be practical and insider-level.
- Vary themes across days.
- !! CRITICAL !! All monetary values (estimatedBudget AND entryFee) MUST be in ${localCurrency}. NEVER output USD, dollars, or the $ symbol if ${place.country} does not officially use it. DO NOT convert to USD.
- Place type: ${place.type}. Tags: ${place.tags?.join(", ")}.
- Output ONLY raw JSON. No markdown. No explanation.`;
};

/**
 * Calls Groq API (free, OpenAI-compatible) to generate a trip plan.
 */
export const generateTripPlan = async (
  place: Place,
  days: number
): Promise<TripPlan> => {
  if (!GROQ_API_KEY) {
    throw new Error(
      "Groq API key not configured. Add VITE_GROQ_API_KEY to your .env file. Get a free key at console.groq.com"
    );
  }

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a professional travel planner. Always respond with only valid JSON. Never include markdown code fences, explanations, or any text outside the JSON object. CRITICAL: always use the requested local currency for all monetary values, NEVER output USD ($) unless the destination actually uses it. Do not include USD conversions.",
        },
        {
          role: "user",
          content: buildTripPlanPrompt(place, days),
        },
      ],
      temperature: 0.7,
      max_tokens: 4096,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const message =
      err?.error?.message ??
      `Groq API error: ${response.status} ${response.statusText}`;
    throw new Error(message);
  }

  const data = await response.json();
  const rawText: string = data?.choices?.[0]?.message?.content ?? "";

  if (!rawText) {
    throw new Error("The AI returned an empty response. Please try again.");
  }

  // Strip any accidental markdown fences just in case
  const cleaned = rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  try {
    const plan = JSON.parse(cleaned) as TripPlan;
    if (!plan.days || !Array.isArray(plan.days)) {
      throw new Error("Invalid plan structure received from AI.");
    }
    return plan;
  } catch {
    throw new Error(
      "Could not parse the AI response. Please try again."
    );
  }
};
