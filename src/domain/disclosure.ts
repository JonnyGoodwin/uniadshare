export type DisclosureInput = {
  podId?: string;
  text: string;
};

export type DisclosureVersion = {
  id: string;
  podId?: string | null;
  text: string;
  hash: string;
  createdAt: Date;
};

export interface DisclosureRepository {
  create(input: DisclosureInput, hash: string): Promise<DisclosureVersion>;
  findById(id: string): Promise<DisclosureVersion | null>;
}
