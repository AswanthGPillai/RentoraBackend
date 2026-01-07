const mongoose = require("mongoose");
const Booking = require("../models/bookingModel");
const Room = require("../models/roomModel");
const User = require("../models/userModel");
const sendEmail = require("../utils/sentEmail");

/* =========================
   CREATE BOOKING (USER) 
========================= */
exports.createBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { roomId, startDate } = req.body;
    const userId = req.userId;

    if (!userId) return res.status(401).json({ message: "Unauthorized: Invalid token" });
    if (!roomId || !startDate) return res.status(400).json({ message: "roomId and startDate are required" });

    const start = new Date(startDate);
    const room = await Room.findById(roomId).session(session);
    
    if (!room || room.status !== "Available") {
      await session.abortTransaction();
      return res.status(400).json({ message: "Room not available" });
    }

    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    const [booking] = await Booking.create([{
      userId, roomId, startDate: start, endDate: end, status: "Active",
    }], { session });

    room.status = "Booked";
    await room.save({ session });

    await session.commitTransaction();
    session.endSession();

    // --- STYLISH EMAIL SECTION ---
    const user = await User.findById(userId);
    if (user?.email) {
      const emailHtml = `
      <div style="background-color: #f8f9fa; padding: 50px 0; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #333;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
          <tr>
            <td align="center" style="background-color: #1a1a1a; padding: 40px 0;">
              <h1 style="color: #d4af37; margin: 0; font-size: 32px; letter-spacing: 4px; font-weight: 300; text-transform: uppercase;">RENTORA</h1>
              <p style="color: #ffffff; font-size: 10px; letter-spacing: 2px; margin-top: 5px; opacity: 0.7;">PREMIUM LIVING EXPERIENCE</p>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 45px 40px 20px 40px;">
              <h2 style="font-size: 24px; font-weight: 600; margin: 0; color: #1a1a1a;">Reservation Confirmed.</h2>
              <p style="font-size: 16px; line-height: 1.6; color: #666; margin-top: 15px;">
                Hello ${user.username}, <br/>
                Your new residence is ready. We have successfully secured your stay at <b>#${room.houseNumber}</b>. Here are your reservation details:
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 40px;">
              <div style="background-color: #fdfaf0; border: 1px solid #f1e6c9; border-radius: 12px; padding: 30px;">
                <table width="100%" border="0" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding-bottom: 15px;">
                      <span style="font-size: 11px; color: #a38b4d; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">Property</span><br/>
                      <span style="font-size: 16px; font-weight: 600;">${room.propertyType} - Room ${room.houseNumber}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 15px;">
                      <span style="font-size: 11px; color: #a38b4d; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">Location</span><br/>
                      <span style="font-size: 16px; font-weight: 600;">${room.location}</span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <table width="100%" border="0" cellpadding="0" cellspacing="0">
                        <tr>
                          <td width="50%">
                            <span style="font-size: 11px; color: #a38b4d; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">Move-in Date</span><br/>
                            <span style="font-size: 16px; font-weight: 600;">${start.toLocaleDateString("en-GB")}</span>
                          </td>
                          <td width="50%" align="right">
                            <span style="font-size: 11px; color: #a38b4d; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">Monthly Rent</span><br/>
                            <span style="font-size: 20px; font-weight: 700; color: #1a1a1a;">₹${room.price}</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding: 40px;">
              <a href="${process.env.CLIENT_URL}" style="background-color: #1a1a1a; color: #d4af37; padding: 18px 35px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 13px; letter-spacing: 1px; display: inline-block; text-transform: uppercase; border: 1px solid #d4af37;">
                View My Dashboard
              </a>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding-bottom: 40px; border-top: 1px solid #eeeeee;">
              <p style="font-size: 12px; color: #999; margin-top: 30px;">
                Questions? Reply to this email or visit our help center.
              </p>
              <p style="font-size: 11px; color: #bbb; text-transform: uppercase; letter-spacing: 1px;">
                &copy; 2026 RENTORA LUXURY PROPERTIES
              </p>
            </td>
          </tr>
        </table>
      </div>`;

      await sendEmail({
        to: user.email,
        subject: `🏠 Reservation Confirmed: ${room.houseNumber}`,
        html: emailHtml,
      });
    }

    return res.status(201).json({ message: "Room booked successfully", booking });

  } catch (error) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    return res.status(500).json({ message: "Failed to create booking", error: error.message });
  }
};

/* =========================
   GET MY BOOKINGS (USER)
========================= */
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.userId })
      .populate("roomId", "houseNumber location address propertyType price imageUrl")
      .sort({ createdAt: -1 });

    return res.status(200).json(bookings);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch bookings", error: error.message });
  }
};

/* =========================
   GET ALL BOOKINGS (ADMIN)
========================= */
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("userId", "username email")
      .populate("roomId", "houseNumber location address propertyType price imageUrl")
      .sort({ createdAt: -1 });

    return res.status(200).json(bookings);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch all bookings", error: error.message });
  }
};

/* =========================
   CANCEL BOOKING (USER)
========================= */
exports.cancelBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const booking = await Booking.findById(req.params.id).session(session);

    if (!booking) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.userId.toString() !== req.userId.toString()) {
      await session.abortTransaction();
      return res.status(403).json({ message: "Unauthorized cancellation request" });
    }

    // Update status and restore room availability
    booking.status = "Cancelled";
    await booking.save({ session });

    await Room.findByIdAndUpdate(booking.roomId, { status: "Available" }, { session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({ message: "Booking cancelled successfully" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ message: "Failed to cancel booking", error: error.message });
  }
};