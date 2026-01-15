export type LeadMetadata = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  referrer?: string;
  clickId?: string;
  ip?: string;
  userAgent?: string;
};

export type LeadInput = {
  email: string;
  name?: string;
  campaignId: string;
  landingPageVersionId?: string;
  disclosureVersionId?: string;
  consentedAt?: Date;
  metadata?: LeadMetadata;
  disclosureHash?: string;
};

export type Lead = LeadInput & {
  id: string;
  createdAt: Date;
};

export interface LeadRepository {
  save(lead: LeadInput): Promise<Lead>;
  findByEmail(email: string, campaignId?: string): Promise<Lead[]>;
}
