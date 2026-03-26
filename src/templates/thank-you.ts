import {
  buildGoogleFontsHref,
  resolveGiftHeaderFont,
  resolveGiftParagraphFont
} from './google-fonts.js';
import type { TemplateRenderer } from './types.js';
import { escapeHtml } from './utils.js';

const HEX_COLOR_REGEX = /^#(?:[0-9a-fA-F]{6})$/;

type ThankYouTheme = {
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  mutedTextColor: string;
  accentColor: string;
  accentSoftColor: string;
  borderColor: string;
  grainOpacity: number;
  headingFont: string;
  bodyFont: string;
  googleFontsHref?: string;
  wordmarkFont?: string;
};

function normalizeHexColor(value: string | undefined, fallback: string): string {
  if (!value) return fallback;
  const normalized = value.trim();
  return HEX_COLOR_REGEX.test(normalized) ? normalized.toUpperCase() : fallback;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleaned = hex.replace('#', '');
  return {
    r: Number.parseInt(cleaned.slice(0, 2), 16),
    g: Number.parseInt(cleaned.slice(2, 4), 16),
    b: Number.parseInt(cleaned.slice(4, 6), 16)
  };
}

function toRgbTuple(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  return `${r}, ${g}, ${b}`;
}

function blendHex(baseHex: string, mixHex: string, ratio: number): string {
  const base = hexToRgb(baseHex);
  const mix = hexToRgb(mixHex);
  const clampedRatio = Math.max(0, Math.min(1, ratio));
  const r = Math.round(base.r + (mix.r - base.r) * clampedRatio);
  const g = Math.round(base.g + (mix.g - base.g) * clampedRatio);
  const b = Math.round(base.b + (mix.b - base.b) * clampedRatio);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
}

