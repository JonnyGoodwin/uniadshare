export type GoogleFontCategory = 'sans-serif' | 'serif' | 'display' | 'handwriting' | 'monospace';

export type GiftGoogleFontOption = {
  label: string;
  value: string;
  cssFamily: string;
  googleFontQuery: string;
};

export const DEFAULT_GIFT_HEADER_FONT = 'Cormorant Garamond';
export const DEFAULT_GIFT_PARAGRAPH_FONT = 'Lato';

const fallbackHeaderOptions: GiftGoogleFontOption[] = [
  { label: 'Cormorant Garamond', value: 'Cormorant Garamond', cssFamily: "'Cormorant Garamond', serif", googleFontQuery: 'family=Cormorant+Garamond' },
  { label: 'Playfair Display', value: 'Playfair Display', cssFamily: "'Playfair Display', serif", googleFontQuery: 'family=Playfair+Display' },
  { label: 'Lora', value: 'Lora', cssFamily: "'Lora', serif", googleFontQuery: 'family=Lora' },
  { label: 'EB Garamond', value: 'EB Garamond', cssFamily: "'EB Garamond', serif", googleFontQuery: 'family=EB+Garamond' },
  { label: 'Libre Baskerville', value: 'Libre Baskerville', cssFamily: "'Libre Baskerville', serif", googleFontQuery: 'family=Libre+Baskerville' }
];

const fallbackParagraphOptions: GiftGoogleFontOption[] = [
  { label: 'Lato', value: 'Lato', cssFamily: "'Lato', sans-serif", googleFontQuery: 'family=Lato' },
  { label: 'Source Sans 3', value: 'Source Sans 3', cssFamily: "'Source Sans 3', sans-serif", googleFontQuery: 'family=Source+Sans+3' },
  { label: 'Inter', value: 'Inter', cssFamily: "'Inter', sans-serif", googleFontQuery: 'family=Inter' },
  { label: 'Nunito Sans', value: 'Nunito Sans', cssFamily: "'Nunito Sans', sans-serif", googleFontQuery: 'family=Nunito+Sans' },
  { label: 'Merriweather Sans', value: 'Merriweather Sans', cssFamily: "'Merriweather Sans', sans-serif", googleFontQuery: 'family=Merriweather+Sans' }
];

const defaultHeaderFont = fallbackHeaderOptions[0];
const defaultParagraphFont = fallbackParagraphOptions[0];

function normalizeFontName(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
}

export function toGoogleFontQuery(fontFamily: string): string {
  return `family=${encodeURIComponent(fontFamily).replace(/%20/g, '+')}`;
}

function cssEscapeSingleQuote(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function fallbackGenericForCategory(category: GoogleFontCategory): string {
  if (category === 'serif') return 'serif';
  if (category === 'monospace') return 'monospace';
  return 'sans-serif';
}

export function toCssFamily(fontFamily: string, category: GoogleFontCategory): string {
  return `'${cssEscapeSingleQuote(fontFamily)}', ${fallbackGenericForCategory(category)}`;
}

function findFont(value: string | undefined, options: GiftGoogleFontOption[], fallback: GiftGoogleFontOption) {
  if (!value) {
    return fallback;
  }

  return options.find((option) => option.value === value) ?? fallback;
}

export function resolveGiftHeaderFont(value: string | undefined): GiftGoogleFontOption {
  const known = findFont(value, fallbackHeaderOptions, defaultHeaderFont);
  const normalized = normalizeFontName(value, known.value);
  return {
    label: normalized,
    value: normalized,
    cssFamily: toCssFamily(normalized, 'serif'),
    googleFontQuery: toGoogleFontQuery(normalized)
  };
}

export function resolveGiftParagraphFont(value: string | undefined): GiftGoogleFontOption {
  const known = findFont(value, fallbackParagraphOptions, defaultParagraphFont);
  const normalized = normalizeFontName(value, known.value);
  return {
    label: normalized,
    value: normalized,
    cssFamily: toCssFamily(normalized, 'sans-serif'),
    googleFontQuery: toGoogleFontQuery(normalized)
  };
}

export function toTemplateFontOptions(options: GiftGoogleFontOption[]) {
  return options.map((option) => ({
    label: option.label,
    value: option.value,
    previewFontFamily: option.cssFamily,
    googleFontQuery: option.googleFontQuery
  }));
}

export function buildGoogleFontsHref(fonts: GiftGoogleFontOption[]): string {
  const queries = [...new Set(fonts.map((font) => font.googleFontQuery))];
  if (queries.length === 0) {
    return '';
  }

  return `https://fonts.googleapis.com/css2?${queries.join('&')}&display=swap`;
}

export function fallbackGiftHeaderFontOptions(): GiftGoogleFontOption[] {
  return [...fallbackHeaderOptions];
}

export function fallbackGiftParagraphFontOptions(): GiftGoogleFontOption[] {
  return [...fallbackParagraphOptions];
}
