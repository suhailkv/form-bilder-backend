require('dotenv').config();

module.exports = {
  app: {
    port: process.env.PORT || 3001,
    jwtSecret: process.env.JWT_SECRET || 'very-secure-secret',
    tokenExpiry: '7d'
  },
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'form_builder_db',
    dialect: 'mysql',
    logging: false
  },
  uploadsDir: process.env.UPLOADS_DIR || 'uploads'
};
