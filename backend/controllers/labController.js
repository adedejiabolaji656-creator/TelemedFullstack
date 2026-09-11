const LabOrder = require('../models/LabOrder');
const MedicalRecord = require('../models/MedicalRecord');
const Appointment = require('../models/Appointment');
const DoctorProfile = require('../models/DoctorProfile');
const PatientProfile = require('../models/PatientProfile');
const Notification = require('../models/Notification');

// Demo helper: simulate a pathology lab reporting values for requested tests.
// A real deployment would replace this with lab partner integrations.
const simulateResults = (tests) => {
  const samples = {
    'Malaria (RDT)': { result: 'Positive', unit: '', referenceRange: 'Negative' },
    'Blood Group': { result: 'O+', unit: '', referenceRange: '—' },
    'Genotype': { result: 'AA', unit: '', referenceRange: 'AA/AS/SS' },
    'Full Blood Count (FBC)': { result: '5.2', unit: 'x10^9/L', referenceRange: '4.0 - 11.0' },
    'Haemoglobin (Hb)': { result: '13.8', unit: 'g/dL', referenceRange: '12.0 - 17.5' },
    'Random Blood Sugar': { result: '5.1', unit: 'mmol/L', referenceRange: '3.9 - 7.8' },
    'Fasting Blood Sugar': { result: '4.8', unit: 'mmol/L', referenceRange: '3.9 - 6.1' },
    'Hepatitis B Surface Antigen': { result: 'Negative', unit: '', referenceRange: 'Negative' },
    'HIV Screening': { result: 'Negative', unit: '', referenceRange: 'Negative' },
    'Syphilis (RPR)': { result: 'Non-reactive', unit: '', referenceRange: 'Non-reactive' },
    'Widal Test': { result: '1:80', unit: 'titre', referenceRange: '<1:160' },
    'Urinalysis': { result: 'Clear', unit: '', referenceRange: 'Clear' },
    'Lipid Profile': { result: '4.2', unit: 'mmol/L', referenceRange: '<5.2' },
    'Thyroid Function (TSH)': { result: '2.1', unit: 'mIU/L', referenceRange: '0.4 - 4.0' },
  };
  return (tests || []).map((test) => {
    const base = samples[test] || {
      result: 'Normal',
      unit: '',
      referenceRange: 'Normal',
    };
    return {
      test,
      result: base.result,
      unit: base.unit,
      referenceRange: base.referenceRange,
      flag: '',
    };
  });
};

// @desc    Get lab orders for current user
// @route   GET /api/labs
// @access  Private
exports.getLabOrders = async (req, res) => {
  try {
    let query = {};
    const { status } = req.query;

    if (req.user.role === 'patient') {
      const patient = await PatientProfile.findOne({ user: req.user.id });
      query.patient = patient ? patient._id : null;
    } else if (req.user.role === 'doctor') {
      const doctor = await DoctorProfile.findOne({ user: req.user.id });
      query.doctor = doctor ? doctor._id : null;
    }
    if (status) query.status = status;

    const labOrders = await LabOrder.find(query)
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'name avatar phone' },
      })
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name avatar' },
      })
      .populate('appointment', 'scheduledDate startTime')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: labOrders.length, labOrders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Doctor requests lab tests during/after a consultation
