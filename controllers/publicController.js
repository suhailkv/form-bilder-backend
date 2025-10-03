// controllers/publicController.js
const { Form, Submission, Otp } = require("../models");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const axios = require("axios");

// Mailer setup
const transporter = nodemailer.createTransport({
  service: "gmail", // or SMTP
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Step 0: Fetch Form
exports.getForm = async (req, res) => {
  try {
    const form = await Form.findOne({ where: { id: req.params.formId, isPublished: true } });
    if (!form) return res.status(404).json({ message: "Form not found or unpublished" });
    res.json(form);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Step 1: Request OTP (only if email verification enabled)
exports.requestOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const form = await Form.findOne({ where: { id: req.params.formId, isPublished: true } });
    if (!form || !form.requireEmailVerification) {
      return res.status(400).json({ message: "Form does not require email verification" });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await Otp.create({ email, otp, expiresAt });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is: ${otp}`
    });

    res.json({ message: "OTP sent to email" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Step 2: Verify OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = await Otp.findOne({ where: { email, otp } });

    if (!record || record.expiresAt < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    await record.destroy();
    res.json({ message: "OTP verified successfully", verified: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Step 3: Submit Form
exports.submitForm = async (req, res) => {
  try {
    const form = await Form.findOne({ where: { id: req.params.formId, isPublished: true } });
    if (!form) return res.status(404).json({ message: "Form not found or unpublished" });

    const { email, data, captchaToken } = req.body;

    // Case 1: Email Verification Enabled
    if (form.requireEmailVerification) {
      if (!email) return res.status(400).json({ message: "Email required" });

      // Check submission limit per email
      const submissionCount = await Submission.count({ where: { formId: form.id, email } });
      if (submissionCount >= form.maxSubmissionsPerUser) {
        return res.status(400).json({ message: "Submission limit reached for this form" });
      }

      // Ensure OTP was verified
      const otpRecord = await Otp.findOne({ where: { email } });
      if (otpRecord) return res.status(400).json({ message: "OTP not verified" });

      // Save submission
      const submission = await Submission.create({
        formId: form.id,
        email,
        isVerified: true,
        data
      });

      return res.status(201).json({ message: "Submission successful", submissionId: submission.id });
    }

    // Case 2: Email Verification Disabled → use CAPTCHA
    if (!captchaToken) {
      return res.status(400).json({ message: "CAPTCHA required" });
    }

    // Verify CAPTCHA (Google reCAPTCHA example)
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET,
          response: captchaToken
        }
      }
    );

    if (!response.data.success) {
      return res.status(400).json({ message: "CAPTCHA verification failed" });
    }

    // Save submission
    const submission = await Submission.create({
      formId: form.id,
      data,
      isVerified: false
    });

    res.status(201).json({ message: "Submission successful", submissionId: submission.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
