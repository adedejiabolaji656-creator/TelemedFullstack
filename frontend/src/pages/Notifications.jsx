import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Bell, BellRing, CheckCheck, Loader2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { formatDistanceToNow } from 'date-fns';

const TYPE_ICON = {
  appointment: 'bg-brand-100 text-brand-600',
  prescription: 'bg-violet-100 text-violet-600',
  medical_record: 'bg-mint-100 text-mint-600',
  payment: 'bg-amber-100 text-amber-600',
  verification: 'bg-slate-100 text-slate-600',
  general: 'bg-slate-100 text-slate-600',
};

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');

  const load = async () => {
    try {
      const res = await axios.get('/api/notifications');
      setNotifications(res.data.notifications || []);
      setUnread(res.data.unreadCount || 0);
    } catch (error) {
      console.error('Notifications load error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markRead = async (n) => {
    if (n.isRead) {
      if (n.link) navigate(n.link);
      return;
    }
    try {
      await axios.put(`/api/notifications/${n._id}/read`);
      if (n.link) navigate(n.link);
    } catch (error) {
      console.error(error);
    }
  };

  const markAll = async () => {
    setBusy('all');
    try {
      await axios.put('/api/notifications/read-all');
      await load();
    } catch (error) {
      console.error(error);
    } finally {
      setBusy('');
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Notifications"
        subtitle={unread > 0 ? `You have ${unread} unread.` : 'You are all caught up.'}
        icon={BellRing}
        actions={
          unread > 0 ? (
            <button onClick={markAll} disabled={busy === 'all'} className="btn-secondary px-4 py-2 text-sm font-semibold">
              {busy === 'all' ? <Loader2 size={15} className="animate-spin" /> : <CheckCheck size={15} />}
              Mark all read
            </button>
          ) : undefined
        }
      />

      {loading ? (
        <p className="py-16 text-center text-sm text-slate-400">Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <div className="card p-12 text-center">
          <Bell className="mx-auto mb-3 text-slate-300" size={36} />
          <p className="text-sm text-slate-400">
            No notifications yet. Booking, prescriptions, labs and payments will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <button
              key={n._id}
              onClick={() => markRead(n)}
              className={`card block w-full p-5 text-left transition-all duration-200 ${
                n.isRead ? 'opacity-70' : 'border-teal-200 bg-teal-50/60'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${TYPE_ICON[n.type] || TYPE_ICON.general}`}>
                  <Bell size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-slate-800">{n.title}</p>
                    <span className="shrink-0 text-[11px] text-slate-400">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-slate-500">{n.message}</p>
                  {!n.isRead && <span className="mt-2 inline-block h-2 w-2 rounded-full bg-teal-500" />}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;