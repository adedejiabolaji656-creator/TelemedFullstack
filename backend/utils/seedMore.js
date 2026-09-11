// Enrich the local database with realistic Nigerian demo data so the app
// doesn't look like an empty template. Idempotent: safe to re-run.
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
const Notification = require('../models/Notification');

const DAY = 24 * 60 * 60 * 1000;
const daysFromNow = (n) => new Date(Date.now() + n * DAY);

// Consultant fees are recorded in Naira (₦)
const DOCTORS = [
  {
    name: 'Dr. Sarah Adeyemi',
    email: 'sarah.adeyemi@telemedicine.com',
    specialization: 'Cardiology',
    licenseNumber: 'MDCN-R-45821',
    yearsExperience: 14,
    fee: 20000,
    bio: 'Consultant cardiologist at Lagos University Teaching Hospital (LUTH) in Idi-Araba. Focused on preventive care, hypertension and heart-rhythm issues.',
    hospital: 'Lagos University Teaching Hospital (LUTH)',
    street: '11 Johnson Street, Idi-Araba',
    city: 'Lagos',
    state: 'Lagos',
    languages: ['English', 'Yoruba'],
    education: [
      { degree: 'MBBS', institution: 'University of Lagos (UNILAG)', year: 2008 },
      { degree: 'FWACP (Cardiology)', institution: 'West African College of Physicians', year: 2015 },
    ],
  },
  {
    name: 'Dr. Emeka Nwachukwu',
    email: 'emeka.nwachukwu@telemedicine.com',
    specialization: 'Dermatology',
    licenseNumber: 'MDCN-R-66348',
    yearsExperience: 11,
    fee: 12000,
    bio: 'Consultant dermatologist with a soft spot for acne, eczema and the kind of skin problems people feel embarrassed to mention. Half my job is reassurance; the other half is a plan that fits your week.',
    hospital: 'Lagoon Hospitals',
    street: '13 Marine Road, Apapa',
    city: 'Lagos',
    state: 'Lagos',
    languages: ['English', 'Igbo'],
    education: [
      { degree: 'MBBS', institution: 'University of Nigeria, Nsukka (UNN)', year: 2012 },
      { degree: 'FMCP (Dermatology)', institution: 'National Postgraduate Medical College of Nigeria', year: 2018 },
    ],
  },
  {
    name: 'Dr. Chiamaka Nwosu',
    email: 'chiamaka.nwosu@telemedicine.com',
    specialization: 'Pediatrics',
    licenseNumber: 'MDCN-R-71509',
    yearsExperience: 13,
    fee: 10000,
    bio: 'Consultant pediatrician and mother of two. I treat ear infections, asthma, fevers and the occasional mysterious rash. Sick children rarely follow scripts, so neither do I.',
    hospital: 'University of Nigeria Teaching Hospital (UNTH)',
    street: 'UNTH Road, Ituku-Ozalla',
    city: 'Enugu',
    state: 'Enugu',
    languages: ['English', 'Igbo'],
    education: [
      { degree: 'MBBS', institution: 'University of Port Harcourt', year: 2010 },
      { degree: 'FMCPaed', institution: 'National Postgraduate Medical College of Nigeria', year: 2017 },
    ],
  },
  {
    name: 'Dr. Abubakar Sani',
    email: 'abubakar.sani@telemedicine.com',
    specialization: 'Family Medicine',
    licenseNumber: 'MDCN-R-80921',
    yearsExperience: 10,
    fee: 8000,
    bio: 'Family physician for colds, malaria, typhoid, allergies and annual checkups. If you need a specialist, I will send you to someone I would send my own family to.',
    hospital: 'National Hospital, Abuja',
    street: 'Central Business District, Garki',
    city: 'Abuja',
    state: 'FCT',
    languages: ['English', 'Hausa'],
    education: [
      { degree: 'MBBS', institution: 'Bayero University Kano', year: 2014 },
      { degree: 'FMCFM', institution: 'National Postgraduate Medical College of Nigeria', year: 2020 },
    ],
  },
  {
    name: 'Dr. Folake Adeyemi',
    email: 'folake.adeyemi@telemedicine.com',
    specialization: 'Orthopedics',
    licenseNumber: 'MDCN-R-91448',
    yearsExperience: 17,
    fee: 25000,
    bio: 'Orthopedic surgeon who also spends a lot of time helping people avoid surgery altogether. Knee, back, shoulder — if it hurts when you move, we can probably sort it out.',
    hospital: 'University College Hospital (UCH)',
    street: 'Queen Elizabeth Road, Oke Offa',
    city: 'Ibadan',
    state: 'Oyo',
    languages: ['English', 'Yoruba'],
    education: [
      { degree: 'MBBS', institution: 'University of Ibadan', year: 2006 },
      { degree: 'FMWACS (Orthopaedics)', institution: 'National Postgraduate Medical College of Nigeria', year: 2013 },
    ],
  },
  {
    name: 'Dr. Oluwaseun Balogun',
    email: 'oluwaseun.balogun@telemedicine.com',
    specialization: 'Neurology',
    licenseNumber: 'MDCN-R-102655',
    yearsExperience: 12,
    fee: 30000,
    bio: 'Neurologist specializing in migraine, sleep disorders and dizziness. I spend a lot of time translating scans and jargon into language that makes sense.',
    hospital: 'Aminu Kano Teaching Hospital (AKTH)',
    street: 'No. 12 Zaria Road, Gyadi-Gyadi',
    city: 'Kano',
    state: 'Kano',
    languages: ['English', 'Yoruba'],
    education: [
      { degree: 'MBBS', institution: 'University of Ilorin', year: 2011 },
      { degree: 'FMCP (Neurology)', institution: 'National Postgraduate Medical College of Nigeria', year: 2019 },
    ],
  },
  {
    name: 'Dr. Tunde Bakare',
    email: 'tunde.bakare@telemedicine.com',
    specialization: 'Psychiatry',
    licenseNumber: 'MDCN-R-88910',
    yearsExperience: 10,
    fee: 15000,
    bio: 'Psychiatrist for anxiety, depression and burnout. Medication is sometimes part of it, but listening is always the first dose.',
    hospital: 'Federal Neuro-Psychiatric Hospital, Yaba',
    street: 'Harvey Road, Yaba',
    city: 'Lagos',
    state: 'Lagos',
    languages: ['English', 'Yoruba'],
    education: [
      { degree: 'MBBS', institution: 'University of Ibadan', year: 2012 },
      { degree: 'FWACP (Psychiatry)', institution: 'West African College of Physicians', year: 2019 },
    ],
  },
  {
    name: 'Dr. Chidinma Obiagu',
    email: 'chidinma.obiagu@telemedicine.com',
    specialization: 'Ophthalmology',
    licenseNumber: 'MDCN-R-117319',
    yearsExperience: 9,
    fee: 15000,
    bio: 'Eye doctor for dry eyes, red eyes, floaters and blurry vision. Most eye panics turn out to be minor; I will tell you honestly when it actually matters.',
    hospital: 'University of Port Harcourt Teaching Hospital (UPTH)',
    street: 'Rumuokuta–Eneka Road, Choba',
    city: 'Port Harcourt',
    state: 'Rivers',
    languages: ['English', 'Igbo'],
    education: [
      { degree: 'MBBS', institution: 'University of Nigeria, Nsukka (UNN)', year: 2014 },
      { degree: 'FMCOphth', institution: 'National Postgraduate Medical College of Nigeria', year: 2021 },
    ],
  },
];

