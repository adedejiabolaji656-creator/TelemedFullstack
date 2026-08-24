import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FileText, Calendar, User, Tag, Download, Plus } from 'lucide-react';
import { format } from 'date-fns';

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

  const getTypeColor = (type) => {
    const colors = {
      consultation: 'bg-blue-100 text-blue-700',
      lab_report: 'bg-green-100 text-green-700',
      imaging: 'bg-purple-100 text-purple-700',
      prescription: 'bg-yellow-100 text-yellow-700',
      vaccination: 'bg-pink-100 text-pink-700',
      surgery: 'bg-red-100 text-red-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Medical Records</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={18} />
          <span>Add Record</span>
        </button>
      </div>

      {records.length === 0 ? (
        <div className="card text-center py-12">
          <FileText className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500 text-lg">No medical records yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((record) => (
            <div key={record._id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getTypeColor(record.type)}`}>
                      {record.type.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-400">
                      {format(new Date(record.createdAt), 'MMM d, yyyy')}
                    </span>
                  </div>

                  <h3 className="font-semibold text-lg mb-1">{record.title}</h3>

                  {record.doctor && (
                    <p className="text-sm text-gray-500 mb-2 flex items-center">
                      <User size={14} className="mr-1" />
                      Dr. {record.doctor?.user?.name}
                    </p>
                  )}

                  {record.description && (
                    <p className="text-gray-600 text-sm mb-3">{record.description}</p>
                  )}

                  {record.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {record.tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs flex items-center">
                          <Tag size={10} className="mr-1" />
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
                    className="ml-4 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Download size={20} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Record Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Add Medical Record</h2>
              <form onSubmit={handleAddRecord} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    className="input"
                    value={newRecord.title}
                    onChange={(e) => setNewRecord({ ...newRecord, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    className="input h-24 resize-none"
                    value={newRecord.description}
                    onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. annual checkup, blood pressure"
                    value={newRecord.tags}
                    onChange={(e) => setNewRecord({ ...newRecord, tags: e.target.value })}
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Add Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalRecords;
