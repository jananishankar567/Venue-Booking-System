const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const Classroom = require("../models/Classroom");
const auth = require("../middleware/authMiddleware");

/* ================= BOOK ================= */
router.post("/book", auth, async (req, res) => {
  const { classroomId, date, fromtime, totime } = req.body;

  const conflict = await Booking.findOne({
    classroomId,
    date,
    fromtime,
    totime,
    status: "CONFIRMED"
  });

  const status = conflict ? "WAITING" : "CONFIRMED";

  await Booking.create({
    ...req.body,
    userId: req.userId,
    status
  });

  res.json({ waiting: status === "WAITING" });
});

/* ================= MY BOOKINGS ================= */
router.get("/my-bookings", auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.userId })
      .populate("classroomId");

    const result = bookings.map(b => ({
      _id: b._id,
      classroomId: b.classroomId._id,
      classroomName: b.classroomId.name,
      date: b.date,
      fromtime: b.fromtime,
      totime: b.totime,
      strength: b.strength,
      purpose: b.purpose,
      status: b.status  // Shows the actual status (CONFIRMED, WAITING, etc.)
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= CANCEL ================= */
router.delete("/cancel/:id", auth, async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.userId;

    const cancelled = await Booking.findOneAndDelete({ _id: bookingId, userId });

    if (!cancelled) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Promote waiting list if needed
    if (cancelled.status === "CONFIRMED") {
      const next = await Booking.findOne({
        classroomId: cancelled.classroomId,
        date: cancelled.date,
        fromtime: cancelled.fromtime,
        totime: cancelled.totime,
        status: "WAITING"
      }).sort({ createdAt: 1 });

      if (next) {
        next.status = "CONFIRMED";
        await next.save();
      }
    }

    res.json({ message: "Cancelled" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;