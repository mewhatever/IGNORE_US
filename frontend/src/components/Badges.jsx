const SEVERITY_STYLES = {
  low: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  medium: 'bg-amber-50 text-amber-700 ring-amber-200',
  high: 'bg-orange-50 text-orange-700 ring-orange-200',
  critical: 'bg-red-50 text-red-700 ring-red-200',
};

const CASE_LABELS = {
  wrong_transfer: 'Wrong Transfer',
  payment_failed: 'Payment Failed',
  refund_request: 'Refund Request',
  phishing_or_social_engineering: 'Phishing / Social Engineering',
  other: 'Other',
};

const DEPT_LABELS = {
  customer_support: 'Customer Support',
  dispute_resolution: 'Dispute Resolution',
  payments_ops: 'Payments Ops',
  fraud_risk: 'Fraud & Risk',
};

export function SeverityBadge({ severity }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset capitalize ${SEVERITY_STYLES[severity] || SEVERITY_STYLES.low}`}
    >
      {severity}
    </span>
  );
}

export function CaseTypeBadge({ caseType }) {
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 ring-1 ring-inset ring-slate-200">
      {CASE_LABELS[caseType] || caseType}
    </span>
  );
}

export function DepartmentBadge({ department }) {
  return (
    <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 ring-1 ring-inset ring-brand-200">
      {DEPT_LABELS[department] || department}
    </span>
  );
}

export { CASE_LABELS, DEPT_LABELS };
