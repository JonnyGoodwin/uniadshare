export type DisclosureInput = {
  campaignId?: string;
  text: string;
};

export type DisclosureVersion = {
  id: string;
  campaignId?: string | null;
  text: string;
  hash: string;
  createdAt: Date;
};

export interface DisclosureRepository {
  create(input: DisclosureInput, hash: string): Promise<DisclosureVersion>;
  findById(id: string): Promise<DisclosureVersion | null>;
}
