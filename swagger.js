const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'Form Builder API', version: '1.0.0' }
  },
  apis: ['./routes/*.js', './controllers/*.js'] // basic
};

const spec = swaggerJSDoc(options);

module.exports = { swaggerUi, spec };
