const jwt = require('jsonwebtoken');
const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const DoctorProfile = require('../models/DoctorProfile');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

const attachProfile = async (user) => {
  const result = user.toObject ? user.toObject() : user;
  if (result.role === 'patient') {
    result.profile = await PatientProfile.findOne({ user: result._id });
  } else if (result.role === 'doctor') {
    result.profile = await DoctorProfile.findOne({ user: result._id });
  }
  return result;
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role, specialization, licenseNumber } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password',
      });
    }

    // Doctor-specific validation happens before any DB writes
    const selectedRole = role || 'patient';
    if (selectedRole === 'doctor' && (!specialization || !licenseNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Specialization and license number are required for doctors',
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: selectedRole,
    });

    // Create role-specific profile
    try {
      if (user.role === 'patient') {
        await PatientProfile.create({ user: user._id });
      } else if (user.role === 'doctor') {
        await DoctorProfile.create({
          user: user._id,
          specialization,
          licenseNumber,
        });
      }
    } catch (profileError) {
      // Roll back the user so a failed profile doesn't leave a broken account
      await User.findByIdAndDelete(user._id);
      throw profileError;
    }

    const token = generateToken(user._id);
    const fullUser = await attachProfile(user);

    res.status(201).json({
      success: true,
      token,
      user: fullUser,
    });
  } catch (error) {
    console.error('Register error:', error);
    const message =
      error.name === 'ValidationError' || error.code === 11000
        ? error.message
        : error.message || 'Registration failed. Please try again.';
    res.status(400).json({
      success: false,
      message,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const token = generateToken(user._id);
    const fullUser = await attachProfile(user);

    res.status(200).json({
      success: true,
      token,
      user: fullUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const fullUser = await attachProfile(user);

    res.status(200).json({
      success: true,
      user: fullUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, avatar },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update patient profile
// @route   PUT /api/auth/patient-profile
// @access  Private (Patient)
exports.updatePatientProfile = async (req, res) => {
  try {
    const profile = await PatientProfile.findOneAndUpdate(
      { user: req.user.id },
      req.body,
      { new: true, runValidators: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update doctor profile
// @route   PUT /api/auth/doctor-profile
// @access  Private (Doctor)
exports.updateDoctorProfile = async (req, res) => {
  try {
    const profile = await DoctorProfile.findOneAndUpdate(
      { user: req.user.id },
      req.body,
      { new: true, runValidators: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
