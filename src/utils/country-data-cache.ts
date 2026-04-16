import { type Place, type CountryDetail } from "../types/explore";

const countryCache: Record<string, CountryDetail> = {};

export const fetchCountryData = async (code: string): Promise<CountryDetail | null> => {
  const cacheKey = code.toUpperCase();
  if (countryCache[cacheKey]) {
    return countryCache[cacheKey];
  }

  try {
    const resp = await fetch(`/data/countries/${cacheKey}.json`);
    if (resp.ok) {
      const data = await resp.json();
      countryCache[cacheKey] = data;
      return data;
    }
  } catch (err) {
    console.error(`Failed to load country data for ${cacheKey}:`, err);
  }
  return null;
};
