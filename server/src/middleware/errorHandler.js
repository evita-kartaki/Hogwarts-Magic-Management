export const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.code === 11000) {
    return res.status(409).json({
      message: "Duplicate name. 'name' must be unique.",
      details: err.keyValue,
    });
  }

  res.status(400).json({ message: err.message || "Something went wrong" });
};
