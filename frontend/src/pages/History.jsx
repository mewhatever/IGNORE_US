import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../api/client';
import { CaseTypeBadge, DepartmentBadge, SeverityBadge } from '../components/Badges';
import { Inbox, RefreshCw, ShieldAlert } from 'lucide-react';

function formatDate(value) {
  return new Date(value).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function History() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await api.tickets({ limit: 50 });
      setTickets(data.tickets || []);
    } catch {
      toast.error('Failed to load ticket history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Ticket History</h2>
          <p className="mt-1 text-slate-500">All classified tickets stored in PostgreSQL</p>
        </div>
        <button
          onClick={loadTickets}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <Inbox className="mb-3 h-10 w-10 text-slate-300" />
            <p className="font-medium text-slate-600">No tickets yet</p>
            <p className="mt-1 text-sm text-slate-400">Classify a ticket from the dashboard to see it here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">Ticket</th>
                  <th className="px-6 py-4">Message</th>
                  <th className="px-6 py-4">Classification</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Review</th>
                  <th className="px-6 py-4">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map((ticket) => (
                  <tr key={`${ticket.ticket_id}-${ticket.created_at}`} className="transition hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-semibold text-slate-900">{ticket.ticket_id}</td>
                    <td className="max-w-xs px-6 py-4">
                      <p className="line-clamp-2 text-slate-600">{ticket.message}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <CaseTypeBadge caseType={ticket.case_type} />
                        <SeverityBadge severity={ticket.severity} />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <DepartmentBadge department={ticket.department} />
                    </td>
                    <td className="px-6 py-4">
                      {ticket.human_review_required ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600">
                          <ShieldAlert className="h-3.5 w-3.5" />
                          Required
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-slate-500">
                      {formatDate(ticket.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
