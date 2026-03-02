import type { FastifyInstance } from 'fastify';

import { requireAdminAuth } from '../auth/guard.js';
import {
  fallbackGiftHeaderFontOptions,
  fallbackGiftParagraphFontOptions,
  toCssFamily,
  toGoogleFontQuery,
  type GoogleFontCategory
} from '../templates/google-fonts.js';

const GOOGLE_FONT_METADATA_URL = 'https://fonts.google.com/metadata/fonts';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

type GoogleFontsMetadataPayload = {
  familyMetadataList?: Array<{
    family?: string;
    category?: string;
  }>;
};

type GoogleFontFieldOption = {
  label: string;
  value: string;
  previewFontFamily: string;
  googleFontQuery: string;
};

let cachedFonts: GoogleFontFieldOption[] | null = null;
let cacheExpiresAt = 0;

function normalizeCategory(value: string | undefined): GoogleFontCategory {
  const normalized = value?.toLowerCase();
  if (normalized === 'serif') return 'serif';
  if (normalized === 'monospace') return 'monospace';
  if (normalized === 'display') return 'display';
  if (normalized === 'handwriting') return 'handwriting';
  return 'sans-serif';
}

function parseGoogleFontsMetadata(raw: string): GoogleFontsMetadataPayload {
  const normalized = raw.startsWith(")]}'") ? raw.slice(raw.indexOf('\n') + 1) : raw;
  return JSON.parse(normalized) as GoogleFontsMetadataPayload;
}

function buildFallbackFonts(): GoogleFontFieldOption[] {
  const fallback = [...fallbackGiftHeaderFontOptions(), ...fallbackGiftParagraphFontOptions()];
  const seen = new Set<string>();

  return fallback
    .filter((font) => {
      if (seen.has(font.value)) {
        return false;
      }
      seen.add(font.value);
      return true;
    })
    .map((font) => ({
      label: font.label,
      value: font.value,
      previewFontFamily: font.cssFamily,
      googleFontQuery: font.googleFontQuery
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

async function loadGoogleFontsFromSource(): Promise<GoogleFontFieldOption[]> {
  const response = await fetch(GOOGLE_FONT_METADATA_URL, {
    signal: AbortSignal.timeout(8000)
  });

  if (!response.ok) {
    throw new Error(`Google Fonts metadata request failed (${response.status})`);
  }

  const payload = parseGoogleFontsMetadata(await response.text());
  const familyMetadata = payload.familyMetadataList ?? [];

  const options = familyMetadata
    .map((entry) => {
      const family = entry.family?.trim();
      if (!family) {
        return null;
      }

      const category = normalizeCategory(entry.category);
      return {
        label: family,
        value: family,
        previewFontFamily: toCssFamily(family, category),
        googleFontQuery: toGoogleFontQuery(family)
      } satisfies GoogleFontFieldOption;
    })
    .filter((entry): entry is GoogleFontFieldOption => Boolean(entry))
    .sort((a, b) => a.label.localeCompare(b.label));

  if (options.length === 0) {
    throw new Error('Google Fonts metadata response was empty');
  }

  return options;
}

async function listGoogleFonts(): Promise<GoogleFontFieldOption[]> {
  if (cachedFonts && Date.now() < cacheExpiresAt) {
    return cachedFonts;
  }

  try {
    const loaded = await loadGoogleFontsFromSource();
    cachedFonts = loaded;
    cacheExpiresAt = Date.now() + CACHE_TTL_MS;
    return loaded;
  } catch {
    if (cachedFonts) {
      return cachedFonts;
    }

    const fallback = buildFallbackFonts();
    cachedFonts = fallback;
    cacheExpiresAt = Date.now() + CACHE_TTL_MS;
    return fallback;
  }
}

export function registerGoogleFontRoutes(app: FastifyInstance): void {
  app.get('/api/google-fonts', { preHandler: requireAdminAuth }, async (_request, reply) => {
    const fonts = await listGoogleFonts();
    return reply.send({ fonts });
  });
}
