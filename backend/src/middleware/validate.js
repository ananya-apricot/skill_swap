// Takes a zod "rulebook" and returns a checkpoint that enforces it
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Invalid input",
      errors: result.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      })),
    });
  }

  req.body = result.data; // use the cleaned data from here on
  next(); // pass the request to the next step
};

module.exports = validate;