const REVIEWS = [
  { doctor: 'sarah.adeyemi@telemedicine.com', name: 'Adaeze Obi', email: 'adaeze.obi@mail.com', rating: 5, comment: 'Dr. Adeyemi actually called me back after my BP numbers worried her. Explained my meds in plain English and changed only the one that needed changing.' },
  { doctor: 'sarah.adeyemi@telemedicine.com', name: 'Yusuf Abubakar', email: 'yusuf.abubakar@mail.com', rating: 4, comment: 'Really thorough. The only reason I am not giving five stars is the wait — took about 10 minutes to connect, which felt long when you are nervous.' },
  { doctor: 'sarah.adeyemi@telemedicine.com', name: 'Nkechi Eze', email: 'nkechi.eze@mail.com', rating: 5, comment: 'I have seen cardiologists for years and she was the first one who asked about my sleep before reaching for more meds. Turns out that was half the problem.' },
  { doctor: 'emeka.nwachukwu@telemedicine.com', name: 'Tobi Alade', email: 'tobi.alade@mail.com', rating: 5, comment: 'Sent photos of my acne and within a day had a routine I can actually stick to. No lecture about washing my face, which I appreciated.' },
  { doctor: 'emeka.nwachukwu@telemedicine.com', name: 'Bisi Ogunwande', email: 'bisi.ogunwande@mail.com', rating: 4, comment: 'Prescription got to the pharmacy the same day, which never happens with my usual clinic. Wish the video had been a touch clearer but that is probably my data.' },
  { doctor: 'emeka.nwachukwu@telemedicine.com', name: 'Aisha Adeyemi', email: 'aisha.adeyemi2@mail.com', rating: 5, comment: 'My eczema has been under control for two months now. He adjusted the plan after a week when it wasnt working — more than my old derm did in a year.' },
  { doctor: 'chiamaka.nwosu@telemedicine.com', name: 'Funmi Falana', email: 'funmi.falana@mail.com', rating: 5, comment: '2am, screaming toddler, ear infection guess. Dr. Nwosu was calm, kind, and had us in front of a pharmacist before sunrise. I almost teared up.' },
  { doctor: 'chiamaka.nwosu@telemedicine.com', name: 'Ibrahim Musa', email: 'ibrahim.musa@mail.com', rating: 4, comment: 'She spotted something my pediatrician had missed for months and referred us the same day. Only complaint: hard to get a same-week slot, she is popular.' },
  { doctor: 'chiamaka.nwosu@telemedicine.com', name: 'Chinyere Okonkwo', email: 'chinyere.okonkwo@mail.com', rating: 5, comment: 'Great with my daughter who is terrified of doctors. By the end she was showing Dr. Nwosu her stuffed dinosaur. That is a win in my book.' },
  { doctor: 'abubakar.sani@telemedicine.com', name: 'Halima Bello', email: 'halima.bello@mail.com', rating: 4, comment: 'Straightforward malaria consult, quick prescription when the test came back positive. The follow-up message checking on me two days later was a nice touch.' },
  { doctor: 'abubakar.sani@telemedicine.com', name: 'Olamide Johnson', email: 'olamide.johnson@mail.com', rating: 5, comment: 'Did my annual physical over video and handled my HMO referral without me having to chase anyone. Unheard of.' },
  { doctor: 'abubakar.sani@telemedicine.com', name: 'Zainab Garba', email: 'zainab.garba@mail.com', rating: 5, comment: 'Took my allergies seriously when every clinic kept saying it was just a cold. Referred me to a specialist who finally found the trigger.' },
  { doctor: 'folake.adeyemi@telemedicine.com', name: 'Kwame Mensah', email: 'kwame.mensah@mail.com', rating: 5, comment: 'Knee has been hurting for two years and everyone said rest. Dr. Adeyemi asked the right questions, got me an MRI referral, and now I have an actual plan.' },
  { doctor: 'folake.adeyemi@telemedicine.com', name: 'Kelechi Nwosu', email: 'kelechi.nwosu@mail.com', rating: 4, comment: 'Clearly knows his craft. He talked me OUT of a surgery I thought I needed and into physiotherapy, which surprised me but ended up being right.' },
  { doctor: 'folake.adeyemi@telemedicine.com', name: 'Gbenga Adebiyi', email: 'gbenga.adebiyi@mail.com', rating: 5, comment: 'My shoulder had me unable to sleep for a month. One visit and a precise referral later I had an injection booked. Huge relief.' },
  { doctor: 'oluwaseun.balogun@telemedicine.com', name: 'Lucia Fernandes', email: 'lucia.fernandes@mail.com', rating: 5, comment: 'Migraines cut down by two-thirds since he refined my meds. He explained the scans line by line instead of handing me a portal message full of jargon.' },
  { doctor: 'oluwaseun.balogun@telemedicine.com', name: 'Priya Ananth', email: 'priya.ananth@mail.com', rating: 4, comment: 'Very knowledgeable, good with follow-through. I wish specialists this sharp were this easy to reach from Abuja.' },
  { doctor: 'oluwaseun.balogun@telemedicine.com', name: 'Segun Akinwunmi', email: 'segun.akinwunmi@mail.com', rating: 5, comment: 'Dizziness that two clinics dismissed. Dr. Balogun went through my history carefully and got to the root of it in one visit. Worth every naira.' },
  { doctor: 'tunde.bakare@telemedicine.com', name: 'Jibril Isah', email: 'jibril.isah@mail.com', rating: 5, comment: 'Was nervous about a video psychiatry visit. Turns out being in my own room made talking easier. He listens without rushing and never makes you feel like a case number.' },
  { doctor: 'tunde.bakare@telemedicine.com', name: 'Maya Olatunji', email: 'maya.olatunji@mail.com', rating: 5, comment: 'Several therapists before never clicked. Dr. Bakare noticed patterns nobody raised before and we finally got the medication balance right.' },
  { doctor: 'tunde.bakare@telemedicine.com', name: 'Sam Okafor', email: 'sam.okafor@mail.com', rating: 4, comment: 'Solid doctor, practical advice. Would have liked slightly longer sessions, but the progress speaks for itself.' },
  { doctor: 'chidinma.obiagu@telemedicine.com', name: 'Amara Eze', email: 'amara.eze@mail.com', rating: 5, comment: 'Thought my floaters were something awful. She walked me through what they were, what to watch for, and what not to panic about. My anxiety alone thanked her.' },
  { doctor: 'chidinma.obiagu@telemedicine.com', name: 'Raymond Ekwueme', email: 'raymond.ekwueme@mail.com', rating: 4, comment: 'Dry eye plan finally works. The video exam limit is real for eyes though — she sent me for an in-person check on the same network, which was easy.' },
];

