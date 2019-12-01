const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const path = require('path');

const fileUpload = require("express-fileupload");
require("dotenv").config();

const middlewares = require("./middlewares");
const api = require("./api");

const app = express();

app.use(morgan("dev"));
app.use(helmet());
app.use(cors({ origin: "*" }));
app.use("/static", express.static(path.join(__dirname, "../data/")));

const fileUploadOptions = {
  debug: process.env.NODE_ENV === "development",
  useTempFiles: true,
  tempFileDir: "/tmp/",
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  abortOnLimit: true
};
app.use(fileUpload(fileUploadOptions));

app.get("/", (req, res) => {
  res.json({
    message: "🦄🌈✨👋🌎🌍🌏✨🌈🦄"
  });
});

app.use("/api/", api);
app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Listening: http://localhost:${port}`);
});
