// Enrich the local database with realistic demo data so the app doesn't
// look like an empty template. Idempotent: safe to re-run.
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const DoctorProfile = require('../models/DoctorProfile');
const Availability = require('../models/Availability');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const Payment = require('../models/Payment');
const MedicalRecord = require('../models/MedicalRecord');
const Review = require('../models/Review');

const DAY = 24 * 60 * 60 * 1000;
const daysFromNow = (n) => new Date(Date.now() + n * DAY);

const DOCTORS = [
  {
    name: 'Dr. Sarah Miller',
    email: 'sarah.miller@telemedicine.com',
    specialization: 'Cardiology',
    licenseNumber: 'TX-LIC-1001',
    yearsExperience: 12,
    fee: 80,
    bio: 'Board-certified cardiologist focused on preventive care, hypertension, and heart-rhythm issues. I like to keep explanations simple so you actually understand what is going on.',
    languages: ['English', 'Spanish'],
    education: [
      { degree: 'MD', institution: 'Johns Hopkins University', year: 2010 },
      { degree: 'Residency, Internal Medicine', institution: 'Cleveland Clinic', year: 2013 },
      { degree: 'Fellowship, Cardiology', institution: 'Texas Heart Institute', year: 2015 },
    ],
  },
  {
    name: 'Dr. Priya Sharma',
    email: 'priya.sharma@telemedicine.com',
    specialization: 'Dermatology',
    licenseNumber: 'TX-LIC-2204',
    yearsExperience: 11,
    fee: 60,
    bio: 'Dermatologist with a soft spot for acne, eczema, and the kind of skin problems people feel embarrassed to mention. Half my job is reassurance, the other half is a plan that fits your week.',
    languages: ['English', 'Hindi'],
    education: [
      { degree: 'MBBS', institution: 'All India Institute of Medical Sciences', year: 2011 },
      { degree: 'MD, Dermatology', institution: 'Mayo Clinic', year: 2015 },
    ],
  },
  {
    name: 'Dr. Chiamaka Nwosu',
    email: 'chiamaka.nwosu@telemedicine.com',
    specialization: 'Pediatrics',
    licenseNumber: 'TX-LIC-3317',
    yearsExperience: 14,
    fee: 55,
    bio: 'Pediatrician and mother of two. I treat ear infections, asthma, fevers, and the occasional mysterious rash. Sick children rarely follow scripts, so neither do I.',
    languages: ['English', 'Igbo'],
    education: [
      { degree: 'MBBS', institution: 'University of Lagos', year: 2007 },
      { degree: 'MPH, Pediatrics', institution: 'Boston University', year: 2010 },
    ],
  },
  {
    name: 'Dr. Mateo Silva',
    email: 'mateo.silva@telemedicine.com',
    specialization: 'Family Medicine',
    licenseNumber: 'TX-LIC-4473',
    yearsExperience: 9,
    fee: 45,
    bio: 'Family physician for colds, flu, allergies, and annual checkups. If you need a referral, I will send you to someone I would send my own dad to.',
    languages: ['English', 'Spanish', 'Portuguese'],
    education: [
      { degree: 'MD', institution: 'UT Southwestern', year: 2014 },
      { degree: 'Residency, Family Medicine', institution: 'Baylor Scott & White', year: 2017 },
    ],
  },
  {
    name: 'Dr. James Callahan',
    email: 'james.callahan@telemedicine.com',
    specialization: 'Orthopedics',
    licenseNumber: 'TX-LIC-5526',
    yearsExperience: 18,
    fee: 95,
    bio: 'Orthopedic surgeon who also spends time helping people avoid surgery altogether. Knee, back, shoulder — if it hurts when you move, we can probably sort it out.',
    languages: ['English'],
    education: [
      { degree: 'MD', institution: 'University of Chicago', year: 2005 },
      { degree: 'Residency, Orthopedic Surgery', institution: 'Hospital for Special Surgery', year: 2010 },
    ],
  },
  {
    name: 'Dr. Emily Chen',
    email: 'emily.chen@telemedicine.com',
    specialization: 'Neurology',
    licenseNumber: 'TX-LIC-6610',
    yearsExperience: 13,
    fee: 110,
    bio: 'Neurologist specializing in migraine, sleep disorders, and dizziness. I spend a lot of time translating scans and jargon into language that makes sense.',
    languages: ['English', 'Mandarin'],
    education: [
      { degree: 'MD', institution: 'Stanford University', year: 2009 },
      { degree: 'Fellowship, Neurology', institution: 'UCSF Medical Center', year: 2014 },
    ],
  },
  {
    name: 'Dr. Tunde Bakare',
    email: 'tunde.bakare@telemedicine.com',
    specialization: 'Psychiatry',
    licenseNumber: 'TX-LIC-7732',
    yearsExperience: 10,
    fee: 75,
    bio: 'Psychiatrist for anxiety, depression, and burnout. Medication is sometimes part of it, but listening is always the first dose.',
    languages: ['English', 'Yoruba'],
    education: [
      { degree: 'MBBS', institution: 'University of Ibadan', year: 2012 },
      { degree: 'Residency, Psychiatry', institution: 'Mount Sinai', year: 2016 },
    ],
  },
  {
    name: 'Dr. Nina Kowalski',
    email: 'nina.kowalski@telemedicine.com',
    specialization: 'Ophthalmology',
    licenseNumber: 'TX-LIC-8841',
    yearsExperience: 8,
    fee: 65,
    bio: 'Eye doctor for dry eyes, red eyes, floaters, and blurry vision. Most eye panics turn out to be minor; I will tell you honestly when it actually matters.',
    languages: ['English', 'Polish'],
    education: [
      { degree: 'MD', institution: 'University of Michigan', year: 2015 },
      { degree: 'Residency, Ophthalmology', institution: 'Bascom Palmer', year: 2019 },
    ],
  },
];

