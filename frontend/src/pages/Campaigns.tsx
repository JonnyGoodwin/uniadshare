import { useEffect, useState } from 'react';

import { Badge } from '../components/Badge';
import { Button, Card, TextInput } from '../components/Form';
import { api } from '../lib/api';
import type { CampaignSummary, LandingPageVersion, Sponsor } from '../lib/api';

export function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [selectedCampaign, setSelectedCampaign] = useState<{
    campaign: CampaignSummary;
    sponsors: Sponsor[];
    landingPageVersions: LandingPageVersion[];
  } | null>(null);
  const [campaignName, setCampaignName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [campaignId, setCampaignId] = useState('');
  const [disclosureText, setDisclosureText] = useState('');
  const [landingContent, setLandingContent] = useState('{"headline":"Welcome","body":"Thanks for stopping by"}');
  const [landingTemplateRef, setLandingTemplateRef] = useState('basic');
  const [disclosureId, setDisclosureId] = useState('');
  const [landingVersionId, setLandingVersionId] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listCampaigns()
      .then((res) => setCampaigns(res.campaigns))
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (!selectedCampaignId) {
      setSelectedCampaign(null);
      setCampaignId('');
      return;
    }
    api
      .getCampaign(selectedCampaignId)
      .then((res) => {
        setSelectedCampaign(res);
        setCampaignId(res.campaign.id);
      })
      .catch((err) => setError(err.message));
  }, [selectedCampaignId]);

  async function createCampaign() {
    setMessage(null);
    setError(null);
    try {
      const res = await api.createCampaign({ name: campaignName, subdomain });
      setCampaignId(res.campaign.id);
      setSelectedCampaignId(res.campaign.id);
      setCampaigns((prev) => [res.campaign, ...prev]);
      setMessage(`Created campaign ${res.campaign.id}`);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function createDisclosure() {
    if (!campaignId || !disclosureText) return;
    try {
      const res = await api.createDisclosure(campaignId, disclosureText);
      setDisclosureId(res.disclosure.id);
      setMessage(`Created disclosure ${res.disclosure.id}`);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function createLanding() {
    if (!campaignId) return;
    try {
      const content = JSON.parse(landingContent);
      const res = await api.createLandingVersion(campaignId, {
        templateRef: landingTemplateRef,
        content,
        disclosureVersionId: disclosureId || undefined
      });
      setLandingVersionId(res.landingPageVersion.id);
      setSelectedCampaign((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          landingPageVersions: [res.landingPageVersion, ...(prev.landingPageVersions ?? [])]
        };
      });
      setMessage(`Created landing version ${res.landingPageVersion.id}`);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function publishLanding(versionIdOverride?: string) {
    const versionToPublish = versionIdOverride ?? landingVersionId;
    if (!campaignId || !versionToPublish) return;
    try {
      await api.publishLandingVersion(campaignId, versionToPublish);
      setMessage(`Published ${versionToPublish}`);
      setSelectedCampaign((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          landingPageVersions: (prev.landingPageVersions ?? []).map((v: LandingPageVersion) =>
            v.id === versionToPublish ? { ...v, status: 'published', publishedAt: new Date().toISOString() } : v
          )
        };
      });
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="space-y-6">
      <Card title="Create Campaign">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TextInput label="Name" value={campaignName} onChange={(e) => setCampaignName(e.target.value)} />
          <TextInput
            label="Subdomain"
            value={subdomain}
            onChange={(e) => setSubdomain(e.target.value)}
            placeholder="example"
          />
          <Button onClick={createCampaign} disabled={!campaignName || !subdomain}>
            Create Campaign
          </Button>
        </div>
        {campaignId && <p className="text-sm text-slate-600 mt-2">Campaign ID: {campaignId}</p>}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Create Disclosure">
          <TextInput
            label="Disclosure Text"
            value={disclosureText}
            onChange={(e) => setDisclosureText(e.target.value)}
            placeholder="Primary publisher and co-reg details..."
          />
          <Button onClick={createDisclosure} disabled={!campaignId || !disclosureText}>
            Save Disclosure
          </Button>
          {disclosureId && <p className="text-sm text-slate-600 mt-2">Disclosure ID: {disclosureId}</p>}
        </Card>

        <Card title="Create & Publish Landing">
          <div className="space-y-3">
            <TextInput
              label="Template Ref"
              value={landingTemplateRef}
              onChange={(e) => setLandingTemplateRef(e.target.value)}
            />
            <label className="block text-sm font-medium text-slate-700 mb-1">Content (JSON)</label>
            <textarea
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm font-mono"
              rows={6}
              value={landingContent}
              onChange={(e) => setLandingContent(e.target.value)}
            />
            <Button onClick={createLanding} disabled={!campaignId}>
              Create Landing
            </Button>
            <Button onClick={() => publishLanding()} disabled={!campaignId || !landingVersionId} variant="ghost">
              Publish Landing
            </Button>
            {landingVersionId && <p className="text-sm text-slate-600">Landing Version ID: {landingVersionId}</p>}
          </div>
        </Card>
      </div>

      <Card title="Campaigns">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="space-y-2">
            {campaigns.map((c) => (
              <button
                key={c.id}
                className={`w-full rounded border px-3 py-2 text-left ${
                  selectedCampaignId === c.id ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 bg-white'
                }`}
                onClick={() => setSelectedCampaignId(c.id)}
              >
                <div className="font-semibold">{c.name}</div>
                <div className="text-xs text-slate-500">{c.subdomain}</div>
                <div className="text-xs text-slate-500 capitalize">Status: {c.status}</div>
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
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold">Landing Versions</div>
                  <div className="space-y-2 mt-2">
                    {selectedCampaign.landingPageVersions?.map((v: LandingPageVersion) => (
                      <div key={v.id} className="rounded border border-slate-200 px-3 py-2 bg-white">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold">{v.id}</div>
                          <div className="text-xs text-slate-500 capitalize">{v.status}</div>
                        </div>
                        <div className="text-xs text-slate-500">Template: {v.templateRef}</div>
                        <div className="text-xs text-slate-500">
                          Published: {v.publishedAt ? new Date(v.publishedAt).toLocaleString() : '—'}
                        </div>
                        <Button variant="ghost" onClick={() => publishLanding(v.id)}>
                          Publish
                        </Button>
                      </div>
                    ))}
                    {(!selectedCampaign.landingPageVersions ||
                      selectedCampaign.landingPageVersions.length === 0) && (
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

      {message && <p className="text-sm text-green-700">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
