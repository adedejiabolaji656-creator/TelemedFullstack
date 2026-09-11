import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Pill,
  Plus,
  Loader2,
  MapPin,
  Phone,
  Truck,
  Store,
  X,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { naira } from '../utils/format';
import { PARTNER_PHARMACIES, drugPrice } from '../utils/partners';
import { format } from 'date-fns';

const NEXT_TRANSITIONS = {
  placed: ['confirmed'],
  confirmed: ['preparing'],
  preparing: ['ready_for_pickup', 'delivering'],
  ready_for_pickup: ['delivered'],
  delivering: ['delivered'],
};

const Pharmacy = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [busy, setBusy] = useState('');

  const [draft, setDraft] = useState({
    prescriptionId: '',
    pharmacy: PARTNER_PHARMACIES[0],
    deliveryMethod: 'pickup',
    deliveryAddress: '',
  });
  const [items, setItems] = useState([]);

  const isPatient = user?.role === 'patient';

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get('/api/pharmacy');
        setOrders(res.data.pharmacyOrders || []);
        if (isPatient) {
          const rx = await axios.get('/api/prescriptions');
          setPrescriptions(rx.data.prescriptions || []);
        }
      } catch (error) {
        console.error('Pharmacy load error:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const selectPrescription = (id) => {
    const rx = prescriptions.find((p) => p._id === id);
    if (!rx) return;
    const nextItems = (rx.medications || []).map((m) => ({
      medication: m.name,
      dosage: `${m.dosage} ${m.frequency || ''}`.trim(),
      quantity: 1,
      pricePerUnit: drugPrice(m.name),
    }));
    setDraft((d) => ({ ...d, prescriptionId: id }));
    setItems(nextItems);
  };

  const setQty = (idx, qty) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, quantity: Number(qty) || 1 } : it)));
  };

  const total = items.reduce((sum, it) => sum + it.quantity * it.pricePerUnit, 0);

  const submitOrder = async () => {
    setBusy('new');
    try {
      const res = await axios.post('/api/pharmacy', {
        prescriptionId: draft.prescriptionId,
        pharmacy: draft.pharmacy,
        deliveryMethod: draft.deliveryMethod,
        deliveryAddress: draft.deliveryAddress,
        items: items.filter((it) => it.medication),
      });
      const order = res.data.pharmacyOrder;
      alert(
        `Order placed at ${order.pharmacy.name}. Payment of ${naira(order.total)} completed (demo).`
      );
      setShowNew(false);
      setDraft({ prescriptionId: '', pharmacy: PARTNER_PHARMACIES[0], deliveryMethod: 'pickup', deliveryAddress: '' });
      setItems([]);
      const refresh = await axios.get('/api/pharmacy');
      setOrders(refresh.data.pharmacyOrders || []);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to place order');
    } finally {
      setBusy('');
    }
  };

  const advance = async (order, status) => {
    setBusy(`advance-${order._id}`);
    try {
      await axios.put(`/api/pharmacy/${order._id}/status`, { status, trackingNote: 'Updated by patient (demo)' });
      const refresh = await axios.get('/api/pharmacy');
      setOrders(refresh.data.pharmacyOrders || []);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update order');
    } finally {
      setBusy('');
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Pharmacy"
        subtitle={
          isPatient
            ? 'Buy your prescribed medication from verified partner pharmacies.'
            : 'Medication orders placed against your prescriptions.'
        }
        icon={Pill}
        actions={
          isPatient ? (
            <button onClick={() => setShowNew(!showNew)} className="btn-primary px-4 py-2 text-sm">
              {showNew ? <X size={15} /> : <Plus size={15} />} {showNew ? 'Close' : 'New order'}
            </button>
          ) : undefined
        }
      />

      {isPatient && showNew && (
        <div className="card mb-8 p-6">
          <h3 className="mb-4 font-display text-lg font-bold text-slate-900">New medication order</h3>
          <div className="space-y-5">
            <div>
              <label className="label">Choose prescription</label>
              <select className="input" value={draft.prescriptionId} onChange={(e) => selectPrescription(e.target.value)}>
                <option value="">Select a prescription...</option>
                {prescriptions.map((rx) => (
                  <option key={rx._id} value={rx._id}>
                    Dr. {rx.doctor?.user?.name} — {rx.diagnosis} ({format(new Date(rx.createdAt), 'MMM d, yyyy')})
                  </option>
                ))}
              </select>
            </div>

            {items.length > 0 && (
              <div className="overflow-hidden rounded-2xl border border-slate-100">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                    <tr>
                      <th className="px-4 py-2 font-semibold">Medication</th>
                      <th className="px-4 py-2 font-semibold">Qty</th>
                      <th className="px-4 py-2 font-semibold">Unit price</th>
                      <th className="px-4 py-2 text-right font-semibold">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, i) => (
                      <tr key={i} className="border-t border-slate-50">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-800">{it.medication}</p>
                          <p className="text-xs text-slate-400">{it.dosage}</p>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="1"
                            className="w-16 rounded-lg border border-slate-200 px-2 py-1 text-sm"
                            value={it.quantity}
                            onChange={(e) => setQty(i, e.target.value)}
                          />
                        </td>
                        <td className="px-4 py-3 text-slate-600">{naira(it.pricePerUnit)}</td>
                        <td className="px-4 py-3 text-right font-bold text-slate-800">
                          {naira(it.quantity * it.pricePerUnit)}
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t border-slate-100 bg-slate-50">
                      <td colSpan="3" className="px-4 py-3 text-sm font-semibold text-slate-600">Total</td>
                      <td className="px-4 py-3 text-right font-display text-base font-extrabold text-slate-900">
                        {naira(total)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            <div>
              <label className="label">Partner pharmacy</label>
              <div className="grid gap-2 sm:grid-cols-2">
                {PARTNER_PHARMACIES.map((ph) => (
                  <label
                    key={ph.name}
                    className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-3 transition-all ${
                      draft.pharmacy.name === ph.name
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <input
                      type="radio"
                      checked={draft.pharmacy.name === ph.name}
                      onChange={() => setDraft({ ...draft, pharmacy: ph })}
                      className="sr-only"
                    />
                    <Store size={16} className="text-teal-600" />
                    <span>
                      <span className="block text-sm font-bold text-slate-800">{ph.name}</span>
                      <span className="block text-xs text-slate-400">{ph.city}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Delivery method</label>
                <select
                  className="input"
                  value={draft.deliveryMethod}
                  onChange={(e) => setDraft({ ...draft, deliveryMethod: e.target.value })}
                >
                  <option value="pickup">Pickup at pharmacy</option>
                  <option value="delivery">Home / office delivery (+₦1,500)</option>
                </select>
              </div>
              {draft.deliveryMethod === 'delivery' && (
                <div>
                  <label className="label">Delivery address</label>
                  <input
                    className="input"
                    placeholder="e.g. 5 Bode Thomas Street, Surulere, Lagos"
                    value={draft.deliveryAddress}
                    onChange={(e) => setDraft({ ...draft, deliveryAddress: e.target.value })}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4">
              <div>
                <p className="text-xs text-slate-400">Order total (incl. delivery)</p>
                <p className="font-display text-xl font-extrabold text-slate-900">
                  {naira(total + (draft.deliveryMethod === 'delivery' ? 1500 : 0))}
                </p>
              </div>
              <button onClick={submitOrder} disabled={!items.length || busy === 'new'} className="btn-primary px-6 py-3">
                {busy === 'new' ? <Loader2 size={16} className="animate-spin" /> : <>Pay {naira(total + (draft.deliveryMethod === 'delivery' ? 1500 : 0))}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p className="py-16 text-center text-sm text-slate-400">Loading pharmacy orders...</p>
      ) : orders.length === 0 ? (
        <div className="card p-12 text-center">
          <Pill className="mx-auto mb-3 text-slate-300" size={36} />
          <p className="text-sm text-slate-400">
            {isPatient
              ? 'No pharmacy orders yet. Get a prescription from a doctor, then order here.'
              : 'No medication orders yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const next = NEXT_TRANSITIONS[order.status] || [];
            return (
              <div key={order._id} className="card p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-display text-base font-bold text-slate-900">
                      Order {order.reference}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {order.pharmacy?.name} · {format(new Date(order.createdAt), 'MMM d, yyyy')}
                      {isPatient && ` · Dr. ${order.doctor?.user?.name}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-700">{naira(order.total)}</span>
                    <StatusBadge status={order.status} />
                  </div>
                </div>

                <ul className="mt-3 space-y-1">
                  {order.items.map((it, i) => (
                    <li key={i} className="flex items-center justify-between text-sm text-slate-600">
                      <span>
                        {it.medication}
                        {it.dosage && <span className="text-slate-400"> — {it.dosage}</span>}
                        <span className="text-slate-400"> × {it.quantity}</span>
                      </span>
                      <span className="font-semibold text-slate-700">{naira(it.quantity * it.pricePerUnit)}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-50 pt-3">
                  <p className="flex items-center gap-1.5 text-xs text-slate-400">
                    <MapPin size={12} /> {order.pharmacy?.address}, {order.pharmacy?.city}
                    {order.deliveryMethod === 'delivery' && (
                      <span className="flex items-center gap-1 text-indigo-500">
                        <Truck size={12} /> Delivery
                      </span>
                    )}
                  </p>
                  {order.status === 'placed' && order.paymentStatus === 'paid' && (
                    <span className="rounded-full bg-mint-100 px-2 py-0.5 text-[11px] font-semibold text-mint-700">
                      Payment received
                    </span>
                  )}
                  {isPatient && next.length > 0 && (
                    <div className="flex gap-2">
                      {next.map((s) => (
                        <button
                          key={s}
                          onClick={() => advance(order, s)}
                          disabled={busy === `advance-${order._id}`}
                          className="btn-secondary px-3 py-1.5 text-xs font-semibold"
                        >
                          {busy === `advance-${order._id}` ? <Loader2 size={12} className="animate-spin" /> : `Mark ${s.replace('_', ' ')} (demo)`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Pharmacy;