const REVIEWS = [
  { doctor: 'sarah.miller@telemedicine.com', name: 'Rebecca Lawson', email: 'rebecca.lawson@mail.com', rating: 5, comment: 'Dr. Miller actually called me back after hours when my BP numbers worried her. Explained my meds in plain English and changed only the one that needed changing.' },
  { doctor: 'sarah.miller@telemedicine.com', name: 'Marcus Webb', email: 'marcus.webb@mail.com', rating: 4, comment: 'Really thorough. The only reason I am not giving five stars is the wait — took about 10 minutes to connect, which felt long when you are nervous.' },
  { doctor: 'sarah.miller@telemedicine.com', name: 'Grace Kim', email: 'grace.kim@mail.com', rating: 5, comment: 'I have seen cardiologists for years and she was the first one who asked about my sleep before reaching for more meds. Turns out that was half the problem.' },
  { doctor: 'priya.sharma@telemedicine.com', name: 'Idris Bello', email: 'idris.bello@mail.com', rating: 5, comment: 'Sent photos of my acne and within a day had a routine I can actually stick to. No lecture about washing my face, which I appreciated.' },
  { doctor: 'priya.sharma@telemedicine.com', name: 'Sienna Doyle', email: 'sienna.doyle@mail.com', rating: 4, comment: 'Prescription arrived at the pharmacy the same day, which never happens with my usual clinic. Wish the video had been a touch clearer but that is probably my wifi.' },
  { doctor: 'priya.sharma@telemedicine.com', name: 'Aisha Adeyemi', email: 'aisha.adeyemi@mail.com', rating: 5, comment: 'My eczema has been under control for two months now. She adjusted the plan after a week when it wasnt working, which is more than my old derm did in a year.' },
  { doctor: 'chiamaka.nwosu@telemedicine.com', name: 'Hannah Feld', email: 'hannah.feld@mail.com', rating: 5, comment: '2am, screaming toddler, ear infection guess. Dr. Nwosu was calm, kind, and had us in front of a pharmacist before sunrise. I almost teared up.' },
  { doctor: 'chiamaka.nwosu@telemedicine.com', name: 'Tom Whitfield', email: 'tom.whitfield@mail.com', rating: 4, comment: 'She spotted something my pediatrician had missed for months and referred us the same day. Only complaint: hard to get a same-week slot, she is popular.' },
  { doctor: 'chiamaka.nwosu@telemedicine.com', name: 'Noah Grant', email: 'noah.grant@mail.com', rating: 5, comment: 'Great with my daughter who is terrified of doctors. By the end she was showing Dr. Nwosu her stuffed dinosaur. That is a win in my book.' },
  { doctor: 'mateo.silva@telemedicine.com', name: 'Carlos Mendez', email: 'carlos.mendez@mail.com', rating: 4, comment: 'Straightforward flu consult, quick antibiotic when it turned out bacterial. The follow-up message checking on me two days later was a nice touch.' },
  { doctor: 'mateo.silva@telemedicine.com', name: 'Olamide Johnson', email: 'olamide.johnson@mail.com', rating: 5, comment: 'Did my annual physical over video and handled my insurance referral without me having to chase anyone. Unheard of.' },
  { doctor: 'mateo.silva@telemedicine.com', name: 'Lena Marsh', email: 'lena.marsh@mail.com', rating: 5, comment: 'Took my allergies seriously when every clinic kept saying it was just a cold. Referred me to an immunologist who found the trigger.' },
  { doctor: 'james.callahan@telemedicine.com', name: 'Kwame Mensah', email: 'kwame.mensah@mail.com', rating: 5, comment: 'Knee has been hurting for two years and everyone said rest. Dr. Callahan asked the right questions, got me an MRI referral, and now I have an actual plan.' },
  { doctor: 'james.callahan@telemedicine.com', name: 'Dana Whitaker', email: 'dana.whitaker@mail.com', rating: 4, comment: 'Clearly knows his stuff. He talked me OUT of a surgery I thought I needed and into physical therapy, which surprised me but ended up being right.' },
  { doctor: 'james.callahan@telemedicine.com', name: 'Greg Holloway', email: 'greg.holloway@mail.com', rating: 5, comment: 'Shoulder had me unable to sleep for a month. One visit and a precise referral later I had a cortisone shot scheduled. Huge relief.' },
  { doctor: 'emily.chen@telemedicine.com', name: 'Lucia Ferro', email: 'lucia.ferro@mail.com', rating: 5, comment: 'Migraines cut down by two-thirds since she refined my meds. She explained the scans line by line instead of handing me a portal message full of jargon.' },
  { doctor: 'emily.chen@telemedicine.com', name: 'Priya Natarajan', email: 'priya.natarajan@mail.com', rating: 4, comment: 'Very knowledgeable, good with follow-through. I wish specialists this sharp were this easy to reach everywhere.' },
  { doctor: 'tunde.bakare@telemedicine.com', name: 'Jake Morrison', email: 'jake.morrison@mail.com', rating: 5, comment: 'Was nervous about a video psychiatry visit. Turns out being in my own room made talking easier. He listens without rushing and never makes you feel like a case number.' },
  { doctor: 'tunde.bakare@telemedicine.com', name: 'Maya Richardson', email: 'maya.richardson@mail.com', rating: 5, comment: 'Several therapists before never clicked. Dr. Bakare noticed patterns nobody raised before and we finally got the medication balance right.' },
  { doctor: 'tunde.bakare@telemedicine.com', name: 'Sam Okafor', email: 'sam.okafor@mail.com', rating: 4, comment: 'Solid doctor, practical advice. Would have liked slightly longer sessions, but the progress speaks for itself.' },
  { doctor: 'nina.kowalski@telemedicine.com', name: 'Elena Petrov', email: 'elena.petrov@mail.com', rating: 5, comment: 'Thought my floaters were something awful. She walked me through what they were, what to watch for, and what not to panic about. My anxiety alone thanked her.' },
  { doctor: 'nina.kowalski@telemedicine.com', name: 'Raymond Ellis', email: 'raymond.ellis@mail.com', rating: 4, comment: 'Dry eye plan finally works. The video exam limit is real for eyes though — she sent me for an in-person check on the same network, which was easy.' },
];

