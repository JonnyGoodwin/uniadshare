import { Outlet, RouterProvider, createBrowserRouter, NavLink, Navigate } from 'react-router-dom';

import { CampaignsPage } from './pages/Campaigns';
import { DeliveriesPage } from './pages/Deliveries';
import { SponsorsPage } from './pages/Sponsors';

  const router = createBrowserRouter([
    {
      path: '/',
      element: <Layout />,
      children: [
        { index: true, element: <CampaignsPage /> },
        { path: 'campaigns', element: <Navigate to="/" replace /> },
        { path: 'sponsors', element: <SponsorsPage /> },
        { path: 'deliveries', element: <DeliveriesPage /> }
      ]
    }
  ]);

function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex">
        <aside className="w-64 bg-slate-900 text-slate-100 min-h-screen p-5 shadow-lg">
          <div className="text-xl font-semibold mb-6 tracking-tight">Acquisition Pods</div>
          <nav className="space-y-2">
            <NavItem to="/">Campaigns</NavItem>
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
              <h1 className="text-2xl font-bold text-slate-900">Acquisition Ops</h1>
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
  return <RouterProvider router={router} />;
}
