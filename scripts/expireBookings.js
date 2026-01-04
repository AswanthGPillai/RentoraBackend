require("dotenv").config();
const mongoose = require("mongoose");
const Booking = require("../models/bookingModel");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

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

    console.log(`✅ Expired bookings updated: ${result.modifiedCount}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Booking cron error:", error);
    process.exit(1);
  }
})();
