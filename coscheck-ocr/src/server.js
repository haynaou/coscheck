const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const path = require('path');
const fileUpload = require("express-fileupload");

const fileUploadOptions = {
  debug: process.env.NODE_ENV === "development",
  useTempFiles: true,
  tempFileDir: "/tmp/",
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  abortOnLimit: true
};
const api = require("./api");

// ================ Middlewares ================
const notFoundMiddleware = (req, res, next) => {
  res.status(404);
  const error = new Error(`Not Found - ${req.originalUrl}`);
  next(error);
};

const errorHandlerMiddleware = (err, req, res, next) => {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack
  });
};

// ================ Express app ================
const app = express();

app.use(morgan("dev"));
app.use(helmet());
app.use(cors({ origin: "*" }));
app.use(fileUpload(fileUploadOptions));

app.get("/", (req, res) => {
  res.json({ message: "Coscheck 💅 OCR backend" });
});

app.use("/api/", api);
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Listening: http://localhost:${port}`);
});
