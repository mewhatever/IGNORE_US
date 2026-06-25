import { useState } from 'react';
import { Loader2, Send, Sparkles } from 'lucide-react';

const CHANNELS = [
  { value: 'app', label: 'Mobile App' },
  { value: 'sms', label: 'SMS' },
  { value: 'call_center', label: 'Call Center' },
  { value: 'merchant_portal', label: 'Merchant Portal' },
];

const LOCALES = [
  { value: 'en', label: 'English' },
  { value: 'bn', label: 'Bengali' },
  { value: 'mixed', label: 'Mixed' },
];

const SAMPLES = [
  {
    label: 'Wrong transfer',
    message: 'I sent 3000 to wrong number',
  },
  {
    label: 'Payment failed',
    message: 'Payment failed but balance deducted',
  },
  {
    label: 'Phishing',
    message: 'Someone called asking my OTP, is that bKash?',
  },
  {
    label: 'Refund',
    message: 'Please refund my last transaction, I changed my mind',
  },
  {
    label: 'Other',
    message: 'App crashed when I opened it',
  },
];

function generateTicketId() {
  const num = String(Math.floor(Math.random() * 900) + 100);
  return `T-${num}`;
}

export default function TicketForm({ onSubmit, loading }) {
  const [ticketId, setTicketId] = useState(generateTicketId);
  const [channel, setChannel] = useState('app');
  const [locale, setLocale] = useState('en');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSubmit({
      ticket_id: ticketId.trim(),
      channel,
      locale,
      message: message.trim(),
    });
  };

  const applySample = (sample) => {
    setTicketId(generateTicketId());
    setMessage(sample.message);
  };

  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60">
      <div className="border-b border-slate-100 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-brand-50 p-2.5 text-brand-600">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">New Ticket</h2>
            <p className="text-sm text-slate-500">Submit a customer message for instant classification</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Ticket ID</label>
            <input
              type="text"
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Channel</label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100"
            >
              {CHANNELS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Locale</label>
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100"
            >
              {LOCALES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Customer Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            placeholder="Paste or type the customer's complaint here..."
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100"
            required
          />
        </div>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">Quick samples</p>
          <div className="flex flex-wrap gap-2">
            {SAMPLES.map((sample) => (
              <button
                key={sample.label}
                type="button"
                onClick={() => applySample(sample)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !message.trim()}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Classifying...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Classify Ticket
            </>
          )}
        </button>
      </form>
    </div>
  );
}
