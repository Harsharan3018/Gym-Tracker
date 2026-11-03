import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import {
  Dumbbell,
  Plus,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Award,
  DollarSign,
  Search,
} from 'lucide-react';

const Trainers = () => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    experienceYears: 1,
    hourlyRate: 500,
    bio: '',
    status: 'Active',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTrainers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/trainers', { params: { search } });
      if (res.data.success) {
        setTrainers(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainers();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({
      name: '',
      email: '',
      phone: '',
      specialization: '',
      experienceYears: 1,
      hourlyRate: 500,
      bio: '',
      status: 'Active',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (t) => {
    setModalMode('edit');
    setCurrentId(t._id);
    setFormData({
      name: t.name,
      email: t.email,
      phone: t.phone,
      specialization: Array.isArray(t.specialization) ? t.specialization.join(', ') : t.specialization,
      experienceYears: t.experienceYears,
      hourlyRate: t.hourlyRate,
      bio: t.bio || '',
      status: t.status,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      if (modalMode === 'create') {
        await api.post('/trainers', formData);
      } else {
        await api.put(`/trainers/${currentId}`, formData);
      }
      setIsModalOpen(false);
      fetchTrainers();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error saving trainer details');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete coach ${name}? All associated schedules will be deleted.`)) {
      try {
        await api.delete(`/trainers/${id}`);
        fetchTrainers();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting trainer');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Fitness Trainers & Coaches</h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage fitness instructor profiles, specialties, and client assignments
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Trainer</span>
        </button>
      </div>

      {/* Grid of Trainers */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">
          <div className="animate-spin h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          Loading trainers...
        </div>
      ) : trainers.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          No trainers registered yet. Click "Add Trainer" to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {trainers.map((trainer) => (
            <div
              key={trainer._id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition shadow-lg group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-lg">
                      {trainer.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base">{trainer.name}</h4>
                      <Badge variant={trainer.status.toLowerCase()}>{trainer.status}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                    <button
                      onClick={() => openEditModal(trainer)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      title="Edit Trainer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(trainer._id, trainer.name)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition"
                      title="Delete Trainer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Specialties */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {trainer.specialization?.map((spec, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-medium bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700/60"
                    >
                      {spec}
                    </span>
                  ))}
                </div>

                {/* Bio */}
                {trainer.bio && (
                  <p className="mt-3 text-xs text-slate-400 line-clamp-2 italic">
                    "{trainer.bio}"
                  </p>
                )}
              </div>

              {/* Stats Footer */}
              <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Experience</span>
                  </div>
                  <span className="font-semibold text-slate-200">{trainer.experienceYears} Years</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Hourly Rate</span>
                  </div>
                  <span className="font-semibold text-slate-200">₹{trainer.hourlyRate}/hr</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Contact</span>
                  </div>
                  <span className="text-slate-300">{trainer.phone}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Trainer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Add New Fitness Trainer' : 'Edit Trainer Profile'}
      >
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Phone Number *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                <option value="On Leave">On Leave</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Experience (Years)</label>
              <input
                type="number"
                min="0"
                value={formData.experienceYears}
                onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Hourly Rate (₹)</label>
              <input
                type="number"
                min="0"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Specializations (comma separated)</label>
            <input
              type="text"
              placeholder="Bodybuilding, HIIT, Yoga, Powerlifting"
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Biography / Credentials</label>
            <textarea
              rows="2"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500 outline-none"
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
              {submitting ? 'Saving...' : modalMode === 'create' ? 'Add Trainer' : 'Update Trainer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Trainers;

