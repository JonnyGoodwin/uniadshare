import type { WebhookAdapter } from '../../services/delivery-service.js';

export class FetchWebhookAdapter implements WebhookAdapter {
  constructor(private readonly timeoutMs = 5000, private readonly maxRetries = 3) {}

  async send(endpoint: string, payload: unknown): Promise<{ success: boolean }> {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        clearTimeout(timeout);
        if (res.ok) {
          return { success: true };
        }
      } catch {
        // swallow and retry
      }
      await new Promise((resolve) => setTimeout(resolve, 100 * attempt));
    }
    return { success: false };
  }
}
