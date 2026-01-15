import { prisma } from './client.js';
import type {
  Campaign,
  CampaignRepository,
  CampaignSponsorLink,
  CampaignSummary,
  AddSponsorInput,
  UpdateSponsorInput,
  CreateCampaignInput,
  CreateLandingPageVersionInput,
  LandingPageDetail,
  LandingPageVersion
} from '../../domain/campaign.js';

export class PrismaCampaignRepository implements CampaignRepository {
  async createCampaign(input: CreateCampaignInput): Promise<Campaign> {
    const record = await prisma.campaign.create({
      data: {
        name: input.name,
        subdomain: input.subdomain.toLowerCase(),
        status: 'draft'
      }
    });

    return {
      id: record.id,
      name: record.name,
      subdomain: record.subdomain,
      status: record.status as Campaign['status'],
      currentVersionId: record.currentVersionId,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    };
  }

  async createLandingPageVersion(input: CreateLandingPageVersionInput): Promise<LandingPageVersion> {
    const record = await prisma.landingPageVersion.create({
      data: {
        campaignId: input.campaignId,
        templateRef: input.templateRef,
        content: input.content,
        disclosureVersionId: input.disclosureVersionId ?? null,
        status: 'draft'
      }
    });

    return {
      id: record.id,
      campaignId: record.campaignId,
      templateRef: record.templateRef,
      content: record.content as Record<string, unknown>,
      disclosureVersionId: record.disclosureVersionId,
      status: record.status as LandingPageVersion['status'],
      publishedAt: record.publishedAt,
      createdAt: record.createdAt
    };
  }

  async publishLandingPageVersion(
    campaignId: string,
    versionId: string
  ): Promise<LandingPageVersion> {
    const version = await prisma.landingPageVersion.findUnique({
      where: { id: versionId }
    });
    if (!version || version.campaignId !== campaignId) {
      throw new Error('Landing page version not found for campaign');
    }

    const updated = await prisma.$transaction(async (tx) => {
      const published = await tx.landingPageVersion.update({
        where: { id: versionId },
        data: { status: 'published', publishedAt: new Date() }
      });

      await tx.campaign.update({
        where: { id: campaignId },
        data: { currentVersionId: versionId, status: 'active' }
      });

      return published;
    });

    return {
      id: updated.id,
      campaignId: updated.campaignId,
      templateRef: updated.templateRef,
      content: updated.content as Record<string, unknown>,
      disclosureVersionId: updated.disclosureVersionId,
      status: updated.status as LandingPageVersion['status'],
      publishedAt: updated.publishedAt,
      createdAt: updated.createdAt
    };
  }

  async findCampaignById(id: string): Promise<Campaign | null> {
    const record = await prisma.campaign.findUnique({ where: { id } });
    if (!record) return null;
    return {
      id: record.id,
      name: record.name,
      subdomain: record.subdomain,
      status: record.status as Campaign['status'],
      currentVersionId: record.currentVersionId,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    };
  }

  async findCampaignBySubdomain(subdomain: string): Promise<Campaign | null> {
    const campaign = await prisma.campaign.findUnique({
      where: { subdomain: subdomain.toLowerCase() }
    });
    if (!campaign) return null;
    return {
      id: campaign.id,
      name: campaign.name,
      subdomain: campaign.subdomain,
      status: campaign.status as Campaign['status'],
      currentVersionId: campaign.currentVersionId,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt
    };
  }

  async findLandingPageVersion(
    campaignId: string,
    versionId: string
  ): Promise<LandingPageDetail | null> {
    const version = await prisma.landingPageVersion.findUnique({
      where: { id: versionId },
      include: { disclosure: true, campaign: true }
    });
    if (!version || version.campaignId !== campaignId) return null;

    return {
      id: version.id,
      campaignId: version.campaignId,
      templateRef: version.templateRef,
      content: version.content as Record<string, unknown>,
      disclosureVersionId: version.disclosureVersionId,
      status: version.status as LandingPageVersion['status'],
      publishedAt: version.publishedAt,
      createdAt: version.createdAt,
      disclosure: version.disclosure
        ? { id: version.disclosure.id, hash: version.disclosure.hash, text: version.disclosure.text }
        : null,
      campaign: version.campaign
        ? {
            id: version.campaign.id,
            name: version.campaign.name,
            subdomain: version.campaign.subdomain
          }
        : undefined
    };
  }

  async findPublishedLandingBySubdomain(subdomain: string): Promise<LandingPageDetail | null> {
    const campaign = await prisma.campaign.findUnique({
      where: { subdomain: subdomain.toLowerCase() },
      include: {
        landingPageVersions: {
          where: { status: 'published' },
          orderBy: { publishedAt: 'desc' },
          take: 1,
          include: { disclosure: true }
        }
      }
    });

    if (!campaign) return null;
    const version = campaign.landingPageVersions[0];
    if (!version) return null;

    return {
      id: version.id,
      campaignId: version.campaignId,
      templateRef: version.templateRef,
      content: version.content as Record<string, unknown>,
      disclosureVersionId: version.disclosureVersionId,
      status: version.status as LandingPageVersion['status'],
      publishedAt: version.publishedAt,
      createdAt: version.createdAt,
      disclosure: version.disclosure
        ? { id: version.disclosure.id, hash: version.disclosure.hash, text: version.disclosure.text }
        : null,
      campaign: {
        id: campaign.id,
        name: campaign.name,
        subdomain: campaign.subdomain
      }
    };
  }

