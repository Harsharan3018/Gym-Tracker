import React, { useEffect, useState } from 'react';
import api from '../services/api';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import {
  Users,
  Dumbbell,
  Receipt,
  UserCheck,
  TrendingUp,
  CreditCard,
  Clock,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      setError('Unable to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleQuickCheckout = async (recordId) => {
    try {
      setCheckoutLoading(recordId);
      await api.put(`/attendance/${recordId}/check-out`, { notes: 'Checked out from dashboard' });
      await fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Error checking out');
    } finally {
      setCheckoutLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const { summary, recentCheckIns, recentMembers, planPopularity } = data || {};

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900 border border-indigo-500/20 rounded-3xl p-6 sm:p-8">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Operational Status: All Services Live
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            FitSync Operations Center
          </h2>
          <p className="text-sm text-slate-300 mt-2">
            Centralized hub for managing active gym members, trainer assignments, real-time check-ins, and membership revenue.
          </p>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Members"
          value={summary?.totalMembers ?? 0}
          icon={Users}
          change={`${summary?.activeMembers ?? 0} Active`}
          color="indigo"
        />
        <StatCard
          title="Inside Gym Now"
          value={summary?.currentlyInside ?? 0}
          icon={UserCheck}
          change={`${summary?.todayAttendance ?? 0} Total Today`}
          color="cyan"
        />
        <StatCard
          title="Active Trainers"
          value={summary?.activeTrainers ?? 0}
          icon={Dumbbell}
          change={`${summary?.totalTrainers ?? 0} On Roster`}
          color="emerald"
        />
        <StatCard
          title="Subscriptions"
          value={summary?.activeSubscriptions ?? 0}
          icon={Receipt}
          change="Active Billing"
          color="amber"
        />
        <StatCard
          title="Workout Plans"
          value={summary?.activeWorkouts ?? 0}
          icon={TrendingUp}
          change="Active Routines"
          color="purple"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${(summary?.totalRevenue ?? 0).toLocaleString()}`}
          icon={CreditCard}
          change="Completed Payments"
          color="rose"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Attendance / Inside Gym */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-white text-base">Live Attendance Stream</h3>
              <p className="text-xs text-slate-400">Recent check-in and check-out logs</p>
            </div>
            <Link
              to="/attendance"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-800/60 mt-2 flex-1">
            {recentCheckIns && recentCheckIns.length > 0 ? (
              recentCheckIns.map((rec) => (
                <div key={rec._id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-slate-200 text-sm">
                      {rec.member?.name?.charAt(0) || 'M'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{rec.member?.name || 'Unknown'}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>In: {new Date(rec.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {rec.checkOutTime && (
                          <span>• Out: {new Date(rec.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant={rec.status === 'Checked In' ? 'checkedIn' : 'checkedOut'}>
                      {rec.status}
                    </Badge>
                    {rec.status === 'Checked In' && (
                      <button
                        onClick={() => handleQuickCheckout(rec._id)}
                        disabled={checkoutLoading === rec._id}
                        className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                      >
                        {checkoutLoading === rec._id ? 'Checking out...' : 'Check Out'}
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 py-6 text-center">No attendance logged yet today</p>
            )}
          </div>
        </div>

        {/* Plan Popularity & Quick Links */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-white text-base">Plan Distribution</h3>
                <p className="text-xs text-slate-400">Subscription breakdown by package</p>
              </div>
              <Link
                to="/plans"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <span>Manage Plans</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-4 mt-4">
              {planPopularity && planPopularity.length > 0 ? (
                planPopularity.map((plan) => (
                  <div key={plan._id} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                    <div className="flex items-center justify-between text-sm font-medium mb-1">
                      <span className="text-white">{plan.name}</span>
                      <span className="text-indigo-400">{plan.count} subscribers</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Total Revenue</span>
                      <span className="font-semibold text-slate-300">₹{plan.totalRevenue?.toLocaleString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 py-4 text-center">No subscription statistics yet</p>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 mt-6 grid grid-cols-2 gap-3">
            <Link
              to="/members"
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition"
            >
              <Users className="w-4 h-4" />
              <span>Add Member</span>
            </Link>
            <Link
              to="/attendance"
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs border border-slate-700 transition"
            >
              <UserCheck className="w-4 h-4" />
              <span>Check In Now</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

