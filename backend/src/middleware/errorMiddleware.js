export const notFound = (req, _res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

export const errorHandler = (error, _req, res, _next) => {
  const statusCode = error.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);

  if (error.name === "ValidationError") {
    res.status(400).json({
      message: "Validation error",
      details: Object.values(error.errors).map((entry) => entry.message)
    });
    return;
  }

  if (error.name === "CastError") {
    res.status(404).json({ message: "Resource not found" });
    return;
  }

  if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
    res.status(401).json({ message: "Invalid or expired token" });
    return;
  }

  res.status(statusCode).json({
    message: error.message || "Server error",
    stack: process.env.NODE_ENV === "production" ? undefined : error.stack
  });
};
