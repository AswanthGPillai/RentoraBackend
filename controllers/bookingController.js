const Booking = require("../models/bookingModel");
const Room = require("../models/roomModel");
const User = require("../models/userModel");
const sendEmail = require("../utils/sentEmail");

/* =========================
   CREATE BOOKING (USER)
   JWT REQUIRED
========================= */
exports.createBooking = async (req, res) => {
  try {
    const { roomId, startDate } = req.body;
    const userId = req.userId; // injected by jwtMiddleware

    /* =========================
       AUTH CHECK
    ========================= */
    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized: Invalid or missing token",
      });
    }

    /* =========================
       INPUT VALIDATION
    ========================= */
    if (!roomId || !startDate) {
      return res.status(400).json({
        message: "roomId and startDate are required",
      });
    }

    const start = new Date(startDate);
    if (isNaN(start.getTime())) {
      return res.status(400).json({
        message: "Invalid start date",
      });
    }

    /* =========================
       ROOM CHECK
    ========================= */
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    if (room.status !== "Available") {
      return res.status(400).json({
        message: "Room is not available for booking",
      });
    }

    /* =========================
       END DATE (1 MONTH)
    ========================= */
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    /* =========================
       CREATE BOOKING
    ========================= */
    const booking = await Booking.create({
      userId,
      roomId,
      startDate: start,
      endDate: end,
      status: "Active",
    });

    /* =========================
       UPDATE ROOM STATUS
    ========================= */
    room.status = "Booked";
    await room.save();

    /* =========================
       USER DETAILS
    ========================= */
    const user = await User.findById(userId);

    /* =========================
       EMAIL CONFIRMATION
    ========================= */
    if (user?.email) {
      const emailHtml = `
        <div style="background:#FDFCFB;padding:40px 20px;font-family:Segoe UI,Tahoma,Verdana;color:#1A1A1A">
          <div style="max-width:600px;margin:auto;background:#fff;border:1px solid #F2EDE4;border-radius:24px;overflow:hidden">
            <div style="background:#1A1A1A;padding:40px;text-align:center">
              <h2 style="color:#C5A059;letter-spacing:4px;font-size:14px;margin:0">
                RESERVATION CONFIRMED
              </h2>
              <h1 style="color:#fff;font-weight:300;margin-top:10px">
                Welcome Home, ${user.username}
              </h1>
            </div>

            <div style="padding:40px">
              <p style="text-align:center;color:#666">
                Your lease has been successfully registered.
              </p>

              <table style="width:100%;margin-top:30px">
                <tr>
                  <td><strong>Room:</strong> #${room.houseNumber}</td>
                  <td align="right"><strong>Location:</strong> ${room.location}</td>
                </tr>
                <tr>
                  <td style="padding-top:15px">
                    <strong>Start:</strong> ${start.toLocaleDateString("en-GB")}
                  </td>
                  <td align="right" style="padding-top:15px">
                    <strong style="color:#C5A059">₹${room.price}/month</strong>
                  </td>
                </tr>
              </table>

              <div style="text-align:center;margin-top:40px">
                <a href="${process.env.CLIENT_URL || "#"}"
                   style="background:#1A1A1A;color:#C5A059;
                   padding:16px 32px;border-radius:12px;
                   text-decoration:none;font-weight:900">
                   VIEW DASHBOARD
                </a>
              </div>
            </div>

            <div style="padding:20px;text-align:center;border-top:1px solid #F2EDE4">
              <small>Rentora © Automated Confirmation</small>
            </div>
          </div>
        </div>
      `;

      await sendEmail({
        to: user.email,
        subject: `🏠 Lease Confirmation - Room ${room.houseNumber}`,
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
    if (!req.userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

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

    if (booking.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        message: "You are not allowed to cancel this booking",
      });
    }

    booking.status = "Cancelled";
    await booking.save();

    await Room.findByIdAndUpdate(booking.roomId, {
      status: "Available",
    });

    return res.status(200).json({
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    return res.status(500).json({
      message: "Failed to cancel booking",
      error: error.message,
    });
  }
};