// @route   POST /api/labs
// @access  Private (Doctor)
exports.createLabRequest = async (req, res) => {
  try {
    const { appointmentId, panelName, tests, reason, notes, amount } = req.body;

    const doctor = await DoctorProfile.findOne({ user: req.user.id });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment || appointment.doctor.toString() !== doctor._id.toString()) {
      return res.status(400).json({ success: false, message: 'Invalid appointment' });
    }

    if (!tests || !Array.isArray(tests) || tests.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: 'At least one test is required' });
    }

    const labOrder = await LabOrder.create({
      patient: appointment.patient,
      doctor: doctor._id,
      appointment: appointment._id,
      panelName: panelName || tests.join(', '),
      tests,
      reason,
      notes,
      amount: amount || 5000,
    });

    const patientProfile = await PatientProfile.findById(appointment.patient);
    if (patientProfile) {
      await Notification.create({
        user: patientProfile.user,
        title: 'Lab Test Requested',
        message: `Dr. ${req.user.name} has requested ${tests.length} test(s) — ${labOrder.panelName}`,
        type: 'medical_record',
        link: `/patient/labs`,
      });
    }

    res.status(201).json({ success: true, labOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single lab order (with auth check)
// @route   GET /api/labs/:id
// @access  Private
exports.getLabOrder = async (req, res) => {
  try {
    const labOrder = await LabOrder.findById(req.params.id)
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'name avatar phone' },
      })
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name avatar' },
      })
      .populate('appointment', 'scheduledDate startTime endTime');

    if (!labOrder) {
      return res.status(404).json({ success: false, message: 'Lab order not found' });
    }

    const patient = await PatientProfile.findOne({ user: req.user.id });
    const doctor = await DoctorProfile.findOne({ user: req.user.id });
    const isPatient = patient && labOrder.patient.toString() === patient._id.toString();
    const isDoctor = doctor && labOrder.doctor.toString() === doctor._id.toString();

    if (!isPatient && !isDoctor && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, labOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Patient books a partner lab and pays (demo gateway)
// @route   POST /api/labs/:id/book
// @access  Private (Patient)
exports.bookLab = async (req, res) => {
  try {
    const { lab } = req.body;

    const labOrder = await LabOrder.findById(req.params.id);
    if (!labOrder) {
      return res.status(404).json({ success: false, message: 'Lab order not found' });
    }

    const patient = await PatientProfile.findOne({ user: req.user.id });
    if (!patient || labOrder.patient.toString() !== patient._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (labOrder.status !== 'requested') {
      return res.status(400).json({ success: false, message: 'Lab order already booked' });
    }

    labOrder.lab = lab;
    labOrder.status = 'ordered';
    labOrder.paymentStatus = 'paid';
    await labOrder.save();

    res.status(200).json({ success: true, labOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Demo: lab collects the patient's sample
// @route   POST /api/labs/:id/sample
// @access  Private (Patient - demo)
exports.collectSample = async (req, res) => {
  try {
    const labOrder = await LabOrder.findById(req.params.id);
    if (!labOrder) {
      return res.status(404).json({ success: false, message: 'Lab order not found' });
    }

    const patient = await PatientProfile.findOne({ user: req.user.id });
    const doctor = await DoctorProfile.findOne({ user: req.user.id });
    const isPatient = patient && labOrder.patient.toString() === patient._id.toString();
    const isDoctor = doctor && labOrder.doctor.toString() === doctor._id.toString();

    if (!isPatient && !isDoctor && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (labOrder.status !== 'ordered') {
      return res.status(400).json({ success: false, message: 'Sample can only be marked after booking' });
    }

    labOrder.status = 'sample_collected';
    await labOrder.save();

    res.status(200).json({ success: true, labOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Demo: lab uploads results (simulated) — creates medical record + notifies
// @route   POST /api/labs/:id/results
// @access  Private (Patient/Doctor - demo mode)
exports.addLabResults = async (req, res) => {
  try {
    const labOrder = await LabOrder.findById(req.params.id);
    if (!labOrder) {
      return res.status(404).json({ success: false, message: 'Lab order not found' });
    }

    const patient = await PatientProfile.findOne({ user: req.user.id });
    const doctor = await DoctorProfile.findOne({ user: req.user.id });
    const isPatient = patient && labOrder.patient.toString() === patient._id.toString();
    const isDoctor = doctor && labOrder.doctor.toString() === doctor._id.toString();

    if (!isPatient && !isDoctor && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (labOrder.status === 'results_ready' || labOrder.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Results already uploaded' });
    }

    const results = simulateResults(labOrder.tests);
    labOrder.results = results;
    labOrder.resultsSummary =
      `Sample collected at ${labOrder.lab && labOrder.lab.name ? labOrder.lab.name : 'the lab'}` +
      ` and analysed. ${results.length} parameter(s) reported on ${new Date().toISOString().slice(0, 10)}.`;
    labOrder.resultDate = new Date();
    labOrder.status = 'results_ready';
    await labOrder.save();

    // Attach to the patient's medical record
    await MedicalRecord.create({
      patient: labOrder.patient,
      doctor: labOrder.doctor,
      appointment: labOrder.appointment,
      title: labOrder.panelName || 'Lab Results',
      description: labOrder.resultsSummary,
      type: 'lab_report',
      tags: [...labOrder.tests],
    });

    // Notify patient + doctor
    const patientProfile = await PatientProfile.findById(labOrder.patient);
    if (patientProfile) {
      await Notification.create({
        user: patientProfile.user,
        title: 'Lab Results Ready',
        message: `Your ${labOrder.panelName} results are now available`,
        type: 'medical_record',
        link: `/patient/labs/${labOrder._id}`,
      });
    }
    if (doctor) {
      await Notification.create({
        user: doctor.user,
        title: 'Lab Results Available',
        message: `${labOrder.panelName} results are ready for review`,
        type: 'medical_record',
        link: `/doctor/labs/${labOrder._id}`,
      });
    }

    res.status(200).json({ success: true, labOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};