const API_BASE = import.meta.env.VITE_API_BASE ?? '';
const ADMIN_KEY = import.meta.env.VITE_ADMIN_KEY;

export type PodSummary = {
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
  slug?: string | null;
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

export type LandingTemplateField = {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'image' | 'color';
  required?: boolean;
  placeholder?: string;
};

export type LandingTemplate = {
  ref: string;
  name: string;
  description: string;
  fields: LandingTemplateField[];
  defaultContent: Record<string, string>;
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
  listPods: () => request<{ pods: PodSummary[] }>('/api/pods'),
  getPod: (podId: string) =>
    request<{
      pod: PodSummary;
      sponsors: Sponsor[];
      landingPageVersions: LandingPageVersion[];
    }>(`/api/pods/${podId}`),
  listSponsors: (podId: string) => request<{ sponsors: Sponsor[] }>(`/api/pods/${podId}/sponsors`),
  createSponsor: (podId: string, payload: SponsorPayload) =>
    request<{ sponsor: Sponsor }>(`/api/pods/${podId}/sponsors`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  updateSponsor: (podId: string, sponsorId: string, payload: Partial<SponsorPayload>) =>
    request<{ sponsor: Sponsor }>(`/api/pods/${podId}/sponsors/${sponsorId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),
  deleteSponsor: (podId: string, sponsorId: string) =>
    request<void>(`/api/pods/${podId}/sponsors/${sponsorId}`, { method: 'DELETE' }),

  createPod: (payload: { name: string; subdomain: string }) =>
    request<{ pod: PodSummary }>('/api/pods', { method: 'POST', body: JSON.stringify(payload) }),

  createDisclosure: (podId: string, text: string) =>
    request<{ disclosure: { id: string; hash: string; text: string } }>(
      `/api/pods/${podId}/disclosures`,
      {
        method: 'POST',
        body: JSON.stringify({ text })
      }
    ),

  createLandingVersion: (
    podId: string,
    payload: {
      slug?: string;
      templateRef: string;
      content: Record<string, unknown>;
      disclosureVersionId?: string;
    }
  ) =>
    request<{ landingPageVersion: LandingPageVersion }>(`/api/pods/${podId}/landing-versions`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  publishLandingVersion: (podId: string, versionId: string) =>
    request<{ landingPageVersion: LandingPageVersion }>(
      `/api/pods/${podId}/landing-versions/${versionId}/publish`,
      { method: 'POST' }
    ),

  listDeliveries: () => request<{ deliveries: Delivery[] }>('/api/deliveries'),
  listTemplates: () => request<{ templates: LandingTemplate[] }>('/api/templates'),

  fetchLanding: (subdomain: string, params: Record<string, string | boolean | undefined> = {}) => {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) search.set(key, String(value));
    });
    const query = search.toString();
    return request<Record<string, unknown>>(`/api/landing/${subdomain}${query ? `?${query}` : ''}`);
  }
};
