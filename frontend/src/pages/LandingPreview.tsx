import { useState } from 'react';

import { Button, Card, TextInput } from '../components/Form';
import { api } from '../lib/api';

export function LandingPreviewPage() {
  const [subdomain, setSubdomain] = useState('');
  const [versionId, setVersionId] = useState('');
  const [draft, setDraft] = useState(false);
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchLanding() {
    setError(null);
    setData(null);
    try {
      const res = await api.fetchLanding(subdomain, {
        ...(versionId ? { versionId } : {}),
        ...(draft ? { draft: true } : {})
      });
      setData(res);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Landing Preview</h1>
      <Card title="Fetch Landing">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <TextInput label="Subdomain" value={subdomain} onChange={(e) => setSubdomain(e.target.value)} />
          <TextInput
            label="Version ID (optional)"
            value={versionId}
            onChange={(e) => setVersionId(e.target.value)}
          />
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input type="checkbox" checked={draft} onChange={(e) => setDraft(e.target.checked)} />
            Draft (latest)
          </label>
          <Button onClick={fetchLanding} disabled={!subdomain}>
            Load
          </Button>
        </div>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </Card>
      {data && (
        <Card title="Landing Data">
          <pre className="text-xs bg-slate-900 text-slate-100 rounded p-3 overflow-x-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  );
}
