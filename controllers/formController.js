const { Form, Field, Submission } = require('../models');
const formService = require('../services/formService');
const response = require("../utils/responseModel");
const { findAndPaginate } = require("../utils/getHandler");
const { Op, where, Sequelize } = require('sequelize');
const { encryptId } = require('../utils/idCrypt');
const admin = false
exports.createForm = async (req, res) => {
    try {

        const errors = _validateCreateForm(req.body);
        if (errors.length) return res.status(400).json({ errors: errors });

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
        form.schema = payload;
        form.thankYouMessage = payload.thankYouMessage || form.thankYouMessage;
        form.bannerImage = payload.bannerImage || form.bannerImage;
        form.requireEmailVerification = payload.emailVerification
        await form.save();

        await Field.destroy({ where: { formId: form.id } });
        if (Array.isArray(payload.fields)) {
            for (const f of payload.fields) {
                await Field.create({ formId: form.id, fieldId: f.id, definition: f ,createdBy : req.user?.userId || 0   });
            }
        }

        return res.json(response(true,"OK",form));
    } catch (err) {
        console.error(err);
        return res.status(500).json(response(false, 'Server error'));
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
            attributes: ['id', 'title', 'description', 'thankYouMessage', 'bannerImage', 'createdAt',

            [Sequelize.literal(`CASE WHEN Form.publishedAt IS NULL THEN FALSE ELSE TRUE END`),"isPublished"],
            [Sequelize.literal(`(SELECT COUNT(*) FROM submissions WHERE formId = Form.id)`),"submissionCount"]
            ],
            where: {
                deletedAt: { [Op.is]: null },
                ...(admin ? {} : { createdBy: userId })
            },
            order: [['createdAt', 'DESC']]
        });
        const formWithFormId = forms.data.map(form => ({...form,formToken: encryptId(form.id)}))
        return res.status(200).json(response("success", "OK", formWithFormId,forms.meta));
    } catch (err) {
        return res.status(500).json(response(false, "Server error"));
    }
};

exports.getSubmissions = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch submissions with pagination
    const submissions = await findAndPaginate(Submission, req.query, {
      where: { formId: id },
      order: [["createdAt", "DESC"]],
      attributes: [
        "id",
        "email",
        "isVerified",
        "submissionToken",
        "updatedAt",
        "formId",
        "userIP",
        "userAgent",
        "data",
        "referrer",
        "createdAt",
      ],
    });

    // Fetch form schema
    const formSchema = await Form.findOne({ where: { id } });
    const fields = Array.isArray(formSchema?.schema?.fields)
      ? formSchema.schema.fields.map((field) => ({
          id: field.id,
          label: field.label,
          type: field.type,
        }))
      : [];

    const fieldMap = Object.fromEntries(fields.map((f) => [f.id, f]));

    // Format each submission properly
    const formattedData = submissions.data.map((sub, index) => {
      const fieldValues = [];

      for (const [key, value] of Object.entries(sub.data || {})) {
        if (key === "_files") continue; // Skip internal field
        const field = fieldMap[key];
        if (field) {
          fieldValues.push({
            type: field.type,
            label: field.label,
            value : field.type == "uploadFile" ? `${process.env.BACKEND_URL}/uploads/final/${value}`: value ,
          });
        }
      }

      return {
        sl_no: index + 1,
        id: sub.id,
        email: sub.email,
        isVerified: sub.isVerified,
        submissionToken: sub.submissionToken,
        updatedAt: sub.updatedAt,
        createdAt: sub.createdAt,
        formId: sub.formId,
        userIP: sub.userIP,
        userAgent: sub.userAgent,
        referrer: sub.r4eferrer,
        fields: fieldValues,
      };
    });

    res.json(response(true, "OK", formattedData, submissions.meta));
  } catch (error) {
    console.error(error);
    res.status(500).json(response(false, "Server error"));
  }
};

exports.getAllResponses = async (req, res) => {
    try {
        const { id } = req.params;
        req.query.limit = !req.query.limit ? "no" :req.query.limit 
        const submissions = await findAndPaginate(Submission,req.query,
            {
            where: { formId : id },
            order: [["createdAt", "DESC"]],
            attributes: ["id", "email", "isVerified", "submissionToken", "updatedAt","formId","userIP","userAgent","data","referrer"]
        });
        const formSchema = await Form.findOne({where : {id:id }})
        const fields = Array.isArray(formSchema?.schema?.fields) ? formSchema.schema.fields.map(field => ({
      id: field.id,
      label: field.label,
      type : field.type
    })) : [];

    // 3️⃣ Create a quick lookup map for fieldId → label
const fieldMap = Object.fromEntries(fields.map(f => [f.id, f]));

// 4️⃣ Transform each submission’s data
const formattedData = submissions.data.map(sub => {
  const result = [];

  for (const [key, value] of Object.entries(sub.data)) {
    if (key === '_files') continue;
    const field = fieldMap[key];
    if (field) {
      result.push({
        type: field.type,
        label: field.label,
        value
      });
    }
  }

  return result;
});
        res.json(response(true, "OK", formattedData, submissions.meta));
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

    
    const formToken = encryptId(form.id)
    
    if (form.publishedAt) {
        return res.status(400).json(response(false,"Form is already published",encodeURIComponent(formToken)));
    }
    form.publishedAt = new Date();
    await form.save();
    res.json({
      message: "Form published successfully",
      formId: form.id,
      formToken : encodeURIComponent(formToken),
    //   isPublished: true
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

const exportsAllSubmission = async (req,res) => {
    try {
        const id = 8;
         const submissions = await Submission.findAll(
            {
            where: { formId : id },
            order: [["createdAt", "DESC"]],
            attributes: ["data"]
        });
        const formSchema = await Form.findOne({id});

        console.log(submissions)
    } catch (error) {
        res.status(500).json(response(false,"internal Sever Error"))
    }
}
exportsAllSubmission()
const _validateCreateForm = (body) => {
    const errors = []
    if(!body.title) errors.push({msg : 'title required',parmas:'title'})
    if(!body.fields) errors.push({msg : 'fields required',parmas:'fields'})
    if(body.fields && !Array.isArray(body.fields)) errors.push( {msg:'fields must be array' ,paams : 'fields'})
        return errors
    
}