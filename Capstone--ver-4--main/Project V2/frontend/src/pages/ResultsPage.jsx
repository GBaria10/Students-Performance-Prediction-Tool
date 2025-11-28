import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ArrowUpRight,
  CircleCheck,
  Flame,
  LineChart,
  Shield
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import Header from '../components/Header.jsx';
import { usePrediction } from '../hooks/usePrediction.js';

const ResultsPage = () => {
  const { lastPrediction } = usePrediction();
  const navigate = useNavigate();

  useEffect(() => {
    if (!lastPrediction) {
      toast.error('No prediction data found. Please create one.');
      navigate('/predict');
    }
  }, [lastPrediction, navigate]);

  if (!lastPrediction) return null;

  const { prediction, input } = lastPrediction;
  const chartData = [
    { label: 'Current GPA', value: Number(input.currentGPA) || 0 },
    { label: 'Predicted CGPA', value: Number(prediction.predictedCGPA) || 0 }
  ];

  const risk = prediction.academicRiskLevel?.toLowerCase();
  const riskStyle =
    risk === 'low'
      ? { badge: 'bg-emerald-50 text-emerald-700', icon: <Shield className="h-4 w-4" />, label: 'Low' }
      : risk === 'medium'
        ? { badge: 'bg-amber-50 text-amber-700', icon: <Shield className="h-4 w-4" />, label: 'Medium' }
        : { badge: 'bg-rose-50 text-rose-700', icon: <Flame className="h-4 w-4" />, label: prediction.academicRiskLevel };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pb-14">
      <div className="mx-auto max-w-6xl px-4 pt-8">
        <Header />

        <div className="mt-8 flex items-center justify-between text-white/80">
          <button
            onClick={() => navigate('/predict')}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            New prediction
          </button>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.2em]">
            <LineChart className="h-4 w-4" />
            Results
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="card col-span-2 p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-primary">
                  Prediction complete
                </p>
                <h2 className="mt-2 text-3xl font-semibold text-slate-900">
                  {prediction.studentName}
                </h2>
                <p className="text-slate-500">Enrollment: {input.enrollmentNumber}</p>
              </div>
              <span
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${riskStyle.badge}`}
              >
                {riskStyle.icon}
                Risk: {riskStyle.label}
              </span>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-primary/10 via-white to-white px-4 py-5">
                <p className="text-sm text-slate-500">Predicted CGPA</p>
                <p className="mt-1 text-3xl font-semibold text-primary">
                  {prediction.predictedCGPA?.toFixed?.(2) ?? prediction.predictedCGPA}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white px-4 py-5">
                <p className="text-sm text-slate-500">Confidence</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {(prediction.confidence * 100).toFixed(1)}%
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white px-4 py-5">
                <p className="text-sm text-slate-500">Created</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {new Date(prediction.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-4 md:p-6">
              <p className="text-sm font-semibold text-slate-700">GPA vs Predicted</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="label" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" domain={[0, 10]} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#2563eb"
                      strokeWidth={2.4}
                      fillOpacity={1}
                      fill="url(#colorPred)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="card flex flex-col gap-4 p-6">
            <div className="rounded-2xl bg-primary/10 px-4 py-3 text-sm font-semibold text-primary">
              Input snapshot
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
              <span className="font-semibold text-slate-900">Age</span>
              <span>{input.age}</span>
              <span className="font-semibold text-slate-900">Department</span>
              <span className="uppercase">{input.department}</span>
              <span className="font-semibold text-slate-900">Gender</span>
              <span className="capitalize">{input.gender}</span>
              <span className="font-semibold text-slate-900">Attendance %</span>
              <span>{input.attendancePercentage}%</span>
              <span className="font-semibold text-slate-900">Study hours</span>
              <span>{input.studyHoursPerWeek} hrs</span>
              <span className="font-semibold text-slate-900">Backlogs</span>
              <span>{input.totalBacklogs}</span>
              <span className="font-semibold text-slate-900">Part-time work</span>
              <span className="capitalize">{input.hasPartTimeJob}</span>
              <span className="font-semibold text-slate-900">Midsem 1</span>
              <span>{input.midsem1Marks}</span>
              <span className="font-semibold text-slate-900">Midsem 2</span>
              <span>{input.midsem2Marks}</span>
              <span className="font-semibold text-slate-900">Comprehensive</span>
              <span>{input.comprehensiveExamMarks}</span>
              <span className="font-semibold text-slate-900">Current GPA</span>
              <span>{input.currentGPA}</span>
            </div>

            <div className="mt-2 flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/predict')}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:bg-slate-50"
              >
                Predict another
                <ArrowUpRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => navigate('/history')}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-card transition hover:-translate-y-0.5 hover:bg-primary/90"
              >
                View history
                <CircleCheck className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
