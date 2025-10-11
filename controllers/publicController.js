// controllers/publicController.js
const { Form, Submission, Otp ,OtpVerifyCount} = require("../models");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const axios = require("axios");
const {encryptId,decryptId} = require("../utils/idCrypt");
const { Op } = require("sequelize");
const response = require("../utils/responseModel")
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
    const {encodedToken} = req.params
    const token = decodeURIComponent(encodedToken);
    const formId = decryptId(token)
    const form = await Form.findOne({ where: { id: formId, publishedAt: {[Op.not] : null } } });
    if (!form) return res.status(404).json(response(false,"Form not found or unpublished"));
    res.json(response(true,"OK",form));
  } catch (err) {
  res.status(500).json(response(false,err.message ));
  }
};

// Step 1: Request OTP (only if email verification enabled)
exports.requestOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    const formToken = req.params.formId
    const formId = decryptId(formToken)
    const form = await Form.findOne({ where: { id: formId} });
    if (!form || !form.requireEmailVerification) {
      return res.status(400).json({ message: "Form does not require email verification" });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const now = new Date()
    await Otp.create(
        { email, 
            otp, 
            type : 'FORM_SUBMISSION',
        expiresAt ,
    createdAt : now});

    const resp = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is: ${otp}`
    });
    console.log(resp)
    if(resp.rejected.length)  return res.status(500).json(response(false,"pleas Try again"))
    res.json(response(true,"OTP sent to email" ));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Step 2: Verify OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp} = req.body;
    const formToken = req.params.formId
    console.log(formToken)
    const record = await Otp.findOne({ where: { email, otp } , order: [["createdAt", "DESC"]] });
    // decrypt form Token and 
    const formId = decryptId(formToken)
    const form = await Form.findOne({
        where : {
            id : formId
        }
    })
    if(!form) return res.status(400).json(response(false,"Not acceptable"))
    if (!record || record.expiresAt < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    await record.destroy();
    const otpcount = await OtpVerifyCount.findOne({
        where : {
           email : email,
        formId : formId, 
        }
    })
    if(!otpcount){

        await OtpVerifyCount.create({
            email : email,
            formId : formId,
            count : 1,
            createdAt : new Date()
        })
    }else{

        otpcount.count += 1
        await otpcount.save()
    }
    res.json({ message: "OTP verified successfully", verified: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Step 3: Submit Form
exports.submitForm = async (req, res) => {
  try {
    const form = await Form.findOne({ where: { id: req.params.formId } });
    if (!form) return res.status(404).json(response(false,"Form not found or unpublished" ));

    const { email, data, captchaToken } = req.body;
// TODO : need to check email is verofoed or not
    // Case 1: Email Verification Enabled
    if (form.requireEmailVerification) {
      if (!email) return res.status(400).json(response(false,"Email required" ));

      // Check submission limit per email
      const submissionCount = await Submission.count({ where: { formId: form.id, email } });
      if (submissionCount >= form.maxSubmissionsPerUser) {
        return res.status(400).json(response(false,"Submission limit reached for this form" ));
      }

      // Ensure OTP was verified
      const otpRecord = await Otp.findOne({ where: { email } });
      if (otpRecord) return res.status(400).json(response(false,"OTP not verified" ));

      // Save submission
      const submission = await Submission.create({
        formId: form.id,
        email,
        isVerified: true,
        data
      });

      return res.status(201).json(response(true,"Submission successful", {submissionId: submission.id} ));
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
