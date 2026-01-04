const cron = require("node-cron");
const Booking = require("../models/bookingModel");

// Runs every day at midnight
cron.schedule("0 0 * * *", async () => {
  try {
    const now = new Date();

    const result = await Booking.updateMany(
      {
        endDate: { $lt: now },
        status: "Active",
      },
      {
        $set: { status: "Expired" },
      }
    );

    console.log(`Expired bookings updated: ${result.modifiedCount}`);
  } catch (error) {
    console.error("Booking cron error:", error.message);
  }
});
