import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  ChevronLeft,
  Stethoscope,
  FileText,
  NotebookPen,
  FlaskConical,
  HeartPulse,
  ArrowRightLeft,
  CalendarClock,
  CheckCircle2,
  Loader2,
  ShieldAlert,
  Pill,
  Droplets,
  X,
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Spinner from '../../components/Spinner';
import StatusBadge from '../../components/StatusBadge';
import { format } from 'date-fns';
import { naira } from '../../utils/format';

const SectionCard = ({ icon: Icon, title, desc, onOpen, children, open, onClose }) => (
  <div className="card p-6">
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
          <Icon size={18} />
        </span>
        <div>
          <h3 className="font-display text-base font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-400">{desc}</p>
        </div>
      </div>
      {open ? (
        <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
          <X size={16} />
        </button>
      ) : (
        <button onClick={onOpen} className="btn-secondary px-3 py-1.5 text-xs font-semibold">
          {children || 'Add'}
        </button>
      )}
    </div>
    {open && <div className="mt-5">{children}</div>}
  </div>
);

const Field = ({ label, children }) => (
  <div>
    <label className="label">{label}</label>
    {children}
  </div>
);

const Consultation = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  const [notes, setNotes] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [showLab, setShowLab] = useState(false);
  const [showReferral, setShowReferral] = useState(false);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [busy, setBusy] = useState('');

  const labForm = { panelName: '', tests: '', amount: 5000, reason: '' };
  const [lab, setLab] = useState(labForm);
  const refForm = { toSpecialty: '', toHospital: '', toCity: '', reason: '', notes: '' };
  const [ref, setRef] = useState(refForm);
  const fuForm = { scheduledDate: '', startTime: '10:00', type: 'video', fee: 0 };
  const [fu, setFu] = useState(fuForm);

  useEffect(() => {
    const load = async () => {
      try {
        const [aptRes, patientRes] = await Promise.all([
          axios.get(`/api/appointments/${appointmentId}`),
          axios.get(`/api/doctors/appointments/${appointmentId}/patient`),
        ]);
        setAppointment(aptRes.data.appointment);
        setPatient(patientRes.data.profile);
        setNotes(aptRes.data.appointment.notes || '');
        setDiagnosis(aptRes.data.appointment.diagnosis || '');
      } catch (error) {
        alert(error.response?.data?.message || 'Could not load consultation');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [appointmentId]);

  const handleComplete = async () => {
    setBusy('complete');
    try {
      await axios.put(`/api/appointments/${appointmentId}/complete`, { notes, diagnosis });
      alert('Consultation completed and saved to the patient record.');
      navigate('/doctor/appointments');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to complete consultation');
    } finally {
      setBusy('');
    }
  };

  const handleLabRequest = async () => {
    setBusy('lab');
    try {
      await axios.post('/api/labs', {
        appointmentId,
        panelName: lab.panelName,
        tests: lab.tests.split(',').map((t) => t.trim()).filter(Boolean),
        reason: lab.reason,
        amount: Number(lab.amount) || 0,
      });
      alert('Lab test request sent. The patient can book a partner lab.');
      setShowLab(false);
      setLab(labForm);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to request lab tests');
    } finally {
      setBusy('');
    }
  };

  const handleReferral = async () => {
    setBusy('referral');
    try {
      await axios.post('/api/referrals', {
        appointmentId,
        toSpecialty: ref.toSpecialty,
        toHospital: ref.toHospital,
        toCity: ref.toCity,
        reason: ref.reason,
        notes: ref.notes,
      });
      alert('Referral sent to the patient.');
      setShowReferral(false);
      setRef(refForm);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to send referral');
    } finally {
      setBusy('');
    }
  };

  const handleFollowUp = async () => {
    setBusy('followup');
    try {
      await axios.post(`/api/appointments/${appointmentId}/follow-up`, {
        scheduledDate: fu.scheduledDate,
        startTime: fu.startTime,
        type: fu.type,
        fee: Number(fu.fee) || 0,
      });
      alert('Follow-up scheduled and sent to the patient.');
      setShowFollowUp(false);
      setFu(fuForm);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to schedule follow-up');
    } finally {
      setBusy('');
    }
  };

  if (loading) return <Spinner label="Opening consultation workspace..." />;
  if (!appointment) return null;

  const patientName = patient?.user?.name || 'the patient';

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        to="/doctor/appointments"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-teal-600"
      >
        <ChevronLeft size={15} /> Back to appointments
      </Link>

      <PageHeader
        title="Consultation Workspace"
        subtitle="Review the patient, record notes, then prescribe, request labs, refer or schedule a follow-up."
        icon={NotebookPen}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Appointment info */}
          <div className="card p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-display text-lg font-bold text-slate-900">
                  Visit with {patientName}
                </p>
                <p className="text-sm text-slate-500">
                  {format(new Date(appointment.scheduledDate), 'EEEE, MMM d, yyyy')} ·{' '}
                  {appointment.startTime} – {appointment.endTime} · {appointment.type}
                </p>
                {appointment.isFollowUp && (
                  <span className="mt-1 inline-block rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                    Follow-up visit
                  </span>
                )}
              </div>
              <StatusBadge status={appointment.status} />
            </div>
            {appointment.symptoms && (
              <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
                <span className="font-semibold">Patient's complaint: </span>
                {appointment.symptoms}
              </p>
            )}
          </div>

          {/* Notes and diagnosis */}
          <div className="card p-6">
            <h3 className="mb-4 font-display text-lg font-bold text-slate-900">Clinical notes</h3>
            <Field label="Diagnosis">
              <input
                className="input"
                placeholder="e.g. Essential hypertension, well controlled"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
              />
            </Field>
            <div className="mt-4">
              <label className="label">Consultation notes</label>
              <textarea
                className="input h-32 resize-none"
                placeholder="Examination findings, advice given, plan..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <button
              onClick={handleComplete}
              disabled={busy === 'complete'}
              className="btn-primary mt-4 w-full py-3 sm:w-auto sm:px-8"
            >
              {busy === 'complete' ? (
                <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Saving...</span>
              ) : (
                <>
                  <CheckCircle2 size={16} /> Save & complete consultation
                </>
              )}
            </button>
          </div>

          {/* Prescription */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                  <Pill size={18} />
                </span>
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900">Prescription</h3>
                  <p className="text-xs text-slate-400">Issue medication orders for the patient</p>
                </div>
              </div>
              <Link
                to={`/doctor/prescriptions/create/${appointmentId}`}
                className="btn-primary px-4 py-2 text-xs"
              >
                <FileText size={14} /> Write prescription
              </Link>
            </div>
          </div>

          {/* Lab request */}
          <SectionCard
            icon={FlaskConical}
            title="Lab test request"
            desc="Ask the patient to run tests at a partner lab"
            open={showLab}
            onOpen={() => setShowLab(true)}
            onClose={() => setShowLab(false)}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Panel name">
                <input
                  className="input"
                  placeholder="e.g. Malaria & FBC panel"
                  value={lab.panelName}
                  onChange={(e) => setLab({ ...lab, panelName: e.target.value })}
                />
              </Field>
              <Field label="Estimated cost (₦)">
                <input
                  type="number"
                  className="input"
                  value={lab.amount}
                  onChange={(e) => setLab({ ...lab, amount: e.target.value })}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Tests (comma separated)">
                  <input
                    className="input"
                    placeholder="e.g. Malaria (RDT), Full Blood Count (FBC), Random Blood Sugar"
                    value={lab.tests}
                    onChange={(e) => setLab({ ...lab, tests: e.target.value })}
                  />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Reason">
                  <input
                    className="input"
                    placeholder="Clinical indication for the tests"
                    value={lab.reason}
                    onChange={(e) => setLab({ ...lab, reason: e.target.value })}
                  />
                </Field>
              </div>
            </div>
            <button
              onClick={handleLabRequest}
              disabled={busy === 'lab'}
              className="btn-primary mt-4 px-6 py-2.5 text-sm"
            >
              {busy === 'lab' ? <Loader2 size={15} className="animate-spin" /> : 'Send lab request'}
            </button>
          </SectionCard>

          {/* Referral */}
          <SectionCard
            icon={ArrowRightLeft}
            title="Refer to a specialist"
            desc="Send the patient to another specialty / hospital"
            open={showReferral}
            onOpen={() => setShowReferral(true)}
            onClose={() => setShowReferral(false)}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Specialty *">
                <input
                  className="input"
                  placeholder="e.g. Cardiology, ENT, Oncology"
                  value={ref.toSpecialty}
                  onChange={(e) => setRef({ ...ref, toSpecialty: e.target.value })}
                />
              </Field>
              <Field label="Hospital">
                <input
                  className="input"
                  placeholder="e.g. National Hospital Abuja"
                  value={ref.toHospital}
                  onChange={(e) => setRef({ ...ref, toHospital: e.target.value })}
                />
              </Field>
              <Field label="City">
                <input
                  className="input"
                  placeholder="e.g. Abuja"
                  value={ref.toCity}
                  onChange={(e) => setRef({ ...ref, toCity: e.target.value })}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Reason *">
                  <textarea
                    className="input h-20 resize-none"
                    placeholder="Why the specialist referral is needed"
                    value={ref.reason}
                    onChange={(e) => setRef({ ...ref, reason: e.target.value })}
                  />
                </Field>
              </div>
            </div>
            <button
              onClick={handleReferral}
              disabled={busy === 'referral'}
              className="btn-primary mt-4 px-6 py-2.5 text-sm"
            >
              {busy === 'referral' ? <Loader2 size={15} className="animate-spin" /> : 'Send referral'}
            </button>
          </SectionCard>

          {/* Follow-up */}
          <SectionCard
            icon={CalendarClock}
            title="Schedule follow-up"
            desc="Book the next review session (free or fee-based)"
            open={showFollowUp}
            onOpen={() => setShowFollowUp(true)}
            onClose={() => setShowFollowUp(false)}
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Date *">
                <input
                  type="date"
                  className="input"
                  value={fu.scheduledDate}
                  onChange={(e) => setFu({ ...fu, scheduledDate: e.target.value })}
                />
              </Field>
              <Field label="Time">
                <input
                  type="time"
                  className="input"
                  value={fu.startTime}
                  onChange={(e) => setFu({ ...fu, startTime: e.target.value })}
                />
              </Field>
              <Field label="Mode">
                <select
                  className="input"
                  value={fu.type}
                  onChange={(e) => setFu({ ...fu, type: e.target.value })}
                >
                  <option value="video">Video</option>
                  <option value="chat">Chat</option>
                  <option value="in_person">In person</option>
                </select>
              </Field>
              <div className="sm:col-span-3">
                <Field label="Follow-up fee (₦) — leave 0 for free review">
                  <input
                    type="number"
                    className="input"
                    value={fu.fee}
                    onChange={(e) => setFu({ ...fu, fee: e.target.value })}
                  />
                </Field>
              </div>
            </div>
            <button
              onClick={handleFollowUp}
              disabled={busy === 'followup'}
              className="btn-primary mt-4 px-6 py-2.5 text-sm"
            >
              {busy === 'followup' ? <Loader2 size={15} className="animate-spin" /> : 'Schedule follow-up'}
            </button>
          </SectionCard>
        </div>

        {/* Patient snapshot */}
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-slate-900">
              <HeartPulse size={18} className="text-teal-600" /> Patient snapshot
            </h3>
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-slate-400">Phone</dt>
                <dd className="font-semibold text-slate-700">{patient?.user?.phone || '—'}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-400">Blood type</dt>
                <dd className="font-semibold text-slate-700">{patient?.bloodType || '—'}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-400">Gender</dt>
                <dd className="font-semibold capitalize text-slate-700">{patient?.gender || '—'}</dd>
              </div>
              <div className="border-t border-slate-100 pt-3">
                <dt className="mb-1 text-slate-400">Allergies</dt>
                <dd className="text-slate-700">
                  {patient?.allergies?.length ? patient.allergies.join(', ') : 'None recorded'}
                </dd>
              </div>
              <div className="border-t border-slate-100 pt-3">
                <dt className="mb-1 text-slate-400">Current medications</dt>
                <dd className="text-slate-700">
                  {patient?.currentMedications?.length
                    ? patient.currentMedications.join(', ')
                    : 'None recorded'}
                </dd>
              </div>
              <div className="border-t border-slate-100 pt-3">
                <dt className="mb-1 text-slate-400">Medical conditions</dt>
                <dd className="text-slate-700">
                  {patient?.medicalConditions?.length
                    ? patient.medicalConditions.join(', ')
                    : 'None recorded'}
                </dd>
              </div>
              <div className="border-t border-slate-100 pt-3">
                <dt className="mb-1 text-slate-400">HMO / Insurance</dt>
                <dd className="text-slate-700">
                  {patient?.insurance?.provider || 'Not provided'}
                </dd>
              </div>
            </dl>
          </div>

          <div className="card border-amber-200 bg-amber-50/60 p-6">
            <h3 className="mb-2 flex items-center gap-2 font-display text-base font-bold text-amber-800">
              <ShieldAlert size={18} /> Safe practice
            </h3>
            <p className="text-xs leading-relaxed text-amber-700">
              Confirm the patient's identity before advising. Document everything in notes — the
              record is shared with the patient and your institutions.
            </p>
          </div>

          {appointment.payment?.amount > 0 && (
            <div className="card p-6">
              <p className="text-xs text-slate-400">Consultation fee received</p>
              <p className="font-display text-2xl font-extrabold text-slate-900">
                {naira(appointment.payment.amount)}
              </p>
              <p className="mt-1 text-xs capitalize text-mint-600">
                via {appointment.payment.method || 'mock'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Consultation;