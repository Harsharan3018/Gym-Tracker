const app = require('../server');
const mongoose = require('mongoose');

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('====================================================');
  console.log('   STARTING FITSYNC BACKEND AUTOMATED TEST SUITE    ');
  console.log('====================================================');

  let passed = 0;
  let failed = 0;
  let token = '';

  const assert = (condition, testName) => {
    if (condition) {
      console.log(`PASS: ${testName}`);
      passed++;
    } else {
      console.error(`FAIL: ${testName}`);
      failed++;
    }
  };

  try {
    // Wait 1 sec for server to be fully listening
    await new Promise((r) => setTimeout(r, 1000));

    // 1. Health check
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    assert(healthData.status === 'OK', 'Health Check Endpoint /api/health');

    // 2. Auth: Invalid login
    const badLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@fitsync.com', password: 'wrongpassword' }),
    });
    assert(badLoginRes.status === 401, 'Auth: Rejects Invalid Password (401)');

    // 3. Auth: Valid login
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@fitsync.com', password: 'admin123password' }),
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200 && loginData.data?.token, 'Auth: Admin Login returns JWT token');
    token = loginData.data.token;

    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    // 4. Dashboard Stats
    const dashRes = await fetch(`${BASE_URL}/dashboard/stats`, { headers: authHeaders });
    const dashData = await dashRes.json();
    assert(
      dashRes.status === 200 &&
      dashData.data.summary.totalMembers > 0 &&
      dashData.data.summary.totalTrainers > 0,
      'Dashboard: Fetches aggregated metrics and KPI summary'
    );

    // 5. Members: Get all
    const membersRes = await fetch(`${BASE_URL}/members`, { headers: authHeaders });
    const membersData = await membersRes.json();
    assert(membersRes.status === 200 && membersData.data.length >= 6, 'Members: List all members');

    // 6. Members: Add new member
    const newMemberRes = await fetch(`${BASE_URL}/members`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: 'Test Candidate Member',
        email: 'test.candidate@testdomain.com',
        phone: '+91 99999 88888',
        gender: 'Male',
        address: 'Test Street, Test City',
      }),
    });
    const newMemberData = await newMemberRes.json();
    assert(newMemberRes.status === 201 && newMemberData.data._id, 'Members: Create new member successfully');
    const createdMemberId = newMemberData.data?._id;

    // 7. Members: Edit / Update member (Testing pending requirement!)
    const updateMemberRes = await fetch(`${BASE_URL}/members/${createdMemberId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        address: 'Updated Street 123, Central Bangalore',
        notes: 'Verified fitness evaluation completed',
      }),
    });
    const updateMemberData = await updateMemberRes.json();
    assert(
      updateMemberRes.status === 200 &&
      updateMemberData.data.address === 'Updated Street 123, Central Bangalore',
      'Members: Edit/Update member functionality works'
    );

    // 8. Plans: List
    const plansRes = await fetch(`${BASE_URL}/plans`, { headers: authHeaders });
    const plansData = await plansRes.json();
    assert(plansRes.status === 200 && plansData.data.length >= 4, 'Plans: List membership plans');
    const firstPlanId = plansData.data[0]._id;

    // 9. Subscriptions: Create subscription for member
    const subRes = await fetch(`${BASE_URL}/subscriptions`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        memberId: createdMemberId,
        planId: firstPlanId,
        paymentMethod: 'UPI',
      }),
    });
    const subData = await subRes.json();
    assert(subRes.status === 201 && subData.data.status === 'Active', 'Subscriptions: Create active subscription');

    // 10. Trainers: List
    const trainersRes = await fetch(`${BASE_URL}/trainers`, { headers: authHeaders });
    const trainersData = await trainersRes.json();
    assert(trainersRes.status === 200 && trainersData.data.length >= 4, 'Trainers: List trainers');
    const firstTrainerId = trainersData.data[0]._id;

    // 11. Trainer Schedules: Create & List
    const schedRes = await fetch(`${BASE_URL}/schedules`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        trainerId: firstTrainerId,
        dayOfWeek: 'Saturday',
        startTime: '08:00 AM',
        endTime: '11:00 AM',
        sessionType: 'Group Class',
        maxCapacity: 10,
      }),
    });
    const schedData = await schedRes.json();
    assert(schedRes.status === 201 && schedData.data._id, 'Schedules: Create trainer schedule');

    // 12. Attendance: Check-In (Testing with JWT header)
    const checkInRes = await fetch(`${BASE_URL}/attendance/check-in`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        memberId: createdMemberId,
        notes: 'Testing Check-In feature with JWT token',
      }),
    });
    const checkInData = await checkInRes.json();
    assert(checkInRes.status === 201 && checkInData.data.status === 'Checked In', 'Attendance: Check-In with JWT Token');
    const attendanceRecordId = checkInData.data?._id;

    // 13. Attendance: Check-Out (Testing with JWT header)
    const checkOutRes = await fetch(`${BASE_URL}/attendance/${attendanceRecordId}/check-out`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        notes: 'Session finished smoothly',
      }),
    });
    const checkOutData = await checkOutRes.json();
    assert(
      checkOutRes.status === 200 && checkOutData.data.status === 'Checked Out',
      'Attendance: Check-Out with JWT Token'
    );

    // 14. Workouts: Create and Assign Workout Plan (Testing with JWT header)
    const workoutRes = await fetch(`${BASE_URL}/workouts`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'Endurance Starter Circuit',
        memberId: createdMemberId,
        trainerId: firstTrainerId,
        goal: 'Endurance',
        difficulty: 'Beginner',
        days: [
          {
            dayName: 'Day 1: Cardio Intervals',
            exercises: [
              { name: 'Rowing Machine', sets: 4, reps: '500m', notes: 'Maintain pace' },
              { name: 'Jump Rope', sets: 3, reps: '2 min', notes: 'Active recovery' },
            ],
          },
        ],
        notes: 'Initial endurance assessment routine',
      }),
    });
    const workoutData = await workoutRes.json();
    assert(
      workoutRes.status === 201 && workoutData.data._id,
      'Workouts: Create & Assign Workout Plan with JWT Token'
    );

    // 15. Members: Clean up / Delete member
    const deleteMemberRes = await fetch(`${BASE_URL}/members/${createdMemberId}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    assert(deleteMemberRes.status === 200, 'Members: Delete member cascade test');

    console.log('====================================================');
    console.log(`   TEST RESULTS: ${passed} PASSED, ${failed} FAILED   `);
    console.log('====================================================');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test Suite Fatal Error:', err);
    process.exit(1);
  }
}

runTests();

