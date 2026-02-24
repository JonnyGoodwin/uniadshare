export type Campaign = {
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
  campaignId: string;
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
  campaign?: Pick<Campaign, 'id' | 'name' | 'subdomain'>;
};

export type CampaignSummary = Pick<Campaign, 'id' | 'name' | 'subdomain' | 'status' | 'currentVersionId'> & {
  createdAt: Date;
  updatedAt: Date;
};

export type CampaignSponsorLink = {
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

export type CreateCampaignInput = {
  name: string;
  subdomain: string;
};

export type CreateLandingPageVersionInput = {
  campaignId: string;
  slug?: string;
  templateRef: string;
  content: Record<string, unknown>;
  disclosureVersionId?: string;
  autoPublish?: boolean;
};

export interface CampaignRepository {
  createCampaign(input: CreateCampaignInput): Promise<Campaign>;
  createLandingPageVersion(input: CreateLandingPageVersionInput): Promise<LandingPageVersion>;
  publishLandingPageVersion(campaignId: string, versionId: string): Promise<LandingPageVersion>;
  findCampaignById(id: string): Promise<Campaign | null>;
  findCampaignBySubdomain(subdomain: string): Promise<Campaign | null>;
  findLandingPageVersion(campaignId: string, versionId: string): Promise<LandingPageDetail | null>;
  findPublishedLandingBySubdomain(subdomain: string): Promise<LandingPageDetail | null>;
  findPublishedLandingBySubdomainAndSlug(subdomain: string, slug: string): Promise<LandingPageDetail | null>;
  findLatestLandingVersion(campaignId: string): Promise<LandingPageDetail | null>;
  listCampaigns(): Promise<CampaignSummary[]>;
  listLandingVersions(campaignId: string): Promise<LandingPageDetail[]>;
  addSponsor(campaignId: string, input: AddSponsorInput): Promise<CampaignSponsorLink>;
  listSponsors(campaignId: string): Promise<CampaignSponsorLink[]>;
  updateSponsor(
    campaignId: string,
    sponsorId: string,
    input: UpdateSponsorInput
  ): Promise<CampaignSponsorLink>;
  removeSponsor(campaignId: string, sponsorId: string): Promise<void>;
}
