import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import Header from '../components/Header.jsx';
import { createPrediction } from '../services/predictionService.js';
import { usePrediction } from '../hooks/usePrediction.js';

const initialState = {
  studentName: '',
  enrollmentNumber: '',
  age: '',
  department: 'CSE',
  gender: 'male',
  midsem1Marks: '',
  midsem2Marks: '',
  comprehensiveExamMarks: '',
  attendancePercentage: '',
  studyHoursPerWeek: '',
  totalBacklogs: '',
  hasPartTimeJob: 'no',
  currentGPA: '',
  parentEducationLevel: 'Graduate'
};

const Field = ({ label, children }) => (
  <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
    {label}
    {children}
  </label>
);

const PredictionFormPage = () => {
  const navigate = useNavigate();
  const { setLastPrediction } = usePrediction();
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      ...form,
      age: Number(form.age),
      department: form.department,
      midsem1Marks: Number(form.midsem1Marks),
      midsem2Marks: Number(form.midsem2Marks),
      comprehensiveExamMarks: Number(form.comprehensiveExamMarks),
      attendancePercentage: Number(form.attendancePercentage),
      studyHoursPerWeek: Number(form.studyHoursPerWeek),
      totalBacklogs: Number(form.totalBacklogs),
      currentGPA: Number(form.currentGPA),
      parentEducationLevel: form.parentEducationLevel
    };

    try {
      const response = await createPrediction(payload);
      setLastPrediction({
        prediction: response.prediction,
        input: payload
      });
      toast.success('Prediction generated');
      navigate('/results');
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Prediction failed';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pb-14">
      <div className="mx-auto max-w-6xl px-4 pt-8">
        <Header />

        <div className="mt-8 flex items-center justify-between text-white/80">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.2em]">
            <Sparkles className="h-4 w-4" />
            Step 1 · Student data
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="card col-span-2 p-6 md:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-primary">
                  New prediction
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                  Enter student signals
                </h2>
                <p className="text-slate-500">
                  The backend will validate, call the ML service, and return CGPA +
                  risk instantly.
                </p>
              </div>
            </div>

            <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Student name">
                  <input
                    required
                    name="studentName"
                    value={form.studentName}
                    onChange={handleChange}
                    className="rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Raj Kumar"
                  />
                </Field>
                <Field label="Enrollment number">
                  <input
                    required
                    name="enrollmentNumber"
                    value={form.enrollmentNumber}
                    onChange={handleChange}
                    className="rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="2021001"
                  />
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Age">
                  <input
                    required
                    name="age"
                    type="number"
                    min={15}
                    max={40}
                    value={form.age}
                    onChange={handleChange}
                    className="rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </Field>
                <Field label="Gender">
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </Field>
                <Field label="Department">
                  <select
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="IT">IT</option>
                    <option value="CIVIL">CIVIL</option>
                    <option value="MECH">MECH</option>
                  </select>
                </Field>
                <Field label="Parent education level">
                  <select
                    name="parentEducationLevel"
                    value={form.parentEducationLevel}
                    onChange={handleChange}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="Diploma">Diploma</option>
                    <option value="Graduate">Graduate</option>
                    <option value="High School">High School</option>
                    <option value="Postgraduate">Postgraduate</option>
                  </select>
                </Field>
                <Field label="Part-time job">
                  <select
                    name="hasPartTimeJob"
                    value={form.hasPartTimeJob}
                    onChange={handleChange}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Midsem 1 marks (0-100)">
                  <input
                    required
                    name="midsem1Marks"
                    type="number"
                    min={0}
                    max={100}
                    value={form.midsem1Marks}
                    onChange={handleChange}
                    className="rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </Field>
                <Field label="Midsem 2 marks (0-100)">
                  <input
                    required
                    name="midsem2Marks"
                    type="number"
                    min={0}
                    max={100}
                    value={form.midsem2Marks}
                    onChange={handleChange}
                    className="rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </Field>
                <Field label="Comprehensive exam (0-100)">
                  <input
                    required
                    name="comprehensiveExamMarks"
                    type="number"
                    min={0}
                    max={100}
                    value={form.comprehensiveExamMarks}
                    onChange={handleChange}
                    className="rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Attendance %">
                  <input
                    required
                    name="attendancePercentage"
                    type="number"
                    min={0}
                    max={100}
                    value={form.attendancePercentage}
                    onChange={handleChange}
                    className="rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </Field>
                <Field label="Study hours / week">
                  <input
                    required
                    name="studyHoursPerWeek"
                    type="number"
                    min={0}
                    value={form.studyHoursPerWeek}
                    onChange={handleChange}
                    className="rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </Field>
                <Field label="Total backlogs">
                  <input
                    required
                    name="totalBacklogs"
                    type="number"
                    min={0}
                    value={form.totalBacklogs}
                    onChange={handleChange}
                    className="rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Current GPA (0-10)">
                  <input
                    required
                    name="currentGPA"
                    type="number"
                    min={0}
                    max={10}
                    step="0.1"
                    value={form.currentGPA}
                    onChange={handleChange}
                    className="rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </Field>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-slate-500">
                  This will call <code className="font-mono text-primary">POST /api/predictions</code>{' '}
                  with JWT from your login.
                </p>
                <button
                  type="submit"
                  disabled={submitting}
                  className="group inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-card transition hover:-translate-y-0.5 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? 'Submitting...' : 'Generate prediction'}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </button>
              </div>
            </form>
          </div>

          <div className="card flex flex-col gap-4 p-6 text-slate-900">
            <div className="rounded-2xl bg-primary/10 px-4 py-3 text-sm font-semibold text-primary">
              Validation tips
            </div>
            <ul className="space-y-3 text-sm text-slate-600">
              <li>Ensure numbers are within the stated ranges.</li>
              <li>Part-time job expects yes/no (already mapped).</li>
              <li>All fields are required for accurate scoring.</li>
              <li>JWT token is injected automatically via axios interceptor.</li>
              <li>Backend will store the prediction in MongoDB.</li>
            </ul>
            <div className="rounded-2xl bg-slate-900 px-4 py-5 text-white">
              <p className="text-sm uppercase tracking-[0.2em] text-white/60">
                After submission
              </p>
              <p className="mt-2 text-white/90">
                You&apos;ll be redirected to the Results screen showing CGPA, risk level,
                and confidence with visuals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionFormPage;
