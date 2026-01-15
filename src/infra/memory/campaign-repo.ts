import { randomUUID } from 'node:crypto';

import type {
  Campaign,
  CampaignRepository,
  CampaignSponsorLink,
  CampaignSummary,
  CreateCampaignInput,
  CreateLandingPageVersionInput,
  UpdateSponsorInput,
  LandingPageDetail,
  LandingPageVersion,
  AddSponsorInput
} from '../../domain/campaign.js';

export class InMemoryCampaignRepository implements CampaignRepository {
  private campaigns: Campaign[] = [];
  private landingVersions: LandingPageVersion[] = [];
  private sponsors: CampaignSponsorLink[] = [];

  async createCampaign(input: CreateCampaignInput): Promise<Campaign> {
    const campaign: Campaign = {
      id: randomUUID(),
      name: input.name,
      subdomain: input.subdomain.toLowerCase(),
      status: 'draft',
      currentVersionId: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.campaigns.push(campaign);
    return campaign;
  }

  async createLandingPageVersion(input: CreateLandingPageVersionInput): Promise<LandingPageVersion> {
    const version: LandingPageVersion = {
      id: randomUUID(),
      campaignId: input.campaignId,
      templateRef: input.templateRef,
      content: input.content,
      disclosureVersionId: input.disclosureVersionId ?? null,
      status: 'draft',
      publishedAt: null,
      createdAt: new Date()
    };
    this.landingVersions.push(version);
    return version;
  }

  async publishLandingPageVersion(campaignId: string, versionId: string): Promise<LandingPageVersion> {
    const version = this.landingVersions.find(
      (v) => v.id === versionId && v.campaignId === campaignId
    );
    if (!version) {
      throw new Error('Landing page version not found for campaign');
    }

    version.status = 'published';
    version.publishedAt = new Date();
    version.createdAt = version.createdAt ?? new Date();

    const campaign = this.campaigns.find((c) => c.id === campaignId);
    if (campaign) {
      campaign.currentVersionId = version.id;
      campaign.status = 'active';
      campaign.updatedAt = new Date();
    }

    return version;
  }

  async findCampaignById(id: string): Promise<Campaign | null> {
    return this.campaigns.find((c) => c.id === id) ?? null;
  }

  async findCampaignBySubdomain(subdomain: string): Promise<Campaign | null> {
    return this.campaigns.find((c) => c.subdomain === subdomain.toLowerCase()) ?? null;
  }

  async findLandingPageVersion(
    campaignId: string,
    versionId: string
  ): Promise<LandingPageDetail | null> {
    const version = this.landingVersions.find(
      (v) => v.id === versionId && v.campaignId === campaignId
    );
    const campaign = this.campaigns.find((c) => c.id === campaignId);
    if (!version || !campaign) return null;
    return { ...version, campaign };
  }

  async findPublishedLandingBySubdomain(subdomain: string): Promise<LandingPageDetail | null> {
    const campaign = await this.findCampaignBySubdomain(subdomain);
    if (!campaign?.currentVersionId) return null;
    const version = this.landingVersions.find((v) => v.id === campaign.currentVersionId);
    if (!version) return null;
    return { ...version, campaign };
  }

  async findLatestLandingVersion(campaignId: string): Promise<LandingPageDetail | null> {
    const versions = this.landingVersions
      .filter((v) => v.campaignId === campaignId)
      .sort((a, b) => (b.createdAt?.getTime?.() ?? 0) - (a.createdAt?.getTime?.() ?? 0));
    const version = versions[0];
    if (!version) return null;
    const campaign = this.campaigns.find((c) => c.id === campaignId);
    return campaign ? { ...version, campaign } : null;
  }

  async listCampaigns(): Promise<CampaignSummary[]> {
    return this.campaigns.map((c) => ({
      id: c.id,
      name: c.name,
      subdomain: c.subdomain,
      status: c.status,
      currentVersionId: c.currentVersionId,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt
    }));
  }

  async listLandingVersions(campaignId: string): Promise<LandingPageDetail[]> {
    const campaign = this.campaigns.find((c) => c.id === campaignId);
    if (!campaign) return [];
    return this.landingVersions
      .filter((v) => v.campaignId === campaignId)
      .map((v) => ({ ...v, campaign }))
      .sort(
        (a, b) => (b.createdAt?.getTime?.() ?? 0) - (a.createdAt?.getTime?.() ?? 0)
      );
  }

  async addSponsor(campaignId: string, input: AddSponsorInput): Promise<CampaignSponsorLink> {
    const sponsor: CampaignSponsorLink = {
      sponsorId: randomUUID(),
      name: input.name,
      webhookEndpoint: input.webhookEndpoint,
      role: input.role,
      privacyUrl: input.privacyUrl,
      termsUrl: input.termsUrl
    };
    this.sponsors.push(sponsor);
    return sponsor;
  }

  async listSponsors(): Promise<CampaignSponsorLink[]> {
    // In this in-memory model, sponsors are not keyed by campaign; return all for now.
    return this.sponsors;
  }

  async updateSponsor(
    _campaignId: string,
    sponsorId: string,
    input: UpdateSponsorInput
  ): Promise<CampaignSponsorLink> {
    const sponsor = this.sponsors.find((s) => s.sponsorId === sponsorId);
    if (!sponsor) throw new Error('Not found');
    Object.assign(sponsor, input);
    return sponsor;
  }

  async removeSponsor(_campaignId: string, sponsorId: string): Promise<void> {
    this.sponsors = this.sponsors.filter((s) => s.sponsorId !== sponsorId);
  }
}
