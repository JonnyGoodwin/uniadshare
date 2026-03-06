import {
  DEFAULT_GIFT_HEADER_FONT,
  DEFAULT_GIFT_PARAGRAPH_FONT,
  buildGoogleFontsHref,
  fallbackGiftHeaderFontOptions,
  fallbackGiftParagraphFontOptions,
  resolveGiftHeaderFont,
  resolveGiftParagraphFont,
  toTemplateFontOptions
} from '../google-fonts.js';
import type { LandingTemplateModule } from '../types.js';
import { escapeHtml, renderLeadCaptureScript } from '../utils.js';

export const giftForNewReadersTemplate: LandingTemplateModule = {
  ref: 'gift-for-new-readers',
  name: 'gift for new readers',
  description: 'Editorial parchment-style offer page with partner perks and social proof.',
  fields: [
    {
      key: 'logoImage',
      label: 'Logo Image',
      type: 'image',
      required: true,
      placeholder: 'https://example.com/logo.png'
    },
    {
      key: 'logoName',
      label: 'Logo Name',
      type: 'text',
      required: true,
      placeholder: 'The Pourover'
    },
    {
      key: 'headerFont',
      label: 'Header Font',
      type: 'font',
      required: true,
      options: toTemplateFontOptions(fallbackGiftHeaderFontOptions())
    },
    {
      key: 'paragraphFont',
      label: 'Paragraph Font',
      type: 'font',
      required: true,
      options: toTemplateFontOptions(fallbackGiftParagraphFontOptions())
    },
    {
      key: 'eyebrowText',
      label: 'Eyebrow Text',
      type: 'text',
      required: true,
      placeholder: 'A gift for new readers'
    },
    {
      key: 'headlinePrefix',
      label: 'Headline Prefix',
      type: 'text',
      required: true,
      placeholder: 'Start Your Day'
    },
    {
      key: 'headlineAccent',
      label: 'Headline Accent',
      type: 'text',
      required: true,
      placeholder: 'Grounded.'
    },
    {
      key: 'subheadline',
      label: 'Subheadline',
      type: 'textarea',
      required: true,
      placeholder: 'Faith-centered news and hand-picked resources delivered free every morning.'
    },
    {
      key: 'emailLabel',
      label: 'Email Label',
      type: 'text',
      required: true,
      placeholder: 'Your email address'
    },
    {
      key: 'belowOptInText',
      label: 'Below Opt-In Text',
      type: 'text',
      required: true,
      placeholder: 'Join over 1.5 million readers. Free forever.'
    },
    {
      key: 'sectionBreakLabel',
      label: 'Section Break Label',
      type: 'text',
      required: true,
      placeholder: 'Also included, free from our partners'
    },
    {
      key: 'asset1Provider',
      label: 'Asset 1 Provider',
      type: 'text',
      required: true,
      placeholder: 'Partner A'
    },
    {
      key: 'asset1',
      label: 'Asset 1 Copy',
      type: 'text',
      required: true,
      placeholder: 'Free trial of a curated study app.'
    },
    {
      key: 'asset2Provider',
      label: 'Asset 2 Provider',
      type: 'text',
      required: true,
      placeholder: 'Partner B'
    },
    {
      key: 'asset2',
      label: 'Asset 2 Copy',
      type: 'text',
      required: true,
      placeholder: 'A free weekly devotional for believers.'
    },
    {
      key: 'proofNumber',
      label: 'Proof Number',
      type: 'text',
      required: true,
      placeholder: '1.5M+'
    },
    {
      key: 'proofLabel',
      label: 'Proof Label',
      type: 'text',
      required: true,
      placeholder: 'Christians reading every morning'
    },
    {
      key: 'ctaLabel',
      label: 'CTA Label',
      type: 'text',
      required: true,
      placeholder: 'Get My Free Offers'
    },
    {
      key: 'consentLabel',
      label: 'Consent Label',
      type: 'text',
      required: true,
      placeholder: 'By subscribing, I agree to receive emails from the publishers listed above.'
    },
    {
      key: 'successHeading',
      label: 'Success Heading',
      type: 'text',
      required: true,
      placeholder: "You're in."
    },
    {
      key: 'successMessage',
      label: 'Success Message',
      type: 'text',
      required: true,
      placeholder: 'Check your inbox for your first edition and partner offers.'
    }
  ],
  defaultContent: {
    logoImage: 'https://thepourover.org/wp-content/uploads/2024/09/cropped-coral_circle_icon.png',
    logoName: 'The Pourover',
    headerFont: DEFAULT_GIFT_HEADER_FONT,
    paragraphFont: DEFAULT_GIFT_PARAGRAPH_FONT,
    eyebrowText: 'A gift for new readers',
    headlinePrefix: 'Start Your Day',
    headlineAccent: 'Grounded.',
    subheadline:
      'Faith-centered news and hand-picked resources — delivered free to your inbox every morning.',
    emailLabel: 'Your email address',
    belowOptInText: 'Join over 1.5 million Christians who read the Pourover. Free forever.',
    sectionBreakLabel: 'Also included, free from our partners',
    asset1Provider: 'Logos Bible Software',
    asset1: 'Free 7-day trial of a curated Bible study app. No card required.',
    asset2Provider: 'Groundwork Ministry',
    asset2: 'A free weekly devotional for believers navigating a noisy world.',
    proofNumber: '1.5M+',
    proofLabel: 'Christians reading every morning',
    ctaLabel: 'Get My Free Offers',
    consentLabel:
      'By subscribing, I agree to receive emails from the Pourover and the partners listed above.',
    successHeading: "You're in.",
    successMessage: 'Check your inbox — your first edition and partner offers are on their way.'
  },
  render: ({ content, context }) => {
    const logoImage = escapeHtml(content.logoImage ?? '');
    const logoName = escapeHtml(content.logoName ?? '');
    const headerFont = resolveGiftHeaderFont(content.headerFont);
    const paragraphFont = resolveGiftParagraphFont(content.paragraphFont);
    const googleFontsHref = buildGoogleFontsHref([headerFont, paragraphFont]);
    const eyebrowText = escapeHtml(content.eyebrowText ?? '');
    const headlinePrefix = escapeHtml(content.headlinePrefix ?? '');
    const headlineAccent = escapeHtml(content.headlineAccent ?? '');
    const subheadline = escapeHtml(content.subheadline ?? '');
    const emailLabel = escapeHtml(content.emailLabel ?? 'Your email address');
    const belowOptInText = escapeHtml(content.belowOptInText ?? '');
    const sectionBreakLabel = escapeHtml(content.sectionBreakLabel ?? '');
    const asset1Provider = escapeHtml(content.asset1Provider ?? '');
    const asset1 = escapeHtml(content.asset1 ?? '');
    const asset2Provider = escapeHtml(content.asset2Provider ?? '');
    const asset2 = escapeHtml(content.asset2 ?? '');
    const proofNumber = escapeHtml(content.proofNumber ?? '');
    const proofLabel = escapeHtml(content.proofLabel ?? '');
    const ctaLabel = escapeHtml(content.ctaLabel ?? 'Submit');
    const consentLabel = escapeHtml(content.consentLabel ?? 'I agree to receive emails from the publishers listed below.');
    const successHeading = escapeHtml(content.successHeading ?? 'Success');
    const successMessage = escapeHtml(content.successMessage ?? 'Thanks, your opt-in was received.');

    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${logoName} — ${eyebrowText}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="${googleFontsHref}" rel="stylesheet" />
    <style>
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      :root {
        --coral: #e8654a;
        --coral-dark: #c4462c;
        --coral-glow: rgba(232, 101, 74, 0.18);
        --parchment: #f3ede2;
        --parchment-2: #ede5d7;
        --ink: #18120c;
        --ink-mid: #3d3028;
        --muted: #8a7c6e;
        --rule: #d6ccbc;
        --font-header: ${headerFont.cssFamily};
        --font-paragraph: ${paragraphFont.cssFamily};
      }
      html, body { min-height: 100%; background: var(--parchment); color: var(--ink); font-family: var(--font-paragraph); }
      body::after {
        content: '';
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 999;
        opacity: 0.04;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
        background-size: 300px 300px;
      }
      body::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: var(--coral);
        z-index: 998;
      }
      .page { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px 24px 72px; }
      .col { width: 100%; max-width: 660px; }
      @keyframes rise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
      .a1 { animation: rise 0.65s cubic-bezier(0.22, 0.68, 0, 1.2) 0.05s both; }
      .a2 { animation: rise 0.65s cubic-bezier(0.22, 0.68, 0, 1.2) 0.15s both; }
      .a3 { animation: rise 0.7s cubic-bezier(0.22, 0.68, 0, 1.2) 0.26s both; }
      .a4 { animation: rise 0.65s cubic-bezier(0.22, 0.68, 0, 1.2) 0.38s both; }
      .a5 { animation: rise 0.65s cubic-bezier(0.22, 0.68, 0, 1.2) 0.5s both; }
      .a6 { animation: rise 0.65s cubic-bezier(0.22, 0.68, 0, 1.2) 0.6s both; }
      .a7 { animation: rise 0.65s cubic-bezier(0.22, 0.68, 0, 1.2) 0.7s both; }
      .a8 { animation: rise 0.65s cubic-bezier(0.22, 0.68, 0, 1.2) 0.78s both; }
      .logo-row { display: flex; align-items: center; gap: 9px; margin-bottom: 52px; }
      .logo-img { width: 28px; height: 28px; object-fit: contain; }
      .logo-name { font-family: var(--font-header); font-size: 0.8125rem; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: var(--ink-mid); }
      .eyebrow { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; }
      .eyebrow-line { flex: 0 0 28px; height: 1px; background: var(--coral); }
      .eyebrow-text { font-size: 0.6875rem; font-weight: 400; letter-spacing: 0.14em; text-transform: uppercase; color: var(--coral); }
      .headline { font-family: var(--font-header); font-size: clamp(3.5rem, 9vw, 5.25rem); font-style: italic; font-weight: 300; line-height: 1; color: var(--ink); margin-bottom: 26px; letter-spacing: -0.015em; }
      .headline-accent { font-style: normal; font-weight: 500; color: var(--coral); }
      .sub { font-family: var(--font-header); font-size: 1.1875rem; font-weight: 400; line-height: 1.7; color: var(--muted); margin-bottom: 44px; max-width: 480px; }
      .lead-form { display: contents; }
      .email-zone { margin-bottom: 13px; }
      .email-label { display: block; font-size: 0.6875rem; font-weight: 400; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); margin-bottom: 10px; }
      .lead-form input[type='text'] { display: none; }
      @keyframes halo { 0%, 100% { box-shadow: 0 0 0 0px var(--coral-glow); } 55% { box-shadow: 0 0 0 7px var(--coral-glow); } }
      .lead-form input[type='email'] {
        display: block;
        width: 100%;
        height: 66px;
        padding: 0 22px;
        font-family: var(--font-header);
        font-size: 1.25rem;
        font-style: italic;
        font-weight: 400;
        color: var(--ink);
        background: var(--parchment-2);
        border: 2px solid var(--ink);
        border-radius: 3px;
        outline: none;
        transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        animation: halo 3.2s ease-in-out 1.8s infinite;
      }
      .lead-form input[type='email']::placeholder { color: var(--muted); font-style: italic; }
      .lead-form input[type='email']:focus { border-color: var(--coral); background: #fff; box-shadow: 0 0 0 5px var(--coral-glow); animation: none; }
      .lead-form button {
        display: block;
        width: 100%;
        height: 56px;
        background: var(--coral);
        color: #fff;
        font-family: var(--font-paragraph);
        font-size: 0.875rem;
        font-weight: 400;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        border: none;
        border-radius: 3px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        transition: background 0.2s;
      }
      .lead-form button::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(105deg, transparent 30%, rgba(255, 255, 255, 0.14) 50%, transparent 70%);
        transform: translateX(-120%);
        transition: transform 0.55s ease;
      }
      .lead-form button:hover { background: var(--coral-dark); }
      .lead-form button:hover::before { transform: translateX(120%); }
      .lead-form button:active { opacity: 0.9; }
      .lead-form button:disabled { opacity: 0.65; cursor: not-allowed; }
      .below-optin { font-size: 0.775rem; font-weight: 300; color: var(--muted); text-align: center; margin-top: 14px; letter-spacing: 0.01em; }
      #lead-status { min-height: 1.2em; text-align: center; font-size: 0.8rem; margin: 10px 0 0; }
      .section-break { display: flex; align-items: center; gap: 14px; margin: 36px 0 28px; }
      .section-break::before, .section-break::after { content: ''; flex: 1; height: 1px; background: var(--rule); }
      .section-break-label { font-size: 0.6375rem; font-weight: 400; letter-spacing: 0.13em; text-transform: uppercase; color: var(--muted); white-space: nowrap; }
      .assets { display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; }
      .asset { display: grid; grid-template-columns: 20px 1fr; gap: 0 10px; align-items: start; }
      .asset-bullet { margin-top: 7px; width: 5px; height: 5px; border-radius: 50%; background: var(--coral); justify-self: center; }
      .asset-text { font-family: var(--font-header); font-size: 1.0625rem; line-height: 1.55; color: var(--muted); }
      .asset-name { font-weight: 500; font-style: italic; color: var(--ink-mid); }
      .consent { margin-bottom: 18px; }
      .consent-text { font-size: 0.725rem; font-weight: 300; line-height: 1.65; color: var(--muted); letter-spacing: 0.01em; }
      .disclosure { margin-bottom: 30px; font-size: 0.7rem; color: var(--muted); line-height: 1.55; }
      .disclosure h2 { display: none; }
      .proof { padding-top: 26px; border-top: 1px solid var(--rule); text-align: center; }
      .proof-number { font-family: var(--font-header); font-size: 2rem; font-weight: 400; color: var(--ink); line-height: 1; margin-bottom: 4px; }
      .proof-label { font-size: 0.725rem; font-weight: 300; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); }
      .success { display: none; text-align: center; padding: 24px 0; }
      .success.visible { display: block; }
      .success-ring {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        border: 2px solid var(--coral);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 32px;
      }
      .success-ring svg { width: 22px; height: 22px; stroke: var(--coral); }
      .success-hed { font-family: var(--font-header); font-size: 3.5rem; font-style: italic; font-weight: 300; color: var(--ink); line-height: 1; margin-bottom: 18px; }
      .success-msg { font-family: var(--font-header); font-size: 1.125rem; line-height: 1.7; color: var(--muted); max-width: 380px; margin: 0 auto; }
      @media (max-width: 560px) {
        .page { padding: 32px 20px 60px; }
        .logo-row { margin-bottom: 40px; }
        .sub { margin-bottom: 36px; }
      }
    </style>
  </head>
  <body>
    <div class="page">
      <div class="col" id="main">
        <div class="logo-row a1">
          <img class="logo-img" src="${logoImage}" alt="" />
          <span class="logo-name">${logoName}</span>
        </div>

        <div class="eyebrow a2">
          <span class="eyebrow-line"></span>
          <span class="eyebrow-text">${eyebrowText}</span>
        </div>

        <h1 class="headline a3">
          ${headlinePrefix}<br />
          <span class="headline-accent">${headlineAccent}</span>
        </h1>

        <p class="sub a4">${subheadline}</p>

        <form id="lead-form" class="lead-form">
          <input id="lead-name" name="name" type="text" autocomplete="given-name" />
          <div class="email-zone a5">
            <label class="email-label" for="lead-email">${emailLabel}</label>
            <input id="lead-email" name="email" type="email" required autocomplete="email" placeholder="you@example.com" />
          </div>

          <div class="a5">
            <button type="submit">${ctaLabel}</button>
          </div>

          <p class="below-optin a5">${belowOptInText}</p>

          <div class="section-break a6">
            <span class="section-break-label">${sectionBreakLabel}</span>
          </div>

          <div class="assets a6">
            <div class="asset">
              <div class="asset-bullet"></div>
              <p class="asset-text"><span class="asset-name">${asset1Provider}</span> - ${asset1}</p>
            </div>
            <div class="asset">
              <div class="asset-bullet"></div>
              <p class="asset-text"><span class="asset-name">${asset2Provider}</span> - ${asset2}</p>
            </div>
          </div>

          <p class="consent consent-text a7">${consentLabel}</p>

          <p id="lead-status" aria-live="polite"></p>
        </form>

        <div class="proof a8">
          <div class="proof-number">${proofNumber}</div>
          <div class="proof-label">${proofLabel}</div>
        </div>
      </div>

      <div class="success col" id="success">
        <div class="success-ring">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 class="success-hed">${successHeading}</h2>
        <p class="success-msg">${successMessage}</p>
      </div>
    </div>

    ${renderLeadCaptureScript(context, content.successMessage)}
    <script>
      (() => {
        const email = document.getElementById('lead-email');
        const status = document.getElementById('lead-status');
        const main = document.getElementById('main');
        const success = document.getElementById('success');
        const expectedSuccess = ${JSON.stringify(content.successMessage ?? 'Thanks, your opt-in was received.').replaceAll('<', '\\u003c')};

        if (email) {
          email.addEventListener('input', () => {
            email.style.borderColor = '';
          });
        }

        if (!status || !main || !success) {
          return;
        }

        const observer = new MutationObserver(() => {
          if (status.textContent === expectedSuccess) {
            main.style.display = 'none';
            success.classList.add('visible');
          }
        });

        observer.observe(status, { childList: true, characterData: true, subtree: true });
      })();
    </script>
  </body>
</html>`;
  }
};
