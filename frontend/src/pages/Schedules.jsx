import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import {
  CalendarDays,
  Plus,
  Clock,
  User,
  Users,
  Edit2,
  Trash2,
  Filter,
} from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const Schedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState('All');
  const [selectedTrainer, setSelectedTrainer] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    trainerId: '',
    dayOfWeek: 'Monday',
    startTime: '07:00 AM',
    endTime: '09:00 AM',
    sessionType: 'Personal Training',
    maxCapacity: 1,
    notes: '',
    status: 'Available',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedDay !== 'All') params.dayOfWeek = selectedDay;
      if (selectedTrainer) params.trainerId = selectedTrainer;

      const [resSched, resTrainers] = await Promise.all([
        api.get('/schedules', { params }),
        api.get('/trainers'),
      ]);

      if (resSched.data.success) setSchedules(resSched.data.data);
      if (resTrainers.data.success) setTrainers(resTrainers.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [selectedDay, selectedTrainer]);

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({
      trainerId: trainers[0]?._id || '',
      dayOfWeek: selectedDay !== 'All' ? selectedDay : 'Monday',
      startTime: '07:00 AM',
      endTime: '09:00 AM',
      sessionType: 'Personal Training',
      maxCapacity: 1,
      notes: '',
      status: 'Available',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (s) => {
    setModalMode('edit');
    setCurrentId(s._id);
    setFormData({
      trainerId: s.trainer?._id || '',
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime,
      sessionType: s.sessionType,
      maxCapacity: s.maxCapacity,
      notes: s.notes || '',
      status: s.status,
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
        await api.post('/schedules', formData);
      } else {
        await api.put(`/schedules/${currentId}`, formData);
      }
      setIsModalOpen(false);
      fetchSchedules();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error saving schedule');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this schedule slot?')) {
      try {
        await api.delete(`/schedules/${id}`);
        fetchSchedules();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting schedule');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Trainer Schedules & Availability</h2>
          <p className="text-xs text-slate-400 mt-1">
            Organize personal training slots, floor supervision hours, and group classes
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Schedule Slot</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setSelectedDay('All')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            selectedDay === 'All'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          All Days
        </button>
        {DAYS.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              selectedDay === day
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {day.slice(0, 3)}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-2">
          <select
            value={selectedTrainer}
            onChange={(e) => setSelectedTrainer(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Trainers</option>
            {trainers.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Schedules Grid / List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/70 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Day & Time</th>
                <th className="px-6 py-4">Trainer</th>
                <th className="px-6 py-4">Session Type</th>
                <th className="px-6 py-4">Capacity</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    <div className="animate-spin h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                    Loading schedules...
                  </td>
                </tr>
              ) : schedules.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    No scheduled slots found for the selected filter.
                  </td>
                </tr>
              ) : (
                schedules.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-800/40 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                          <CalendarDays className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">{item.dayOfWeek}</p>
                          <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{item.startTime} - {item.endTime}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-200">{item.trainer?.name || 'Assigned Coach'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium px-2 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300">
                        {item.sessionType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-300">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>Up to {item.maxCapacity} members</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={item.status === 'Available' ? 'active' : 'suspended'}>
                        {item.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Create Schedule Slot' : 'Edit Schedule Slot'}
      >
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Select Trainer *</label>
            <select
              required
              value={formData.trainerId}
              onChange={(e) => setFormData({ ...formData, trainerId: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500 outline-none"
            >
              <option value="">Choose Trainer</option>
              {trainers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Day of Week</label>
              <select
                value={formData.dayOfWeek}
                onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500 outline-none"
              >
                {DAYS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Start Time</label>
              <input
                type="text"
                placeholder="06:00 AM"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">End Time</label>
              <input
                type="text"
                placeholder="08:00 AM"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Session Type</label>
              <select
                value={formData.sessionType}
                onChange={(e) => setFormData({ ...formData, sessionType: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500 outline-none"
              >
                <option value="Personal Training">Personal Training</option>
                <option value="Group Class">Group Class</option>
                <option value="Floor Duty">Floor Duty</option>
                <option value="Consultation">Consultation</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Max Capacity</label>
              <input
                type="number"
                min="1"
                value={formData.maxCapacity}
                onChange={(e) => setFormData({ ...formData, maxCapacity: Number(e.target.value) })}
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
                <option value="Available">Available</option>
                <option value="Booked">Booked</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Slot Notes</label>
            <input
              type="text"
              placeholder="e.g. Focus on high-intensity intervals"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500 outline-none"
            />
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
              {submitting ? 'Saving...' : modalMode === 'create' ? 'Create Slot' : 'Update Slot'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Schedules;

