const eventModel = require('../models/eventModel');

const getEvents = async (req, res, next) => {
  try {
    const events = await eventModel.findAll();
    res.json({ success: true, data: events });
  } catch (err) {
    next(err);
  }
};

module.exports = { getEvents };
