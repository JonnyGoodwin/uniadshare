import { randomUUID } from 'node:crypto';

import type {
  Pod,
  PodRepository,
  PodSponsorLink,
  PodSummary,
  CreatePodInput,
  CreateLandingPageVersionInput,
  UpdateSponsorInput,
  LandingPageDetail,
  LandingPageVersion,
  AddSponsorInput
} from '../../domain/pod.js';

export class InMemoryPodRepository implements PodRepository {
  private pods: Pod[] = [];
  private landingVersions: LandingPageVersion[] = [];
  private sponsors: PodSponsorLink[] = [];

  async createPod(input: CreatePodInput): Promise<Pod> {
    const pod: Pod = {
      id: randomUUID(),
      name: input.name,
      subdomain: input.subdomain.toLowerCase(),
      status: 'draft',
      currentVersionId: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.pods.push(pod);
    return pod;
  }

  async createLandingPageVersion(input: CreateLandingPageVersionInput): Promise<LandingPageVersion> {
    const pod = this.pods.find((c) => c.id === input.podId);
    if (!pod) {
      throw new Error('Pod not found');
    }

    const normalizedSlug = input.slug?.trim().toLowerCase() || undefined;
    const hasRoot = Boolean(pod.currentVersionId);
    if (hasRoot && !normalizedSlug) {
      throw new Error('slug is required for non-root landing pages');
    }

    if (normalizedSlug) {
      const duplicate = this.landingVersions.find(
        (v) => v.podId === input.podId && v.slug?.toLowerCase() === normalizedSlug
      );
      if (duplicate) {
        throw new Error('slug already exists for pod');
      }
    }

    const shouldAutoPublish = input.autoPublish !== false;
    const version: LandingPageVersion = {
      id: randomUUID(),
      podId: input.podId,
      slug: normalizedSlug ?? null,
      templateRef: input.templateRef,
      content: input.content,
      disclosureVersionId: input.disclosureVersionId ?? null,
      status: shouldAutoPublish ? 'published' : 'draft',
      publishedAt: shouldAutoPublish ? new Date() : null,
      createdAt: new Date()
    };
    this.landingVersions.push(version);

    if (shouldAutoPublish) {
      if (!pod.currentVersionId) {
        pod.currentVersionId = version.id;
      }
      pod.status = 'active';
      pod.updatedAt = new Date();
    }

    return version;
  }

  async publishLandingPageVersion(podId: string, versionId: string): Promise<LandingPageVersion> {
    const version = this.landingVersions.find(
      (v) => v.id === versionId && v.podId === podId
    );
    if (!version) {
      throw new Error('Landing page version not found for pod');
    }

    version.status = 'published';
    version.publishedAt = new Date();
    version.createdAt = version.createdAt ?? new Date();

    const pod = this.pods.find((c) => c.id === podId);
    if (pod) {
      pod.currentVersionId = version.id;
      pod.status = 'active';
      pod.updatedAt = new Date();
    }

    return version;
  }

  async findPodById(id: string): Promise<Pod | null> {
    return this.pods.find((c) => c.id === id) ?? null;
  }

  async findPodBySubdomain(subdomain: string): Promise<Pod | null> {
    return this.pods.find((c) => c.subdomain === subdomain.toLowerCase()) ?? null;
  }

  async findLandingPageVersion(
    podId: string,
    versionId: string
  ): Promise<LandingPageDetail | null> {
    const version = this.landingVersions.find(
      (v) => v.id === versionId && v.podId === podId
    );
    const pod = this.pods.find((c) => c.id === podId);
    if (!version || !pod) return null;
    return { ...version, pod };
  }

  async findPublishedLandingBySubdomain(subdomain: string): Promise<LandingPageDetail | null> {
    const pod = await this.findPodBySubdomain(subdomain);
    if (!pod?.currentVersionId) return null;
    const version = this.landingVersions.find((v) => v.id === pod.currentVersionId);
    if (!version) return null;
    return { ...version, pod };
  }

  async findPublishedLandingBySubdomainAndSlug(
    subdomain: string,
    slug: string
  ): Promise<LandingPageDetail | null> {
    const pod = await this.findPodBySubdomain(subdomain);
    if (!pod) return null;
    const normalizedSlug = slug.toLowerCase();
    const version = this.landingVersions.find(
      (v) =>
        v.podId === pod.id &&
        v.status === 'published' &&
        v.slug?.toLowerCase() === normalizedSlug
    );
    if (!version) return null;
    return { ...version, pod };
  }

  async findLatestLandingVersion(podId: string): Promise<LandingPageDetail | null> {
    const versions = this.landingVersions
      .filter((v) => v.podId === podId)
      .sort((a, b) => (b.createdAt?.getTime?.() ?? 0) - (a.createdAt?.getTime?.() ?? 0));
    const version = versions[0];
    if (!version) return null;
    const pod = this.pods.find((c) => c.id === podId);
    return pod ? { ...version, pod } : null;
  }

  async listPods(): Promise<PodSummary[]> {
    return this.pods.map((c) => ({
      id: c.id,
      name: c.name,
      subdomain: c.subdomain,
      status: c.status,
      currentVersionId: c.currentVersionId,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt
    }));
  }

  async listLandingVersions(podId: string): Promise<LandingPageDetail[]> {
    const pod = this.pods.find((c) => c.id === podId);
    if (!pod) return [];
    return this.landingVersions
      .filter((v) => v.podId === podId)
      .map((v) => ({ ...v, pod }))
      .sort(
        (a, b) => (b.createdAt?.getTime?.() ?? 0) - (a.createdAt?.getTime?.() ?? 0)
      );
  }

  async addSponsor(podId: string, input: AddSponsorInput): Promise<PodSponsorLink> {
    const sponsor: PodSponsorLink = {
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

  async listSponsors(): Promise<PodSponsorLink[]> {
    // In this in-memory model, sponsors are not keyed by pod; return all for now.
    return this.sponsors;
  }

  async updateSponsor(
    _podId: string,
    sponsorId: string,
    input: UpdateSponsorInput
  ): Promise<PodSponsorLink> {
    const sponsor = this.sponsors.find((s) => s.sponsorId === sponsorId);
    if (!sponsor) throw new Error('Not found');
    Object.assign(sponsor, input);
    return sponsor;
  }

  async removeSponsor(_podId: string, sponsorId: string): Promise<void> {
    this.sponsors = this.sponsors.filter((s) => s.sponsorId !== sponsorId);
  }
}
