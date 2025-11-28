import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Search, ShieldAlert, ShieldCheck } from 'lucide-react';
import Header from '../components/Header.jsx';
import { getPredictions } from '../services/predictionService.js';

const PastPredictionsPage = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getPredictions();
        setPredictions(data);
      } catch (error) {
        const message =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Unable to fetch predictions';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return predictions.filter((p) => p.studentName.toLowerCase().includes(term));
  }, [predictions, search]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pb-14">
      <div className="mx-auto max-w-6xl px-4 pt-8">
        <Header />

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 text-white/80">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.2em]">
            History
          </div>
        </div>

        <div className="mt-6 card overflow-hidden p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-primary">
                Prediction history
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-900">
                Every forecast in one place
              </h2>
              <p className="text-slate-500">
                Data served directly from MongoDB via the protected API.
              </p>
            </div>
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                placeholder="Search by student"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2 pl-10 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-3">
              <thead>
                <tr className="text-left text-sm text-slate-500">
                  <th className="px-4">Student</th>
                  <th className="px-4">Predicted CGPA</th>
                  <th className="px-4">Risk</th>
                  <th className="px-4">Confidence</th>
                  <th className="px-4">Created</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-6 text-center text-slate-500">
                      <div className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading predictions...
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-6 text-center text-slate-500">
                      No predictions yet.
                    </td>
                  </tr>
                ) : (
                  filtered.map((prediction) => {
                    const risk = prediction.academicRiskLevel?.toLowerCase();
                    const riskStyle =
                      risk === 'low'
                        ? { badge: 'bg-emerald-50 text-emerald-700', icon: <ShieldCheck className="h-4 w-4" /> }
                        : risk === 'medium'
                          ? { badge: 'bg-amber-50 text-amber-700', icon: <ShieldCheck className="h-4 w-4" /> }
                          : { badge: 'bg-rose-50 text-rose-700', icon: <ShieldAlert className="h-4 w-4" /> };
                    return (
                      <tr key={prediction._id} className="rounded-2xl bg-white shadow-subtle">
                        <td className="px-4 py-4 font-semibold text-slate-900">
                          {prediction.studentName}
                        </td>
                        <td className="px-4 py-4 text-slate-700">
                          {prediction.predictedCGPA?.toFixed?.(2) ?? prediction.predictedCGPA}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${riskStyle.badge}`}
                          >
                            {riskStyle.icon}
                            {prediction.academicRiskLevel}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-slate-700">
                          {(prediction.confidence * 100).toFixed(1)}%
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {new Date(prediction.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PastPredictionsPage;
