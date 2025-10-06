const { Form, Field, Submission } = require('../models');
const formService = require('../services/formService');
const response = require("../utils/responseModel");
const { findAndPaginate } = require("../utils/getHandler");
const { Op, where } = require('sequelize');
const { encryptId } = require('../utils/idCrypt');
const admin = false
exports.createForm = async (req, res) => {
    try {

        const errors = _validateCreateForm(req.body);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const payload = req.body;
        const form = await formService.createForm(payload, req.user.userId);
        return res.status(201).json(response(true, "Form created", form));
    } catch (err) {
        console.error(err);
        return res.status(500).json(response(false, "Server error"));
    }
};

exports.updateForm = async (req, res) => {
    try {
        const id = req.params.id;
        const form = await Form.findByPk(id);
        if (!form) return res.status(404).json({ message: 'Form not found' });
        if (admin === false && form.createdBy !== req.user.userId) {
            return res.status(403).json(response(false, "Forbidden"));
        }
        const payload = req.body;
        form.title = payload.title || form.title;
        form.description = payload.description || form.description;
        form.json = payload;
        form.thankYouMessage = payload.thankYouMessage || form.thankYouMessage;
        form.bannerImage = payload.bannerImage || form.bannerImage;
        await form.save();

        await Field.destroy({ where: { formId: form.id } });
        if (Array.isArray(payload.fields)) {
            for (const f of payload.fields) {
                await Field.create({ formId: form.id, fieldId: f.id, definition: f });
            }
        }

        return res.json({ form });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteForm = async (req, res) => {
    try {

        const id = req.params.id;

        const form = await Form.findOne({
            where: {
                deletedAt: { [Op.is]: null },
                id: id,
                ...(admin ? {} : { createdBy: req.user.userId })
            }
        });
        if (!form) return res.status(404).json(response(false, 'Form not found'));

        // Soft delete related fields
        await Field.update(
            { deletedAt: new Date(), deletedBy: req.user.id },
            { where: { formId: id } }
        );

        // Soft delete the form
        await form.update({
            deletedAt: new Date(),
            deletedBy: req.user.id
        });

        return res.json(response(true, 'Form deleted successfully'));
    } catch (err) {
        console.error(err);
        return res.status(500).json(response(false, "Server error"));
    }
};


exports.getForm = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user.userId;
        const form = await Form.findByPk(id,
            {
                where: {
                    deletedAt: { [Op.is]: null },
                    ...(admin ? {} : { createdBy: userId })
                }
            }
        );
        if (!form) return res.status(404).json(response(false, "Form not found"));
        return res.status(200).json(response(true, "OK", form));
    } catch (err) {
        return res.status(500).json(response(false, "Server error"));
    }
};

exports.listForms = async (req, res) => {
    try {
        const userId = req.user.userId;
        const forms = await findAndPaginate(Form, req.query, {
            attributes: ['id', 'title', 'description', 'thankYouMessage', 'bannerImage', 'createdAt'],
            where: {
                deletedAt: { [Op.is]: null },
                ...(admin ? {} : { createdBy: userId })
            },
            order: [['createdAt', 'DESC']]
        });
        return res.status(200).json(response("success", "OK", forms));
    } catch (err) {
        return res.status(500).json(response(false, "Server error"));
    }
};

exports.getSubmissions = async (req, res) => {
    try {
        const { id } = req.params;

        const submissions = await Submission.findAll({
            where: { formId : id },
            order: [["createdAt", "DESC"]],
            attributes: ["id", "email", "isVerified", "submissionToken", "createdAt","fromId"]
        });

        res.json(response(true, "OK", submissions));
    } catch (error) {
        console.error(error);
        res.status(500).json(response(false, "Server error"));
    }
}

exports.publish = async (req,res) => {
    try {
    const { formId } = req.params;

    const form = await Form.findByPk(formId);
    if (!form) return res.status(404).json({ message: "Form not found" });

    
    form.publishedAt = new Date();
    const formToken = encryptId(form.id)
    
    if (form.publishedAt) {
      return res.status(400).json(response(false,"Form is already published",encodeURIComponent(formToken)));
    }
    await form.save();
    res.json({
      message: "Form published successfully",
      formId: form.id,
      formToken : encodeURIComponent(formToken),
      isPublished: true
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}

exports.getTokenOfAForm = async (req,res) => {
    try {
        const id = req.params.id;
        const encryptid = encodeURIComponent(encryptId(id));
        res.status(200).json(true,encryptid)
    } catch (error) {
        res.status(500).json(response(false,"internal Sever Error"))
    }
}

const _validateCreateForm = (body) => {
    const errors = []
    if(!body.title) errors.push({msg : 'title required',parmas:'title'})
    if(!body.fields) errors.push({msg : 'fields required',parmas:'fields'})
    if(body.fields && !Array.isArray(body.fields)) errors.push( {msg:'fields must be array' ,paams : 'fields'})
        return errors
    
}