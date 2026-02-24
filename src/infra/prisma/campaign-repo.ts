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

const SLUG_KEY = '__landingSlug';

function extractSlug(content: Record<string, unknown>): string | null {
  const candidate = content[SLUG_KEY];
  return typeof candidate === 'string' && candidate.trim().length > 0 ? candidate : null;
}

function stripInternalContent(content: Record<string, unknown>): Record<string, unknown> {
  const next = { ...content };
  delete next[SLUG_KEY];
  return next;
}

function withSlugInContent(content: Record<string, unknown>, slug?: string): Record<string, unknown> {
  const next = { ...content };
  if (slug) {
    next[SLUG_KEY] = slug;
  } else {
    delete next[SLUG_KEY];
  }
  return next;
}

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
    const campaign = await prisma.campaign.findUnique({
      where: { id: input.campaignId },
      select: { currentVersionId: true }
    });
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const normalizedSlug = input.slug?.trim().toLowerCase() || undefined;
    if (campaign.currentVersionId && !normalizedSlug) {
      throw new Error('slug is required for non-root landing pages');
    }

    if (normalizedSlug) {
      const versions = await prisma.landingPageVersion.findMany({
        where: { campaignId: input.campaignId },
        select: { content: true }
      });
      const duplicate = versions.some((version) => {
        const slug = extractSlug(version.content as Record<string, unknown>);
        return slug?.toLowerCase() === normalizedSlug;
      });
      if (duplicate) {
        throw new Error('slug already exists for campaign');
      }
    }

    const shouldAutoPublish = input.autoPublish !== false;
    const record = await prisma.landingPageVersion.create({
      data: {
        campaignId: input.campaignId,
        templateRef: input.templateRef,
        content: withSlugInContent(input.content, normalizedSlug),
        disclosureVersionId: input.disclosureVersionId ?? null,
        status: shouldAutoPublish ? 'published' : 'draft',
        publishedAt: shouldAutoPublish ? new Date() : null
      }
    });

    if (shouldAutoPublish) {
      await prisma.campaign.update({
        where: { id: input.campaignId },
        data: {
          status: 'active',
          ...(campaign.currentVersionId ? {} : { currentVersionId: record.id })
        }
      });
    }

    return {
      id: record.id,
      campaignId: record.campaignId,
      slug: extractSlug(record.content as Record<string, unknown>),
      templateRef: record.templateRef,
      content: stripInternalContent(record.content as Record<string, unknown>),
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

      const campaign = await tx.campaign.findUnique({
        where: { id: campaignId },
        select: { currentVersionId: true }
      });
      await tx.campaign.update({
        where: { id: campaignId },
        data: {
          status: 'active',
          ...(campaign?.currentVersionId ? {} : { currentVersionId: versionId })
        }
      });

      return published;
    });

    return {
      id: updated.id,
      campaignId: updated.campaignId,
      slug: extractSlug(updated.content as Record<string, unknown>),
      templateRef: updated.templateRef,
      content: stripInternalContent(updated.content as Record<string, unknown>),
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
      slug: extractSlug(version.content as Record<string, unknown>),
      templateRef: version.templateRef,
      content: stripInternalContent(version.content as Record<string, unknown>),
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
        landingPageVersions: { include: { disclosure: true } }
      }
    });

    if (!campaign) return null;
    const version = campaign.currentVersionId
      ? campaign.landingPageVersions.find((item) => item.id === campaign.currentVersionId)
      : campaign.landingPageVersions
          .filter((item) => item.status === 'published')
          .sort((a, b) => (a.createdAt?.getTime?.() ?? 0) - (b.createdAt?.getTime?.() ?? 0))[0];
    if (!version) return null;

    return {
      id: version.id,
      campaignId: version.campaignId,
      slug: extractSlug(version.content as Record<string, unknown>),
      templateRef: version.templateRef,
      content: stripInternalContent(version.content as Record<string, unknown>),
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

  async findPublishedLandingBySubdomainAndSlug(
    subdomain: string,
    slug: string
  ): Promise<LandingPageDetail | null> {
    const campaign = await prisma.campaign.findUnique({
      where: { subdomain: subdomain.toLowerCase() },
      include: {
        landingPageVersions: { where: { status: 'published' }, include: { disclosure: true } }
      }
    });
    if (!campaign) return null;

    const normalizedSlug = slug.toLowerCase();
    const version = campaign.landingPageVersions.find((item) => {
      const itemSlug = extractSlug(item.content as Record<string, unknown>);
      return itemSlug?.toLowerCase() === normalizedSlug;
    });
    if (!version) return null;

    return {
      id: version.id,
      campaignId: version.campaignId,
      slug: extractSlug(version.content as Record<string, unknown>),
      templateRef: version.templateRef,
      content: stripInternalContent(version.content as Record<string, unknown>),
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
      slug: extractSlug(version.content as Record<string, unknown>),
      templateRef: version.templateRef,
      content: stripInternalContent(version.content as Record<string, unknown>),
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
      slug: extractSlug(version.content as Record<string, unknown>),
      templateRef: version.templateRef,
      content: stripInternalContent(version.content as Record<string, unknown>),
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
