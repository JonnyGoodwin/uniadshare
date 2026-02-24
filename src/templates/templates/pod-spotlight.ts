import type { LandingTemplateModule } from '../types.js';
import { escapeHtml, renderLeadCaptureScript, renderLeadForm } from '../utils.js';

export const podSpotlightTemplate: LandingTemplateModule = {
  ref: 'pod-spotlight',
  name: 'Pod Spotlight',
  description: 'Two-column pod layout with benefits and stronger social proof.',
  fields: [
    {
      key: 'headline',
      label: 'Headline',
      type: 'text',
      required: true,
      placeholder: 'Unlock acquisition tactics from top brands'
    },
    {
      key: 'subheadline',
      label: 'Subheadline',
      type: 'text',
      required: true,
      placeholder: 'Weekly teardown, no fluff.'
    },
    {
      key: 'benefit1',
      label: 'Benefit 1',
      type: 'text',
      required: true,
      placeholder: 'Case studies from real pods'
    },
    {
      key: 'benefit2',
      label: 'Benefit 2',
      type: 'text',
      required: true,
      placeholder: 'Copy-and-paste playbooks'
    },
    {
      key: 'benefit3',
      label: 'Benefit 3',
      type: 'text',
      required: true,
      placeholder: 'Sponsor-backed growth opportunities'
    },
    {
      key: 'ctaLabel',
      label: 'CTA Label',
      type: 'text',
      required: true,
      placeholder: 'Reserve My Spot'
    },
    {
      key: 'consentLabel',
      label: 'Consent Label',
      type: 'text',
      required: true,
      placeholder: 'I consent to receive email from these publishers and partners.'
    },
    {
      key: 'successMessage',
      label: 'Success Message',
      type: 'text',
      required: true,
      placeholder: 'Done. Welcome aboard.'
    }
  ],
  defaultContent: {
    headline: 'The acquisition pod for modern growth teams',
    subheadline: 'Learn what is working right now from high-performing operators.',
    benefit1: 'Actionable pod breakdowns',
    benefit2: 'Creative and copy examples every week',
    benefit3: 'Partner offers and sponsor opportunities',
    ctaLabel: 'Subscribe Now',
    consentLabel: 'I consent to receive email from these publishers and partners.',
    successMessage: 'Success. Watch for your first issue.'
  },
  render: ({ content, disclosureText, context }) => {
    const headline = escapeHtml(content.headline ?? 'Join the pod');
    const subheadline = escapeHtml(content.subheadline ?? '');
    const benefit1 = escapeHtml(content.benefit1 ?? '');
    const benefit2 = escapeHtml(content.benefit2 ?? '');
    const benefit3 = escapeHtml(content.benefit3 ?? '');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${headline}</title>
  <style>
    :root { --bg: #f1f5f9; --ink: #111827; --accent: #b91c1c; }
    body { margin: 0; font-family: ui-sans-serif, -apple-system, Segoe UI, sans-serif; background: radial-gradient(circle at top, #fee2e2 0%, var(--bg) 50%); color: var(--ink); }
    .wrap { max-width: 980px; margin: 30px auto; padding: 20px; }
    .shell { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 18px; }
    .panel { background: white; border: 1px solid #e5e7eb; border-radius: 16px; padding: 22px; box-shadow: 0 10px 25px rgba(17, 24, 39, 0.06); }
    h1 { margin: 0 0 10px; font-size: 2rem; line-height: 1.1; }
    .sub { margin: 0 0 12px; color: #374151; }
    ul { margin: 0; padding-left: 18px; color: #1f2937; line-height: 1.6; }
    .lead-form { margin-top: 6px; display: grid; gap: 10px; }
    .lead-form input[type="text"], .lead-form input[type="email"] { border: 1px solid #d1d5db; border-radius: 10px; padding: 10px 12px; font-size: 1rem; }
    .lead-form button { border: 0; background: var(--accent); color: white; border-radius: 10px; padding: 11px 14px; font-weight: 700; cursor: pointer; }
    .lead-form button:disabled { opacity: 0.65; cursor: not-allowed; }
    .consent-line { display: flex; gap: 10px; align-items: flex-start; font-size: 0.9rem; color: #334155; }
    .disclosure { margin-top: 14px; border-top: 1px solid #e5e7eb; padding-top: 12px; }
    #lead-status { min-height: 1.2em; margin: 0; font-size: 0.95rem; }
    @media (max-width: 760px) { .shell { grid-template-columns: 1fr; } .wrap { margin: 12px auto; } h1 { font-size: 1.6rem; } }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="shell">
      <section class="panel">
        <h1>${headline}</h1>
        <p class="sub">${subheadline}</p>
        <ul>
          <li>${benefit1}</li>
          <li>${benefit2}</li>
          <li>${benefit3}</li>
        </ul>
      </section>
      <section class="panel">
        ${renderLeadForm(content, disclosureText)}
      </section>
    </div>
  </div>
  ${renderLeadCaptureScript(context, content.successMessage)}
</body>
</html>`;
  }
};
