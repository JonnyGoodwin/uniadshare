export type Pod = {
  id: string;
  name: string;
  subdomain: string;
  status: 'draft' | 'active' | 'inactive';
  currentVersionId?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type LandingPageVersion = {
  id: string;
  podId: string;
  slug?: string | null;
  templateRef: string;
  content: Record<string, unknown>;
  disclosureVersionId?: string | null;
  status: 'draft' | 'published';
  publishedAt?: Date | null;
  createdAt: Date;
};

export type LandingPageDetail = LandingPageVersion & {
  disclosure?: {
    id: string;
    hash: string;
    text: string;
  } | null;
  pod?: Pick<Pod, 'id' | 'name' | 'subdomain'>;
};

export type PodSummary = Pick<Pod, 'id' | 'name' | 'subdomain' | 'status' | 'currentVersionId'> & {
  createdAt: Date;
  updatedAt: Date;
};

export type PodSponsorLink = {
  sponsorId: string;
  name: string;
  webhookEndpoint: string;
  role: string;
  privacyUrl?: string | null;
  termsUrl?: string | null;
};

export type AddSponsorInput = {
  name: string;
  webhookEndpoint: string;
  role: string; // primary, co-reg
  privacyUrl?: string;
  termsUrl?: string;
};
export type UpdateSponsorInput = Partial<AddSponsorInput>;

export type CreatePodInput = {
  name: string;
  subdomain: string;
};

export type CreateLandingPageVersionInput = {
  podId: string;
  slug?: string;
  templateRef: string;
  content: Record<string, unknown>;
  disclosureVersionId?: string;
  autoPublish?: boolean;
};

export interface PodRepository {
  createPod(input: CreatePodInput): Promise<Pod>;
  createLandingPageVersion(input: CreateLandingPageVersionInput): Promise<LandingPageVersion>;
  publishLandingPageVersion(podId: string, versionId: string): Promise<LandingPageVersion>;
  findPodById(id: string): Promise<Pod | null>;
  findPodBySubdomain(subdomain: string): Promise<Pod | null>;
  findLandingPageVersion(podId: string, versionId: string): Promise<LandingPageDetail | null>;
  findPublishedLandingBySubdomain(subdomain: string): Promise<LandingPageDetail | null>;
  findPublishedLandingBySubdomainAndSlug(subdomain: string, slug: string): Promise<LandingPageDetail | null>;
  findLatestLandingVersion(podId: string): Promise<LandingPageDetail | null>;
  listPods(): Promise<PodSummary[]>;
  listLandingVersions(podId: string): Promise<LandingPageDetail[]>;
  addSponsor(podId: string, input: AddSponsorInput): Promise<PodSponsorLink>;
  listSponsors(podId: string): Promise<PodSponsorLink[]>;
  updateSponsor(
    podId: string,
    sponsorId: string,
    input: UpdateSponsorInput
  ): Promise<PodSponsorLink>;
  removeSponsor(podId: string, sponsorId: string): Promise<void>;
}
