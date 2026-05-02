// Global error handling middleware
// Prevents server crashes and provides consistent error responses

module.exports = function errorHandler(err, req, res, next) {
  console.error('═══════════════════════════════════════');
  console.error('❌ ERROR CAUGHT:', err.message);
  console.error('📍 Route:', req.method, req.path);
  console.error('⏰ Time:', new Date().toISOString());
  console.error('Stack:', err.stack);
  console.error('═══════════════════════════════════════');

  // Default error response
  const response = {
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  };

  // Determine status code
  let statusCode = err.statusCode || err.status || 500;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    response.message = 'Validation error';
    response.details = err.details;
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    response.message = 'Unauthorized';
  } else if (err.name === 'NotFoundError') {
    statusCode = 404;
    response.message = 'Resource not found';
  } else if (err.name === 'DatabaseError' || err.code?.includes('P')) {
    statusCode = 500;
    response.message = 'Database operation failed';
    if (process.env.NODE_ENV === 'development') {
      response.dbError = err.message;
    }
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    response.message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    response.message = 'Token expired';
  }

  // Prevent leaking sensitive info in production
  if (process.env.NODE_ENV === 'production') {
    delete response.error;
    if (statusCode === 500) {
      response.message = 'An error occurred. Please try again later.';
    }
  }

  res.status(statusCode).json(response);
};
