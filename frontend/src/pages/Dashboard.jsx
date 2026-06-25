import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../api/client';
import TicketForm from '../components/TicketForm';
import ClassificationResult from '../components/ClassificationResult';
import StatsCards from '../components/StatsCards';
import { Activity } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [classifying, setClassifying] = useState(false);
  const [result, setResult] = useState(null);

  const loadStats = async () => {
    try {
      const data = await api.stats();
      setStats(data);
    } catch {
      toast.error('Could not load dashboard stats');
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleSubmit = async (payload) => {
    setClassifying(true);
    try {
      const data = await api.sortTicket(payload);
      setResult(data);
      toast.success('Ticket classified successfully');
      loadStats();
    } catch (err) {
      toast.error(err.message || 'Classification failed');
    } finally {
      setClassifying(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="animate-fade-up">
        <div className="flex items-center gap-2 text-brand-600">
          <Activity className="h-4 w-4" />
          <span className="text-sm font-medium">Live Operations</span>
        </div>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Ticket Classification Center
        </h2>
        <p className="mt-2 max-w-2xl text-slate-500">
          Route customer complaints to the right team in seconds. Phishing and critical cases are flagged for immediate human review.
        </p>
      </div>

      <StatsCards stats={stats} loading={statsLoading} />

      <div className="grid gap-6 xl:grid-cols-2">
        <TicketForm onSubmit={handleSubmit} loading={classifying} />
        <ClassificationResult result={result} />
      </div>
    </div>
  );
}
