import { prisma } from './client.js';
import type {
  Pod,
  PodRepository,
  PodSponsorLink,
  PodSummary,
  AddSponsorInput,
  UpdateSponsorInput,
  CreatePodInput,
  CreateLandingPageVersionInput,
  LandingPageDetail,
  LandingPageVersion
} from '../../domain/pod.js';

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

export class PrismaPodRepository implements PodRepository {
  async createPod(input: CreatePodInput): Promise<Pod> {
    const record = await prisma.pod.create({
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
      status: record.status as Pod['status'],
      currentVersionId: record.currentVersionId,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    };
  }

  async createLandingPageVersion(input: CreateLandingPageVersionInput): Promise<LandingPageVersion> {
    const pod = await prisma.pod.findUnique({
      where: { id: input.podId },
      select: { currentVersionId: true }
    });
    if (!pod) {
      throw new Error('Pod not found');
    }

    const normalizedSlug = input.slug?.trim().toLowerCase() || undefined;
    if (pod.currentVersionId && !normalizedSlug) {
      throw new Error('slug is required for non-root landing pages');
    }

    if (normalizedSlug) {
      const versions = await prisma.landingPageVersion.findMany({
        where: { podId: input.podId },
        select: { content: true }
      });
      const duplicate = versions.some((version) => {
        const slug = extractSlug(version.content as Record<string, unknown>);
        return slug?.toLowerCase() === normalizedSlug;
      });
      if (duplicate) {
        throw new Error('slug already exists for pod');
      }
    }

    const shouldAutoPublish = input.autoPublish !== false;
    const record = await prisma.landingPageVersion.create({
      data: {
        podId: input.podId,
        templateRef: input.templateRef,
        content: withSlugInContent(input.content, normalizedSlug),
        disclosureVersionId: input.disclosureVersionId ?? null,
        status: shouldAutoPublish ? 'published' : 'draft',
        publishedAt: shouldAutoPublish ? new Date() : null
      }
    });

    if (shouldAutoPublish) {
      await prisma.pod.update({
        where: { id: input.podId },
        data: {
          status: 'active',
          ...(pod.currentVersionId ? {} : { currentVersionId: record.id })
        }
      });
    }

    return {
      id: record.id,
      podId: record.podId,
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
    podId: string,
    versionId: string
  ): Promise<LandingPageVersion> {
    const version = await prisma.landingPageVersion.findUnique({
      where: { id: versionId }
    });
    if (!version || version.podId !== podId) {
      throw new Error('Landing page version not found for pod');
    }

    const updated = await prisma.$transaction(async (tx) => {
      const published = await tx.landingPageVersion.update({
        where: { id: versionId },
        data: { status: 'published', publishedAt: new Date() }
      });

      const pod = await tx.pod.findUnique({
        where: { id: podId },
        select: { currentVersionId: true }
      });
      await tx.pod.update({
        where: { id: podId },
        data: {
          status: 'active',
          ...(pod?.currentVersionId ? {} : { currentVersionId: versionId })
        }
      });

      return published;
    });

    return {
      id: updated.id,
      podId: updated.podId,
      slug: extractSlug(updated.content as Record<string, unknown>),
      templateRef: updated.templateRef,
      content: stripInternalContent(updated.content as Record<string, unknown>),
      disclosureVersionId: updated.disclosureVersionId,
      status: updated.status as LandingPageVersion['status'],
      publishedAt: updated.publishedAt,
      createdAt: updated.createdAt
    };
  }

  async findPodById(id: string): Promise<Pod | null> {
    const record = await prisma.pod.findUnique({ where: { id } });
    if (!record) return null;
    return {
      id: record.id,
      name: record.name,
      subdomain: record.subdomain,
      status: record.status as Pod['status'],
      currentVersionId: record.currentVersionId,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    };
  }

  async findPodBySubdomain(subdomain: string): Promise<Pod | null> {
    const pod = await prisma.pod.findUnique({
      where: { subdomain: subdomain.toLowerCase() }
    });
    if (!pod) return null;
    return {
      id: pod.id,
      name: pod.name,
      subdomain: pod.subdomain,
      status: pod.status as Pod['status'],
      currentVersionId: pod.currentVersionId,
      createdAt: pod.createdAt,
      updatedAt: pod.updatedAt
    };
  }

  async findLandingPageVersion(
    podId: string,
    versionId: string
  ): Promise<LandingPageDetail | null> {
    const version = await prisma.landingPageVersion.findUnique({
      where: { id: versionId },
      include: { disclosure: true, pod: true }
    });
    if (!version || version.podId !== podId) return null;

    return {
      id: version.id,
      podId: version.podId,
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
      pod: version.pod
        ? {
            id: version.pod.id,
            name: version.pod.name,
            subdomain: version.pod.subdomain
          }
        : undefined
    };
  }

  async findPublishedLandingBySubdomain(subdomain: string): Promise<LandingPageDetail | null> {
    const pod = await prisma.pod.findUnique({
      where: { subdomain: subdomain.toLowerCase() },
      include: {
        landingPageVersions: { include: { disclosure: true } }
      }
    });

    if (!pod) return null;
    const version = pod.currentVersionId
      ? pod.landingPageVersions.find((item) => item.id === pod.currentVersionId)
      : pod.landingPageVersions
          .filter((item) => item.status === 'published')
          .sort((a, b) => (a.createdAt?.getTime?.() ?? 0) - (b.createdAt?.getTime?.() ?? 0))[0];
    if (!version) return null;

    return {
      id: version.id,
      podId: version.podId,
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
      pod: {
        id: pod.id,
        name: pod.name,
        subdomain: pod.subdomain
      }
    };
  }

  async findPublishedLandingBySubdomainAndSlug(
    subdomain: string,
    slug: string
  ): Promise<LandingPageDetail | null> {
    const pod = await prisma.pod.findUnique({
      where: { subdomain: subdomain.toLowerCase() },
      include: {
        landingPageVersions: { where: { status: 'published' }, include: { disclosure: true } }
      }
    });
    if (!pod) return null;

    const normalizedSlug = slug.toLowerCase();
    const version = pod.landingPageVersions.find((item) => {
      const itemSlug = extractSlug(item.content as Record<string, unknown>);
      return itemSlug?.toLowerCase() === normalizedSlug;
    });
    if (!version) return null;

    return {
      id: version.id,
      podId: version.podId,
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
      pod: {
        id: pod.id,
        name: pod.name,
        subdomain: pod.subdomain
      }
    };
  }

  async findLatestLandingVersion(podId: string): Promise<LandingPageDetail | null> {
    const version = await prisma.landingPageVersion.findFirst({
      where: { podId },
      orderBy: { createdAt: 'desc' },
      include: { disclosure: true, pod: true }
    });
    if (!version) return null;

    return {
      id: version.id,
      podId: version.podId,
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
      pod: version.pod
        ? {
            id: version.pod.id,
            name: version.pod.name,
            subdomain: version.pod.subdomain
          }
        : undefined
    };
  }

  async listPods(): Promise<PodSummary[]> {
    const records = await prisma.pod.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return records.map((record) => ({
      id: record.id,
      name: record.name,
      subdomain: record.subdomain,
      status: record.status as Pod['status'],
      currentVersionId: record.currentVersionId,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    }));
  }

  async listLandingVersions(podId: string): Promise<LandingPageDetail[]> {
    const versions = await prisma.landingPageVersion.findMany({
      where: { podId },
      include: { disclosure: true, pod: true },
      orderBy: { createdAt: 'desc' }
    });

    return versions.map((version) => ({
      id: version.id,
      podId: version.podId,
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
      pod: version.pod
        ? {
            id: version.pod.id,
            name: version.pod.name,
            subdomain: version.pod.subdomain
          }
        : undefined
    }));
  }

  async addSponsor(podId: string, input: AddSponsorInput): Promise<PodSponsorLink> {
    const sponsor = await prisma.sponsor.create({
      data: {
        name: input.name,
        webhookEndpoint: input.webhookEndpoint,
        privacyUrl: input.privacyUrl ?? '',
        termsUrl: input.termsUrl
      }
    });

    const link = await prisma.podSponsor.create({
      data: {
        podId,
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

  async listSponsors(podId: string): Promise<PodSponsorLink[]> {
    const links = await prisma.podSponsor.findMany({
      where: { podId },
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
    podId: string,
    sponsorId: string,
    input: UpdateSponsorInput
  ): Promise<PodSponsorLink> {
    const link = await prisma.podSponsor.findFirst({
      where: { podId, sponsorId },
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

    const updatedLink = await prisma.podSponsor.update({
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

  async removeSponsor(podId: string, sponsorId: string): Promise<void> {
    const link = await prisma.podSponsor.findFirst({
      where: { podId, sponsorId }
    });
    if (!link) throw new Error('Not found');
    await prisma.podSponsor.delete({ where: { id: link.id } });
    // Keep sponsor record for other pods; delete only the link.
  }
}
