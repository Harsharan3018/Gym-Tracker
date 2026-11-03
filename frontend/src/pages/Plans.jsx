import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import {
  CreditCard,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    durationMonths: 1,
    price: 1500,
    description: '',
    featuresText: '',
    status: 'Active',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await api.get('/plans');
      if (res.data.success) {
        setPlans(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({
      name: '',
      durationMonths: 1,
      price: 1500,
      description: '',
      featuresText: 'Full Gym Access\nLocker Room Access\nFree Fitness Assessment',
      status: 'Active',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (p) => {
    setModalMode('edit');
    setCurrentId(p._id);
    setFormData({
      name: p.name,
      durationMonths: p.durationMonths,
      price: p.price,
      description: p.description || '',
      featuresText: p.features ? p.features.join('\n') : '',
      status: p.status,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      const features = formData.featuresText
        .split('\n')
        .map((f) => f.trim())
        .filter((f) => f.length > 0);

      const payload = {
        name: formData.name,
        durationMonths: Number(formData.durationMonths),
        price: Number(formData.price),
        description: formData.description,
        features,
        status: formData.status,
      };

      if (modalMode === 'create') {
        await api.post('/plans', payload);
      } else {
        await api.put(`/plans/${currentId}`, payload);
      }
      setIsModalOpen(false);
      fetchPlans();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error saving membership plan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete membership plan "${name}"?`)) {
      try {
        await api.delete(`/plans/${id}`);
        fetchPlans();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting plan');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Gym Membership Packages</h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure pricing tiers, duration intervals, and package amenities
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Membership Plan</span>
        </button>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">
          <div className="animate-spin h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          Loading plans...
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          No membership plans created yet. Click "Create Membership Plan" to add one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan._id}
              className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-3xl p-6 flex flex-col justify-between transition shadow-xl relative overflow-hidden group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Badge variant={plan.status.toLowerCase()}>{plan.status}</Badge>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(plan)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      title="Edit Plan"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(plan._id, plan.name)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition"
                      title="Delete Plan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-xs text-slate-400 mb-6 min-h-[32px]">{plan.description}</p>

                <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-slate-800">
                  <span className="text-3xl font-extrabold text-white">₹{plan.price.toLocaleString()}</span>
                  <span className="text-xs text-slate-400 font-medium">/ {plan.durationMonths} {plan.durationMonths === 1 ? 'Month' : 'Months'}</span>
                </div>

                {/* Features List */}
                <ul className="space-y-2.5 text-xs text-slate-300 mb-6">
                  {plan.features?.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Duration: {plan.durationMonths} mo</span>
                </div>
                <span className="text-indigo-400 font-semibold">₹{(plan.price / plan.durationMonths).toFixed(0)}/mo</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Plan Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Create Membership Plan' : 'Edit Membership Plan'}
      >
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Plan Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Duration (Months) *</label>
              <input
                type="number"
                min="1"
                required
                value={formData.durationMonths}
                onChange={(e) => setFormData({ ...formData, durationMonths: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Total Price (₹) *</label>
              <input
                type="number"
                min="0"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500 outline-none"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Plan Description</label>
            <input
              type="text"
              placeholder="e.g. Recommended for regular lifters and general wellness"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">
              Included Amenities & Features (One per line)
            </label>
            <textarea
              rows="4"
              value={formData.featuresText}
              onChange={(e) => setFormData({ ...formData, featuresText: e.target.value })}
              placeholder="Full Gym Access&#10;Locker Room Access&#10;Sauna Session"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500 outline-none font-mono text-xs"
            ></textarea>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Saving...' : modalMode === 'create' ? 'Create Plan' : 'Update Plan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Plans;

