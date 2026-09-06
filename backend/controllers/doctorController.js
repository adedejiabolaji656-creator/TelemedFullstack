const DoctorProfile = require('../models/DoctorProfile');
const User = require('../models/User');
const Availability = require('../models/Availability');
const Review = require('../models/Review');
const cloudinary = require('../config/cloudinary');

// @desc    Get all verified doctors
// @route   GET /api/doctors
// @access  Public
exports.getDoctors = async (req, res) => {
  try {
    const { specialization, search, page = 1, limit = 10 } = req.query;

    const query = {
      verificationStatus: 'verified',
      isAvailable: true,
    };

    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }

    if (search) {
      const users = await User.find({
        name: { $regex: search, $options: 'i' },
        role: 'doctor',
      }).select('_id');
      query.$or = [
        { user: { $in: users.map((u) => u._id) } },
        { specialization: { $regex: search, $options: 'i' } },
      ];
    }

    const doctors = await DoctorProfile.find(query)
      .populate('user', 'name email avatar phone')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await DoctorProfile.countDocuments(query);

    res.status(200).json({
      success: true,
      count: doctors.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      doctors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get distinct specializations of verified doctors
// @route   GET /api/doctors/specializations
// @access  Public
exports.getSpecializations = async (req, res) => {
  try {
    const specializations = await DoctorProfile.distinct('specialization', {
      verificationStatus: 'verified',
      isAvailable: true,
    });

    const normalized = specializations
      .filter((s) => s && s.trim())
      .map((s) => s.trim())
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

    res.status(200).json({
      success: true,
      specializations: normalized,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single doctor
// @route   GET /api/doctors/:id
// @access  Public
exports.getDoctor = async (req, res) => {
  try {
    const doctor = await DoctorProfile.findById(req.params.id)
      .populate('user', 'name email avatar phone createdAt');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    // Get availability
    const availability = await Availability.find({
      doctor: doctor._id,
      isBooked: false,
    }).sort({ dayOfWeek: 1, startTime: 1 });

    // Get reviews
    const reviews = await Review.find({ doctor: doctor._id, isVisible: true })
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'name avatar' },
      })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      doctor: {
        ...doctor.toObject(),
        availability,
        reviews,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get doctor availability
// @route   GET /api/doctors/:id/availability
// @access  Public
exports.getAvailability = async (req, res) => {
  try {
    const slots = await Availability.find({
      doctor: req.params.id,
      isBooked: false,
    }).sort({ dayOfWeek: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      slots,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Add availability slots
// @route   POST /api/doctors/availability
// @access  Private (Doctor)
exports.addAvailability = async (req, res) => {
  try {
    const doctor = await DoctorProfile.findOne({ user: req.user.id });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found',
      });
    }

    const { slots } = req.body;

    if (!Array.isArray(slots) || slots.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one slot',
      });
    }

    const existingSlots = await Availability.find({ doctor: doctor._id }).select('dayOfWeek startTime isRecurring specificDate');
    const existingKeys = new Set(
      existingSlots.map((s) =>
        s.isRecurring
          ? `r-${s.dayOfWeek}-${s.startTime}`
          : `s-${new Date(s.specificDate).toISOString().slice(0, 10)}-${s.startTime}`
      )
    );

    const availabilitySlots = [];
    for (const slot of slots) {
      const key = slot.specificDate
        ? `s-${new Date(slot.specificDate).toISOString().slice(0, 10)}-${slot.startTime}`
        : `r-${slot.dayOfWeek}-${slot.startTime}`;

      if (existingKeys.has(key)) continue;
      if (!slot.endTime || slot.startTime >= slot.endTime) {
        return res.status(400).json({
          success: false,
          message: `Invalid time range for slot ${slot.dayOfWeek} ${slot.startTime}`,
        });
      }
      existingKeys.add(key);

      availabilitySlots.push({
        doctor: doctor._id,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isRecurring: slot.isRecurring !== undefined ? slot.isRecurring : !slot.specificDate,
        specificDate: slot.specificDate || null,
      });
    }

    if (availabilitySlots.length > 0) {
      await Availability.insertMany(availabilitySlots);
    }

    res.status(201).json({
      success: true,
      message: `${availabilitySlots.length} availability slot(s) added successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete availability slot
// @route   DELETE /api/doctors/availability/:id
// @access  Private (Doctor)
exports.deleteAvailability = async (req, res) => {
  try {
    const doctor = await DoctorProfile.findOne({ user: req.user.id });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found',
      });
    }

    const slot = await Availability.findOne({
      _id: req.params.id,
      doctor: doctor._id,
    });

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Slot not found',
      });
    }

    await slot.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Slot deleted',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Upload verification documents
// @route   POST /api/doctors/documents
// @access  Private (Doctor)
exports.uploadDocuments = async (req, res) => {
  try {
    const doctor = await DoctorProfile.findOne({ user: req.user.id });

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file',
      });
    }

    // Upload to Cloudinary (from memory buffer; disk storage is ephemeral on serverless)
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'doctor_documents' },
        (error, uploadResult) => {
          if (error) return reject(error);
          resolve(uploadResult);
        }
      );
      stream.end(req.file.buffer);
    });

    doctor.documents.push({
      type: req.body.documentType,
      url: result.secure_url,
      fileName: req.file.originalname,
    });

    // If all required docs uploaded, set to under_review
    const requiredDocs = ['medical_license', 'board_certification', 'degree', 'id_proof'];
    const uploadedTypes = doctor.documents.map((d) => d.type);
    const hasAllDocs = requiredDocs.every((type) => uploadedTypes.includes(type));

    if (hasAllDocs && doctor.verificationStatus === 'pending') {
      doctor.verificationStatus = 'under_review';
    }

    await doctor.save();

    res.status(200).json({
      success: true,
      documents: doctor.documents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get my doctor profile
// @route   GET /api/doctors/me
// @access  Private (Doctor)
exports.getMyProfile = async (req, res) => {
  try {
    const doctor = await DoctorProfile.findOne({ user: req.user.id })
      .populate('user', 'name email avatar phone');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found',
      });
    }

    res.status(200).json({
      success: true,
      doctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
