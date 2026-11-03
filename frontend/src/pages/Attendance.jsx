import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import {
  UserCheck,
  Plus,
  Clock,
  Calendar,
  LogOut,
  Filter,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

const Attendance = () => {
  const [records, setRecords] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [checkInNotes, setCheckInNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const params = {};
      if (dateFilter) params.date = dateFilter;
      if (statusFilter !== 'All') params.status = statusFilter;

      const [resAtt, resMem] = await Promise.all([
        api.get('/attendance', { params }),
        api.get('/members', { params: { status: 'Active' } }),
      ]);

      if (resAtt.data.success) setRecords(resAtt.data.data);
      if (resMem.data.success) setMembers(resMem.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [dateFilter, statusFilter]);

  const openCheckInModal = () => {
    setSelectedMemberId(members[0]?._id || '');
    setCheckInNotes('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleCheckInSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      await api.post('/attendance/check-in', {
        memberId: selectedMemberId,
        notes: checkInNotes,
      });
      setIsModalOpen(false);
      fetchAttendance();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error checking in member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckOut = async (recordId) => {
    try {
      setActionLoading(recordId);
      await api.put(`/attendance/${recordId}/check-out`, {
        notes: 'Checked out from attendance console',
      });
      fetchAttendance();
    } catch (err) {
      alert(err.response?.data?.message || 'Error checking out');
    } finally {
      setActionLoading(null);
    }
  };

  const currentlyIn = records.filter((r) => r.status === 'Checked In').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Daily Gym Attendance</h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time entry & exit tracking with member verification and timestamp logs
          </p>
        </div>
        <button
          onClick={openCheckInModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition cursor-pointer self-start sm:self-auto"
        >
          <UserCheck className="w-4 h-4" />
          <span>Check In Member</span>
        </button>
      </div>

      {/* Date & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Statuses</option>
              <option value="Checked In">Currently Inside</option>
              <option value="Checked Out">Completed Visits</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span>Total Visits:</span>
            <span className="font-bold text-white text-sm">{records.length}</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Inside Now:</span>
            <span className="font-bold text-sm">{currentlyIn}</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/70 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Member</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Entry Time</th>
                <th className="px-6 py-4">Exit Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Notes</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                    <div className="animate-spin h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                    Loading attendance logs...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                    No attendance records for date: {dateFilter}. Click "Check In Member" to log attendance.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-800/40 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-slate-200 text-sm">
                          {r.member?.name?.charAt(0) || 'M'}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{r.member?.name || 'Member'}</p>
                          <p className="text-xs text-slate-400">{r.member?.phone || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-slate-300">{r.date}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(r.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {r.checkOutTime ? (
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{new Date(r.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-amber-400 font-medium">In Session</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={r.status === 'Checked In' ? 'checkedIn' : 'checkedOut'}>
                        {r.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-slate-400 max-w-[200px] truncate block">
                        {r.notes || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {r.status === 'Checked In' ? (
                        <button
                          onClick={() => handleCheckOut(r._id)}
                          disabled={actionLoading === r._id}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 ml-auto transition"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>{actionLoading === r._id ? 'Processing...' : 'Check Out'}</span>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 flex items-center justify-end gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-slate-400" />
                          <span>Logged</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Check In Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Member Entry Check-In"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {formError}
          </div>
        )}

        <form onSubmit={handleCheckInSubmit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Select Gym Member *</label>
            <select
              required
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500 outline-none"
            >
              <option value="">Choose Member</option>
              {members.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name} — {m.currentPlan?.name || 'Active Member'} ({m.phone})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Check-in Notes / Locker #</label>
            <input
              type="text"
              placeholder="e.g. Locker #42, Chest & Triceps routine"
              value={checkInNotes}
              onChange={(e) => setCheckInNotes(e.target.value)}
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
              {submitting ? 'Verifying...' : 'Confirm Check In'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Attendance;

