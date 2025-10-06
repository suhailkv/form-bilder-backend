const express = require("express");
const router = express.Router();
const publicController = require("../controllers/publicController");
const rateLimit = require("express-rate-limit");

// Rate limiting for submissions without email verification
const submissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 5, // max 5 per IP
  message: { message: "Too many submissions from this IP, try again later" }
});

router.get("/:encodedToken", publicController.getForm);

router.post("/:formId/request-otp", publicController.requestOtp);
router.post("/:formId/verify-otp", publicController.verifyOtp);
router.post("/forms/:formId/submissions", submissionLimiter, publicController.submitForm);

module.exports = router;
