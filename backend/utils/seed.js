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

    // Demo doctor (Nigerian context — LUTH, Lagos)
    let doctorUser = await User.findOne({ email: 'sarah.adeyemi@telemedicine.com' });
    if (!doctorUser) {
      doctorUser = await User.create({
        name: 'Dr. Sarah Adeyemi',
        email: 'sarah.adeyemi@telemedicine.com',
        password: 'doctor123',
        phone: '+234 803 555 0101',
        role: 'doctor',
        emailVerified: true,
      });

      const profile = await DoctorProfile.create({
        user: doctorUser._id,
        specialization: 'Cardiology',
        licenseNumber: 'MDCN-R-45821',
        yearsExperience: 14,
        bio: 'Consultant cardiologist at Lagos University Teaching Hospital (LUTH). Focused on preventive care, hypertension and heart-rhythm issues. I keep explanations simple so you actually understand what is going on with your heart.',
        consultationFee: 20000,
        hospital: 'Lagos University Teaching Hospital (LUTH), Idi-Araba',
        verificationStatus: 'verified',
        verifiedAt: new Date(),
        isAvailable: true,
        languages: ['English', 'Yoruba'],
        address: { street: '11 Johnson Street, Idi-Araba', city: 'Lagos', state: 'Lagos', country: 'Nigeria' },
        education: [
          { degree: 'MBBS', institution: 'University of Lagos (UNILAG)', year: 2008 },
          { degree: 'FWACP (Cardiology)', institution: 'West African College of Physicians', year: 2015 },
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

    // Demo patient (Nigerian)
    let patientUser = await User.findOne({ email: 'emeka.okafor@telemedicine.com' });
    if (!patientUser) {
      patientUser = await User.create({
        name: 'Emeka Okafor',
        email: 'emeka.okafor@telemedicine.com',
        password: 'patient123',
        phone: '+234 803 555 0177',
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
    console.log('  Admin:   admin@telemedicine.com        / admin123');
    console.log('  Doctor:  sarah.adeyemi@telemedicine.com / doctor123');
    console.log('  Patient: emeka.okafor@telemedicine.com  / patient123');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
};

seed();