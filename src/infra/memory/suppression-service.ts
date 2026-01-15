import type { SuppressionService } from '../../services/delivery-service.js';

export class InMemorySuppressionService implements SuppressionService {
  private suppressed = new Map<string, Set<string>>(); // sponsorId -> set of email hashes

  async isSuppressed(sponsorId: string, emailHash: string): Promise<boolean> {
    const set = this.suppressed.get(sponsorId);
    return set ? set.has(emailHash) : false;
  }

  addSuppression(sponsorId: string, emailHash: string): void {
    const set = this.suppressed.get(sponsorId) ?? new Set<string>();
    set.add(emailHash);
    this.suppressed.set(sponsorId, set);
  }
}
