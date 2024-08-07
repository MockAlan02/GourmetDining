function errorHandler(errors, req) {
  if (errors.isArray()) {
    return req.flash(
      "error",
      errors.map((err) => err.message)
    );
  } else {
    return errors.message;
  }
}

module.exports = { errorHandler };
