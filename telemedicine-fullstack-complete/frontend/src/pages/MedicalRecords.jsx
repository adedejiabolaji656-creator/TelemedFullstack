import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  Calendar,
  Tag,
  Download,
  Plus,
  FolderHeart,
  X,
  Stethoscope,
  Beaker,
  ScanLine,
  Pill,
  Syringe,
  Scissors,
} from 'lucide-react';
import { format } from 'date-fns';
import PageHeader, { Avatar } from '../components/PageHeader';
import { Spinner } from '../components/Spinner';

const TYPE_META = {
  consultation: { icon: Stethoscope, classes: 'bg-brand-50 text-brand-700 ring-brand-100' },
  lab_report: { icon: Beaker, classes: 'bg-mint-50 text-mint-600 ring-mint-100' },
  imaging: { icon: ScanLine, classes: 'bg-violet-50 text-violet-700 ring-violet-100' },
  prescription: { icon: Pill, classes: 'bg-amber-50 text-amber-700 ring-amber-100' },
  vaccination: { icon: Syringe, classes: 'bg-pink-50 text-pink-700 ring-pink-100' },
  surgery: { icon: Scissors, classes: 'bg-red-50 text-red-700 ring-red-100' },
};

const MedicalRecords = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRecord, setNewRecord] = useState({
    title: '',
    description: '',
    type: 'consultation',
    tags: '',
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const res = await axios.get('/api/medical-records');
      setRecords(res.data.records);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecord = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/medical-records', {
        ...newRecord,
        patientId: user?.profile?._id,
        tags: newRecord.tags.split(',').map((t) => t.trim()),
      });
      setShowAddModal(false);
      setNewRecord({ title: '', description: '', type: 'consultation', tags: '' });
      fetchRecords();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add record');
    }
  };

  const meta = (type) => TYPE_META[type] || TYPE_META.consultation;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Medical records"
        subtitle="Your diagnoses, lab reports, and care history in one timeline."
        icon={FolderHeart}
        actions={
          <button onClick={() => setShowAddModal(true)} className="btn-primary">
            <Plus size={16} />
            Add record
          </button>
        }
      />

      {loading ? (
        <Spinner label="Loading your records..." />
      ) : records.length === 0 ? (
        <div className="card mx-auto max-w-lg py-16 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-300 ring-1 ring-slate-100">
            <FileText size={30} />
          </div>
          <p className="font-display text-lg font-bold text-slate-800">No medical records yet</p>
          <p className="mt-2 text-sm text-slate-500">
            Add a record below or they'll be attached automatically by your doctors.
          </p>
          <button onClick={() => setShowAddModal(true)} className="btn-primary mt-6">
            <Plus size={15} />
            Add your first record
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((record) => {
            const { icon: TypeIcon, classes } = meta(record.type);
            return (
              <div key={record._id} className="card p-5 transition-all duration-200 hover:shadow-lift">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-xl ring-1 ${classes}`}
                      >
                        <TypeIcon size={16} />
                      </span>
                      <h3 className="font-display text-lg font-bold text-slate-900">{record.title}</h3>
                      <span className={`badge capitalize ring-1 ${classes}`}>
                        {record.type.replace('_', ' ')}
                      </span>
                    </div>

                    {record.doctor && (
                      <p className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                        <Avatar name={`Dr. ${record.doctor?.user?.name}`} className="h-6 w-6 text-[9px]" />
                        Dr. {record.doctor?.user?.name}
                        <span className="mx-1 h-3 w-px bg-slate-200" />
                        <span className="flex items-center gap-1 text-slate-400">
                          <Calendar size={11} />
                          {format(new Date(record.createdAt), 'MMM d, yyyy')}
                        </span>
                      </p>
                    )}

                    {record.description && (
                      <p className="mt-3 text-sm leading-relaxed text-slate-600">{record.description}</p>
                    )}

                    {record.tags?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {record.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500"
                          >
                            <Tag size={10} className="text-slate-400" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {record.documentUrl && (
                    <a
                      href={record.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400 ring-1 ring-slate-200 transition-all hover:bg-brand-50 hover:text-brand-600 hover:ring-brand-100"
                      aria-label="Download document"
                    >
                      <Download size={16} />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Record Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-lift">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="font-display text-lg font-bold text-slate-900">Add medical record</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddRecord} className="space-y-5 p-6">
              <div>
                <label className="label" htmlFor="record-title">Title</label>
                <input
                  id="record-title"
                  type="text"
                  className="input"
                  placeholder="e.g. Annual physical exam"
                  value={newRecord.title}
                  onChange={(e) => setNewRecord({ ...newRecord, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="record-type">Type</label>
                <select
                  id="record-type"
                  className="input"
                  value={newRecord.type}
                  onChange={(e) => setNewRecord({ ...newRecord, type: e.target.value })}
                >
                  <option value="consultation">Consultation</option>
                  <option value="lab_report">Lab Report</option>
                  <option value="imaging">Imaging</option>
                  <option value="prescription">Prescription</option>
                  <option value="vaccination">Vaccination</option>
                  <option value="surgery">Surgery</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="label" htmlFor="record-desc">Description</label>
                <textarea
                  id="record-desc"
                  className="input h-24 resize-none"
                  placeholder="Short summary of this record"
                  value={newRecord.description}
                  onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}
                />
              </div>
              <div>
                <label className="label" htmlFor="record-tags">
                  Tags <span className="font-normal text-slate-400">(comma separated)</span>
                </label>
                <input
                  id="record-tags"
                  type="text"
                  className="input"
                  placeholder="e.g. annual checkup, blood pressure"
                  value={newRecord.tags}
                  onChange={(e) => setNewRecord({ ...newRecord, tags: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Plus size={15} />
                  Add record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalRecords;