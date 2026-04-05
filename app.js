const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const routes = require('./routes');
const errorHandler = require('./middleware/error.middleware');

const app = express();

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const { globalLimiter } = require('./middleware/rate_limit.middleware');

// Rate limiting (Global Protection)
app.use(globalLimiter);

// API Routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

module.exports = app;
