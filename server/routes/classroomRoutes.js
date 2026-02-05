const express = require("express");
const Classroom = require("../models/Classroom");
const Booking = require("../models/Booking");
const WaitingList = require("../models/WaitingList");
const jwt = require("jsonwebtoken");

const router = express.Router();
const SECRET = process.env.JWT_SECRET;

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

/* -------- GET CLASSROOMS -------- */
router.get("/classrooms", verifyToken, async (req, res) => {
  try {
    const rooms = await Classroom.find();
    const bookings = await Booking.find();
    const waitingLists = await WaitingList.find();

    const roomsWithStatus = rooms.map(room => {
      const isBooked = bookings.some(b => b.classroomId.toString() === room._id.toString());
      const hasWaitingList = waitingLists.some(w => w.classroomId.toString() === room._id.toString());
      let status = "Available";
      if (isBooked) status = "Not Available";
      if (hasWaitingList) status = "Waiting List";
      return { ...room.toObject(), status };
    });
    res.json(roomsWithStatus);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* -------- BOOK CLASSROOM -------- */
router.post("/book", verifyToken, async (req, res) => {
  try {
    const { classroomId, staffName, staffId, date, time, purpose, strength } = req.body;
    const userId = req.userId;

    const room = await Classroom.findById(classroomId);
    if (!room) return res.status(404).json({ message: "Classroom not found" });

    const existingBooking = await Booking.findOne({ classroomId });
    if (existingBooking) {
      // Add to waiting list
      await WaitingList.create({ userId, classroomId, staffName, staffId, date, time, purpose, strength });
      return res.json({ message: "Added to waiting list", waiting: true });
    }

    // Book directly
    await Classroom.findByIdAndUpdate(classroomId, { isAvailable: false });
    await Booking.create({ userId, classroomId, staffName, staffId, date, time, purpose, strength });
    res.json({ message: "Booked successfully", waiting: false });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* -------- CANCEL BOOKING -------- */
router.delete("/cancel/:id", verifyToken, async (req, res) => {
  try {
    const classroomId = req.params.id;
    const userId = req.userId;

    const booking = await Booking.findOneAndDelete({ classroomId, userId });
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Check waiting list and assign next
    const nextInLine = await WaitingList.findOneAndDelete({ classroomId }).sort({ createdAt: 1 });
    if (nextInLine) {
      await Booking.create({
        userId: nextInLine.userId,
        classroomId,
        staffName: nextInLine.staffName,
        staffId: nextInLine.staffId,
        date: nextInLine.date,
        time: nextInLine.time,
        purpose: nextInLine.purpose,
        strength: nextInLine.strength
      });
    } else {
      await Classroom.findByIdAndUpdate(classroomId, { isAvailable: true });
    }

    res.json({ message: "Booking cancelled" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* -------- MY BOOKINGS -------- */
router.get("/my-bookings", verifyToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.userId }).populate("classroomId");
    res.json(bookings.map(b => ({
      _id: b._id,
      classroomId: b.classroomId._id,
      classroomName: b.classroomId.name,
      staffName: b.staffName,
      staffId: b.staffId,
      date: b.date,
      time: b.time,
      purpose: b.purpose,
      strength: b.strength
    })));
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;