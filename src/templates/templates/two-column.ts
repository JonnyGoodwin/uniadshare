import type { LandingTemplateModule } from '../types.js';
import { escapeHtml, renderLeadCaptureScript, renderLeadForm } from '../utils.js';

const HEX_COLOR_REGEX = /^#(?:[0-9a-fA-F]{6})$/;

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

export const twoColumnTemplate: LandingTemplateModule = {
  ref: 'two-column',
  name: 'two-column',
  description: 'Premium two-column offer page with animated report cards.',
  fields: [
    { key: 'wordmarkPrefix', label: 'Wordmark Prefix', type: 'text', required: true },
    { key: 'wordmarkAccent', label: 'Wordmark Accent', type: 'text', required: true },
    { key: 'wordmarkSuffix', label: 'Wordmark Suffix', type: 'text', required: true },
    { key: 'headline', label: 'Headline', type: 'textarea', required: true },
    { key: 'subheadline', label: 'Subheadline', type: 'textarea', required: true },
    { key: 'badgeText', label: 'Badge Text', type: 'text', required: true },
    { key: 'visualLabel', label: 'Visual Label', type: 'text', required: true },
    { key: 'ruleText', label: 'Rule Text', type: 'text', required: true },
    { key: 'guide1Pub', label: 'Guide 1 Publisher', type: 'text', required: true },
    { key: 'guide1Desc', label: 'Guide 1 Description', type: 'text', required: true },
    { key: 'guide2Pub', label: 'Guide 2 Publisher', type: 'text', required: true },
    { key: 'guide2Desc', label: 'Guide 2 Description', type: 'text', required: true },
    { key: 'guide3Pub', label: 'Guide 3 Publisher', type: 'text', required: true },
    { key: 'guide3Desc', label: 'Guide 3 Description', type: 'text', required: true },
    { key: 'backgroundColor', label: 'Background Color', type: 'color', required: true },
    { key: 'surfaceColor', label: 'Surface Color', type: 'color', required: true },
    { key: 'textColor', label: 'Text Color', type: 'color', required: true },
    { key: 'mutedTextColor', label: 'Muted Text Color', type: 'color', required: true },
    { key: 'accentColor', label: 'Accent Color', type: 'color', required: true },
    { key: 'ctaLabel', label: 'CTA Label', type: 'text', required: true },
    { key: 'consentLabel', label: 'Consent Label', type: 'text', required: true },
    { key: 'successMessage', label: 'Success Message', type: 'text', required: true },
    { key: 'disclaimer', label: 'Disclaimer', type: 'textarea', required: true }
  ],
  defaultContent: {
    wordmarkPrefix: 'Wealth',
    wordmarkAccent: 'Daily',
    wordmarkSuffix: 'Publishing',
    headline: 'Three of the Top Financial Strategists Just Bundled Their Best 2026 Research - For Free',
    subheadline: 'Get 3 Free Resources To Better Understand How the Wealthy are Capitalizing on 2026',
    badgeText: 'A resource from Wealth Daily & partners',
    visualLabel: 'Portfolio Intelligence · Q2 2026',
    ruleText: 'Your intelligence briefing',
    guide1Pub: 'Wealth Daily',
    guide1Desc: 'Investment Research Delivered Daily',
    guide2Pub: 'Energy & Capital',
    guide2Desc: '2026 Q2 Top Energy & Stock Picks',
    guide3Pub: 'Goldworld',
    guide3Desc: 'Guide to Backing Wealth with Gold',
    backgroundColor: '#111119',
    surfaceColor: '#171724',
    textColor: '#EDE8DF',
    mutedTextColor: '#A8A8C2',
    accentColor: '#C4922A',
    ctaLabel: 'Get Access',
    consentLabel: 'I agree to receive investment intelligence and updates from publishing partners.',
    successMessage: 'Success. Check your inbox for access details.',
    disclaimer:
      'By submitting, you agree to receive investment intelligence and updates from our publishing partners. Unsubscribe at any time. We never sell or share your information.'
  },
  render: ({ content, context }) => {
    const wordmarkPrefix = escapeHtml(content.wordmarkPrefix ?? '');
    const wordmarkAccent = escapeHtml(content.wordmarkAccent ?? '');
    const wordmarkSuffix = escapeHtml(content.wordmarkSuffix ?? '');
    const headline = escapeHtml(content.headline ?? '');
    const subheadline = escapeHtml(content.subheadline ?? '');
    const badgeText = escapeHtml(content.badgeText ?? '');
    const visualLabel = escapeHtml(content.visualLabel ?? '');
    const ruleText = escapeHtml(content.ruleText ?? '');
    const guide1Pub = escapeHtml(content.guide1Pub ?? '');
    const guide1Desc = escapeHtml(content.guide1Desc ?? '');
    const guide2Pub = escapeHtml(content.guide2Pub ?? '');
    const guide2Desc = escapeHtml(content.guide2Desc ?? '');
    const guide3Pub = escapeHtml(content.guide3Pub ?? '');
    const guide3Desc = escapeHtml(content.guide3Desc ?? '');
    const disclaimer = escapeHtml(content.disclaimer ?? '');
    const backgroundColor = normalizeHexColor(content.backgroundColor, '#111119');
    const surfaceColor = normalizeHexColor(content.surfaceColor, '#171724');
    const textColor = normalizeHexColor(content.textColor, '#EDE8DF');
    const mutedTextColor = normalizeHexColor(content.mutedTextColor, '#A8A8C2');
    const accentColor = normalizeHexColor(content.accentColor, '#C4922A');
    const accentColorLight = blendHex(accentColor, '#FFFFFF', 0.18);
    const accentColorDark = blendHex(accentColor, '#000000', 0.23);
    const accentColorRgb = toRgbTuple(accentColor);
    const accentColorLightRgb = toRgbTuple(accentColorLight);
    const mutedTextColorRgb = toRgbTuple(mutedTextColor);
    const textColorRgb = toRgbTuple(textColor);
    const surfaceColorRgb = toRgbTuple(surfaceColor);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${headline}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --background-color: ${backgroundColor};
      --surface-color: ${surfaceColor};
      --text-color: ${textColor};
      --muted-text-color: ${mutedTextColor};
      --accent-color: ${accentColor};
      --accent-color-light: ${accentColorLight};
      --accent-color-dark: ${accentColorDark};
      --accent-color-rgb: ${accentColorRgb};
      --accent-color-light-rgb: ${accentColorLightRgb};
      --muted-text-color-rgb: ${mutedTextColorRgb};
      --text-color-rgb: ${textColorRgb};
      --surface-color-rgb: ${surfaceColorRgb};
    }
    html, body {
      min-height: 100%;
      background: var(--background-color);
      color: var(--text-color);
      font-family: 'Outfit', sans-serif;
      font-weight: 400;
      -webkit-font-smoothing: antialiased;
    }
    body::before {
      content: '';
      position: fixed;
      top: 0; left: 0; right: 0;
      height: 2px;
      background: linear-gradient(to right, transparent, var(--accent-color) 25%, var(--accent-color-light) 50%, var(--accent-color) 75%, transparent);
      z-index: 100;
    }
    body::after {
      content: '';
      position: fixed; inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.055'/%3E%3C/svg%3E");
      pointer-events: none;
      z-index: 9999;
      mix-blend-mode: overlay;
    }
    .page { min-height: 100vh; position: relative; }
    .content {
      width: 56%;
      min-height: 100vh;
      padding: 4vh 68px 4vh 76px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      overflow: hidden;
    }
    .content::after {
      content: '';
      position: absolute;
      right: 44%; top: 8%; bottom: 8%;
      width: 1px;
      background: linear-gradient(to bottom, transparent, var(--accent-color) 25%, var(--accent-color) 75%, transparent);
      opacity: 0.18;
    }
    .wordmark {
      font-size: 16px;
      font-weight: 500;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--muted-text-color);
      margin-bottom: 2.5vh;
      opacity: 0;
      animation: fadeUp 1s cubic-bezier(0.16,1,0.3,1) forwards 0.1s;
    }
    .wordmark b { color: var(--accent-color); font-weight: 500; }
    h1 {
      font-family: 'Cormorant Garamond', serif;
      font-size: clamp(32px, 3.8vw, 56px);
      font-weight: 600;
      line-height: 1.06;
      letter-spacing: -0.025em;
      max-width: 530px;
      margin-bottom: 1.4vh;
      opacity: 0;
      animation: fadeUp 1s cubic-bezier(0.16,1,0.3,1) forwards 0.44s;
    }
    h2 {
      font-size: 17px;
      font-weight: 500;
      line-height: 1.6;
      color: var(--muted-text-color);
      max-width: 520px;
      margin-bottom: 2vh;
      opacity: 0;
      animation: fadeUp 1s cubic-bezier(0.16,1,0.3,1) forwards 0.58s;
    }
    .rule {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 1.5vh;
      opacity: 0;
      animation: fadeUp 1s cubic-bezier(0.16,1,0.3,1) forwards 0.68s;
    }
    .rule-line {
      height: 1px;
      width: 36px;
      background: linear-gradient(to right, var(--accent-color), transparent);
    }
    .rule-text {
      font-size: 16px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: rgba(var(--accent-color-light-rgb), 0.9);
    }
    .rule-line-r {
      flex: 1;
      height: 1px;
      background: linear-gradient(to right, rgba(var(--accent-color-rgb), 0.12), transparent);
    }
    .guides { list-style: none; margin-bottom: 2.2vh; }
    .guide {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 1.1vh 0;
      border-bottom: 1px solid rgba(var(--accent-color-rgb), 0.07);
      cursor: default;
      opacity: 0;
      animation: fadeUp 1s cubic-bezier(0.16,1,0.3,1) forwards;
      transition: background 0.2s;
    }
    .guide:first-child { animation-delay: 0.78s; }
    .guide:nth-child(2) { animation-delay: 0.93s; }
    .guide:last-child { animation-delay: 1.08s; border-bottom: none; }
    .guide-num {
      font-family: 'Cormorant Garamond', serif;
      font-size: 36px;
      font-weight: 300;
      line-height: 0.88;
      color: var(--accent-color);
      opacity: 0.3;
      min-width: 30px;
      user-select: none;
      transition: opacity 0.25s;
    }
    .guide:hover .guide-num { opacity: 0.6; }
    .guide-info { flex: 1; }
    .guide-pub {
      font-family: 'Cormorant Garamond', serif;
      font-size: 19px;
      font-weight: 600;
      line-height: 1.2;
      margin-bottom: 2px;
      color: var(--text-color);
    }
    .guide-desc {
      font-size: 16px;
      font-weight: 400;
      color: var(--muted-text-color);
      line-height: 1.5;
    }
    .guide-arrow {
      font-size: 18px;
      color: rgba(var(--accent-color-rgb), 0.2);
      transition: color 0.2s, transform 0.25s;
      flex-shrink: 0;
    }
    .guide:hover .guide-arrow { color: var(--accent-color); transform: translateX(4px); }

    .form {
      opacity: 0;
      animation: fadeUp 1s cubic-bezier(0.16,1,0.3,1) forwards 1.22s;
    }
    .lead-form { display: grid; gap: 10px; }
    .lead-form label { font-size: 14px; color: rgba(var(--muted-text-color-rgb), 0.85); }
    .lead-form input[type="text"], .lead-form input[type="email"] {
      width: 100%;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(var(--accent-color-rgb), 0.35);
      border-radius: 3px;
      padding: 12px 16px;
      color: var(--text-color);
      font-family: 'Outfit', sans-serif;
      font-size: 16px;
      outline: none;
      transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
    }
    .lead-form input[type="text"]::placeholder, .lead-form input[type="email"]::placeholder {
      color: rgba(var(--muted-text-color-rgb), 0.6);
    }
    .lead-form input[type="text"]:focus, .lead-form input[type="email"]:focus {
      border-color: var(--accent-color-light);
      background: rgba(255,255,255,0.12);
      box-shadow: 0 0 0 3px rgba(var(--accent-color-rgb), 0.14);
    }
    .consent-line {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      font-size: 14px;
      color: rgba(var(--muted-text-color-rgb), 0.9);
    }
    .consent-line input {
      margin-top: 3px;
      accent-color: var(--accent-color);
    }
    .lead-form button {
      width: 100%;
      position: relative;
      overflow: hidden;
      border: none;
      border-radius: 3px;
      padding: 14px 24px;
      background: linear-gradient(115deg, var(--accent-color-dark) 0%, var(--accent-color) 35%, var(--accent-color-light) 60%, var(--accent-color-dark) 100%);
      background-size: 220% 100%;
      color: #06040A;
      font-family: 'Outfit', sans-serif;
      font-size: 16px;
      font-weight: 600;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      cursor: pointer;
      transition: background-position 0.55s ease, box-shadow 0.3s ease, transform 0.2s ease;
    }
    .lead-form button:hover {
      background-position: 100% 0;
      box-shadow: 0 8px 36px rgba(var(--accent-color-rgb), 0.32), 0 2px 8px rgba(0,0,0,0.6);
      transform: translateY(-1px);
    }
    .lead-form button:disabled { opacity: 0.7; cursor: not-allowed; }
    #lead-status { min-height: 1.2em; margin-top: 2px; font-size: 14px; }
    .disclosure {
      margin-top: 10px;
      border-top: 1px solid rgba(var(--accent-color-rgb), 0.22);
      padding-top: 10px;
    }
    .disclosure h2 { margin: 0 0 6px; font-size: 14px; color: var(--accent-color-light); opacity: 1; animation: none; }
    .disclosure p { color: rgba(var(--muted-text-color-rgb), 0.86); font-size: 14px; line-height: 1.5; }

    .disclaimer {
      margin-top: 1vh;
      font-size: 14px;
      color: rgba(var(--muted-text-color-rgb), 0.85);
      line-height: 1.65;
      opacity: 0;
      animation: fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) forwards 1.42s;
    }
    .visual {
      position: absolute;
      right: 0; top: 0;
      width: 44%; height: 100%;
      overflow: hidden;
      background: var(--surface-color);
    }
    .visual::before {
      content: '';
      position: absolute; inset: 0;
      background: radial-gradient(ellipse 65% 65% at 58% 50%, rgba(var(--accent-color-rgb), 0.07) 0%, transparent 70%);
      pointer-events: none;
    }
    .cards-container {
      position: absolute; inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1;
    }
    .report-card {
      position: absolute;
      width: clamp(175px, 14.5vw, 220px);
      aspect-ratio: 5/7;
      border-radius: 7px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4), 0 14px 44px rgba(0,0,0,0.55), 0 32px 80px rgba(0,0,0,0.38);
      opacity: 0;
      transition: box-shadow 0.35s ease;
    }
    .report-card:hover, .report-card.card-hovered {
      box-shadow: 0 4px 12px rgba(0,0,0,0.5), 0 24px 60px rgba(0,0,0,0.7), 0 48px 100px rgba(0,0,0,0.5);
      z-index: 10 !important;
    }
    .card-1 {
      background: linear-gradient(155deg, #152035 0%, #192848 100%);
      transform: rotate(-9deg) translate(-104px, 14px);
      z-index: 1;
      --accent: var(--accent-color); --accent-l: var(--accent-color-light);
      animation: cardFadeIn 0.9s cubic-bezier(0.16,1,0.3,1) forwards 0.55s;
    }
    .card-1:hover, .card-1.card-hovered { transform: rotate(-9deg) translate(-104px, 0) scale(1.07); }
    .card-2 {
      background: linear-gradient(155deg, #162618 0%, #1C3220 100%);
      transform: rotate(-1deg) translate(6px, -12px);
      z-index: 2;
      --accent: #4E9E5A; --accent-l: #74CC82;
      animation: cardFadeIn 0.9s cubic-bezier(0.16,1,0.3,1) forwards 0.75s;
    }
    .card-2:hover, .card-2.card-hovered { transform: rotate(-1deg) translate(6px, -28px) scale(1.07); }
    .card-3 {
      background: linear-gradient(155deg, #261C0C 0%, #332408 100%);
      transform: rotate(8.5deg) translate(110px, 12px);
      z-index: 3;
      --accent: #D0A030; --accent-l: #EEC858;
      animation: cardFadeIn 0.9s cubic-bezier(0.16,1,0.3,1) forwards 0.95s;
    }
    .card-3:hover, .card-3.card-hovered { transform: rotate(8.5deg) translate(110px, -4px) scale(1.07); }
    @keyframes cardFadeIn { to { opacity: 1; } }
    .card-stripe {
      height: 3px;
      background: linear-gradient(to right, var(--accent), var(--accent-l));
      flex-shrink: 0;
    }
    .card-header {
      padding: 13px 14px 6px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-shrink: 0;
    }
    .card-pub {
      font-family: 'Outfit', sans-serif;
      font-size: 9px;
      font-weight: 600;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--accent-l);
      line-height: 1.35;
      max-width: 78%;
    }
    .card-issue {
      font-family: 'Cormorant Garamond', serif;
      font-size: 11px;
      font-weight: 300;
      color: rgba(var(--text-color-rgb), 0.2);
    }
    .card-art {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }
    .card-art-icon {
      color: var(--accent);
      position: relative;
      z-index: 1;
      filter: drop-shadow(0 0 10px var(--accent));
    }
    .card-art-num {
      position: absolute;
      font-family: 'Cormorant Garamond', serif;
      font-size: 108px;
      font-weight: 300;
      color: rgba(255,255,255,0.03);
      line-height: 1;
      bottom: -14px; right: -6px;
      user-select: none;
    }
    .card-footer {
      padding: 10px 14px 14px;
      flex-shrink: 0;
      border-top: 1px solid rgba(255,255,255,0.05);
    }
    .card-tag {
      font-size: 7.5px;
      font-weight: 500;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: var(--accent);
      margin-bottom: 4px;
      opacity: 0.75;
    }
    .card-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 13px;
      font-weight: 600;
      line-height: 1.25;
      color: rgba(var(--text-color-rgb), 0.92);
    }
    .visual-fade {
      position: absolute;
      top: 0; left: 0; bottom: 0;
      width: 130px;
      background: linear-gradient(to right, var(--background-color), transparent);
      pointer-events: none;
      z-index: 2;
    }
    .badge {
      position: absolute;
      top: 34px; right: 34px;
      z-index: 3;
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(var(--surface-color-rgb), 0.85);
      border: 1px solid rgba(var(--accent-color-rgb), 0.22);
      border-radius: 2px;
      padding: 7px 13px;
      backdrop-filter: blur(10px);
      opacity: 0;
      animation: fadeDown 0.9s cubic-bezier(0.16,1,0.3,1) forwards 1.65s;
    }
    .badge-label {
      font-size: 14px;
      letter-spacing: 0.04em;
      color: var(--muted-text-color);
      font-weight: 400;
    }
    .badge-label b { color: var(--accent-color-light); font-weight: 600; }
    .visual-label {
      position: absolute;
      bottom: 30px; left: 36px;
      z-index: 3;
      opacity: 0;
      animation: fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) forwards 1.85s;
    }
    .visual-label span {
      font-family: 'Cormorant Garamond', serif;
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: rgba(var(--accent-color-light-rgb), 0.75);
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(18px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @media (max-width: 860px) {
      .page { min-height: unset; }
      .content {
        width: 100%; min-height: unset;
        padding: 56px 24px 52px;
        overflow: visible;
        position: relative;
      }
      .content::after { display: none; }
      .visual {
        position: relative;
        right: auto; top: auto;
        width: 100%; height: 240px;
        margin-bottom: 2vh;
        flex-shrink: 0;
        background: none;
        overflow: visible;
      }
      .visual-fade {
        top: 0; left: 0; right: 0; bottom: auto;
        height: 64px; width: 100%;
        background: linear-gradient(to bottom, var(--background-color), transparent);
      }
      .visual-label, .badge { display: none; }
      .visual-fade { z-index: 0; }
      .report-card { width: 115px; }
      .card-1 { transform: rotate(-9deg) translate(-68px, 8px); }
      .card-1:hover, .card-1.card-hovered { transform: rotate(-9deg) translate(-68px, -2px) scale(1.05); }
      .card-2 { transform: rotate(-1deg) translate(4px, -6px); }
      .card-2:hover, .card-2.card-hovered { transform: rotate(-1deg) translate(4px, -14px) scale(1.05); }
      .card-3 { transform: rotate(8.5deg) translate(70px, 8px); }
      .card-3:hover, .card-3.card-hovered { transform: rotate(8.5deg) translate(70px, -2px) scale(1.05); }
      h1 { font-size: 36px; }
    }
  </style>
</head>
<body>
<div class="page">
  <section class="content">
    <div class="wordmark">${wordmarkPrefix} <b>${wordmarkAccent}</b> ${wordmarkSuffix}</div>
    <h1>${headline}</h1>
    <h2>${subheadline}</h2>
    <section class="visual">
      <div class="cards-container">
        <div class="report-card card-1">
          <div class="card-stripe"></div>
          <div class="card-header">
            <span class="card-pub">${guide1Pub}</span>
            <span class="card-issue">01</span>
          </div>
          <div class="card-art">
            <svg class="card-art-icon" width="62" height="54" viewBox="0 0 62 54" fill="none">
              <rect x="2" y="28" width="13" height="24" rx="1.5" fill="currentColor" opacity="0.3"/>
              <rect x="21" y="15" width="13" height="37" rx="1.5" fill="currentColor" opacity="0.6"/>
              <rect x="40" y="2" width="13" height="50" rx="1.5" fill="currentColor"/>
              <polyline points="8.5,26 27.5,13 46.5,0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.45"/>
            </svg>
            <span class="card-art-num">01</span>
          </div>
          <div class="card-footer">
            <div class="card-tag">Investment Research</div>
            <div class="card-title">${guide1Desc}</div>
          </div>
        </div>
        <div class="report-card card-2">
          <div class="card-stripe"></div>
          <div class="card-header">
            <span class="card-pub">${guide2Pub}</span>
            <span class="card-issue">02</span>
          </div>
          <div class="card-art">
            <svg class="card-art-icon" width="42" height="62" viewBox="0 0 42 62" fill="none">
              <path d="M25 2L2 36H19L13 60L42 24H24L25 2Z" fill="currentColor"/>
            </svg>
            <span class="card-art-num">02</span>
          </div>
          <div class="card-footer">
            <div class="card-tag">Q2 2026 Top Picks</div>
            <div class="card-title">${guide2Desc}</div>
          </div>
        </div>
        <div class="report-card card-3">
          <div class="card-stripe"></div>
          <div class="card-header">
            <span class="card-pub">${guide3Pub}</span>
            <span class="card-issue">03</span>
          </div>
          <div class="card-art">
            <svg class="card-art-icon" width="72" height="50" viewBox="0 0 72 50" fill="none">
              <rect x="8" y="34" width="56" height="14" rx="3" fill="currentColor" opacity="0.35"/>
              <rect x="14" y="20" width="46" height="17" rx="3" fill="currentColor" opacity="0.65"/>
              <rect x="20" y="6" width="36" height="17" rx="3" fill="currentColor"/>
            </svg>
            <span class="card-art-num">03</span>
          </div>
          <div class="card-footer">
            <div class="card-tag">Wealth Guide</div>
            <div class="card-title">${guide3Desc}</div>
          </div>
        </div>
      </div>
      <div class="visual-fade"></div>
      <div class="badge"><span class="badge-label"><b>${badgeText}</b></span></div>
      <div class="visual-label"><span>${visualLabel}</span></div>
    </section>

    <div class="rule">
      <div class="rule-line"></div>
      <span class="rule-text">${ruleText}</span>
      <div class="rule-line-r"></div>
    </div>

    <ul class="guides">
      <li class="guide">
        <span class="guide-num">1</span>
        <div class="guide-info">
          <div class="guide-pub">${guide1Pub}</div>
          <div class="guide-desc">${guide1Desc}</div>
        </div>
        <span class="guide-arrow">&#8594;</span>
      </li>
      <li class="guide">
        <span class="guide-num">2</span>
        <div class="guide-info">
          <div class="guide-pub">${guide2Pub}</div>
          <div class="guide-desc">${guide2Desc}</div>
        </div>
        <span class="guide-arrow">&#8594;</span>
      </li>
      <li class="guide">
        <span class="guide-num">3</span>
        <div class="guide-info">
          <div class="guide-pub">${guide3Pub}</div>
          <div class="guide-desc">${guide3Desc}</div>
        </div>
        <span class="guide-arrow">&#8594;</span>
      </li>
    </ul>

    <div class="form">
      ${renderLeadForm(content)}
    </div>
    <p class="disclaimer">${disclaimer}</p>
  </section>
</div>

<script>
  const guides = document.querySelectorAll('.guide');
  const cards = document.querySelectorAll('.report-card');
  guides.forEach((guide, i) => {
    guide.addEventListener('mouseenter', () => cards[i]?.classList.add('card-hovered'));
    guide.addEventListener('mouseleave', () => cards[i]?.classList.remove('card-hovered'));
  });
</script>
${renderLeadCaptureScript(context, content.successMessage)}
</body>
</html>`;
  }
};
