import type { WebhookAdapter } from '../../services/delivery-service.js';

export class InMemoryWebhookAdapter implements WebhookAdapter {
  async send(): Promise<{ success: boolean }> {
    // Simulate successful webhook delivery; replace with real HTTP call when network destinations are defined.
    return { success: true };
  }
}
