import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Loader2, Lock, Mail, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('agent@queuestorm.demo');
  const [password, setPassword] = useState('Agent@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 overflow-hidden bg-slate-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-600/30 via-transparent to-transparent" />
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-brand-500/10 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500 shadow-xl shadow-brand-500/30">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-xl font-bold text-white">QueueStorm</p>
            <p className="text-sm text-slate-400">Intelligent Ticket Router</p>
          </div>
        </div>

        <div className="relative max-w-md">
          <h1 className="text-4xl font-bold leading-tight text-white">
            Route support tickets with confidence
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-slate-300">
            Classify complaints, detect phishing, assign departments, and flag critical cases — all in under two seconds.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4">
            {[
              { label: 'Case types', value: '5' },
              { label: 'Departments', value: '4' },
              { label: 'Response', value: '<2s' },
              { label: 'Accuracy', value: 'Rules+' },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                <p className="text-2xl font-bold text-white">{item.value}</p>
                <p className="text-sm text-slate-400">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-sm text-slate-500">bKash × SUST CSE Carnival 2026 — Codex Hackathon</p>
      </div>

      <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <p className="text-xl font-bold text-slate-900">QueueStorm</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-900">Agent sign in</h2>
          <p className="mt-2 text-slate-500">Access the support operations dashboard</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-11 text-sm outline-none transition focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in to dashboard'
              )}
            </button>
          </form>

          <p className="mt-6 rounded-xl bg-slate-50 px-4 py-3 text-center text-xs text-slate-500 ring-1 ring-slate-200">
            Demo credentials are pre-filled. Change them via environment variables in production.
          </p>
        </div>
      </div>
    </div>
  );
}
