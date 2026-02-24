import { randomUUID } from 'node:crypto';

import type { DisclosureInput, DisclosureRepository, DisclosureVersion } from '../../domain/disclosure.js';

export class InMemoryDisclosureRepository implements DisclosureRepository {
  private disclosures: DisclosureVersion[] = [];

  async create(input: DisclosureInput, hash: string): Promise<DisclosureVersion> {
    const disclosure: DisclosureVersion = {
      id: randomUUID(),
      podId: input.podId ?? null,
      text: input.text,
      hash,
      createdAt: new Date()
    };
    this.disclosures.push(disclosure);
    return disclosure;
  }

  async findById(id: string): Promise<DisclosureVersion | null> {
    return this.disclosures.find((d) => d.id === id) ?? null;
  }
}
