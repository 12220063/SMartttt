const express = require("express");
const multer = require("multer");
const { uploadImage } = require("../controllers/userController");

const upload = multer({ dest: "uploads/" });
const router = express.Router();

router.post("/upload", upload.single("image"), uploadImage);

module.exports = router;