const DEMO_PATIENT = { oldEmail: 'patient@example.com', name: 'Alex Morgan', email: 'alex.morgan@telemedicine.com' };
const DEMO_DOCTOR_EMAIL = 'doctor@example.com';

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // 1. Give the demo accounts realistic credentials
    const patient = await User.findOneAndUpdate(
      { email: DEMO_PATIENT.oldEmail },
      { $set: { name: DEMO_PATIENT.name, email: DEMO_PATIENT.email, phone: '5125550177' } },
      { new: true }
    );
    if (patient) console.log(`Patient → ${patient.name} <${patient.email}>`);

    const docUser = await User.findOneAndUpdate(
      { email: DEMO_DOCTOR_EMAIL },
      { $set: { email: 'sarah.miller@telemedicine.com' } },
      { new: true }
    );
    if (docUser) console.log(`Doctor login → sarah.miller@telemedicine.com`);

    // 2. Create the demo patient profile if missing
    let patientProfile = patient ? await PatientProfile.findOne({ user: patient._id }) : null;
    if (!patientProfile && patient) {
      patientProfile = await PatientProfile.create({
        user: patient._id,
        gender: 'male',
        bloodType: 'O+',
        dateOfBirth: new Date('1991-03-22'),
        allergies: ['Penicillin'],
        medicalConditions: ['Mild hypertension'],
        address: { street: '4810 Duval St', city: 'Austin', state: 'TX', zipCode: '78751', country: 'USA' },
        emergencyContact: { name: 'Jordan Morgan', phone: '5125550144', relationship: 'Spouse' },
        insurance: { provider: 'Blue Cross Blue Shield', policyNumber: 'BCBS-7742-1901' },
      });
      console.log('Patient profile created');
    }

    // 3. Add the extra doctors (skip if already present)
    const slotTemplate = (docId) => {
      const slots = [];
      for (let day = 1; day <= 5; day++) {
        for (const [start, end] of [['09:00', '09:30'], ['09:30', '10:00'], ['10:00', '10:30'], ['14:00', '14:30'], ['14:30', '15:00']]) {
          slots.push({ doctor: docId, dayOfWeek: day, startTime: start, endTime: end });
        }
      }
      return slots;
    };

    const doctorProfiles = {};
    for (const d of DOCTORS) {
      let user = await User.findOne({ email: d.email });
      if (!user) {
        user = await User.create({
          name: d.name,
          email: d.email,
          password: 'demo123',
          phone: '5125550100',
          role: 'doctor',
          emailVerified: true,
        });
      }
      let profile = await DoctorProfile.findOne({ user: user._id });
      if (!profile) {
        profile = await DoctorProfile.create({
          user: user._id,
          specialization: d.specialization,
          licenseNumber: d.licenseNumber,
          yearsExperience: d.yearsExperience,
          bio: d.bio,
          consultationFee: d.fee,
          verificationStatus: 'verified',
          verifiedAt: new Date(),
          isAvailable: true,
          languages: d.languages,
          education: d.education,
        });
        await Availability.insertMany(slotTemplate(profile._id));
        console.log(`Added ${d.name} (${d.specialization})`);
      }
      doctorProfiles[d.email] = profile;
    }

    // 4. Realistic reviews (creates reviewer patients + their completed visit)
    for (const r of REVIEWS) {
      const doctor = doctorProfiles[r.doctor];
      if (!doctor) continue;
      let reviewerUser = await User.findOne({ email: r.email });
      if (!reviewerUser) {
        reviewerUser = await User.create({
          name: r.name,
          email: r.email,
          password: 'demo123',
          role: 'patient',
          emailVerified: true,
        });
      }
      let reviewerProfile = await PatientProfile.findOne({ user: reviewerUser._id });
      if (!reviewerProfile) {
        reviewerProfile = await PatientProfile.create({ user: reviewerUser._id });
      }
      const already = await Review.findOne({ patient: reviewerProfile._id }).populate('doctor').lean();
      if (already && already.doctor._id.toString() === doctor._id.toString()) continue;

      const past = daysFromNow(-(8 + Math.floor(Math.random() * 90)));
      past.setHours(9 + Math.floor(Math.random() * 8), 15 * (Math.floor(Math.random() * 3) + 1), 0, 0);
      const apt = await Appointment.create({
        patient: reviewerProfile._id,
        doctor: doctor._id,
        scheduledDate: past,
        startTime: '09:00',
        endTime: '09:30',
        status: 'completed',
        type: Math.random() > 0.3 ? 'video' : 'chat',
        symptoms: 'General consultation',
      });
      await Review.create({
        doctor: doctor._id,
        patient: reviewerProfile._id,
        appointment: apt._id,
        rating: r.rating,
        comment: r.comment,
        isVisible: true,
      });
    }

    // Recompute ratings from actual reviews so the listing matches them
    for (const profile of Object.values(doctorProfiles)) {
      const agg = await Review.aggregate([
        { $match: { doctor: profile._id, isVisible: true } },
        { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
      ]);
      const row = agg[0];
      profile.rating = row ? Math.round(row.avg * 10) / 10 : 0;
      profile.reviewCount = row ? row.count : 0;
      await profile.save();
    }

    // 5. Demo patient history
    const sarah = doctorProfiles['sarah.miller@telemedicine.com'];
    const priya = doctorProfiles['priya.sharma@telemedicine.com'];
    const emily = doctorProfiles['emily.chen@telemedicine.com'];

    if (patientProfile && sarah) {
      const hasUpcoming = await Appointment.findOne({ patient: patientProfile._id, status: 'confirmed', scheduledDate: { $gte: new Date() } });
      const history = await Appointment.find({ patient: patientProfile._id, status: 'completed' }).countDocuments();

      if (!hasUpcoming) {
        const soon = daysFromNow(6);
        const slot = await Availability.findOne({ doctor: sarah._id, isRecurring: true, dayOfWeek: soon.getDay() === 0 ? 6 : soon.getDay() }).lean();
        const apt = await Appointment.create({
          patient: patientProfile._id,
          doctor: sarah._id,
          availability: slot ? slot._id : undefined,
          scheduledDate: soon,
          startTime: '09:30',
          endTime: '10:00',
          status: 'confirmed',
          type: 'video',
          symptoms: 'Follow-up on blood pressure. Numbers have been creeping up the past week.',
        });
        console.log('Created upcoming appointment for demo patient');
      }

      if (history === 0) {
        // Cardiology follow-up
        const c1 = daysFromNow(-21); c1.setHours(10, 0, 0, 0);
        const apt1 = await Appointment.create({
          patient: patientProfile._id, doctor: sarah._id,
          scheduledDate: c1, startTime: '10:00', endTime: '10:30',
          status: 'completed', type: 'video',
          symptoms: 'Occasional palpitations, feeling tired by mid-afternoon.',
          notes: 'Reviewed home BP log. Average 128/84, improved from last month.',
          diagnosis: 'Essential hypertension, well controlled on current dose',
        });
        await Prescription.create({
          appointment: apt1._id, doctor: sarah._id, patient: patientProfile._id,
          diagnosis: 'Essential hypertension',
          medications: [
            { name: 'Amlodipine', dosage: '5 mg', frequency: 'Once daily', duration: '90 days', instructions: 'Take in the morning. Keep the BP log.' },
          ],
          status: 'completed', validUntil: daysFromNow(69),
        });
        await Payment.create({ appointment: apt1._id, patient: patientProfile._id, doctor: sarah._id, amount: 80, status: 'completed', paidAt: c1 });
        await MedicalRecord.create({
          patient: patientProfile._id, doctor: sarah._id, appointment: apt1._id,
          title: 'Cardiology follow-up',
          description: 'Hypertension follow-up visit. BP trending down, medication continues. Next review in 90 days.',
          type: 'consultation', tags: ['cardiology', 'hypertension'],
        });

        // Dermatology visit
        const c2 = daysFromNow(-38); c2.setHours(9, 0, 0, 0);
        const apt2 = await Appointment.create({
          patient: patientProfile._id, doctor: priya._id,
          scheduledDate: c2, startTime: '09:00', endTime: '09:30',
          status: 'completed', type: 'video',
          symptoms: 'Recurring breakouts on jawline and forehead, worse the past few weeks.',
          diagnosis: 'Acne vulgaris (moderate)',
        });
        await Prescription.create({
          appointment: apt2._id, doctor: priya._id, patient: patientProfile._id,
          diagnosis: 'Acne vulgaris',
          medications: [
            { name: 'Adapalene 0.1% gel', dosage: 'Pea-sized', frequency: 'At bedtime', duration: '60 days', instructions: 'Start every other night, then nightly. Use moisturizer.' },
            { name: 'Benzoyl peroxide 4% wash', dosage: 'Daily', frequency: 'Morning', duration: '60 days', instructions: 'Rinse off after 1-2 minutes.' },
          ],
          status: 'active', validUntil: daysFromNow(22),
        });
        await Payment.create({ appointment: apt2._id, patient: patientProfile._id, doctor: priya._id, amount: 60, status: 'completed', paidAt: c2 });

        // Neurology consult
        const c3 = daysFromNow(-60); c3.setHours(14, 0, 0, 0);
        const apt3 = await Appointment.create({
          patient: patientProfile._id, doctor: emily._id,
          scheduledDate: c3, startTime: '14:00', endTime: '14:30',
          status: 'completed', type: 'video',
          symptoms: 'Getting a headache every few days, often behind the eyes. Triggers seem to be screens and skipped meals.',
          diagnosis: 'Migraine without aura',
        });
        await Prescription.create({
          appointment: apt3._id, doctor: emily._id, patient: patientProfile._id,
          diagnosis: 'Migraine without aura',
          medications: [
            { name: 'Sumatriptan', dosage: '50 mg', frequency: 'As needed (max 2/week)', duration: '30 days', instructions: 'Take at first sign of migraine. Do not exceed 2 tablets per week.' },
            { name: 'Vitamin B2 (riboflavin)', dosage: '400 mg', frequency: 'Once daily', duration: '90 days', instructions: 'Preventive. Takes 6-8 weeks to help.' },
          ],
          status: 'active', validUntil: daysFromNow(28),
        });
        await Payment.create({ appointment: apt3._id, patient: patientProfile._id, doctor: emily._id, amount: 110, status: 'completed', paidAt: c3 });
        await MedicalRecord.create({
          patient: patientProfile._id, doctor: emily._id, appointment: apt3._id,
          title: 'Neurology consult — migraine management',
          description: 'Migraine workup. No red flags on history. Started preventive riboflavin; sumatriptan for attacks as needed.',
          type: 'consultation', tags: ['neurology', 'migraine'],
        });
        await MedicalRecord.create({
          patient: patientProfile._id,
          title: 'Lab work — annual panel',
          description: 'CBC, lipid panel, HbA1c. All within normal limits. LDL 101 mg/dL.',
          type: 'lab_report', tags: ['lab', 'cholesterol'],
        });

        await Review.create({
          doctor: sarah._id, patient: patientProfile._id, appointment: apt1._id,
          rating: 5, comment: 'Follow-up felt personal, not rushed. She remembered my case from the last visit which never happens elsewhere.',
        });
        console.log('Created demo patient history (appointments, prescriptions, payments, records)');
      }
    }

    console.log('Done. Demo login → alex.morgan@telemedicine.com / patient123 · sarah.miller@telemedicine.com / doctor123');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('SeedMore failed:', error);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
};

run();