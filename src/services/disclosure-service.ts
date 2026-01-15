import { createHash } from 'node:crypto';

import type { DisclosureInput, DisclosureRepository, DisclosureVersion } from '../domain/disclosure.js';

export class DisclosureService {
  constructor(private readonly repo: DisclosureRepository) {}

  async create(input: DisclosureInput): Promise<DisclosureVersion> {
    const hash = createHash('sha256').update(input.text).digest('hex');
    return this.repo.create(input, hash);
  }

  async getById(id: string): Promise<DisclosureVersion | null> {
    return this.repo.findById(id);
  }

  async assertExists(id?: string): Promise<void> {
    if (!id) return;
    const disclosure = await this.getById(id);
    if (!disclosure) {
      throw new Error('Disclosure version not found');
    }
  }
}
