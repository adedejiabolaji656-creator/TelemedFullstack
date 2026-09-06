import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Trash2, Clock, Calendar, CalendarClock } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { Spinner } from '../../components/Spinner';

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
    return <Spinner label="Loading your schedule..." />;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Manage availability"
        subtitle="Click time slots to add them to your weekly schedule."
        icon={CalendarClock}
      />

      {/* Current Slots */}
      {slots.length > 0 && (
        <div className="card mb-6 p-6">
          <h2 className="mb-4 font-display text-lg font-bold text-slate-900">Current schedule</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {slots.map((slot) => (
              <div
                key={slot._id}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3"
              >
                <div className="flex items-center gap-2 text-sm">
                  <Calendar size={14} className="text-slate-400" />
                  <span className="font-semibold text-slate-700">{DAYS[slot.dayOfWeek]}</span>
                  <span className="text-slate-300">|</span>
                  <Clock size={14} className="text-slate-400" />
                  <span className="text-slate-600">{slot.startTime} – {slot.endTime}</span>
                </div>
                <button
                  onClick={() => handleDelete(slot._id)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                  aria-label="Delete slot"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add New Slots */}
      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-slate-900">Add new slots</h2>
          {selectedSlots.size > 0 && (
            <span className="badge bg-teal-50 text-teal-700 ring-1 ring-teal-100">
              {selectedSlots.size} selected
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-7 gap-2 mb-2">
              {DAYS.map((day) => (
                <div key={day} className="py-2 text-center text-sm font-semibold text-slate-500">
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
                        className={`rounded-lg py-2 text-xs font-medium transition-all duration-150 ${
                          isExisting
                            ? 'cursor-not-allowed bg-mint-50 text-mint-600 ring-1 ring-mint-100'
                            : isSelected
                            ? 'bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-md shadow-cyan-500/25'
                            : 'bg-slate-50 text-slate-600 ring-1 ring-slate-200 hover:bg-teal-50 hover:text-teal-700 hover:ring-teal-300'
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
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              {selectedSlots.size} slot(s) selected
            </p>
            <div className="flex gap-3">
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
