// utils/asyncHandler.js
// Wraps async route handlers so any thrown error / rejected promise
// is automatically forwarded to the Express error handler middleware,
// avoiding repetitive try/catch blocks in every controller.

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
