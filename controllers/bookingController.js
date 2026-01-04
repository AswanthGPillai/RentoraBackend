const Booking = require("../models/bookingModel");
const Room = require("../models/roomModel");
const User = require("../models/userModel"); // ✅ FIXED
const sendEmail = require("../utils/sentEmail");

/* =========================
   CREATE BOOKING (USER)
   JWT REQUIRED
========================= */
exports.createBooking = async (req, res) => {
  try {
    const { roomId, startDate } = req.body;
    const userId = req.userId;

    if (!roomId || !startDate) {
      return res.status(400).json({ message: "roomId and startDate are required" });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (room.status !== "Available") {
      return res.status(400).json({ message: "Room is not available for booking" });
    }

    const start = new Date(startDate);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    const booking = await Booking.create({
      userId,
      roomId,
      startDate: start,
      endDate: end,
      status: "Active",
    });

    room.status = "Booked";
    await room.save();

    const user = await User.findById(userId);
    
    if (user?.email) {
      // White & Gold Luxury Template
      const emailHtml = `
        <div style="background-color: #FDFCFB; padding: 40px 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1A1A1A;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #F2EDE4; border-radius: 24px; overflow: hidden; shadow: 0 10px 30px rgba(0,0,0,0.05);">
            
            <div style="background-color: #1A1A1A; padding: 40px; text-align: center;">
              <h2 style="color: #C5A059; margin: 0; text-transform: uppercase; letter-spacing: 4px; font-size: 14px; font-weight: 900;">Reservation Confirmed</h2>
              <h1 style="color: #ffffff; margin: 10px 0 0 0; font-size: 28px; font-weight: 300; letter-spacing: -1px;">Welcome Home, ${user.username}</h1>
            </div>

            <div style="padding: 40px;">
              <p style="font-size: 16px; line-height: 1.6; color: #666; text-align: center; margin-bottom: 30px;">
                Your lease has been successfully registered in our ledger. We have prepared your residence for your arrival.
              </p>

              <div style="background-color: #FDF9F0; border-radius: 16px; padding: 25px; border: 1px solid #F2EDE4; margin-bottom: 30px;">
                <div style="text-align: center; margin-bottom: 20px;">
                   <span style="font-size: 10px; font-weight: 900; color: #B48A30; text-transform: uppercase; letter-spacing: 2px;">Property Details</span>
                </div>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #F2EDE4;">
                      <span style="font-size: 12px; color: #999; text-transform: uppercase;">Room Number</span><br/>
                      <strong style="font-size: 16px; color: #1A1A1A;"># ${room.houseNumber}</strong>
                    </td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #F2EDE4; text-align: right;">
                      <span style="font-size: 12px; color: #999; text-transform: uppercase;">Location</span><br/>
                      <strong style="font-size: 16px; color: #1A1A1A;">${room.location}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 20px 0 10px 0;">
                      <span style="font-size: 12px; color: #999; text-transform: uppercase;">Lease Start</span><br/>
                      <strong style="font-size: 14px; color: #1A1A1A;">${start.toLocaleDateString('en-GB')}</strong>
                    </td>
                    <td style="padding: 20px 0 10px 0; text-align: right;">
                      <span style="font-size: 12px; color: #999; text-transform: uppercase;">Monthly Rent</span><br/>
                      <strong style="font-size: 20px; color: #C5A059;">₹${room.price}</strong>
                    </td>
                  </tr>
                </table>
              </div>

              <div style="text-align: center;">
                <a href="${process.env.CLIENT_URL}/rent" style="background-color: #1A1A1A; color: #C5A059; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; display: inline-block;">View In Ledger</a>
              </div>
            </div>

            <div style="background-color: #FDFCFB; padding: 30px; border-top: 1px solid #F2EDE4; text-align: center;">
              <p style="font-size: 12px; color: #B48A30; font-weight: bold; letter-spacing: 3px; margin: 0 0 10px 0;">RENTORA ADMINISTRATIVE OFFICE</p>
              <p style="font-size: 11px; color: #999; margin: 0;">This is an automated confirmation of your legal lease agreement.</p>
            </div>
          </div>
        </div>
      `;

      await sendEmail({
        to: user.email,
        subject: "🏠 Lease Confirmation - Room " + room.houseNumber,
        html: emailHtml,
      });
    }

    return res.status(201).json({
      message: "Room booked successfully",
      booking,
    });

  } catch (error) {
    console.error("Create booking error:", error);
    return res.status(500).json({
      message: "Failed to create booking",
      error: error.message,
    });
  }
};

/* =========================
   GET MY BOOKINGS (USER)
   JWT REQUIRED
========================= */
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.userId })
      .populate(
        "roomId",
        "houseNumber location address propertyType price imageUrl"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json(bookings);
  } catch (error) {
    console.error("Get my bookings error:", error);
    return res.status(500).json({
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
};

/* =========================
   GET ALL BOOKINGS (ADMIN)
   ADMIN ONLY
========================= */
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("userId", "username email")
      .populate(
        "roomId",
        "houseNumber location address propertyType price imageUrl"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json(bookings);
  } catch (error) {
    console.error("Get all bookings error:", error);
    return res.status(500).json({
      message: "Failed to fetch all bookings",
      error: error.message,
    });
  }
};

/* =========================
   CANCEL BOOKING (USER)
   JWT REQUIRED
========================= */
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    // 🔐 Ownership check
    if (booking.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        message: "You are not allowed to cancel this booking",
      });
    }

    // 🔄 Update booking status
    booking.status = "Cancelled";
    await booking.save();

    // ♻️ Restore room availability
    await Room.findByIdAndUpdate(booking.roomId, {
      status: "Available",
    });

    return res.status(200).json({
      message: "Booking cancelled successfully. History preserved.",
    });

  } catch (error) {
    console.error("Cancel booking error:", error);
    return res.status(500).json({
      message: "Failed to cancel booking",
      error: error.message,
    });
  }
};
