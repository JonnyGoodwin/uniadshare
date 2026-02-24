import { useEffect, useState } from 'react';

import { Button, Card, TextInput } from '../components/Form';
import { api } from '../lib/api';
import type { PodSummary } from '../lib/api';

type Sponsor = {
  sponsorId: string;
  name: string;
  webhookEndpoint: string;
  role: string;
};

export function SponsorsPage() {
  const [pods, setPods] = useState<PodSummary[]>([]);
  const [podId, setPodId] = useState('');
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [form, setForm] = useState({
    name: '',
    webhookEndpoint: '',
    role: 'primary'
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listPods()
      .then((res) => setPods(res.pods))
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (!podId) return;
    api
      .listSponsors(podId)
      .then((res) => setSponsors(res.sponsors))
      .catch((err) => setError(err.message));
  }, [podId]);

  async function handleCreate() {
    setError(null);
    try {
      const res = await api.createSponsor(podId, form);
      setSponsors((prev) => [...prev, res.sponsor]);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    try {
      await api.deleteSponsor(podId, id);
      setSponsors((prev) => prev.filter((s) => s.sponsorId !== id));
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Select Pod</label>
          <select
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            value={podId}
            onChange={(e) => setPodId(e.target.value)}
          >
            <option value="">-- choose pod --</option>
            {pods.map((pod) => (
              <option key={pod.id} value={pod.id}>
                {pod.name} ({pod.subdomain})
              </option>
            ))}
          </select>
        </div>
        <Button onClick={() => podId && api.listSponsors(podId).then((res) => setSponsors(res.sponsors))}>
          Load Sponsors
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Add Sponsor">
          <div className="space-y-3">
            <TextInput
              label="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <TextInput
              label="Webhook Endpoint"
              value={form.webhookEndpoint}
              onChange={(e) => setForm({ ...form, webhookEndpoint: e.target.value })}
              placeholder="https://example.com/webhook"
            />
            <TextInput
              label="Role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              placeholder="primary or co-reg"
            />
            <Button onClick={handleCreate} disabled={!podId}>
              Save Sponsor
            </Button>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        </Card>

        <Card title="Sponsors">
          {!podId && <p className="text-sm text-slate-500">Select a pod to load sponsors.</p>}
          <div className="space-y-2">
            {sponsors.map((sponsor) => (
              <div
                key={sponsor.sponsorId}
                className="flex items-center justify-between rounded border border-slate-200 px-3 py-2"
              >
                <div>
                  <div className="font-semibold">{sponsor.name}</div>
                  <div className="text-xs text-slate-500">{sponsor.webhookEndpoint}</div>
                  <div className="text-xs text-slate-500">Role: {sponsor.role}</div>
                </div>
                <Button variant="ghost" onClick={() => handleDelete(sponsor.sponsorId)}>
                  Delete
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
