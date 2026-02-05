const cron = require('node-cron');
const Booking = require('./models/Booking'); // Adjust path if needed

// Function to update expired bookings
const updateExpiredBookings = async () => {
  try {
    const now = new Date();
    const expiredBookings = await Booking.find({
      status: "CONFIRMED"
    });

    for (const booking of expiredBookings) {
      // Combine date and totime into a full DateTime (e.g., "2023-10-01T12:30:00")
      const [hours, minutes] = booking.totime.split(':').map(Number);
      const bookingEndTime = new Date(booking.date);
      bookingEndTime.setHours(hours, minutes, 0, 0); // Set time to totime

      // Check if current time is past the booking's end time
      if (now > bookingEndTime) {
        await Booking.findByIdAndUpdate(booking._id, { status: "EXPIRED" });
        console.log(`Updated booking ${booking._id} to EXPIRED`); // For debugging
      }
    }

    // Optional: Log if any were updated (you can remove if not needed)
    const updatedCount = expiredBookings.filter(b => {
      const [hours, minutes] = b.totime.split(':').map(Number);
      const bookingEndTime = new Date(b.date);
      bookingEndTime.setHours(hours, minutes, 0, 0);
      return now > bookingEndTime;
    }).length;

    if (updatedCount > 0) {
      console.log(`Updated ${updatedCount} expired bookings`);
    }
  } catch (err) {
    console.error('Error updating expired bookings:', err);
  }
};

// Run every minute (change '* * * * *' to '*/5 * * * *' for every 5 minutes)
cron.schedule('* * * * *', updateExpiredBookings);

console.log('Cron job for expired bookings started');

module.exports = { updateExpiredBookings };