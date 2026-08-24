import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Trash2, Clock, Calendar } from 'lucide-react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30',
];

const DoctorAvailability = () => {
  const [slots, setSlots] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      const res = await axios.get('/api/doctors/me');
      const doctorId = res.data.doctor._id;
      const slotsRes = await axios.get(`/api/doctors/${doctorId}/availability`);
      setSlots(slotsRes.data.slots);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSlot = (dayIndex, time) => {
    const key = `${dayIndex}-${time}`;
    const next = new Set(selectedSlots);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSelectedSlots(next);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const newSlots = Array.from(selectedSlots).map((key) => {
        const [dayOfWeek, startTime] = key.split('-');
        const [h, m] = startTime.split(':').map(Number);
        const endH = h + (m + 30 >= 60 ? 1 : 0);
        const endM = (m + 30) % 60;
        return {
          dayOfWeek: parseInt(dayOfWeek),
          startTime,
          endTime: `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`,
        };
      });

      await axios.post('/api/doctors/availability', { slots: newSlots });
      setSelectedSlots(new Set());
      fetchSlots();
      alert('Availability saved!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (slotId) => {
    if (!window.confirm('Delete this slot?')) return;
    try {
      await axios.delete(`/api/doctors/availability/${slotId}`);
      fetchSlots();
    } catch (error) {
      alert('Failed to delete');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-2">Manage Availability</h1>
      <p className="text-gray-500 mb-6">Click on time slots to add them to your schedule</p>

      {/* Current Slots */}
      {slots.length > 0 && (
        <div className="card mb-6">
          <h2 className="font-semibold mb-3">Current Schedule</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {slots.map((slot) => (
              <div
                key={slot._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  <Calendar size={14} className="text-gray-400" />
                  <span className="text-sm font-medium">{DAYS[slot.dayOfWeek]}</span>
                  <Clock size={14} className="text-gray-400 ml-2" />
                  <span className="text-sm">{slot.startTime} - {slot.endTime}</span>
                </div>
                <button
                  onClick={() => handleDelete(slot._id)}
                  className="text-red-400 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add New Slots */}
      <div className="card">
        <h2 className="font-semibold mb-4">Add New Slots</h2>

        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-7 gap-2 mb-2">
              {DAYS.map((day) => (
                <div key={day} className="text-center font-medium text-sm text-gray-600 py-2">
                  {day.slice(0, 3)}
                </div>
              ))}
            </div>

            <div className="space-y-1">
              {TIME_SLOTS.map((time) => (
                <div key={time} className="grid grid-cols-7 gap-2">
                  {DAYS.map((_, dayIndex) => {
                    const key = `${dayIndex}-${time}`;
                    const isSelected = selectedSlots.has(key);
                    const isExisting = slots.some(
                      (s) => s.dayOfWeek === dayIndex && s.startTime === time
                    );

                    return (
                      <button
                        key={key}
                        onClick={() => !isExisting && toggleSlot(dayIndex, time)}
                        disabled={isExisting}
                        className={`py-2 text-xs rounded transition-colors ${
                          isExisting
                            ? 'bg-green-100 text-green-600 cursor-not-allowed'
                            : isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-50 hover:bg-blue-50 text-gray-700 border border-gray-200'
                        }`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {selectedSlots.size > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {selectedSlots.size} slot(s) selected
            </p>
            <div className="space-x-3">
              <button
                onClick={() => setSelectedSlots(new Set())}
                className="btn-secondary"
              >
                Clear
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Slots'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorAvailability;
