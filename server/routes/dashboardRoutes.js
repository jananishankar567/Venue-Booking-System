const express = require("express");
const router = express.Router();
const Classroom = require("../models/Classroom");
const Booking = require("../models/Booking");
const auth = require("../middleware/authMiddleware");

router.get("/classrooms", auth, async (req, res) => {
  const rooms = await Classroom.find();
  const bookings = await Booking.find({ status: "CONFIRMED" });

  const data = rooms.map(r => {
    const booked = bookings.some(b => b.classroomId.toString() === r._id.toString());
    return { ...r.toObject(), status: booked ? "Not Available" : "Available" };
  });

  res.json(data);
});

module.exports = router;