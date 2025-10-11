const express = require('express');
const cors = require('cors');
const path = require("path")
// const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const { sequelize } = require('./models');
const config = require('./config/config');
const logger = require('./utils/logger');
const compression = require("compression")

// const authRoutes = require('./routes/authRoutes');
const formRoutes = require('./routes/formRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const publicRouter = require("./routes/publicRoutes")
const { swaggerUi, spec } = require('./swagger');

// uploads

const uploadRouter = require('./routes/upload.routes');
const multerErrorHandler = require('./middlewares/multerErrorHandler');
const app = express();
app.use(compression());
const cookieParser = require('cookie-parser')
app.use(
  express.static(path.resolve(__dirname, config.buildRelativePath), {
    maxAge: "1y", // cache for one year
    immutable: true,
    index: false,
  })
);

app.use(cors({credentials: true, origin: true}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// app.use(bodyParser.json({ limit: '10mb' }));

// uploads

app.use('/api', uploadRouter);
// Multer-specific error handler (must come after routes)
app.use(multerErrorHandler);

app.use('/uploads', express.static('uploads'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300
});
app.use(limiter);

// Routes
// app.use('/api/auth', authRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/forms',publicRouter)
// Swagger
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(spec));

// Health
app.get('/health', (req, res) => res.json({ ok: true }));

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, `${buildRelativePath}/index.html`));
});
// Start server after DB connect
const start = async () => {
  try {
    await sequelize.authenticate();
    // await sequelize.sync(); // in prod, use migrations; sync is acceptable for demo
    app.listen(config.app.port, () => {
      logger.info(`Server listening on port ${config.app.port}`);
    });
  } catch (err) {
    logger.error('Failed to start server: ' + err.message);
    process.exit(1);
  }
};
start();

module.exports = app;
