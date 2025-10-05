const { Form ,OtpVerifyCount} = require("../models");
const OtpVerifyCount = require("../models/OtpVerifyCount");
const {decryptId} = require("../utils/idCrypt")
const response = require("../utils/responseModel")
async function checkOtpVerified(req, res, next) {

    try {
        const email = req.body.email;
        const formToken = parseInt(req.params.id);
        const formId = decryptId(formToken)
        const form = await Form.findByPk(formId);
        if (!form) return res.status(404).json(response(false,'Form not found'))
            req.isVerified = false
        const isEmailVerifRequired = form.isEmailVerifRequired;
    if(!isEmailVerifRequired) return next();
    const verifyCount = await OtpVerifyCount.findOne({
        where : {
            email,
            formId,
        }
    });
    if(!verifyCount || verifyCount?.count < 1) res.status(400).json(response(false,"Please Verify Your Email"));
    next()

    } catch (error) {
        return res.status(500).json(response(false,"internal Sever Error"))
    }
}