const DEMO_PATIENT = {
  oldEmail: 'alex.morgan@telemedicine.com',
  name: 'Emeka Okafor',
  email: 'emeka.okafor@telemedicine.com',
};
const DEMO_DOCTOR_EMAIL = 'doctor@example.com';

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // 1. Re-point the legacy doctor login, and rename the legacy demo patient
    const docUser = await User.findOneAndUpdate(
      { email: DEMO_DOCTOR_EMAIL },
      { $set: { email: 'sarah.adeyemi@telemedicine.com' } },
      { new: true }
    );
    if (docUser) console.log(`Doctor login → sarah.adeyemi@telemedicine.com`);

    const patient = await User.findOneAndUpdate(
      { email: DEMO_PATIENT.oldEmail },
      { $set: { name: DEMO_PATIENT.name, email: DEMO_PATIENT.email, phone: '+234 803 555 0177' } },
      { new: true }
    );
    if (patient) console.log(`Patient → ${patient.name} <${patient.email}>`);

    // 2. Create/refresh the demo patient profile
    let patientProfile = patient ? await PatientProfile.findOne({ user: patient._id }) : null;
    if (!patientProfile && patient) {
      patientProfile = await PatientProfile.create({
        user: patient._id,
        gender: 'male',
        bloodType: 'O+',
        dateOfBirth: new Date('1991-03-22'),
        allergies: ['Penicillin'],
        medicalConditions: ['Mild hypertension'],
        currentMedications: ['Amlodipine 5 mg (once daily)'],
        address: { street: '12 Admiralty Way, Lekki Phase 1', city: 'Lagos', state: 'Lagos', zipCode: '', country: 'Nigeria' },
        emergencyContact: { name: 'Ngozi Okafor', phone: '+234 803 555 0144', relationship: 'Sister' },
        insurance: { provider: 'Hygeia HMO', policyNumber: 'HYG-7742-1901', groupNumber: 'GRP-88-HMO' },
      });
      console.log('Patient profile created');
    } else if (patientProfile) {
      await PatientProfile.updateOne(
        { user: patient._id },
        {
          $set: {
            allergies: ['Penicillin'],
            medicalConditions: ['Mild hypertension'],
            currentMedications: ['Amlodipine 5 mg (once daily)'],
            'address.street': '12 Admiralty Way, Lekki Phase 1',
            'address.city': 'Lagos',
            'address.state': 'Lagos',
            'address.country': 'Nigeria',
            'emergencyContact.name': 'Ngozi Okafor',
            'emergencyContact.phone': '+234 803 555 0144',
            'emergencyContact.relationship': 'Sister',
            'insurance.provider': 'Hygeia HMO',
            'insurance.policyNumber': 'HYG-7742-1901',
          },
        }
      );
      console.log('Patient profile refreshed');
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
          phone: '+234 803 555 01' + d.licenseNumber.slice(-2),
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
          hospital: d.hospital,
          consultationFee: d.fee,
          verificationStatus: 'verified',
          verifiedAt: new Date(),
          isAvailable: true,
          languages: d.languages,
          education: d.education,
          address: { street: d.street, city: d.city, state: d.state, country: 'Nigeria' },
        });
        await Availability.insertMany(slotTemplate(profile._id));
        console.log(`Added ${d.name} (${d.specialization})`);
      } else {
        // Refresh existing records every run so old demo data self-corrects
        // to the current Nigerian names + Lagos addresses.
        await User.updateOne({ _id: user._id }, { $set: { name: d.name } });
        profile.hospital = d.hospital;
        profile.address = { street: d.street, city: d.city, state: d.state, country: 'Nigeria' };
        profile.languages = d.languages;
        profile.consultationFee = d.fee;
        profile.specialization = d.specialization;
        profile.bio = d.bio;
        await profile.save();
        console.log(`Refreshed ${d.name} → Lagos`);
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

    // 5. Demo patient history (all amounts in Naira)
    const sarah = doctorProfiles['sarah.adeyemi@telemedicine.com'];
    const emeka = doctorProfiles['emeka.nwachukwu@telemedicine.com'];
    const seun = doctorProfiles['oluwaseun.balogun@telemedicine.com'];

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
        await Payment.create({
          appointment: apt._id, patient: patientProfile._id, doctor: sarah._id,
          amount: sarah.consultationFee, currency: 'ngn', status: 'completed',
          method: 'card', reference: 'PSK-DEMO-UPCOMING', paidAt: new Date(),
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
        await Payment.create({ appointment: apt1._id, patient: patientProfile._id, doctor: sarah._id, amount: 20000, currency: 'ngn', status: 'completed', method: 'card', reference: 'PSK-DEMO-0001', paidAt: c1 });
        await MedicalRecord.create({
          patient: patientProfile._id, doctor: sarah._id, appointment: apt1._id,
          title: 'Cardiology follow-up',
          description: 'Hypertension follow-up visit. BP trending down, medication continues. Next review in 90 days.',
          type: 'consultation', tags: ['cardiology', 'hypertension'],
        });

        // Dermatology visit
        const c2 = daysFromNow(-38); c2.setHours(9, 0, 0, 0);
        const apt2 = await Appointment.create({
          patient: patientProfile._id, doctor: emeka._id,
          scheduledDate: c2, startTime: '09:00', endTime: '09:30',
          status: 'completed', type: 'video',
          symptoms: 'Recurring breakouts on jawline and forehead, worse the past few weeks.',
          diagnosis: 'Acne vulgaris (moderate)',
        });
        await Prescription.create({
          appointment: apt2._id, doctor: emeka._id, patient: patientProfile._id,
          diagnosis: 'Acne vulgaris',
          medications: [
            { name: 'Adapalene 0.1% gel', dosage: 'Pea-sized', frequency: 'At bedtime', duration: '60 days', instructions: 'Start every other night, then nightly. Use moisturizer.' },
            { name: 'Benzoyl peroxide 4% wash', dosage: 'Daily', frequency: 'Morning', duration: '60 days', instructions: 'Rinse off after 1-2 minutes.' },
          ],
          status: 'active', validUntil: daysFromNow(22),
        });
        await Payment.create({ appointment: apt2._id, patient: patientProfile._id, doctor: emeka._id, amount: 12000, currency: 'ngn', status: 'completed', method: 'ussd', reference: 'PSK-DEMO-0002', paidAt: c2 });

        // Neurology consult
        const c3 = daysFromNow(-60); c3.setHours(14, 0, 0, 0);
        const apt3 = await Appointment.create({
          patient: patientProfile._id, doctor: seun._id,
          scheduledDate: c3, startTime: '14:00', endTime: '14:30',
          status: 'completed', type: 'video',
          symptoms: 'Getting a headache every few days, often behind the eyes. Triggers seem to be screens and skipped meals.',
          diagnosis: 'Migraine without aura',
        });
        await Prescription.create({
          appointment: apt3._id, doctor: seun._id, patient: patientProfile._id,
          diagnosis: 'Migraine without aura',
          medications: [
            { name: 'Sumatriptan', dosage: '50 mg', frequency: 'As needed (max 2/week)', duration: '30 days', instructions: 'Take at first sign of migraine. Do not exceed 2 tablets per week.' },
            { name: 'Vitamin B2 (riboflavin)', dosage: '400 mg', frequency: 'Once daily', duration: '90 days', instructions: 'Preventive. Takes 6-8 weeks to help.' },
          ],
          status: 'active', validUntil: daysFromNow(28),
        });
        await Payment.create({ appointment: apt3._id, patient: patientProfile._id, doctor: seun._id, amount: 30000, currency: 'ngn', status: 'completed', method: 'bank_transfer', reference: 'PSK-DEMO-0003', paidAt: c3 });
        await MedicalRecord.create({
          patient: patientProfile._id, doctor: seun._id, appointment: apt3._id,
          title: 'Neurology consult — migraine management',
          description: 'Migraine workup. No red flags on history. Started preventive riboflavin; sumatriptan for attacks as needed.',
          type: 'consultation', tags: ['neurology', 'migraine'],
        });
        await MedicalRecord.create({
          patient: patientProfile._id,
          title: 'Lab work — annual panel',
          description: 'CBC, lipid panel, HbA1c. All within normal limits. LDL 2.6 mmol/L.',
          type: 'lab_report', tags: ['lab', 'cholesterol'],
        });
        await MedicalRecord.create({
          patient: patientProfile._id,
          title: 'Yellow Fever vaccination',
          description: 'Yellow fever vaccine (17D) administered at government-approved centre. Certificate valid for life.',
          type: 'vaccination', tags: ['vaccination', 'travel'],
        });

        await Review.create({
          doctor: sarah._id, patient: patientProfile._id, appointment: apt1._id,
          rating: 5, comment: 'Follow-up felt personal, not rushed. She remembered my case from the last visit which never happens elsewhere.',
        });

        // Welcome notifications
        await Notification.create({
          user: patient._id,
          title: 'Welcome to TeleMedicine Rouge',
          message: 'Complete your health profile (blood type, allergies, HMO) so doctors can serve you faster.',
          type: 'general',
          link: '/patient/profile',
        });
        await Notification.create({
          user: patient._id,
          title: 'Upcoming appointment',
          message: 'You have a cardiology follow-up confirmed for your next visit day. A reminder will be sent 24 hours before.',
          type: 'appointment',
          link: '/patient/appointments',
        });
        console.log('Created demo patient history (appointments, prescriptions, payments, records, notifications)');
      }
    }

    console.log('Done. Demo login → emeka.okafor@telemedicine.com / patient123 · sarah.adeyemi@telemedicine.com / doctor123');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('SeedMore failed:', error);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
};

run();