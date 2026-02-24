import type { DisclosureService } from './disclosure-service.js';
import type {
  Campaign,
  CampaignRepository,
  CreateCampaignInput,
  CreateLandingPageVersionInput,
  LandingPageDetail,
  LandingPageVersion
} from '../domain/campaign.js';

export class CampaignService {
  constructor(
    private readonly repo: CampaignRepository,
    private readonly disclosureService: DisclosureService
  ) {}

  createCampaign(input: CreateCampaignInput): Promise<Campaign> {
    return this.repo.createCampaign(input);
  }

  createLandingPageVersion(input: CreateLandingPageVersionInput): Promise<LandingPageVersion> {
    return this.repo.createLandingPageVersion(input);
  }

  publishLandingPageVersion(campaignId: string, versionId: string): Promise<LandingPageVersion> {
    return this.repo.publishLandingPageVersion(campaignId, versionId);
  }

  findById(id: string): Promise<Campaign | null> {
    return this.repo.findCampaignById(id);
  }

  async getLandingVersionBySubdomain(
    subdomain: string,
    versionId: string
  ): Promise<LandingPageDetail | null> {
    const campaign = await this.repo.findCampaignBySubdomain(subdomain);
    if (!campaign) return null;
    const detail = await this.repo.findLandingPageVersion(campaign.id, versionId);
    return this.attachDisclosure(detail);
  }

  getPublishedLandingBySubdomain(subdomain: string): Promise<LandingPageDetail | null> {
    return this.repo.findPublishedLandingBySubdomain(subdomain).then((detail) =>
      this.attachDisclosure(detail)
    );
  }

  getPublishedLandingBySubdomainAndSlug(
    subdomain: string,
    slug: string
  ): Promise<LandingPageDetail | null> {
    return this.repo.findPublishedLandingBySubdomainAndSlug(subdomain, slug).then((detail) =>
      this.attachDisclosure(detail)
    );
  }

  async getLatestLandingVersion(subdomain: string): Promise<LandingPageDetail | null> {
    const campaign = await this.repo.findCampaignBySubdomain(subdomain);
    if (!campaign) return null;
    const detail = await this.repo.findLatestLandingVersion(campaign.id);
    return this.attachDisclosure(detail);
  }

  addSponsor(campaignId: string, input: AddSponsorInput) {
    return this.repo.addSponsor(campaignId, input);
  }

  listSponsors(campaignId: string) {
    return this.repo.listSponsors(campaignId);
  }

  listLandingVersions(campaignId: string) {
    return this.repo.listLandingVersions(campaignId);
  }

  listCampaigns() {
    return this.repo.listCampaigns();
  }

  updateSponsor(campaignId: string, sponsorId: string, input: UpdateSponsorInput) {
    return this.repo.updateSponsor(campaignId, sponsorId, input);
  }

  removeSponsor(campaignId: string, sponsorId: string) {
    return this.repo.removeSponsor(campaignId, sponsorId);
  }

  private async attachDisclosure(detail: LandingPageDetail | null): Promise<LandingPageDetail | null> {
    if (!detail) return null;
    if (detail.disclosure || !detail.disclosureVersionId) return detail;

    const disclosure = await this.disclosureService.getById(detail.disclosureVersionId);
    return {
      ...detail,
      disclosure: disclosure
        ? { id: disclosure.id, hash: disclosure.hash, text: disclosure.text }
        : null
    };
  }
}
