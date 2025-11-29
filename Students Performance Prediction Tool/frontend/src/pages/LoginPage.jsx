import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowRight, Shield, Sparkles } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { signin, signup, signinWithGoogle } from '../services/authService.js';
import { useAuth } from '../hooks/useAuth.js';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [mode, setMode] = useState('signin');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const idToken = credentialResponse?.credential;
      if (!idToken) {
        toast.error('Missing Google id_token; please try again');
        return;
      }
      const payload = await signinWithGoogle(idToken);
      login(payload);
      toast.success('Signed in with Google');
      navigate('/dashboard');
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Google sign-in failed';
      toast.error(message);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload =
        mode === 'signup'
          ? await signup({
              name: form.name,
              email: form.email,
              password: form.password
            })
          : await signin({
              email: form.email,
              password: form.password
            });

      login(payload);
      toast.success(mode === 'signup' ? 'Account created' : 'Signed in');
      navigate('/dashboard');
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Unable to authenticate';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10 text-white">
      <div className="grid w-full max-w-6xl grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-primary/80 via-sky-500/80 to-indigo-600/80 p-10 shadow-card">
          <div className="absolute -left-10 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-16 -right-12 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="relative flex flex-col gap-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <Sparkles className="h-7 w-7" />
            </div>
            <h1 className="text-3xl font-semibold leading-tight text-white md:text-4xl">
              Student Performance Forecasting Tool
            </h1>
            <p className="text-lg text-slate-100/90">
              Securely onboard, predict CGPA, and monitor academic risk in one
              streamlined workspace.
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                <p className="text-3xl font-semibold">12</p>
                <p className="text-slate-100/80">API endpoints ready</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                <p className="text-3xl font-semibold">1</p>
                <p className="text-slate-100/80">Services online</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 text-sm text-slate-100/90">
              <Shield className="h-5 w-5" />
              JWT secured • MongoDB Atlas • FastAPI ML (This needs to be removed)
            </div>
          </div>
        </div>

        <div className="card relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-accent to-indigo-500" />
          <div className="p-8 md:p-10">
            <div className="mb-6 flex items-center gap-2">
              <div className="flex items-center rounded-full bg-primary/10 px-3 py-1 text-primary">
                {mode === 'signup' ? 'Create faculty account' : 'Welcome back'}
              </div>
            </div>
            <div className="mb-6 flex items-center gap-2 text-sm">
              <button
                className={`rounded-xl px-4 py-2 font-semibold transition ${
                  mode === 'signin'
                    ? 'bg-primary text-white shadow-subtle'
                    : 'text-slate-600 hover:text-primary'
                }`}
                onClick={() => setMode('signin')}
              >
                Sign In
              </button>
              <button
                className={`rounded-xl px-4 py-2 font-semibold transition ${
                  mode === 'signup'
                    ? 'bg-primary text-white shadow-subtle'
                    : 'text-slate-600 hover:text-primary'
                }`}
                onClick={() => setMode('signup')}
              >
                Sign Up
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {mode === 'signup' && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Full name
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required={mode === 'signup'}
                    placeholder="Dr. Jane Smith"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Institutional email
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="you@college.edu"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  placeholder="Minimum 6 characters"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-subtle transition hover:-translate-y-0.5 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </button>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="h-px flex-1 bg-slate-200" />
                or
                <span className="h-px flex-1 bg-slate-200" />
              </div>
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error('Google sign-in failed')}
                  useOneTap={false}
                  theme="outline"
                  shape="pill"
                  text="continue_with"
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