function pickText(content: Record<string, string>, keys: string[], fallback: string): string {
  for (const key of keys) {
    const value = content[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }
  return fallback;
}

function buildBrand(content: Record<string, string>): string {
  const composite = [content.wordmarkPrefix, content.wordmarkAccent, content.wordmarkSuffix]
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .join(' ')
    .trim();

  if (composite) return composite;

  return pickText(
    content,
    ['logoName', 'badgeText', 'eyebrow', 'eyebrowText', 'guide1Pub', 'asset1Provider'],
    'UNI'
  );
}

function isGiftTheme(content: Record<string, string>): boolean {
  return typeof content.headerFont === 'string' || typeof content.logoImage === 'string';
}

function isTwoColumnTheme(content: Record<string, string>): boolean {
  return typeof content.backgroundColor === 'string' && typeof content.surfaceColor === 'string';
}

function isToolkitTheme(content: Record<string, string>): boolean {
  return typeof content.includesTitle === 'string' || typeof content.asset4 === 'string';
}

function resolveTheme(content: Record<string, string>): ThankYouTheme {
  if (isGiftTheme(content)) {
    const headerFont = resolveGiftHeaderFont(content.headerFont);
    const paragraphFont = resolveGiftParagraphFont(content.paragraphFont);
    return {
      backgroundColor: '#F3EDE2',
      surfaceColor: '#EDE5D7',
      textColor: '#18120C',
      mutedTextColor: '#6F6257',
      accentColor: '#E8654A',
      accentSoftColor: '#FFF5EF',
      borderColor: '#D6CCBC',
      grainOpacity: 0.05,
      headingFont: headerFont.cssFamily,
      bodyFont: paragraphFont.cssFamily,
      wordmarkFont: headerFont.cssFamily,
      googleFontsHref: buildGoogleFontsHref([headerFont, paragraphFont])
    };
  }

  if (isTwoColumnTheme(content)) {
    const backgroundColor = normalizeHexColor(content.backgroundColor, '#111119');
    const surfaceColor = normalizeHexColor(content.surfaceColor, '#171724');
    const textColor = normalizeHexColor(content.textColor, '#EDE8DF');
    const mutedTextColor = normalizeHexColor(content.mutedTextColor, '#A8A8C2');
    const accentColor = normalizeHexColor(content.accentColor, '#C4922A');
    return {
      backgroundColor,
      surfaceColor,
      textColor,
      mutedTextColor,
      accentColor,
      accentSoftColor: blendHex(accentColor, '#FFFFFF', 0.14),
      borderColor: blendHex(accentColor, surfaceColor, 0.7),
      grainOpacity: 0.055,
      headingFont: "'Cormorant Garamond', serif",
      bodyFont: "'Outfit', sans-serif",
      wordmarkFont: "'Outfit', sans-serif",
      googleFontsHref:
        'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Outfit:wght@300;400;500;600&display=swap'
    };
  }

  if (isToolkitTheme(content)) {
    return {
      backgroundColor: '#F5F7FB',
      surfaceColor: '#FFFFFF',
      textColor: '#0F172A',
      mutedTextColor: '#475569',
      accentColor: '#0EA5E9',
      accentSoftColor: '#E0F2FE',
      borderColor: '#D7DEEB',
      grainOpacity: 0.02,
      headingFont: "ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      bodyFont: "ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      wordmarkFont: "ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    };
  }

  return {
    backgroundColor: '#F8FAFC',
    surfaceColor: '#FFFFFF',
    textColor: '#0F172A',
    mutedTextColor: '#334155',
    accentColor: '#0F766E',
    accentSoftColor: '#CCFBF1',
    borderColor: '#E2E8F0',
    grainOpacity: 0.015,
    headingFont: "ui-sans-serif, -apple-system, 'Segoe UI', sans-serif",
    bodyFont: "ui-sans-serif, -apple-system, 'Segoe UI', sans-serif",
    wordmarkFont: "ui-sans-serif, -apple-system, 'Segoe UI', sans-serif"
  };
}

function buildCoreProblem(content: Record<string, string>): string {
  return pickText(
    content,
    ['subheadline', 'body', 'proofLine', 'guide1Desc'],
    'move faster with better information'
  );
}

function buildAssetStack(content: Record<string, string>): Array<{ state: string; title: string; description: string }> {
  if (typeof content.guide1Desc === 'string' || typeof content.guide2Desc === 'string') {
    return [
      {
        state: 'Available now',
        title: pickText(content, ['guide1Desc', 'headline'], 'Primary framework'),
        description: 'Primary framework to get started.'
      },
      {
        state: 'Arriving shortly',
        title: pickText(content, ['guide2Desc', 'subheadline'], 'Complementary resource'),
        description: 'A complementary resource that builds on Asset #1.'
      },
      {
        state: 'Arriving shortly',
        title: pickText(content, ['guide3Desc', 'ruleText'], 'System finisher'),
        description: 'The final piece that completes the system.'
      }
    ];
  }

  if (typeof content.asset1 === 'string' || typeof content.asset2 === 'string') {
    const primaryTitle =
      typeof content.asset3 === 'string' && content.asset3.trim().length > 0
        ? content.asset3
        : `${buildBrand(content)} first edition`;
    return [
      {
        state: 'Available now',
        title: pickText(content, ['asset1', 'asset3', 'headline'], 'Primary framework'),
        description: 'Primary framework to get started.'
      },
      {
        state: 'Arriving shortly',
        title: pickText(content, ['asset2', 'asset4', 'subheadline'], 'Complementary resource'),
        description: 'A complementary resource that builds on Asset #1.'
      },
      {
        state: 'Arriving shortly',
        title: primaryTitle.trim(),
        description: 'The final piece that completes the system.'
      }
    ];
  }

  return [
    {
      state: 'Available now',
      title: `${buildBrand(content)} starter guide`,
      description: 'Primary framework to get started.'
    },
    {
      state: 'Arriving shortly',
      title: `${buildBrand(content)} partner resource`,
      description: 'A complementary resource that builds on Asset #1.'
    },
    {
      state: 'Arriving shortly',
      title: `${buildBrand(content)} follow-up brief`,
      description: 'The final piece that completes the system.'
    }
  ];
}

export const renderDefaultThankYouPage: TemplateRenderer = ({ content }) => {
  const theme = resolveTheme(content);
  const accentRgb = toRgbTuple(theme.accentColor);
  const mutedRgb = toRgbTuple(theme.mutedTextColor);
  const borderRgb = toRgbTuple(theme.borderColor);
  const surfaceRgb = toRgbTuple(theme.surfaceColor);
  const textRgb = toRgbTuple(theme.textColor);
  const brand = escapeHtml(buildBrand(content));
  const heading = escapeHtml(
    pickText(content, ['thankYouHeading'], 'Your resources are unlocked')
  );
  const subhead = escapeHtml(
    pickText(
      content,
      ['thankYouMessage'],
      `You'll receive three curated assets designed to help you ${buildCoreProblem(content).replace(/\.$/, '')}.`
    )
  );
  const orientation = escapeHtml(
    pickText(
      content,
      ['thankYouOrientation'],
      "To keep things focused, we'll deliver these one at a time via email."
    )
  );
  const footer = escapeHtml(
    pickText(
      content,
      ['thankYouFooter'],
      'Curated in collaboration with UNI - a shared acquisition platform.'
    )
  );
  const assetStack = buildAssetStack(content);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${heading}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  ${theme.googleFontsHref ? `<link href="${theme.googleFontsHref}" rel="stylesheet" />` : ''}
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --background-color: ${theme.backgroundColor};
      --surface-color: ${theme.surfaceColor};
      --text-color: ${theme.textColor};
      --muted-text-color: ${theme.mutedTextColor};
      --accent-color: ${theme.accentColor};
      --accent-soft-color: ${theme.accentSoftColor};
      --border-color: ${theme.borderColor};
      --accent-rgb: ${accentRgb};
      --muted-rgb: ${mutedRgb};
      --border-rgb: ${borderRgb};
      --surface-rgb: ${surfaceRgb};
      --text-rgb: ${textRgb};
      --font-heading: ${theme.headingFont};
      --font-body: ${theme.bodyFont};
      --font-wordmark: ${theme.wordmarkFont ?? theme.bodyFont};
    }
    html, body {
      min-height: 100%;
      background:
        radial-gradient(circle at top, rgba(var(--accent-rgb), 0.13), transparent 34%),
        linear-gradient(180deg, var(--background-color), ${blendHex(theme.backgroundColor, '#000000', 0.08)});
      color: var(--text-color);
      font-family: var(--font-body);
      -webkit-font-smoothing: antialiased;
    }
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      pointer-events: none;
      opacity: ${theme.grainOpacity};
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.74' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
      mix-blend-mode: overlay;
    }
    body::after {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(to right, transparent, var(--accent-color) 24%, var(--accent-soft-color) 50%, var(--accent-color) 76%, transparent);
    }
    main {
      min-height: 100vh;
      position: relative;
      z-index: 1;
      padding: 42px 0 54px;
    }
    .shell {
      width: min(100%, 1400px);
      margin: 0 auto;
      padding: 0 clamp(22px, 4vw, 54px);
      display: grid;
      gap: 40px;
    }
    .meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      padding-bottom: 18px;
      border-bottom: 1px solid rgba(var(--border-rgb), 0.55);
    }
    .brand {
      font-family: var(--font-wordmark);
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: var(--accent-color);
    }
    .eyebrow {
      font-size: 12px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: rgba(var(--muted-rgb), 0.92);
    }
    .hero {
      display: grid;
      grid-template-columns: minmax(0, 1.25fr) minmax(280px, 0.75fr);
      gap: clamp(28px, 4vw, 70px);
      align-items: start;
    }
    h1 {
      font-family: var(--font-heading);
      font-size: clamp(2.8rem, 7vw, 4.9rem);
      line-height: 0.94;
      letter-spacing: -0.03em;
      margin-bottom: 18px;
    }
    .subhead {
      max-width: 40rem;
      font-size: 1.07rem;
      line-height: 1.72;
      color: rgba(var(--muted-rgb), 0.98);
    }
    .orientation {
      margin-top: 22px;
      padding-top: 18px;
      border-top: 1px solid rgba(var(--border-rgb), 0.68);
      font-size: 0.97rem;
      line-height: 1.7;
      color: rgba(var(--muted-rgb), 0.9);
    }
    .status-card {
      padding: 0;
      border: none;
      background: none;
      box-shadow: none;
    }
    .status-label {
      font-size: 11px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: rgba(var(--muted-rgb), 0.88);
      margin-bottom: 14px;
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 12px 14px;
      border-radius: 999px;
      background: rgba(var(--surface-rgb), 0.38);
      border: 1px solid rgba(var(--accent-rgb), 0.22);
      font-size: 0.94rem;
      font-weight: 600;
      color: var(--text-color);
      backdrop-filter: blur(6px);
    }
    .status-dot {
      width: 10px;
      height: 10px;
      border-radius: 999px;
      background: var(--accent-color);
      box-shadow: 0 0 0 8px rgba(var(--accent-rgb), 0.11);
    }
    .stack {
      display: grid;
      gap: 14px;
      padding-top: 22px;
      border-top: 1px solid rgba(var(--border-rgb), 0.55);
    }
    .stack-title {
      font-size: 12px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: rgba(var(--muted-rgb), 0.92);
    }
    .asset {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 16px;
      padding: 20px 0 18px;
      border-bottom: 1px solid rgba(var(--border-rgb), 0.62);
      background: transparent;
    }
    .asset:last-child { border-bottom: none; }
    .asset-index {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-heading);
      font-size: 1.15rem;
      color: var(--accent-color);
      background: rgba(var(--accent-rgb), 0.04);
      border: 1px solid rgba(var(--accent-rgb), 0.16);
    }
    .asset-kicker {
      display: inline-block;
      margin-bottom: 8px;
      font-size: 11px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: rgba(var(--muted-rgb), 0.86);
    }
    .asset h2 {
      font-size: 1.14rem;
      line-height: 1.35;
      margin-bottom: 6px;
      font-weight: 600;
      color: rgb(var(--text-rgb));
    }
    .asset p {
      font-size: 0.96rem;
      line-height: 1.65;
      color: rgba(var(--muted-rgb), 0.94);
    }
    .footer {
      padding-top: 10px;
      font-size: 0.84rem;
      line-height: 1.6;
      color: rgba(var(--muted-rgb), 0.78);
    }
    @media (max-width: 760px) {
      .shell { gap: 30px; }
      .hero { grid-template-columns: 1fr; }
      .meta { align-items: flex-start; flex-direction: column; }
    }
  </style>
</head>
<body>
  <main>
    <section class="shell">
        <div class="meta">
          <div class="brand">${brand}</div>
        </div>

        <div class="hero">
          <div>
            <h1>${heading}</h1>
            <p class="subhead">${subhead}</p>
            <p class="orientation">${orientation}</p>
          </div>

          <aside class="status-card">
            <div class="status-label">Delivery status</div>
            <div class="status-badge">
              <span class="status-dot" aria-hidden="true"></span>
              Email sequence in progress
            </div>
          </aside>
        </div>

        <section class="stack">
          <div class="stack-title">Asset Stack</div>
          ${assetStack
            .map(
              (asset, index) => `<article class="asset">
            <div class="asset-index">${index + 1}</div>
            <div>
              <span class="asset-kicker">Asset #${index + 1} - ${escapeHtml(asset.state)}</span>
              <h2>${escapeHtml(asset.title)}</h2>
              <p>${escapeHtml(asset.description)}</p>
            </div>
          </article>`
            )
            .join('')}
        </section>

        <p class="footer">${footer}</p>
    </section>
  </main>
</body>
</html>`;
};
