require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const { updateExpiredBookings } = require('./cronJobs');
const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"));

app.use("/", authRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", bookingRoutes);

app.listen(process.env.PORT||4000,()=>{
  console.log("server running on "+(process.env.PORT || 4000));
  updateExpiredBookings(); //start the cron job
});
