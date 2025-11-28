import { Link } from 'react-router-dom';
import { Brain, LineChart, ShieldCheck, Sparkles, ArrowUpRight } from 'lucide-react';
import Header from '../components/Header.jsx';

const StatCard = ({ icon: Icon, label, value, accent }) => (
  <div className="card relative overflow-hidden p-5">
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-white/40 to-slate-50" />
    <div className="relative flex items-center gap-4">
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${accent}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  </div>
);

const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pb-14">
      <div className="mx-auto max-w-6xl px-4 pt-8">
        <Header />

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="card col-span-2 overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                  Overview
                </p>
                <h2 className="mt-1 text-3xl font-semibold text-slate-900">
                  Predict student success with precision
                </h2>
                <p className="mt-2 max-w-xl text-slate-500">
                  Capture student signals, generate CGPA forecasts, and identify risk
                  early. Powered by your backend and ML pipeline.
                </p>
              </div>
              <div className="hidden rounded-3xl bg-primary/10 px-5 py-4 text-sm text-primary lg:block">
                Services live: Backend • ML • MongoDB
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <StatCard
                icon={Sparkles}
                label="Ready Endpoints"
                value="12"
                accent="bg-primary/80"
              />
              <StatCard
                icon={Brain}
                label="ML Service"
                value="Forecast + Risk"
                accent="bg-emerald-500/80"
              />
              <StatCard
                icon={ShieldCheck}
                label="Security"
                value="JWT Protected"
                accent="bg-slate-800/80"
              />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Link
                to="/predict"
                className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-gradient-to-r from-primary/90 via-blue-600 to-indigo-600 px-6 py-5 text-white shadow-card transition hover:-translate-y-0.5"
              >
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-white/70">
                    Action
                  </p>
                  <p className="mt-2 text-xl font-semibold">Predict a student</p>
                  <p className="text-sm text-white/80">
                    Send data to backend → ML → instant insights
                  </p>
                </div>
                <ArrowUpRight className="h-6 w-6 transition group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link>

              <Link
                to="/history"
                className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-6 py-5 text-slate-900 shadow-subtle transition hover:-translate-y-0.5"
              >
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                    Records
                  </p>
                  <p className="mt-2 text-xl font-semibold">Past predictions</p>
                  <p className="text-sm text-slate-500">
                    Browse every forecast, confidence, and risk level
                  </p>
                </div>
                <LineChart className="h-6 w-6 text-primary transition group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link>
            </div>
          </div>

          <div className="card flex flex-col gap-4 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-slate-500">How it flows</p>
                <p className="text-lg font-semibold text-slate-900">Data → ML → Insight</p>
              </div>
            </div>
            <ol className="space-y-3 text-sm text-slate-600">
              <li className="flex gap-3">
                <span className="mt-0.5 h-6 w-6 shrink-0 rounded-full bg-primary/10 text-center text-xs font-semibold text-primary">
                  1
                </span>
                Capture student data in the guided form.
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 h-6 w-6 shrink-0 rounded-full bg-primary/10 text-center text-xs font-semibold text-primary">
                  2
                </span>
                Backend validates and calls the FastAPI ML service.
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 h-6 w-6 shrink-0 rounded-full bg-primary/10 text-center text-xs font-semibold text-primary">
                  3
                </span>
                MongoDB stores every prediction for history.
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 h-6 w-6 shrink-0 rounded-full bg-primary/10 text-center text-xs font-semibold text-primary">
                  4
                </span>
                View confidence, CGPA, and risk instantly.
              </li>
            </ol>
            <div className="mt-auto rounded-2xl bg-slate-900 px-4 py-5 text-white">
              <p className="text-sm uppercase tracking-[0.2em] text-white/60">Credentials</p>
              <p className="mt-2 text-base text-white/90">
                Sign up with your institutional email to start predicting. JWT secures
                every request.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
