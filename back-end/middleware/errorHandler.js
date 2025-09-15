function errorHandler(err, req, res, next) {
  console.error("Error:", err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Something went wrong!',
  });
}

module.exports = errorHandler;
