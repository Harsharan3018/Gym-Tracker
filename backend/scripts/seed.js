require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Trainer = require('../models/Trainer');
const Plan = require('../models/Plan');
const Member = require('../models/Member');
const Subscription = require('../models/Subscription');
const Schedule = require('../models/Schedule');
const Attendance = require('../models/Attendance');
const WorkoutPlan = require('../models/WorkoutPlan');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fitsync_db';
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    console.log('Clearing existing database collections...');
    await Promise.all([
      User.deleteMany({}),
      Trainer.deleteMany({}),
      Plan.deleteMany({}),
      Member.deleteMany({}),
      Subscription.deleteMany({}),
      Schedule.deleteMany({}),
      Attendance.deleteMany({}),
      WorkoutPlan.deleteMany({}),
    ]);

    console.log('Creating Admin User...');
    const adminUser = await User.create({
      name: 'FitSync System Administrator',
      email: 'admin@fitsync.com',
      password: 'admin123password',
      role: 'admin',
      phone: '+91 98765 43210',
    });
    console.log(` Admin created: ${adminUser.email} / admin123password`);

    console.log('Creating Membership Plans...');
    const plans = await Plan.create([
      {
        name: 'Basic Monthly',
        durationMonths: 1,
        price: 1499,
        description: 'Ideal for beginners seeking standard gym floor and cardio equipment access.',
        features: ['Cardio Zone Access', 'Free Weights Area', 'Locker Room Access', 'Open 6 AM - 10 PM'],
        status: 'Active',
      },
      {
        name: 'Standard Quarterly',
        durationMonths: 3,
        price: 3999,
        description: 'Comprehensive fitness plan with periodic progress evaluation.',
        features: ['Full Gym Access', '1 Personal Trainer Evaluation', 'Locker Room & Showers', 'Fitness Assessment'],
        status: 'Active',
      },
      {
        name: 'Pro Semi-Annual',
        durationMonths: 6,
        price: 7499,
        description: 'Designed for serious athletes and goal-oriented fitness enthusiasts.',
        features: ['All-Hours Gym Access', '3 Personal Training Sessions', 'Sauna & Steam Bath', 'Personalized Nutrition Guide'],
        status: 'Active',
      },
      {
        name: 'Elite Annual VIP',
        durationMonths: 12,
        price: 12999,
        description: 'Ultimate VIP fitness experience with premium perks and dedicated support.',
        features: ['24/7 All-Access Pass', 'Monthly Dedicated PT Coaching', 'Full Spa & Recovery Lounge', 'Unlimited Guest Passes', 'Free Gym Merchandise Kit'],
        status: 'Active',
      },
    ]);
    console.log(` Created ${plans.length} Membership Plans`);

    console.log('Creating Trainers...');
    const trainers = await Trainer.create([
      {
        name: 'Marcus Vance',
        email: 'marcus.vance@fitsync.com',
        phone: '+91 98111 22334',
        specialization: ['Bodybuilding', 'Powerlifting', 'Strength & Conditioning'],
        experienceYears: 7,
        hourlyRate: 800,
        bio: 'Certified CSCS coach with 7+ years of experience transforming athletes and powerlifters.',
        status: 'Active',
      },
      {
        name: 'Sarah Jenkins',
        email: 'sarah.jenkins@fitsync.com',
        phone: '+91 98222 33445',
        specialization: ['HIIT', 'Fat Loss', 'Cardiovascular Conditioning'],
        experienceYears: 5,
        hourlyRate: 650,
        bio: 'Passionate functional trainer specializing in high-intensity metabolic conditioning and sustainable weight loss.',
        status: 'Active',
      },
      {
        name: 'Elena Rostova',
        email: 'elena.rostova@fitsync.com',
        phone: '+91 98333 44556',
        specialization: ['Yoga', 'Flexibility', 'Pilates', 'Rehabilitation'],
        experienceYears: 6,
        hourlyRate: 700,
        bio: 'Registered 500-hr Yoga Master focusing on posture correction, mobility, and mind-body balance.',
        status: 'Active',
      },
      {
        name: 'Devon Reed',
        email: 'devon.reed@fitsync.com',
        phone: '+91 98444 55667',
        specialization: ['CrossFit', 'Endurance', 'Olympic Weightlifting'],
        experienceYears: 4,
        hourlyRate: 600,
        bio: 'CrossFit Level 2 Coach driving functional fitness, agility, and high-performance endurance.',
        status: 'Active',
      },
    ]);
    console.log(` Created ${trainers.length} Trainers`);

    console.log('Creating Trainer Schedules...');
    await Schedule.create([
      {
        trainer: trainers[0]._id,
        dayOfWeek: 'Monday',
        startTime: '06:00 AM',
        endTime: '10:00 AM',
        sessionType: 'Personal Training',
        maxCapacity: 2,
        notes: 'Morning heavy compound lifting sessions',
        status: 'Booked',
      },
      {
        trainer: trainers[0]._id,
        dayOfWeek: 'Wednesday',
        startTime: '05:00 PM',
        endTime: '09:00 PM',
        sessionType: 'Floor Duty',
        maxCapacity: 10,
        notes: 'Floor supervision & spot assistance',
        status: 'Available',
      },
      {
        trainer: trainers[1]._id,
        dayOfWeek: 'Tuesday',
        startTime: '07:00 AM',
        endTime: '08:30 AM',
        sessionType: 'Group Class',
        maxCapacity: 15,
        notes: 'Metabolic HIIT Burner morning bootcamp',
        status: 'Available',
      },
      {
        trainer: trainers[1]._id,
        dayOfWeek: 'Thursday',
        startTime: '06:00 PM',
        endTime: '08:00 PM',
        sessionType: 'Personal Training',
        maxCapacity: 1,
        notes: 'One-on-one conditioning protocol',
        status: 'Booked',
      },
      {
        trainer: trainers[2]._id,
        dayOfWeek: 'Monday',
        startTime: '06:30 AM',
        endTime: '08:00 AM',
        sessionType: 'Group Class',
        maxCapacity: 12,
        notes: 'Morning Vinyasa Flow & mobility',
        status: 'Available',
      },
      {
        trainer: trainers[2]._id,
        dayOfWeek: 'Friday',
        startTime: '05:30 PM',
        endTime: '07:00 PM',
        sessionType: 'Consultation',
        maxCapacity: 3,
        notes: 'Posture analysis & physical recovery',
        status: 'Available',
      },
    ]);
    console.log(' Created Trainer Schedules');

    console.log('Creating Members & Subscriptions...');
    const membersData = [
      {
        name: 'Aarav Sharma',
        email: 'aarav.sharma@example.com',
        phone: '+91 99001 11223',
        dateOfBirth: new Date('1998-05-14'),
        gender: 'Male',
        address: '42 MG Road, Bangalore',
        emergencyContact: { name: 'Sunil Sharma', phone: '+91 99001 00001' },
        planIndex: 3, // Elite Annual
        trainerIndex: 0,
        status: 'Active',
      },
      {
        name: 'Sneha Patel',
        email: 'sneha.patel@example.com',
        phone: '+91 99002 22334',
        dateOfBirth: new Date('1995-11-20'),
        gender: 'Female',
        address: '15 Indiranagar 100ft Rd, Bangalore',
        emergencyContact: { name: 'Nilesh Patel', phone: '+91 99002 00002' },
        planIndex: 2, // Pro Semi-Annual
        trainerIndex: 1,
        status: 'Active',
      },
      {
        name: 'Rohan Mehra',
        email: 'rohan.mehra@example.com',
        phone: '+91 99003 33445',
        dateOfBirth: new Date('2001-03-08'),
        gender: 'Male',
        address: '88 Koramangala 4th Block, Bangalore',
        emergencyContact: { name: 'Kavita Mehra', phone: '+91 99003 00003' },
        planIndex: 1, // Standard Quarterly
        trainerIndex: 0,
        status: 'Active',
      },
      {
        name: 'Ananya Iyer',
        email: 'ananya.iyer@example.com',
        phone: '+91 99004 44556',
        dateOfBirth: new Date('1997-08-25'),
        gender: 'Female',
        address: '104 Whitefield Palm Meadows, Bangalore',
        emergencyContact: { name: 'Gopal Iyer', phone: '+91 99004 00004' },
        planIndex: 2, // Pro Semi-Annual
        trainerIndex: 2,
        status: 'Active',
      },
      {
        name: 'Karan Verma',
        email: 'karan.verma@example.com',
        phone: '+91 99005 55667',
        dateOfBirth: new Date('1993-01-30'),
        gender: 'Male',
        address: '27 HSR Layout Sector 2, Bangalore',
        emergencyContact: { name: 'Ritu Verma', phone: '+91 99005 00005' },
        planIndex: 0, // Basic Monthly
        trainerIndex: null,
        status: 'Active',
      },
      {
        name: 'Pooja Nair',
        email: 'pooja.nair@example.com',
        phone: '+91 99006 66778',
        dateOfBirth: new Date('2000-09-12'),
        gender: 'Female',
        address: '61 Jayanagar 4th T Block, Bangalore',
        emergencyContact: { name: 'Madhavan Nair', phone: '+91 99006 00006' },
        planIndex: 0, // Basic Monthly
        trainerIndex: null,
        status: 'Inactive',
      },
    ];

    const createdMembers = [];

    for (const m of membersData) {
      const plan = plans[m.planIndex];
      const trainer = m.trainerIndex !== null ? trainers[m.trainerIndex] : null;

      const member = await Member.create({
        name: m.name,
        email: m.email,
        phone: m.phone,
        dateOfBirth: m.dateOfBirth,
        gender: m.gender,
        address: m.address,
        emergencyContact: m.emergencyContact,
        currentPlan: plan._id,
        assignedTrainer: trainer ? trainer._id : null,
        status: m.status,
      });

      // Create subscription
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 15); // Started 15 days ago
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + plan.durationMonths);

      const sub = await Subscription.create({
        member: member._id,
        plan: plan._id,
        startDate,
        endDate,
        amount: plan.price,
        paymentStatus: 'Paid',
        paymentMethod: 'UPI',
        status: m.status === 'Active' ? 'Active' : 'Expired',
      });

      member.currentSubscription = sub._id;
      await member.save();
      createdMembers.push(member);
    }
    console.log(` Created ${createdMembers.length} Members and Active Subscriptions`);

    console.log('Creating Attendance Records...');
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Today's attendance
    await Attendance.create([
      {
        member: createdMembers[0]._id, // Aarav Sharma
        date: today,
        checkInTime: new Date(Date.now() - 3600000 * 2), // 2 hrs ago
        checkOutTime: null,
        status: 'Checked In',
        notes: 'Morning heavy chest & triceps session',
      },
      {
        member: createdMembers[1]._id, // Sneha Patel
        date: today,
        checkInTime: new Date(Date.now() - 3600000 * 1.5), // 1.5 hrs ago
        checkOutTime: null,
        status: 'Checked In',
        notes: 'HIIT & Spin class attendance',
      },
      {
        member: createdMembers[2]._id, // Rohan Mehra
        date: today,
        checkInTime: new Date(Date.now() - 3600000 * 4), // 4 hrs ago
        checkOutTime: new Date(Date.now() - 3600000 * 2.5),
        status: 'Checked Out',
        notes: 'Leg day workout completed',
      },
      {
        member: createdMembers[3]._id, // Ananya Iyer
        date: yesterday,
        checkInTime: new Date(Date.now() - 86400000 - 3600000 * 3),
        checkOutTime: new Date(Date.now() - 86400000 - 3600000 * 1.5),
        status: 'Checked Out',
        notes: 'Yoga flexibility and core conditioning',
      },
      {
        member: createdMembers[4]._id, // Karan Verma
        date: yesterday,
        checkInTime: new Date(Date.now() - 86400000 - 3600000 * 5),
        checkOutTime: new Date(Date.now() - 86400000 - 3600000 * 3.5),
        status: 'Checked Out',
        notes: 'General cardio & treadmill 5km',
      },
    ]);
    console.log(' Created Attendance Records');

    console.log('Creating Workout Plans...');
    await WorkoutPlan.create([
      {
        title: 'Hypertrophy 4-Day Upper/Lower Split',
        member: createdMembers[0]._id,
        trainer: trainers[0]._id,
        goal: 'Muscle Gain',
        difficulty: 'Advanced',
        startDate: new Date(),
        days: [
          {
            dayName: 'Day 1: Upper Power',
            exercises: [
              { name: 'Barbell Bench Press', sets: 4, reps: '6-8', notes: 'RPE 8' },
              { name: 'Bent-Over Barbell Row', sets: 4, reps: '6-8', notes: 'Keep back flat' },
              { name: 'Overhead Dumbbell Press', sets: 3, reps: '8-10', notes: 'Full lockout' },
              { name: 'Incline Dumbbell Curls', sets: 3, reps: '10-12', notes: 'Peak contraction' },
            ],
          },
          {
            dayName: 'Day 2: Lower Power',
            exercises: [
              { name: 'Barbell Back Squats', sets: 4, reps: '5-6', notes: 'Parallel depth' },
              { name: 'Romanian Deadlift', sets: 3, reps: '8-10', notes: 'Feel hamstring stretch' },
              { name: 'Standing Calf Raises', sets: 4, reps: '12-15', notes: 'Pause at top' },
            ],
          },
        ],
        notes: 'Focus on progressive overload weekly. Track log in mobile app.',
        status: 'Active',
      },
      {
        title: 'Accelerated Fat Loss & Metabolic Conditioning',
        member: createdMembers[1]._id,
        trainer: trainers[1]._id,
        goal: 'Weight Loss',
        difficulty: 'Intermediate',
        startDate: new Date(),
        days: [
          {
            dayName: 'Day 1: Full Body Circuit',
            exercises: [
              { name: 'Kettlebell Swings', sets: 4, reps: '20', notes: 'Explosive hip drive' },
              { name: 'Dumbbell Thrusters', sets: 4, reps: '12-15', notes: 'Squat to overhead press' },
              { name: 'Box Jumps', sets: 3, reps: '15', notes: 'Soft landing' },
              { name: 'Plank Hold', sets: 3, reps: '60s', notes: 'Core engaged' },
            ],
          },
        ],
        notes: 'Stay hydrated and maintain heart rate in Zone 4 during intervals.',
        status: 'Active',
      },
      {
        title: 'Spine Mobility & Core Alignment Routine',
        member: createdMembers[3]._id,
        trainer: trainers[2]._id,
        goal: 'Flexibility',
        difficulty: 'Beginner',
        startDate: new Date(),
        days: [
          {
            dayName: 'Day 1: Mobility Flow',
            exercises: [
              { name: 'Cat-Cow Flow', sets: 3, reps: '10 cycles', notes: 'Sync with breath' },
              { name: 'Downward Dog to Cobra', sets: 3, reps: '8 reps', notes: 'Slow transition' },
              { name: 'Pigeon Pose Stretch', sets: 3, reps: '45s / side', notes: 'Hip opener' },
            ],
          },
        ],
        notes: 'Perform every morning before breakfast.',
        status: 'Active',
      },
    ]);
    console.log(' Created Workout Plans');

    console.log('--- SEEDING COMPLETED SUCCESSFULLY ---');
    console.log('Summary of Seeded Data:');
    console.log('- 1 Admin User (admin@fitsync.com / admin123password)');
    console.log(`- ${trainers.length} Certified Trainers`);
    console.log(`- ${plans.length} Membership Plans`);
    console.log(`- ${createdMembers.length} Members`);
    console.log('- 6 Trainer Schedules');
    console.log('- 5 Attendance Records (Active Check-ins ready)');
    console.log('- 3 Custom Workout Plans');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedData();

