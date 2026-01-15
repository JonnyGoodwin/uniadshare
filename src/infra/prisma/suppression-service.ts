import { prisma } from './client.js';
import type { SuppressionService } from '../../services/delivery-service.js';

export class PrismaSuppressionService implements SuppressionService {
  async isSuppressed(sponsorId: string, emailHash: string): Promise<boolean> {
    const count = await prisma.suppression.count({
      where: { sponsorId, emailHash }
    });
    return count > 0;
  }
}