  async findLatestLandingVersion(campaignId: string): Promise<LandingPageDetail | null> {
    const version = await prisma.landingPageVersion.findFirst({
      where: { campaignId },
      orderBy: { createdAt: 'desc' },
      include: { disclosure: true, campaign: true }
    });
    if (!version) return null;

    return {
      id: version.id,
      campaignId: version.campaignId,
      templateRef: version.templateRef,
      content: version.content as Record<string, unknown>,
      disclosureVersionId: version.disclosureVersionId,
      status: version.status as LandingPageVersion['status'],
      publishedAt: version.publishedAt,
      createdAt: version.createdAt,
      disclosure: version.disclosure
        ? { id: version.disclosure.id, hash: version.disclosure.hash, text: version.disclosure.text }
        : null,
      campaign: version.campaign
        ? {
            id: version.campaign.id,
            name: version.campaign.name,
            subdomain: version.campaign.subdomain
          }
        : undefined
    };
  }

  async listCampaigns(): Promise<CampaignSummary[]> {
    const records = await prisma.campaign.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return records.map((record) => ({
      id: record.id,
      name: record.name,
      subdomain: record.subdomain,
      status: record.status as Campaign['status'],
      currentVersionId: record.currentVersionId,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    }));
  }

  async listLandingVersions(campaignId: string): Promise<LandingPageDetail[]> {
    const versions = await prisma.landingPageVersion.findMany({
      where: { campaignId },
      include: { disclosure: true, campaign: true },
      orderBy: { createdAt: 'desc' }
    });

    return versions.map((version) => ({
      id: version.id,
      campaignId: version.campaignId,
      templateRef: version.templateRef,
      content: version.content as Record<string, unknown>,
      disclosureVersionId: version.disclosureVersionId,
      status: version.status as LandingPageVersion['status'],
      publishedAt: version.publishedAt,
      createdAt: version.createdAt,
      disclosure: version.disclosure
        ? { id: version.disclosure.id, hash: version.disclosure.hash, text: version.disclosure.text }
        : null,
      campaign: version.campaign
        ? {
            id: version.campaign.id,
            name: version.campaign.name,
            subdomain: version.campaign.subdomain
          }
        : undefined
    }));
  }

  async addSponsor(campaignId: string, input: AddSponsorInput): Promise<CampaignSponsorLink> {
    const sponsor = await prisma.sponsor.create({
      data: {
        name: input.name,
        webhookEndpoint: input.webhookEndpoint,
        privacyUrl: input.privacyUrl ?? '',
        termsUrl: input.termsUrl
      }
    });

    const link = await prisma.campaignSponsor.create({
      data: {
        campaignId,
        sponsorId: sponsor.id,
        role: input.role
      }
    });

    return {
      sponsorId: sponsor.id,
      name: sponsor.name,
      webhookEndpoint: sponsor.webhookEndpoint,
      role: link.role,
      privacyUrl: sponsor.privacyUrl,
      termsUrl: sponsor.termsUrl
    };
  }

  async listSponsors(campaignId: string): Promise<CampaignSponsorLink[]> {
    const links = await prisma.campaignSponsor.findMany({
      where: { campaignId },
      include: { sponsor: true }
    });

    return links.map((link) => ({
      sponsorId: link.sponsorId,
      name: link.sponsor.name,
      webhookEndpoint: link.sponsor.webhookEndpoint,
      role: link.role,
      privacyUrl: link.sponsor.privacyUrl,
      termsUrl: link.sponsor.termsUrl
    }));
  }

  async updateSponsor(
    campaignId: string,
    sponsorId: string,
    input: UpdateSponsorInput
  ): Promise<CampaignSponsorLink> {
    const link = await prisma.campaignSponsor.findFirst({
      where: { campaignId, sponsorId },
      include: { sponsor: true }
    });
    if (!link) throw new Error('Not found');

    const updatedSponsor = await prisma.sponsor.update({
      where: { id: sponsorId },
      data: {
        name: input.name ?? link.sponsor.name,
        webhookEndpoint: input.webhookEndpoint ?? link.sponsor.webhookEndpoint,
        privacyUrl: input.privacyUrl ?? link.sponsor.privacyUrl,
        termsUrl: input.termsUrl ?? link.sponsor.termsUrl
      }
    });

    const updatedLink = await prisma.campaignSponsor.update({
      where: { id: link.id },
      data: { role: input.role ?? link.role }
    });

    return {
      sponsorId: updatedSponsor.id,
      name: updatedSponsor.name,
      webhookEndpoint: updatedSponsor.webhookEndpoint,
      role: updatedLink.role,
      privacyUrl: updatedSponsor.privacyUrl,
      termsUrl: updatedSponsor.termsUrl
    };
  }

  async removeSponsor(campaignId: string, sponsorId: string): Promise<void> {
    const link = await prisma.campaignSponsor.findFirst({
      where: { campaignId, sponsorId }
    });
    if (!link) throw new Error('Not found');
    await prisma.campaignSponsor.delete({ where: { id: link.id } });
    // Keep sponsor record for other campaigns; delete only the link.
  }
}
