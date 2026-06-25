import {
  AlertTriangle,
  Clock,
  Inbox,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react';

const cards = [
  {
    key: 'total',
    label: 'Total Tickets',
    icon: Inbox,
    color: 'bg-blue-500',
    light: 'bg-blue-50 text-blue-700',
  },
  {
    key: 'needs_review',
    label: 'Needs Review',
    icon: AlertTriangle,
    color: 'bg-amber-500',
    light: 'bg-amber-50 text-amber-700',
  },
  {
    key: 'critical',
    label: 'Critical',
    icon: ShieldAlert,
    color: 'bg-red-500',
    light: 'bg-red-50 text-red-700',
  },
  {
    key: 'phishing',
    label: 'Phishing Cases',
    icon: TrendingUp,
    color: 'bg-brand-500',
    light: 'bg-brand-50 text-brand-700',
  },
];

export default function StatsCards({ stats, loading }) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ key, label, icon: Icon, color, light }, idx) => (
        <div
          key={key}
          className="animate-fade-up group rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60 transition hover:shadow-md"
          style={{ animationDelay: `${idx * 60}ms` }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                {stats?.[key] ?? 0}
              </p>
            </div>
            <div className={`rounded-xl p-2.5 ${light}`}>
              <Icon className={`h-5 w-5`} strokeWidth={2} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-400">
            <Clock className="h-3.5 w-3.5" />
            Live from database
          </div>
        </div>
      ))}
    </div>
  );
}
