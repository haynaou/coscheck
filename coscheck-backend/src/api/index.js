const express = require("express");
const ocrApi = require("./ocr");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    message: "Coscheck API - 👋"
  });
});

router.use("/ocr", ocrApi);

module.exports = router;
