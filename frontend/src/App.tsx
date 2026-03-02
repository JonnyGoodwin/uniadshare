import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Outlet, RouterProvider, createBrowserRouter, NavLink } from 'react-router-dom';

import { api } from './lib/api';
import { DeliveriesPage } from './pages/Deliveries';
import { PodsPage } from './pages/Pods';
import { SponsorsPage } from './pages/Sponsors';

const AUTH_TOKEN_KEY = 'admin_auth_token';

function LoginPage({
  onLogin,
  loading,
  error
}: {
  onLogin: (email: string, password: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onLogin(email, password);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-6">
      <form className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4" onSubmit={handleSubmit}>
        <div>
          <h1 className="text-xl font-semibold">Admin Login</h1>
          <p className="text-sm text-slate-500 mt-1">Only authorized admins can access this app.</p>
        </div>

        <label className="block text-sm font-medium text-slate-700">
          Email
          <input
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Password
          <input
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-slate-900 text-white text-sm font-medium py-2 hover:bg-slate-800 disabled:opacity-60"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

function Layout({
  adminEmail,
  onLogout
}: {
  adminEmail: string;
  onLogout: () => Promise<void>;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex">
        <aside className="w-64 bg-slate-900 text-slate-100 min-h-screen p-5 shadow-lg">
          <div className="text-xl font-semibold mb-6 tracking-tight">Uni Adshare</div>
          <nav className="space-y-2">
            <NavItem to="/">Pods</NavItem>
            <NavItem to="/sponsors">Sponsors</NavItem>
            <NavItem to="/deliveries">Deliveries</NavItem>
          </nav>
          <div className="mt-8 text-xs text-slate-400">
            Manage co-reg sponsors, publish landers, and monitor deliveries.
          </div>
        </aside>
        <main className="flex-1 p-8">
          <header className="mb-6 flex items-center justify-between max-w-6xl mx-auto">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Workspace</p>
              <h1 className="text-2xl font-bold text-slate-900">Uni Adshare</h1>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-sm text-slate-600">{adminEmail}</p>
              <button
                type="button"
                onClick={() => {
                  void onLogout();
                }}
                className="rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
              >
                Log out
              </button>
            </div>
          </header>
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `block rounded px-3 py-2 text-sm font-medium ${isActive ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/80'}`
      }
    >
      {children}
    </NavLink>
  );
}

export function App() {
  const [bootstrapping, setBootstrapping] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState<string>('');

  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      setBootstrapping(false);
      return;
    }

    api.setAuthToken(token);
    api
      .me()
      .then((res) => {
        setAdminEmail(res.admin.email);
      })
      .catch(() => {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        api.setAuthToken(null);
      })
      .finally(() => {
        setBootstrapping(false);
      });
  }, []);

  const isAuthenticated = !bootstrapping && adminEmail.length > 0;

  const router = useMemo(
    () =>
      createBrowserRouter([
        {
          path: '/',
          element: (
            <Layout
              adminEmail={adminEmail}
              onLogout={async () => {
                try {
                  await api.logout();
                } catch {
                  // Token removal is local-first; backend logout failure should not block sign-out.
                }
                localStorage.removeItem(AUTH_TOKEN_KEY);
                api.setAuthToken(null);
                setAdminEmail('');
              }}
            />
          ),
          children: [
            { index: true, element: <PodsPage /> },
            { path: 'pods', element: <PodsPage /> },
            { path: 'sponsors', element: <SponsorsPage /> },
            { path: 'deliveries', element: <DeliveriesPage /> }
          ]
        }
      ]),
    [adminEmail]
  );

  async function handleLogin(email: string, password: string) {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const result = await api.login({ email, password });
      api.setAuthToken(result.token);
      localStorage.setItem(AUTH_TOKEN_KEY, result.token);
      setAdminEmail(result.admin.email);
    } catch (err) {
      setAuthError((err as Error).message);
    } finally {
      setAuthLoading(false);
    }
  }

  if (bootstrapping) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center">
        <p className="text-sm text-slate-600">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} loading={authLoading} error={authError} />;
  }

  return <RouterProvider router={router} />;
}
