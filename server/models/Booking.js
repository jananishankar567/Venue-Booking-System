const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  classroomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Classroom",
    required: true
  },
  staffName: String,
  staffId: String,
  date: Date,
  fromtime: String,
  totime: String,
  purpose: String,
  strength: Number,
  status: {
    type: String,
    enum: ["CONFIRMED", "WAITING"],
    default: "CONFIRMED"
  }
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);
