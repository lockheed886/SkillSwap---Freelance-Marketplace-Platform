// server/middleware/errorMiddleware.js

// Not Found Handler (for non-existent routes)
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error); // Pass error to the general error handler
};

// General Error Handler
const errorHandler = (err, req, res, next) => {
    // Sometimes error might come with status code 200, set to 500 if so
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        // Provide stack trace only in development mode
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = { notFound, errorHandler };