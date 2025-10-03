const bcrypt = require('bcrypt');
const { sequelize, User, Form, Field } = require('./models');
const config = require('./config/config');

async function runSeed() {
  await sequelize.sync({ force: true });
  const pass = await bcrypt.hash('adminpassword', 10);
  const admin = await User.create({ email: 'admin@example.com', name: 'Admin', passwordHash: pass, role: 'admin' });

  // sample form JSON (from your example)
  const sampleFormJson = {
    title: "Sample Registration",
    description: "Please fill out this sample form.",
    fields: [
      {
        id: "field_1759421871840",
        type: "select",
        label: "Haii",
        required: false,
        conditions: [
          { field: "field_1759421915968", value: "false" }
        ],
        options: ["Option 1", "Option 2"],
        placeholder: "Enter text...",
        min: "",
        max: ""
      },
      {
        id: "field_1759421901559",
        type: "checkbox",
        label: "New Choice",
        required: true,
        conditions: [],
        options: ["Option 1", "Option 2"],
        defaultChecked: false
      },
      {
        id: "field_1759421915968",
        type: "uploadFile",
        label: "File Upload",
        required: true,
        conditions: [],
        options: [],
        accept: "",
        maxSize: ""
      },
      {
        id: "field_1759421924740",
        type: "number",
        label: "Number Input",
        required: true,
        conditions: [],
        placeholder: "Enter number...",
        min: "",
        max: ""
      }
    ],
    thankYouMessage: "Thanks for your submission!",
    bannerImage: ""
  };

  const form = await Form.create({
    title: sampleFormJson.title,
    description: sampleFormJson.description,
    json: sampleFormJson,
    thankYouMessage: sampleFormJson.thankYouMessage,
    bannerImage: sampleFormJson.bannerImage,
    createdBy: admin.id
  });

  for (const f of sampleFormJson.fields) {
    await Field.create({ formId: form.id, fieldId: f.id, definition: f });
  }

  console.log('Seed complete. Admin user: admin@example.com / adminpassword');
  process.exit(0);
}

runSeed().catch(err => {
  console.error(err);
  process.exit(1);
});
