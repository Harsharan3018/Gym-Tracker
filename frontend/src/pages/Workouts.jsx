import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import {
  Activity,
  Plus,
  Edit2,
  Trash2,
  User,
  Dumbbell,
  Target,
  Zap,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const Workouts = () => {
  const [workouts, setWorkouts] = useState([]);
  const [members, setMembers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPlan, setExpandedPlan] = useState(null);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentId, setCurrentId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    memberId: '',
    trainerId: '',
    goal: 'General Fitness',
    difficulty: 'Intermediate',
    notes: '',
    status: 'Active',
    days: [
      {
        dayName: 'Day 1: Chest & Triceps',
        exercises: [
          { name: 'Barbell Bench Press', sets: 4, reps: '8-10', notes: 'Warm up thoroughly' },
          { name: 'Incline Dumbbell Flyes', sets: 3, reps: '12', notes: 'Focus on stretch' },
        ],
      },
    ],
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resWork, resMem, resTr] = await Promise.all([
        api.get('/workouts'),
        api.get('/members'),
        api.get('/trainers'),
      ]);

      if (resWork.data.success) {
        setWorkouts(resWork.data.data);
        if (resWork.data.data.length > 0 && !expandedPlan) {
          setExpandedPlan(resWork.data.data[0]._id);
        }
      }
      if (resMem.data.success) setMembers(resMem.data.data);
      if (resTr.data.success) setTrainers(resTr.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({
      title: '',
      memberId: members[0]?._id || '',
      trainerId: trainers[0]?._id || '',
      goal: 'General Fitness',
      difficulty: 'Intermediate',
      notes: '',
      status: 'Active',
      days: [
        {
          dayName: 'Day 1: Full Body Circuit',
          exercises: [
            { name: 'Barbell Squats', sets: 4, reps: '8-10', notes: 'Core brace' },
            { name: 'Push-ups', sets: 3, reps: '15', notes: 'Chest to floor' },
          ],
        },
      ],
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (w) => {
    setModalMode('edit');
    setCurrentId(w._id);
    setFormData({
      title: w.title,
      memberId: w.member?._id || w.member || '',
      trainerId: w.trainer?._id || w.trainer || '',
      goal: w.goal,
      difficulty: w.difficulty,
      notes: w.notes || '',
      status: w.status,
      days: w.days && w.days.length > 0 ? w.days : [
        { dayName: 'Day 1', exercises: [{ name: '', sets: 3, reps: '10', notes: '' }] },
      ],
    });
    setFormError('');
    setIsModalOpen(true);
  };

  // Dynamic day/exercise helpers
  const addDay = () => {
    setFormData({
      ...formData,
      days: [
        ...formData.days,
        {
          dayName: `Day ${formData.days.length + 1}: Split Workout`,
          exercises: [{ name: '', sets: 3, reps: '10-12', notes: '' }],
        },
      ],
    });
  };

  const removeDay = (dIndex) => {
    const updated = formData.days.filter((_, i) => i !== dIndex);
    setFormData({ ...formData, days: updated });
  };

  const addExercise = (dIndex) => {
    const updatedDays = [...formData.days];
    updatedDays[dIndex].exercises.push({ name: '', sets: 3, reps: '10-12', notes: '' });
    setFormData({ ...formData, days: updatedDays });
  };

  const removeExercise = (dIndex, eIndex) => {
    const updatedDays = [...formData.days];
    updatedDays[dIndex].exercises = updatedDays[dIndex].exercises.filter((_, i) => i !== eIndex);
    setFormData({ ...formData, days: updatedDays });
  };

  const handleExerciseChange = (dIndex, eIndex, field, value) => {
    const updatedDays = [...formData.days];
    updatedDays[dIndex].exercises[eIndex][field] = value;
    setFormData({ ...formData, days: updatedDays });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      if (modalMode === 'create') {
        await api.post('/workouts', formData);
      } else {
        await api.put(`/workouts/${currentId}`, formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error saving workout plan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete workout plan "${title}"?`)) {
      try {
        await api.delete(`/workouts/${id}`);
        fetchData();
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
          <h2 className="text-xl font-bold text-white">Workout Programs & Routines</h2>
          <p className="text-xs text-slate-400 mt-1">
            Build customized exercise routines, sets, reps, and assign to members & trainers
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Workout Plan</span>
        </button>
      </div>

      {/* Plans List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">
          <div className="animate-spin h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          Loading workout programs...
        </div>
      ) : workouts.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          No workout plans created yet. Click "Create Workout Plan" to prescribe routines.
        </div>
      ) : (
        <div className="space-y-4">
          {workouts.map((plan) => {
            const isExpanded = expandedPlan === plan._id;
            return (
              <div
                key={plan._id}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition shadow-lg"
              >
                {/* Header Summary Row */}
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/40"
                  onClick={() => setExpandedPlan(isExpanded ? null : plan._id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-base">{plan.title}</h3>
                        <Badge variant={plan.status.toLowerCase()}>{plan.status}</Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1 text-slate-300">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>Member: {plan.member?.name || 'Unassigned'}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-indigo-300">
                          <Dumbbell className="w-3.5 h-3.5" />
                          <span>Coach: {plan.trainer?.name || 'Unassigned'}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-emerald-400 font-medium">
                          <Target className="w-3.5 h-3.5" />
                          <span>Goal: {plan.goal}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-auto" onClick={(e) => e.stopPropagation()}>
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                      {plan.difficulty}
                    </span>
                    <button
                      onClick={() => openEditModal(plan)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      title="Edit Plan"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(plan._id, plan.title)}
                      className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition"
                      title="Delete Plan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setExpandedPlan(isExpanded ? null : plan._id)}
                      className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 transition"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Workout Breakdown */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-slate-800/80 bg-slate-950/40 space-y-4">
                    {plan.notes && (
                      <p className="text-xs text-slate-400 italic bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                        Coach Note: {plan.notes}
                      </p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {plan.days?.map((day, dIdx) => (
                        <div key={dIdx} className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                          <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3 text-indigo-400">
                            {day.dayName}
                          </h4>
                          <div className="space-y-2">
                            {day.exercises?.map((ex, eIdx) => (
                              <div
                                key={eIdx}
                                className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-950/60 border border-slate-800/80"
                              >
                                <div>
                                  <span className="font-semibold text-slate-200 block">{ex.name}</span>
                                  {ex.notes && <span className="text-[11px] text-slate-400">{ex.notes}</span>}
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-mono text-[11px] font-semibold border border-indigo-500/20">
                                    {ex.sets} sets × {ex.reps}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Workout Plan Builder Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Create Personalized Workout Plan' : 'Edit Workout Routine'}
        maxWidth="max-w-2xl"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Plan Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. 12-Week Lean Bulk Routine"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Assign to Member *</label>
              <select
                required
                value={formData.memberId}
                onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500 outline-none"
              >
                <option value="">Select Member</option>
                {members.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name} ({m.phone})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Assigning Coach *</label>
              <select
                required
                value={formData.trainerId}
                onChange={(e) => setFormData({ ...formData, trainerId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500 outline-none"
              >
                <option value="">Select Trainer</option>
                {trainers.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Goal</label>
              <select
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500 outline-none"
              >
                <option value="Muscle Gain">Muscle Gain</option>
                <option value="Weight Loss">Weight Loss</option>
                <option value="Endurance">Endurance</option>
                <option value="Flexibility">Flexibility</option>
                <option value="General Fitness">General Fitness</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500 outline-none"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500 outline-none"
              >
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Paused">Paused</option>
              </select>
            </div>
          </div>

          {/* Dynamic Day Splits */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-bold text-xs uppercase tracking-wider">
                Workout Days & Exercises
              </label>
              <button
                type="button"
                onClick={addDay}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Day</span>
              </button>
            </div>

            {formData.days.map((day, dIdx) => (
              <div key={dIdx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={day.dayName}
                    onChange={(e) => {
                      const updated = [...formData.days];
                      updated[dIdx].dayName = e.target.value;
                      setFormData({ ...formData, days: updated });
                    }}
                    placeholder="e.g. Day 1: Upper Body"
                    className="font-semibold text-white bg-transparent border-b border-slate-700 pb-1 text-xs outline-none focus:border-indigo-500 flex-1"
                  />
                  {formData.days.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDay(dIdx)}
                      className="text-rose-400 hover:text-rose-300 text-xs"
                    >
                      Remove Day
                    </button>
                  )}
                </div>

                {/* Exercises in Day */}
                <div className="space-y-2">
                  {day.exercises.map((ex, eIdx) => (
                    <div key={eIdx} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">
                        <input
                          type="text"
                          required
                          placeholder="Exercise Name"
                          value={ex.name}
                          onChange={(e) => handleExerciseChange(dIdx, eIdx, 'name', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="Sets"
                          value={ex.sets}
                          onChange={(e) => handleExerciseChange(dIdx, eIdx, 'sets', Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          placeholder="Reps (e.g. 10)"
                          value={ex.reps}
                          onChange={(e) => handleExerciseChange(dIdx, eIdx, 'reps', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          placeholder="Notes"
                          value={ex.notes}
                          onChange={(e) => handleExerciseChange(dIdx, eIdx, 'notes', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="col-span-1 text-right">
                        <button
                          type="button"
                          onClick={() => removeExercise(dIdx, eIdx)}
                          className="text-rose-400 hover:text-rose-300 text-xs"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addExercise(dIdx)}
                    className="text-[11px] text-slate-400 hover:text-slate-200 mt-1 flex items-center gap-1 font-medium"
                  >
                    + Add Exercise
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Coaching Instructions</label>
            <textarea
              rows="2"
              placeholder="Progression guidelines, warm-up reminders, dietary tips..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
              {submitting ? 'Prescribing...' : modalMode === 'create' ? 'Create Plan' : 'Update Plan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Workouts;

