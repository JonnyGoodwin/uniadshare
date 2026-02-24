import { prisma } from './client.js';
import type { DisclosureInput, DisclosureRepository, DisclosureVersion } from '../../domain/disclosure.js';

export class PrismaDisclosureRepository implements DisclosureRepository {
  async create(input: DisclosureInput, hash: string): Promise<DisclosureVersion> {
    const record = await prisma.disclosureVersion.create({
      data: {
        podId: input.podId ?? null,
        text: input.text,
        hash
      }
    });

    return {
      id: record.id,
      podId: record.podId,
      text: record.text,
      hash: record.hash,
      createdAt: record.createdAt
    };
  }

  async findById(id: string): Promise<DisclosureVersion | null> {
    const record = await prisma.disclosureVersion.findUnique({ where: { id } });
    if (!record) return null;
    return {
      id: record.id,
      podId: record.podId,
      text: record.text,
      hash: record.hash,
      createdAt: record.createdAt
    };
  }
}
