const userModel         = require('../models/userModel');
const eventModel        = require('../models/eventModel');
const registrationModel = require('../models/registrationModel');

// POST /api/register
const register = async (req, res, next) => {
  try {
    const { name, email, phone, college, participant_type, course, eventIds } = req.body;

    // --- Validation ---
    const missing = [];
    if (!name)                              missing.push('name');
    if (!email)                             missing.push('email');
    if (!phone)                             missing.push('phone');
    if (!college)                           missing.push('college');
    if (!participant_type)                  missing.push('participant_type');
    if (!course)                            missing.push('course');
    if (!eventIds || !eventIds.length)      missing.push('eventIds');

    if (missing.length) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(', ')}`,
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ success: false, message: 'Phone must be 10 digits' });
    }

    if (!Array.isArray(eventIds)) {
      return res.status(400).json({ success: false, message: 'eventIds must be an array' });
    }

    // --- Validate all event IDs exist ---
    const eventChecks = await Promise.all(eventIds.map((id) => eventModel.findById(id)));
    const invalidEvent = eventChecks.findIndex((e) => !e);
    if (invalidEvent !== -1) {
      return res.status(400).json({
        success: false,
        message: `Invalid event ID: ${eventIds[invalidEvent]}`,
      });
    }

    // --- Upsert user (same email = same user) ---
    let user = await userModel.findByEmail(email);
    if (!user) {
      user = await userModel.create({ name, email, phone, college, participant_type, course });
    }

    // --- Create registrations ---
    const registrations = await Promise.all(
      eventIds.map((eventId) => registrationModel.create(user.id, eventId))
    );

    // Filter out nulls (duplicate registrations silently skipped)
    const created = registrations.filter(Boolean);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user,
        registrations: created,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/registrations
const getRegistrations = async (req, res, next) => {
  try {
    const registrations = await registrationModel.findAll();
    res.json({ success: true, data: registrations });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, getRegistrations };
