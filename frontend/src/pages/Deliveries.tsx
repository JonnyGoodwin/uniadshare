import { useEffect, useState } from 'react';

import { Card } from '../components/Form';
import { api } from '../lib/api';

type Delivery = {
  id: string;
  leadId: string;
  sponsorId: string;
  status: string;
  endpoint: string;
  attempts?: Array<{ status: string; at?: string }>;
};

export function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listDeliveries()
      .then((res) => setDeliveries(res.deliveries))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Delivery Attempts</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Card title="Attempts">
        <div className="space-y-2">
          {deliveries.map((d) => (
            <div
              key={d.id}
              className="rounded border border-slate-200 px-3 py-2 bg-white"
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold capitalize">{d.status}</div>
                <div className="text-xs text-slate-500">{d.endpoint}</div>
              </div>
              <div className="text-xs text-slate-600">
                Lead: {d.leadId} · Sponsor: {d.sponsorId}
              </div>
              {d.attempts && d.attempts.length > 0 && (
                <div className="mt-1 text-xs text-slate-500">
                  Attempts:{' '}
                  {d.attempts.map((a, idx) => (
                    <span key={idx} className="mr-2">
                      {a.status} {a.at ? `(${a.at})` : ''}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
          {deliveries.length === 0 && <p className="text-sm text-slate-500">No deliveries yet.</p>}
        </div>
      </Card>
    </div>
  );
}
