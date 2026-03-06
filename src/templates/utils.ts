import type { TemplateContext } from './types.js';

export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function renderLeadForm(content: Record<string, string>): string {
  const ctaLabel = escapeHtml(content.ctaLabel ?? 'Submit');
  const consentLabel = escapeHtml(
    content.consentLabel ?? 'I agree to receive emails from the publishers listed below.'
  );

  return `
    <form id="lead-form" class="lead-form">
      <label for="lead-name">First name (optional)</label>
      <input id="lead-name" name="name" type="text" autocomplete="given-name" />

      <label for="lead-email">Email</label>
      <input id="lead-email" name="email" type="email" required autocomplete="email" />

      <p class="consent-line">${consentLabel}</p>

      <button type="submit">${ctaLabel}</button>
      <p id="lead-status" aria-live="polite"></p>
    </form>
  `;
}

export function renderLeadCaptureScript(context: TemplateContext, successMessage?: string): string {
  const scriptContext = JSON.stringify(context).replaceAll('<', '\\u003c');
  const safeSuccessMessage = JSON.stringify(successMessage ?? 'Thanks, your opt-in was received.').replaceAll(
    '<',
    '\\u003c'
  );

  return `<script>
    (() => {
      const context = ${scriptContext};
      const successMessage = ${safeSuccessMessage};
      const form = document.getElementById('lead-form');
      const status = document.getElementById('lead-status');
      if (!form || !status) return;

      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const submit = form.querySelector('button[type="submit"]');
        if (submit) submit.disabled = true;
        status.textContent = 'Submitting...';
        status.style.color = '#334155';

        const data = new FormData(form);
        const params = new URLSearchParams(window.location.search);
        const name = String(data.get('name') ?? '').trim();
        const payload = {
          email: String(data.get('email') ?? ''),
          ...(name ? { name } : {}),
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

          form.reset();
          status.textContent = successMessage;
          status.style.color = '#166534';
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
