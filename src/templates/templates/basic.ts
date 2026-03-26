import type { LandingTemplateModule } from '../types.js';
import { escapeHtml, renderLeadCaptureScript, renderLeadForm } from '../utils.js';

export const basicTemplate: LandingTemplateModule = {
  ref: 'basic',
  name: 'Basic Lead Capture',
  description: 'Simple hero with headline, supporting copy, and a lead form.',
  fields: [
    {
      key: 'formFields',
      label: 'Form Fields',
      type: 'checkbox-group',
      required: true,
      options: [
        { label: 'Name', value: 'name' },
        { label: 'Email', value: 'email' },
        { label: 'Phone Number', value: 'phone' }
      ]
    },
    { key: 'eyebrow', label: 'Eyebrow', type: 'text', placeholder: 'Free newsletter' },
    {
      key: 'headline',
      label: 'Headline',
      type: 'text',
      required: true,
      placeholder: 'Grow faster with better insights'
    },
    {
      key: 'body',
      label: 'Body Copy',
      type: 'textarea',
      required: true,
      placeholder: 'Explain the value proposition in 1-3 sentences.'
    },
    {
      key: 'ctaLabel',
      label: 'CTA Label',
      type: 'text',
      required: true,
      placeholder: 'Get My Free Tips'
    },
    {
      key: 'successMessage',
      label: 'Success Message',
      type: 'text',
      required: true,
      placeholder: 'Thanks! Check your inbox shortly.'
    }
  ],
  defaultContent: {
    formFields: 'name,email',
    eyebrow: 'Free newsletter',
    headline: 'Get smarter growth ideas every week',
    body: 'Join thousands of operators receiving actionable playbooks, benchmarks, and experiments.',
    ctaLabel: 'Join Free',
    successMessage: 'You are in. Check your inbox for a confirmation.'
  },
  render: ({ content, context }) => {
    const eyebrow = escapeHtml(content.eyebrow ?? '');
    const headline = escapeHtml(content.headline ?? 'Welcome');
    const body = escapeHtml(content.body ?? '');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${headline}</title>
  <style>
    :root { --bg: #f8fafc; --ink: #0f172a; --brand: #0f766e; }
    body { margin: 0; font-family: ui-sans-serif, -apple-system, Segoe UI, sans-serif; background: linear-gradient(135deg, #f8fafc, #eef2ff); color: var(--ink); }
    main { max-width: 780px; margin: 32px auto; padding: 24px; background: white; border-radius: 16px; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08); }
    .eyebrow { color: var(--brand); font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; font-size: 0.75rem; }
    h1 { font-size: 2rem; margin: 8px 0 12px; line-height: 1.1; }
    p { color: #334155; line-height: 1.5; }
    .lead-form { margin-top: 20px; display: grid; gap: 10px; }
    .lead-form input[type="text"], .lead-form input[type="email"] { border: 1px solid #cbd5e1; border-radius: 10px; padding: 10px 12px; font-size: 1rem; }
    .lead-form button { border: 0; background: var(--brand); color: white; border-radius: 10px; padding: 11px 14px; font-weight: 700; cursor: pointer; }
    .lead-form button:disabled { opacity: 0.65; cursor: not-allowed; }
    .consent-line { display: flex; gap: 10px; align-items: flex-start; font-size: 0.9rem; color: #334155; }
    .disclosure { margin-top: 16px; border-top: 1px solid #e2e8f0; padding-top: 14px; }
    #lead-status { min-height: 1.2em; margin: 0; font-size: 0.95rem; }
    @media (max-width: 640px) { main { margin: 16px; padding: 18px; } h1 { font-size: 1.55rem; } }
  </style>
</head>
<body>
  <main>
    ${eyebrow ? `<div class="eyebrow">${eyebrow}</div>` : ''}
    <h1>${headline}</h1>
    <p>${body}</p>
    ${renderLeadForm(content)}
  </main>
  ${renderLeadCaptureScript(context)}
</body>
</html>`;
  }
};
