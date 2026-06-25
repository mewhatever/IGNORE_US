import {
  AlertOctagon,
  Building2,
  CheckCircle2,
  FileText,
  Gauge,
  ShieldAlert,
} from 'lucide-react';
import { CaseTypeBadge, DepartmentBadge, SeverityBadge } from './Badges';

export default function ClassificationResult({ result }) {
  if (!result) {
    return (
      <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white/50 p-8 text-center">
        <div className="mb-4 rounded-2xl bg-slate-100 p-4">
          <FileText className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-base font-semibold text-slate-700">No classification yet</h3>
        <p className="mt-1 max-w-xs text-sm text-slate-500">
          Submit a ticket on the left to see routing, severity, and agent summary here.
        </p>
      </div>
    );
  }

  const confidencePct = Math.round((result.confidence || 0) * 100);

  return (
    <div className="animate-fade-up space-y-4">
      {result.human_review_required && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <div>
            <p className="font-semibold text-red-800">Human review required</p>
            <p className="mt-0.5 text-sm text-red-700">
              This ticket was flagged for immediate agent attention due to critical severity or phishing indicators.
            </p>
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60">
        <div className="border-b border-slate-100 px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Ticket</p>
              <h3 className="text-xl font-bold text-slate-900">{result.ticket_id}</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <CaseTypeBadge caseType={result.case_type} />
              <SeverityBadge severity={result.severity} />
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
              <Building2 className="h-4 w-4" />
              Routed Department
            </div>
            <DepartmentBadge department={result.department} />
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
              <Gauge className="h-4 w-4" />
              Confidence Score
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-brand-500 transition-all duration-500"
                  style={{ width: `${confidencePct}%` }}
                />
              </div>
              <span className="text-sm font-bold text-slate-800">{confidencePct}%</span>
            </div>

          </div>

        </div>

        <div className="border-t border-slate-100 px-6 py-5">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
            <CheckCircle2 className="h-4 w-4" />
            Agent Summary
          </div>
          <p className="text-sm leading-relaxed text-slate-700">{result.agent_summary}</p>
        </div>

        {!result.human_review_required && (
          <div className="border-t border-slate-100 px-6 py-4">
            <div className="flex items-center gap-2 text-sm text-emerald-700">
              <AlertOctagon className="h-4 w-4" />
              Standard queue — no immediate escalation
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
