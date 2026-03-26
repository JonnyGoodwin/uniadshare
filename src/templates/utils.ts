import type { TemplateContext } from './types.js';

function parseFormFields(value: string | undefined): Set<string> {
  const selected = (value ?? 'name,email')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter((item) => item.length > 0);
  return new Set(selected.length > 0 ? selected : ['name', 'email']);
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function renderLeadForm(
  content: Record<string, string>
): string {
  const ctaLabel = escapeHtml(content.ctaLabel ?? 'Submit');
  const formFields = parseFormFields(content.formFields);
  const askName = formFields.has('name');
  const askEmail = formFields.has('email');
  const askPhone = formFields.has('phone');

  return `
    <form id="lead-form" class="lead-form">
      ${askName ? `<label for="lead-name">Name</label>
      <input id="lead-name" name="name" type="text" autocomplete="name" />` : ''}
      ${askEmail ? `<label for="lead-email">Email</label>
      <input id="lead-email" name="email" type="email" autocomplete="email" />` : ''}
      ${askPhone ? `<label for="lead-phone">Phone Number</label>
      <input id="lead-phone" name="phone" type="tel" autocomplete="tel" />` : ''}

      <button type="submit">${ctaLabel}</button>
      <p id="lead-status" aria-live="polite"></p>
    </form>
  `;
}

export function renderLeadCaptureScript(context: TemplateContext): string {
  const scriptContext = JSON.stringify(context).replaceAll('<', '\\u003c');

  return `<script>
    (() => {
      const context = ${scriptContext};
      const form = document.getElementById('lead-form');
      const status = document.getElementById('lead-status');
      if (!form || !status) return;

      const resolveThankYouUrl = () => {
        const url = new URL(window.location.href);
        const normalizedPath = url.pathname === '/' ? '/' : url.pathname.replace(/\\/+$/, '');
        url.pathname = normalizedPath === '/' ? '/thank-you' : normalizedPath + '/thank-you';
        return url.toString();
      };

      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const submit = form.querySelector('button[type="submit"]');
        if (submit) submit.disabled = true;
        status.textContent = 'Submitting...';
        status.style.color = '#334155';

        const data = new FormData(form);
        const params = new URLSearchParams(window.location.search);
        const name = String(data.get('name') ?? '').trim();
        const email = String(data.get('email') ?? '').trim();
        const phone = String(data.get('phone') ?? '').trim();
        const payload = {
          ...(email ? { email } : {}),
          ...(name ? { name } : {}),
          ...(phone ? { phone } : {}),
          podId: context.podId,
          landingPageVersionId: context.landingPageVersionId,
          disclosureVersionId: context.disclosureVersionId ?? undefined,
          consentedAt: new Date().toISOString(),
          metadata: {
            utmSource: params.get('utm_source') ?? undefined,
            utmMedium: params.get('utm_medium') ?? undefined,
            utmCampaign: params.get('utm_campaign') ?? undefined,
            utmTerm: params.get('utm_term') ?? undefined,
            utmContent: params.get('utm_content') ?? undefined,
            referrer: document.referrer || undefined,
            clickId: params.get('click_id') ?? params.get('cid') ?? undefined,
            userAgent: navigator.userAgent
          }
        };

        try {
          const response = await fetch('/api/leads', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(payload)
          });

          if (!response.ok) {
            const text = await response.text();
            throw new Error(text || 'Failed to submit');
          }

          window.location.assign(resolveThankYouUrl());
        } catch (error) {
          status.textContent = error instanceof Error ? error.message : 'Unable to submit right now';
          status.style.color = '#b91c1c';
        } finally {
          if (submit) submit.disabled = false;
        }
      });
    })();
  </script>`;
}
