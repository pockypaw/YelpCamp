// handler/errorHandlers.js
const AppError = require("./AppError");

// const handleValidationErr = (err) => {
//   //In a real app, we would do a lot more here...
//   return new AppError(`Validation Failed...${err.message}`, 400);
// };

const globalErrorHandler = (err, req, res, next) => {
  //We can single out particular types of Mongoose Errors:
//   if (err.name === "ValidationError") err = handleValidationErr(err);
  next(err);
};

module.exports = { globalErrorHandler };
