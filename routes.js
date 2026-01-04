const express = require("express");
const router = express.Router();

// Controllers
const userController = require("./controllers/usercontroller");
const roomController = require("./controllers/roomController");
const bookingController = require("./controllers/bookingController");
const complaintController = require("./controllers/complaintController");
const suggestionController = require("./controllers/suggestionController");

// Middlewares
const jwtMiddleware = require("./middleware/jwtMiddleware");
const jwtAdminMiddleware = require("./middleware/jwtAdminMiddleware");
const multerConfig = require("./middleware/multerMiddleware");

/* =========================
   AUTH ROUTES
========================= */
router.post("/register", userController.registerController);
router.post("/login", userController.loginController);
router.post("/google-login", userController.googleLoginController);

/* =========================
   USER ROUTES
========================= */
router.put(
  "/user-profile-update",
  jwtMiddleware,
  multerConfig.single("profile"),
  userController.userUpdateProfileController
);

/* =========================
   ADMIN USER MANAGEMENT
========================= */
router.get("/all-users", jwtAdminMiddleware, userController.getAllUsersController);
router.delete("/users/:id", jwtAdminMiddleware, userController.deleteUserController);

/* =========================
   ROOM ROUTES
========================= */
router.post("/rooms", jwtAdminMiddleware, multerConfig.array("uploadedImg", 5), roomController.createRoom);
router.get("/rooms", roomController.getAllRooms);
router.get("/rooms/:id", roomController.getRoomById);

// Updated to allow image updates during room editing
router.put(
  "/rooms/:id",
  jwtAdminMiddleware,
  multerConfig.array("uploadedImg", 5), 
  roomController.updateRoom
);

router.delete("/rooms/:id", jwtAdminMiddleware, roomController.deleteRoom);

/* =========================
   BOOKING ROUTES
========================= */
router.post("/bookings", jwtMiddleware, bookingController.createBooking);
router.get("/bookings/user", jwtMiddleware, bookingController.getMyBookings);
router.get("/bookings", jwtAdminMiddleware, bookingController.getAllBookings);

// This hits the soft-delete/cancel logic we wrote earlier
router.delete("/bookings/:id", jwtMiddleware, bookingController.cancelBooking);

/* =========================
   COMPLAINT & SUGGESTION
========================= */
router.post("/complaints", jwtMiddleware, complaintController.createComplaint);
router.get("/complaints", jwtAdminMiddleware, complaintController.getAllComplaints);
router.delete("/complaints/:id", jwtAdminMiddleware, complaintController.deleteComplaint);

router.post("/suggestions", jwtMiddleware, suggestionController.createSuggestion);
router.get("/suggestions", jwtAdminMiddleware, suggestionController.getAllSuggestions);
router.delete("/suggestions/:id", jwtAdminMiddleware, suggestionController.deleteSuggestion);

module.exports = router;