import type { DisclosureService } from './disclosure-service.js';
import type {
  Pod,
  PodRepository,
  CreatePodInput,
  CreateLandingPageVersionInput,
  AddSponsorInput,
  UpdateSponsorInput,
  LandingPageDetail,
  LandingPageVersion
} from '../domain/pod.js';

export class PodService {
  constructor(
    private readonly repo: PodRepository,
    private readonly disclosureService: DisclosureService
  ) {}

  createPod(input: CreatePodInput): Promise<Pod> {
    return this.repo.createPod(input);
  }

  createLandingPageVersion(input: CreateLandingPageVersionInput): Promise<LandingPageVersion> {
    return this.repo.createLandingPageVersion(input);
  }

  publishLandingPageVersion(podId: string, versionId: string): Promise<LandingPageVersion> {
    return this.repo.publishLandingPageVersion(podId, versionId);
  }

  findById(id: string): Promise<Pod | null> {
    return this.repo.findPodById(id);
  }

  async getLandingVersionBySubdomain(
    subdomain: string,
    versionId: string
  ): Promise<LandingPageDetail | null> {
    const pod = await this.repo.findPodBySubdomain(subdomain);
    if (!pod) return null;
    const detail = await this.repo.findLandingPageVersion(pod.id, versionId);
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
    const pod = await this.repo.findPodBySubdomain(subdomain);
    if (!pod) return null;
    const detail = await this.repo.findLatestLandingVersion(pod.id);
    return this.attachDisclosure(detail);
  }

  addSponsor(podId: string, input: AddSponsorInput) {
    return this.repo.addSponsor(podId, input);
  }

  listSponsors(podId: string) {
    return this.repo.listSponsors(podId);
  }

  listLandingVersions(podId: string) {
    return this.repo.listLandingVersions(podId);
  }

  listPods() {
    return this.repo.listPods();
  }

  updateSponsor(podId: string, sponsorId: string, input: UpdateSponsorInput) {
    return this.repo.updateSponsor(podId, sponsorId, input);
  }

  removeSponsor(podId: string, sponsorId: string) {
    return this.repo.removeSponsor(podId, sponsorId);
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
