import { useEffect, useMemo, useState } from 'react';

import { Badge } from '../components/Badge';
import { Button, Card, TextInput } from '../components/Form';
import { api } from '../lib/api';
import type { CampaignSummary, LandingPageVersion, LandingTemplate, Sponsor } from '../lib/api';

type PartnerForm = {
  name: string;
  webhookEndpoint: string;
};

type WizardState = {
  podName: string;
  subdomain: string;
  primaryPartner: PartnerForm;
  sponsor1: PartnerForm;
  sponsor2: PartnerForm;
  templateRef: string;
  templateContent: Record<string, string>;
  disclosureText: string;
};

const defaultPartner: PartnerForm = {
  name: '',
  webhookEndpoint: ''
};

const stepTitles = ['Pod Information', 'Create Initial Offer', 'Disclosure'];

export function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
  const [templates, setTemplates] = useState<LandingTemplate[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [selectedCampaign, setSelectedCampaign] = useState<{
    campaign: CampaignSummary;
    sponsors: Sponsor[];
    landingPageVersions: LandingPageVersion[];
  } | null>(null);
  const [mode, setMode] = useState<'list' | 'create'>('list');
  const [step, setStep] = useState(0);
  const [wizard, setWizard] = useState<WizardState>({
    podName: '',
    subdomain: '',
    primaryPartner: { ...defaultPartner },
    sponsor1: { ...defaultPartner },
    sponsor2: { ...defaultPartner },
    templateRef: 'basic',
    templateContent: {},
    disclosureText: ''
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const activeTemplate = useMemo(
    () => templates.find((template) => template.ref === wizard.templateRef) ?? null,
    [templates, wizard.templateRef]
  );

  const apiBase = import.meta.env.VITE_API_BASE;

  function normalizeWebhookEndpoint(input: string): string {
    const trimmed = input.trim();
    if (!trimmed) return '';
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  }

  function isValidUrl(input: string): boolean {
    try {
      const url = new URL(input);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  function getLandingPreviewHref(subdomain: string, version?: LandingPageVersion): string {
    try {
      const baseUrl = new URL(apiBase || window.location.origin);
      const previewUrl = new URL('/api/preview/', `${baseUrl.protocol}//${baseUrl.host}`);
      previewUrl.pathname = `/api/preview/${subdomain}`;
      if (version?.id) {
        previewUrl.searchParams.set('versionId', version.id);
      }

      return previewUrl.toString();
    } catch {
      const query = version?.id ? `?versionId=${encodeURIComponent(version.id)}` : '';
      return `${apiBase ?? ''}/api/preview/${encodeURIComponent(subdomain)}${query}`;
    }
  }

  function resetWizard(selectedRef?: string) {
    const initialTemplate = selectedRef ?? templates.find((template) => template.ref === 'basic')?.ref ?? '';
    const baseTemplate = templates.find((template) => template.ref === initialTemplate);
    setWizard({
      podName: '',
      subdomain: '',
      primaryPartner: { ...defaultPartner },
      sponsor1: { ...defaultPartner },
      sponsor2: { ...defaultPartner },
      templateRef: initialTemplate,
      templateContent: baseTemplate ? { ...baseTemplate.defaultContent } : {},
      disclosureText: ''
    });
    setStep(0);
  }

  function selectTemplate(ref: string, carry: Record<string, string> = {}) {
    const template = templates.find((item) => item.ref === ref);
    if (!template) return;

    const nextValues: Record<string, string> = { ...template.defaultContent };
    for (const field of template.fields) {
      const candidate = carry[field.key];
      if (typeof candidate === 'string') {
        nextValues[field.key] = candidate;
      }
    }

    setWizard((prev) => ({
      ...prev,
      templateRef: ref,
      templateContent: nextValues
    }));
  }

  useEffect(() => {
    api
      .listCampaigns()
      .then((res) => setCampaigns(res.campaigns))
      .catch((err) => setError(err.message));

    api
      .listTemplates()
      .then((res) => {
        setTemplates(res.templates);
        if (res.templates.length === 0) return;
        const preferred = res.templates.find((template) => template.ref === 'basic') ?? res.templates[0];
        resetWizard(preferred.ref);
      })
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (!selectedCampaignId) return;
    api
      .getCampaign(selectedCampaignId)
      .then((res) => setSelectedCampaign(res))
      .catch((err) => setError(err.message));
  }, [selectedCampaignId]);

  function validateStep(currentStep: number): string | null {
    if (currentStep === 0) {
      if (!wizard.podName.trim()) return 'Pod Name is required';
      if (!wizard.subdomain.trim()) return 'Subdomain is required';
      if (!wizard.primaryPartner.name.trim() || !wizard.primaryPartner.webhookEndpoint.trim()) {
        return 'Primary Partner name and webhook endpoint are required';
      }
      if (!isValidUrl(normalizeWebhookEndpoint(wizard.primaryPartner.webhookEndpoint))) {
        return 'Primary Partner webhook endpoint must be a valid URL';
      }
      if (!wizard.sponsor1.name.trim() || !wizard.sponsor1.webhookEndpoint.trim()) {
        return 'Sponsor 1 name and webhook endpoint are required';
      }
      if (!isValidUrl(normalizeWebhookEndpoint(wizard.sponsor1.webhookEndpoint))) {
        return 'Sponsor 1 webhook endpoint must be a valid URL';
      }
      if (!wizard.sponsor2.name.trim() || !wizard.sponsor2.webhookEndpoint.trim()) {
        return 'Sponsor 2 name and webhook endpoint are required';
      }
      if (!isValidUrl(normalizeWebhookEndpoint(wizard.sponsor2.webhookEndpoint))) {
        return 'Sponsor 2 webhook endpoint must be a valid URL';
      }
      return null;
    }

    if (currentStep === 1) {
      if (!activeTemplate) return 'Template selection is required';
      for (const field of activeTemplate.fields) {
        if (!field.required) continue;
        const value = wizard.templateContent[field.key] ?? '';
        if (!value.trim()) return `${field.label} is required`;
      }
      return null;
    }

    if (currentStep === 2) {
      if (!wizard.disclosureText.trim()) return 'Disclosure text is required';
      return null;
    }

    return null;
  }

  function nextStep() {
    const validationError = validateStep(step);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setStep((prev) => Math.min(prev + 1, 2));
  }

  function prevStep() {
    setError(null);
    setStep((prev) => Math.max(prev - 1, 0));
  }

  async function completeWizard() {
    const validationError = validateStep(2);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!activeTemplate) {
      setError('Template selection is required');
      return;
    }

    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const createdCampaign = await api.createCampaign({
        name: wizard.podName.trim(),
        subdomain: wizard.subdomain.trim().toLowerCase()
      });

      const campaignId = createdCampaign.campaign.id;

      await api.createSponsor(campaignId, {
        name: wizard.primaryPartner.name.trim(),
        webhookEndpoint: normalizeWebhookEndpoint(wizard.primaryPartner.webhookEndpoint),
        role: 'primary'
      });

      await api.createSponsor(campaignId, {
        name: wizard.sponsor1.name.trim(),
        webhookEndpoint: normalizeWebhookEndpoint(wizard.sponsor1.webhookEndpoint),
        role: 'co-reg'
      });

      await api.createSponsor(campaignId, {
        name: wizard.sponsor2.name.trim(),
        webhookEndpoint: normalizeWebhookEndpoint(wizard.sponsor2.webhookEndpoint),
        role: 'co-reg'
      });

      const disclosure = await api.createDisclosure(campaignId, wizard.disclosureText.trim());

      const content: Record<string, string> = {};
      for (const field of activeTemplate.fields) {
        content[field.key] = wizard.templateContent[field.key] ?? '';
      }

      await api.createLandingVersion(campaignId, {
        templateRef: wizard.templateRef,
        content,
        disclosureVersionId: disclosure.disclosure.id
      });

      const refreshed = await api.listCampaigns();
      setCampaigns(refreshed.campaigns);
      setMode('list');
      setSelectedCampaignId(campaignId);
      setMessage(`Created campaign ${campaignId}`);
      resetWizard(wizard.templateRef);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Campaigns</h1>
        {mode === 'list' ? (
          <Button
            onClick={() => {
              setMode('create');
              setError(null);
              setMessage(null);
              resetWizard(wizard.templateRef);
            }}
          >
            Create New Campaign
          </Button>
        ) : (
          <Button
            variant="ghost"
            onClick={() => {
              setMode('list');
              setError(null);
            }}
          >
            Back to Campaigns
          </Button>
        )}
      </div>

      {mode === 'create' ? (
        <Card title="New Campaign Wizard">
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4">
              <div className="mt-4 hidden md:block">
                <div className="relative">
                  <div className="pointer-events-none absolute inset-x-0 top-4 border-t border-dotted border-slate-300" />
                  <div
                    className="pointer-events-none absolute left-0 top-4 border-t border-slate-900 transition-all"
                    style={{ width: `${((step + 1) / stepTitles.length) * 100}%` }}
                  />

                  <div className="flex items-start">
                    {stepTitles.map((title, index) => {
                      const active = step === index;
                      const complete = step > index;

                      return (
                        <div key={title} className="relative flex-1 px-2">
                          <div
                            className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                              complete || active
                                ? 'border border-slate-900 bg-slate-900 text-white'
                                : 'border border-slate-300 bg-white text-slate-500'
                            }`}
                          >
                            {index + 1}
                          </div>

                          <div className="mt-2 text-center">
                            <div className="text-sm font-semibold text-slate-800">{title}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2 md:hidden">
                {stepTitles.map((title, index) => {
                  const active = step === index;
                  const complete = step > index;
                  return (
                    <div key={title} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                              complete || active
                                ? 'border border-slate-900 bg-slate-900 text-white'
                                : 'border border-slate-300 bg-white text-slate-500'
                            }`}
                          >
                            {index + 1}
                          </div>
                          <div className="text-sm font-semibold text-slate-800">{title}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {step === 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextInput
                    label="Pod Name"
                    value={wizard.podName}
                    onChange={(event) => setWizard((prev) => ({ ...prev, podName: event.target.value }))}
                  />
                  <TextInput
                    label="Subdomain"
                    value={wizard.subdomain}
                    onChange={(event) => setWizard((prev) => ({ ...prev, subdomain: event.target.value }))}
                    placeholder="my-pod"
                  />
                </div>

                <div>
                  <div className="text-sm font-semibold text-slate-700 mb-2">Pod Partners</div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                    <div className="rounded border border-slate-200 p-3">
                      <div className="mb-2 text-sm font-semibold">Primary Partner</div>
                      <TextInput
                        label="Name"
                        value={wizard.primaryPartner.name}
                        onChange={(event) =>
                          setWizard((prev) => ({
                            ...prev,
                            primaryPartner: { ...prev.primaryPartner, name: event.target.value }
                          }))
                        }
                      />
                      <TextInput
                        label="Webhook Endpoint"
                        value={wizard.primaryPartner.webhookEndpoint}
                        onChange={(event) =>
                          setWizard((prev) => ({
                            ...prev,
                            primaryPartner: { ...prev.primaryPartner, webhookEndpoint: event.target.value }
                          }))
                        }
                        placeholder="example.com/webhook"
                      />
                    </div>

                    <div className="rounded border border-slate-200 p-3">
                      <div className="mb-2 text-sm font-semibold">Sponsor 1</div>
                      <TextInput
                        label="Name"
                        value={wizard.sponsor1.name}
                        onChange={(event) =>
                          setWizard((prev) => ({
                            ...prev,
                            sponsor1: { ...prev.sponsor1, name: event.target.value }
                          }))
                        }
                      />
                      <TextInput
                        label="Webhook Endpoint"
                        value={wizard.sponsor1.webhookEndpoint}
                        onChange={(event) =>
                          setWizard((prev) => ({
                            ...prev,
                            sponsor1: { ...prev.sponsor1, webhookEndpoint: event.target.value }
                          }))
                        }
                        placeholder="example.com/webhook"
                      />
                    </div>

                    <div className="rounded border border-slate-200 p-3">
                      <div className="mb-2 text-sm font-semibold">Sponsor 2</div>
                      <TextInput
                        label="Name"
                        value={wizard.sponsor2.name}
                        onChange={(event) =>
                          setWizard((prev) => ({
                            ...prev,
                            sponsor2: { ...prev.sponsor2, name: event.target.value }
                          }))
                        }
                      />
                      <TextInput
                        label="Webhook Endpoint"
                        value={wizard.sponsor2.webhookEndpoint}
                        onChange={(event) =>
                          setWizard((prev) => ({
                            ...prev,
                            sponsor2: { ...prev.sponsor2, webhookEndpoint: event.target.value }
                          }))
                        }
                        placeholder="example.com/webhook"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div className="text-sm font-semibold text-slate-700">Choose a Template</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {templates.map((template) => {
                    const selected = wizard.templateRef === template.ref;
                    return (
                      <button
                        key={template.ref}
                        type="button"
                        className={`rounded border p-2 text-left ${
                          selected ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 bg-white'
                        }`}
                        onClick={() => selectTemplate(template.ref, wizard.templateContent)}
                      >
                        <div className="h-28 rounded bg-gradient-to-br from-slate-200 via-slate-100 to-slate-300 flex items-center justify-center text-xs font-semibold text-slate-600">
                          Placeholder Screenshot
                        </div>
                        <div className="mt-2 text-sm font-semibold text-slate-800">{template.name}</div>
                        <div className="text-xs text-slate-500">{template.description}</div>
                      </button>
                    );
                  })}
                </div>

                {activeTemplate && (
                  <div className="rounded border border-slate-200 p-4 space-y-3">
                    <div className="text-sm font-semibold">Customize {activeTemplate.name}</div>
                    {activeTemplate.fields.map((field) =>
                      field.type === 'textarea' ? (
                        <label key={field.key} className="block text-sm font-medium text-slate-700 mb-1">
                          {field.label}
                          <textarea
                            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                            rows={4}
                            value={wizard.templateContent[field.key] ?? ''}
                            onChange={(event) =>
                              setWizard((prev) => ({
                                ...prev,
                                templateContent: {
                                  ...prev.templateContent,
                                  [field.key]: event.target.value
                                }
                              }))
                            }
                            placeholder={field.placeholder}
                          />
                        </label>
                      ) : (
                        <TextInput
                          key={field.key}
                          label={field.label}
                          value={wizard.templateContent[field.key] ?? ''}
                          onChange={(event) =>
                            setWizard((prev) => ({
                              ...prev,
                              templateContent: {
                                ...prev.templateContent,
                                [field.key]: event.target.value
                              }
                            }))
                          }
                          placeholder={field.placeholder}
                        />
                      )
                    )}
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <TextInput
                  label="Disclosure Text"
                  value={wizard.disclosureText}
                  onChange={(event) =>
                    setWizard((prev) => ({
                      ...prev,
                      disclosureText: event.target.value
                    }))
                  }
                  placeholder="Primary publisher and co-reg details..."
                />
                <p className="text-xs text-slate-500">
                  Disclosure is required and will be linked to the initial landing page.
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <Button variant="ghost" onClick={prevStep} disabled={step === 0 || submitting}>
                Back
              </Button>
              {step < 2 ? (
                <Button onClick={nextStep} disabled={submitting}>
                  Continue
                </Button>
              ) : (
                <Button onClick={completeWizard} disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Campaign'}
                </Button>
              )}
            </div>
          </div>
        </Card>
      ) : (
        <Card title="Campaign List">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="space-y-2">
              {campaigns.map((campaign) => (
                <button
                  key={campaign.id}
                  className={`w-full rounded border px-3 py-2 text-left ${
                    selectedCampaignId === campaign.id ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 bg-white'
                  }`}
                  onClick={() => setSelectedCampaignId(campaign.id)}
                >
                  <div className="font-semibold">{campaign.name}</div>
                  <div className="text-xs text-slate-500">{campaign.subdomain}</div>
                  <div className="text-xs text-slate-500 capitalize">Status: {campaign.status}</div>
                </button>
              ))}
              {campaigns.length === 0 && <p className="text-sm text-slate-500">No campaigns yet.</p>}
            </div>

            <div className="lg:col-span-2">
              {selectedCampaign ? (
                <div className="space-y-3">
                  <div>
                    <div className="text-lg font-semibold">{selectedCampaign.campaign.name}</div>
                    <div className="text-sm text-slate-600 flex items-center gap-2">
                      <span>{selectedCampaign.campaign.subdomain}</span>
                      <Badge>{selectedCampaign.campaign.status}</Badge>
                      <a
                        href={getLandingPreviewHref(selectedCampaign.campaign.subdomain)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-indigo-700 hover:underline"
                      >
                        Open Root
                      </a>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-semibold">Landing Versions</div>
                    <div className="space-y-2 mt-2">
                      {selectedCampaign.landingPageVersions.map((version) => (
                        <div key={version.id} className="rounded border border-slate-200 px-3 py-2 bg-white">
                          <div className="flex items-center justify-between">
                            <div className="font-semibold">{version.id}</div>
                            <div className="text-xs text-slate-500 capitalize">{version.status}</div>
                          </div>
                          <div className="text-xs text-slate-500">Template: {version.templateRef}</div>
                          <div className="text-xs text-slate-500">Slug: {version.slug || '(root)'}</div>
                          <div className="text-xs text-slate-500">
                            Published: {version.publishedAt ? new Date(version.publishedAt).toLocaleString() : '—'}
                          </div>
                          <div className="mt-2 flex items-center gap-3">
                            <a
                              href={getLandingPreviewHref(selectedCampaign.campaign.subdomain, version)}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-semibold text-indigo-700 hover:underline"
                            >
                              Preview
                            </a>
                          </div>
                        </div>
                      ))}
                      {selectedCampaign.landingPageVersions.length === 0 && (
                        <p className="text-sm text-slate-500">No versions yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">Select a campaign to view details.</p>
              )}
            </div>
          </div>
        </Card>
      )}

      {message && <p className="text-sm text-green-700">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
