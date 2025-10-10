// controllers/submissionController.js
const { Submission, Form } = require('../models');
const { validateSubmissionData } = require('../utils/submissionValidator');
const response = require("../utils/responseModel");

const crypto = require('crypto');
const { decrypt } = require('dotenv');
const { decryptId } = require('../utils/idCrypt');

/**
 * Submit a form with optional file uploads
 * Route: POST /api/forms/:id/submit
 */
exports.submitForm = [
  async (req, res) => {
    try {
      const formToken = req.params.id;
      const formId = decryptId(formToken)
      
      if (!formId || isNaN(formId)) return res.status(400).json(response(false,"Invalid form"))
     

      // Fetch form details
      const form = await Form.findByPk(formId);
      if (!form) return res.status(404).json(response(false,'Form not found'))
       

      if (!form.publishedAt) return res.status(403).json(response(false,'This form is not accepting submissions'))
    

      // Parse submission data
      let parsedData = req.body.data || req.body;
      if (typeof parsedData === 'string') {
        try {
          parsedData = JSON.parse(parsedData);
        } catch (err) {
          return res.status(400).json(response(false,'Invalid data format'))
       
        }
      }

      // Extract email
      const submissionEmail = req.body.email || parsedData.email || null;

      

      // Check submission limits
      if (submissionEmail && form.maxSubmissionsPerUser > 0) {
        const existingCount = await Submission.count({
          where: {
            formId: form.id,
            email: submissionEmail
          }
        });

        if (existingCount >= form.maxSubmissionsPerUser) {
          return res.status(429).json(response(false,`You have reached the maximum ${form.maxSubmissionsPerUser} submission(s) allowed for this form`))
        }
      }
      const requiresVerification = form.
      requireEmailVerification 
      if(requiresVerification && !req.isVerified) return res.status(401).json(response(false,'Please Verify Email'))

// Validate against form schema
      if (form.schema) {
        const validation = await validateSubmissionData(parsedData, form.schema);
        if (!validation.isValid) {
          return res.status(400).json(response(false,'Validation failed',validation.errors ))
        }
      }
      // Process uploaded files
      const filesMap = {};
      if (Array.isArray(req.files) && req.files.length > 0) {
        for (const file of req.files) {
          filesMap[file.fieldname] = file.filename;
        }
      }

      // Prepare final data with file references
      const finalData = {
        ...parsedData,
        _files: filesMap
      };

      // Create submission
      const submission = await Submission.create({
        formId: form.id,
        email: submissionEmail,
        isVerified: !form.requireEmailVerification,
        data: finalData,
        userIP: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'] || null,
        referrer: req.headers['referer'] || req.headers['referrer'] || null
      });

      // Handle email verification if required
    //   const requiresVerification = form.requireEmailVerification 
      
    //   if (requiresVerification) {
    //     // TODO: Send verification email
    //     console.log(`Send verification email to: ${submissionEmail}`);
    //     console.log(`Verification token: ${submission.submissionToken}`);
    //     // await emailService.sendVerificationEmail(submissionEmail, submission.submissionToken);
    //   }

      return res.status(201).json({
        success: true,
        submissionId: submission.id,
        submissionToken: submission.submissionToken,
        message: form.thankYouMessage || 'Thank you for your submission!',
        requiresVerification
      });

    } catch (err) {
      console.error('Submission error:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Unable to process submission. Please try again.' 
      });
    }
  }
];


/**
 * Get single submission by token (for user to view their submission)
 * Route: GET /api/submissions/:token
 */
exports.getSubmissionByToken = async (req, res) => {
  try {
    const { token } = req.params;
    
    const submission = await Submission.findOne({
      where: { submissionToken: token },
      include: [{
        model: Form,
        attributes: ['id', 'title', 'description', 'thankYouMessage']
      }]
    });

    if (!submission) {
      return res.status(404).json({ 
        success: false, 
        message: 'Submission not found' 
      });
    }

    return res.json(response(true,submission))
       

  } catch (err) {
    console.error('Get submission error:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Unable to retrieve submission' 
    });
  }
};