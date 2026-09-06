require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const PatientProfile = require('../models/PatientProfile');
const Availability = require('../models/Availability');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB...');

    // Admin
    let admin = await User.findOne({ email: 'admin@telemedicine.com' });
    if (!admin) {
      admin = await User.create({
        name: 'Platform Admin',
        email: 'admin@telemedicine.com',
        password: 'admin123',
        role: 'admin',
        emailVerified: true,
      });
      console.log('Created admin user:', admin.email);
    } else {
      console.log('Admin user already exists');
    }

    // Demo doctor
    let doctorUser = await User.findOne({ email: 'sarah.miller@telemedicine.com' });
    if (!doctorUser) {
      doctorUser = await User.create({
        name: 'Dr. Sarah Miller',
        email: 'sarah.miller@telemedicine.com',
        password: 'doctor123',
        phone: '512-555-0101',
        role: 'doctor',
        emailVerified: true,
      });

      const profile = await DoctorProfile.create({
        user: doctorUser._id,
        specialization: 'Cardiology',
        licenseNumber: 'MD-LIC-1001',
        yearsExperience: 12,
        bio: 'Board-certified cardiologist with over a decade of experience in preventive and interventional cardiology.',
        consultationFee: 80,
        verificationStatus: 'verified',
        verifiedAt: new Date(),
        isAvailable: true,
        languages: ['English', 'Spanish'],
        education: [
          { degree: 'MD', institution: 'Johns Hopkins University', year: 2010 },
          { degree: 'Residency', institution: 'Cleveland Clinic', year: 2013 },
        ],
      });

      // Weekly availability slots
      const slots = [];
      for (let day = 1; day <= 5; day++) {
        slots.push(
          { doctor: profile._id, dayOfWeek: day, startTime: '09:00', endTime: '09:30' },
          { doctor: profile._id, dayOfWeek: day, startTime: '09:30', endTime: '10:00' },
          { doctor: profile._id, dayOfWeek: day, startTime: '10:00', endTime: '10:30' },
          { doctor: profile._id, dayOfWeek: day, startTime: '14:00', endTime: '14:30' },
          { doctor: profile._id, dayOfWeek: day, startTime: '14:30', endTime: '15:00' }
        );
      }
      await Availability.insertMany(slots);
      console.log('Created demo doctor + availability slots');
    } else {
      console.log('Demo doctor already exists');
    }

    // Demo patient
    let patientUser = await User.findOne({ email: 'alex.morgan@telemedicine.com' });
    if (!patientUser) {
      patientUser = await User.create({
        name: 'Alex Morgan',
        email: 'alex.morgan@telemedicine.com',
        password: 'patient123',
        phone: '512-555-0177',
        role: 'patient',
        emailVerified: true,
      });
      await PatientProfile.create({
        user: patientUser._id,
        gender: 'male',
        bloodType: 'O+',
        dateOfBirth: new Date('1991-03-22'),
      });
      console.log('Created demo patient');
    } else {
      console.log('Demo patient already exists');
    }

    console.log('\nSeed complete. Demo accounts:');
    console.log('  Admin:   admin@telemedicine.com     / admin123');
    console.log('  Doctor:  sarah.miller@telemedicine.com / doctor123');
    console.log('  Patient: alex.morgan@telemedicine.com  / patient123');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
};

seed();
