const API_BASE = import.meta.env.VITE_API_BASE ?? '';
const ADMIN_KEY = import.meta.env.VITE_ADMIN_KEY;

export type CampaignSummary = {
  id: string;
  name: string;
  subdomain: string;
  status: string;
  currentVersionId?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type LandingPageVersion = {
  id: string;
  templateRef: string;
  status: string;
  publishedAt?: string;
  disclosureVersionId?: string;
};

export type Sponsor = {
  sponsorId: string;
  name: string;
  webhookEndpoint: string;
  role: string;
  privacyUrl?: string;
  termsUrl?: string;
};

export type Delivery = {
  id: string;
  leadId: string;
  sponsorId: string;
  status: string;
  endpoint: string;
  attempts?: Array<{ status: string; at?: string }>;
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    ...(ADMIN_KEY ? { 'x-admin-key': ADMIN_KEY } : {})
  };
  if (options.body !== undefined) {
    headers['content-type'] = 'application/json';
  }
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers as Record<string, string> | undefined)
    }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json() as Promise<T>;
}

export type SponsorPayload = {
  name: string;
  webhookEndpoint: string;
  role: string;
  privacyUrl?: string;
  termsUrl?: string;
};

export const api = {
  listCampaigns: () => request<{ campaigns: CampaignSummary[] }>('/api/campaigns'),
  getCampaign: (campaignId: string) =>
    request<{
      campaign: CampaignSummary;
      sponsors: Sponsor[];
      landingPageVersions: LandingPageVersion[];
    }>(`/api/campaigns/${campaignId}`),
  listSponsors: (campaignId: string) => request<{ sponsors: Sponsor[] }>(`/api/campaigns/${campaignId}/sponsors`),
  createSponsor: (campaignId: string, payload: SponsorPayload) =>
    request<{ sponsor: Sponsor }>(`/api/campaigns/${campaignId}/sponsors`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  updateSponsor: (campaignId: string, sponsorId: string, payload: Partial<SponsorPayload>) =>
    request<{ sponsor: Sponsor }>(`/api/campaigns/${campaignId}/sponsors/${sponsorId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),
  deleteSponsor: (campaignId: string, sponsorId: string) =>
    request<void>(`/api/campaigns/${campaignId}/sponsors/${sponsorId}`, { method: 'DELETE' }),

  createCampaign: (payload: { name: string; subdomain: string }) =>
    request<{ campaign: CampaignSummary }>('/api/campaigns', { method: 'POST', body: JSON.stringify(payload) }),

  createDisclosure: (campaignId: string, text: string) =>
    request<{ disclosure: { id: string; hash: string; text: string } }>(
      `/api/campaigns/${campaignId}/disclosures`,
      {
        method: 'POST',
        body: JSON.stringify({ text })
      }
    ),

  createLandingVersion: (
    campaignId: string,
    payload: { templateRef: string; content: Record<string, unknown>; disclosureVersionId?: string }
  ) =>
    request<{ landingPageVersion: LandingPageVersion }>(`/api/campaigns/${campaignId}/landing-versions`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  publishLandingVersion: (campaignId: string, versionId: string) =>
    request<{ landingPageVersion: LandingPageVersion }>(
      `/api/campaigns/${campaignId}/landing-versions/${versionId}/publish`,
      { method: 'POST' }
    ),

  listDeliveries: () => request<{ deliveries: Delivery[] }>('/api/deliveries'),

  fetchLanding: (subdomain: string, params: Record<string, string | boolean | undefined> = {}) => {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) search.set(key, String(value));
    });
    const query = search.toString();
    return request<Record<string, unknown>>(`/api/landing/${subdomain}${query ? `?${query}` : ''}`);
  }
};
