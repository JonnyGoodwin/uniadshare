import type { LandingTemplateModule } from '../types.js';
import { escapeHtml, renderLeadCaptureScript, renderLeadForm } from '../utils.js';

export const toolkitTemplate: LandingTemplateModule = {
  ref: 'toolkit',
  name: 'toolkit',
  description: 'Resource-style page with toolkit bullets and a focused capture panel.',
  fields: [
    {
      key: 'eyebrow',
      label: 'Eyebrow',
      type: 'text',
      required: true,
      placeholder: 'Free Resource Bundle'
    },
    {
      key: 'headline',
      label: 'Headline',
      type: 'text',
      required: true,
      placeholder: 'Get the Toolkit'
    },
    {
      key: 'subheadline',
      label: 'Subheadline',
      type: 'textarea',
      required: true,
      placeholder: 'Describe what this toolkit helps your audience do.'
    },
    {
      key: 'includesTitle',
      label: 'Includes Title',
      type: 'text',
      required: true,
      placeholder: "What's included"
    },
    {
      key: 'asset1',
      label: 'Asset 1',
      type: 'text',
      required: true,
      placeholder: 'Lead magnet templates'
    },
    {
      key: 'asset1Provider',
      label: 'Asset 1 Provider',
      type: 'text',
      required: true,
      placeholder: 'Partner A'
    },
    {
      key: 'asset2',
      label: 'Asset 2',
      type: 'text',
      required: true,
      placeholder: 'Headline swipe file'
    },
    {
      key: 'asset2Provider',
      label: 'Asset 2 Provider',
      type: 'text',
      required: true,
      placeholder: 'Partner B'
    },
    {
      key: 'asset3',
      label: 'Asset 3',
      type: 'text',
      required: true,
      placeholder: 'Welcome sequence starter'
    },
    {
      key: 'asset3Provider',
      label: 'Asset 3 Provider',
      type: 'text',
      required: true,
      placeholder: 'Partner C'
    },
    {
      key: 'asset4',
      label: 'Asset 4',
      type: 'text',
      required: true,
      placeholder: 'Weekly content planner'
    },
    {
      key: 'asset4Provider',
      label: 'Asset 4 Provider',
      type: 'text',
      required: true,
      placeholder: 'Partner D'
    },
    {
      key: 'proofLine',
      label: 'Proof Line',
      type: 'text',
      required: true,
      placeholder: 'Used by thousands of creators and operators.'
    },
    {
      key: 'ctaLabel',
      label: 'CTA Label',
      type: 'text',
      required: true,
      placeholder: 'Send Me the Toolkit'
    },
    {
      key: 'consentLabel',
      label: 'Consent Label',
      type: 'text',
      required: true,
      placeholder: 'I agree to receive emails from the publishers listed below.'
    },
    {
      key: 'successMessage',
      label: 'Success Message',
      type: 'text',
      required: true,
      placeholder: 'Success. Check your inbox for access details.'
    }
  ],
  defaultContent: {
    eyebrow: 'Free Resource Bundle',
    headline: 'Get the Toolkit',
    subheadline:
      'Steal the exact playbooks, prompts, and templates used to turn attention into subscribers and subscribers into revenue.',
    includesTitle: "What's included",
    asset1: 'Lead magnet angle generator + 50 proven offers',
    asset1Provider: 'Growth Daily',
    asset2: 'High-performing headline and hook swipe file',
    asset2Provider: 'Demand Engine',
    asset3: '7-day welcome sequence framework',
    asset3Provider: 'Inbox Insights',
    asset4: 'Content-to-lead conversion planner',
    asset4Provider: 'Content Lift',
    proofLine: 'Used by creators, agencies, and growth teams to scale acquisition faster.',
    ctaLabel: 'Send Me the Toolkit',
    consentLabel: 'I agree to receive emails from the publishers listed below.',
    successMessage: 'Success. Check your inbox for access details.'
  },
  render: ({ content, context }) => {
    const eyebrow = escapeHtml(content.eyebrow ?? 'Free Resource Bundle');
    const headline = escapeHtml(content.headline ?? 'Get the Toolkit');
    const subheadline = escapeHtml(content.subheadline ?? '');
    const includesTitle = escapeHtml(content.includesTitle ?? "What's included");
    const asset1 = escapeHtml(content.asset1 ?? '');
    const asset1Provider = escapeHtml(content.asset1Provider ?? 'Partner');
    const asset2 = escapeHtml(content.asset2 ?? '');
    const asset2Provider = escapeHtml(content.asset2Provider ?? 'Partner');
    const asset3 = escapeHtml(content.asset3 ?? '');
    const asset3Provider = escapeHtml(content.asset3Provider ?? 'Partner');
    const asset4 = escapeHtml(content.asset4 ?? '');
    const asset4Provider = escapeHtml(content.asset4Provider ?? 'Partner');
    const proofLine = escapeHtml(content.proofLine ?? '');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${headline}</title>
  <style>
    :root {
      --page: #f5f7fb;
      --panel: #ffffff;
      --ink: #0f172a;
      --muted: #475569;
      --line: #d7deeb;
      --brand: #0f172a;
      --accent: #0ea5e9;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: var(--ink);
      background: radial-gradient(1200px 600px at 15% -10%, #e2e8f0 0%, var(--page) 45%);
    }
    .shell {
      max-width: 1120px;
      margin: 32px auto;
      padding: 20px;
    }
    .frame {
      border: 1px solid var(--line);
      border-radius: 20px;
      background: var(--panel);
      overflow: hidden;
      box-shadow: 0 12px 35px rgba(15, 23, 42, 0.08);
    }
    .grid {
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      min-height: 560px;
    }
    .left {
      padding: 44px 42px;
      border-right: 1px solid var(--line);
      background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
    }
    .eyebrow {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      background: #e2e8f0;
      color: #0f172a;
    }
    h1 {
      margin: 14px 0 10px;
      font-size: clamp(2rem, 3.8vw, 3rem);
      line-height: 1.03;
      letter-spacing: -0.02em;
    }
    .sub {
      margin: 0;
      max-width: 60ch;
      color: var(--muted);
      line-height: 1.55;
      font-size: 1.04rem;
    }
    .includes {
      margin-top: 26px;
      padding: 18px 18px 16px;
      border: 1px solid var(--line);
      border-radius: 14px;
      background: #fff;
    }
    .includes h2 {
      margin: 0 0 12px;
      font-size: 0.95rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #334155;
    }
    .includes ul {
      margin: 0;
      padding: 0;
      list-style: none;
      display: grid;
      gap: 9px;
    }
    .includes li { display: flex; gap: 10px; align-items: flex-start; }
    .includes li::before {
      content: '✓';
      color: var(--accent);
      font-weight: 800;
      margin-top: 1px;
    }
    .asset {
      display: grid;
      gap: 2px;
      color: #0f172a;
      font-size: 0.96rem;
      line-height: 1.45;
    }
    .provider {
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #475569;
      font-weight: 700;
    }
    .proof {
      margin-top: 16px;
      color: #334155;
      font-size: 0.92rem;
      line-height: 1.45;
    }
    .right {
      padding: 28px;
      background: #f8fafc;
      display: flex;
      align-items: center;
    }
    .capture {
      width: 100%;
      border: 1px solid var(--line);
      border-radius: 14px;
      background: #fff;
      padding: 18px;
      box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06);
    }
    .capture h3 {
      margin: 0 0 6px;
      font-size: 1.02rem;
    }
    .capture p {
      margin: 0 0 14px;
      color: var(--muted);
      font-size: 0.92rem;
      line-height: 1.45;
    }
    .lead-form { margin: 0; display: grid; gap: 10px; }
    .lead-form label { font-size: 0.82rem; font-weight: 600; color: #334155; }
    .lead-form input[type='text'], .lead-form input[type='email'] {
      width: 100%;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      padding: 10px 12px;
      font-size: 0.96rem;
      color: #0f172a;
      background: #fff;
    }
    .lead-form button {
      border: 0;
      border-radius: 10px;
      padding: 12px 14px;
      background: var(--brand);
      color: #fff;
      font-size: 0.98rem;
      font-weight: 700;
      cursor: pointer;
      margin-top: 2px;
    }
    .lead-form button:disabled { opacity: 0.7; cursor: not-allowed; }
    .consent-line {
      display: flex;
      gap: 8px;
      align-items: flex-start;
      font-size: 0.78rem;
      color: #475569;
      line-height: 1.35;
    }
    #lead-status {
      min-height: 1.1em;
      margin: 2px 0 0;
      font-size: 0.85rem;
    }
    .disclosure {
      margin-top: 14px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
    }
    .disclosure h2 {
      margin: 0 0 6px;
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
    }
    .disclosure p {
      margin: 0;
      color: #475569;
      font-size: 0.8rem;
      line-height: 1.4;
    }
    @media (max-width: 920px) {
      .shell { margin: 14px auto; padding: 10px; }
      .grid { grid-template-columns: 1fr; }
      .left { border-right: 0; border-bottom: 1px solid var(--line); padding: 24px 20px; }
      .right { padding: 16px; }
    }
  </style>
</head>
<body>
  <div class="shell">
    <div class="frame">
      <div class="grid">
        <section class="left">
          <div class="eyebrow">${eyebrow}</div>
          <h1>${headline}</h1>
          <p class="sub">${subheadline}</p>

          <div class="includes">
            <h2>${includesTitle}</h2>
            <ul>
              <li><div class="asset"><span>${asset1}</span><span class="provider">Provided by ${asset1Provider}</span></div></li>
              <li><div class="asset"><span>${asset2}</span><span class="provider">Provided by ${asset2Provider}</span></div></li>
              <li><div class="asset"><span>${asset3}</span><span class="provider">Provided by ${asset3Provider}</span></div></li>
              <li><div class="asset"><span>${asset4}</span><span class="provider">Provided by ${asset4Provider}</span></div></li>
            </ul>
          </div>

          <p class="proof">${proofLine}</p>
        </section>

        <aside class="right">
          <div class="capture">
            <h3>Instant Access</h3>
            <p>Enter your details and we will send the toolkit immediately.</p>
            ${renderLeadForm(content)}
          </div>
        </aside>
      </div>
    </div>
  </div>
  ${renderLeadCaptureScript(context, content.successMessage)}
</body>
</html>`;
  }
};
