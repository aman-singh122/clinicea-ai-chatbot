import express from "express";

import multer from "multer";

import path from "path";

import fs from "fs";

import uploadAnalyticsController from "../controllers/uploadAnalyticsController.js";

const router = express.Router();

// =========================
// STORAGE
// =========================

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const user = req.body.user || "user1";

    const dir = path.join("data", user, "temp");

    // =========================
    // CREATE FOLDER IF MISSING
    // =========================

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },

  filename: function (req, file, cb) {
    // =========================
    // CLEAN FILE NAME
    // =========================

    const cleanName = file.originalname

      .toLowerCase()

      .replace(/\s+/g, "_")

      .replace(/report/gi, "")

      .replace(/[^\w.-]/g, "")

      .replace(/__+/g, "_")

      .trim();

    cb(null, cleanName);
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 20 * 1024 * 1024 * 1024, // 20 GB
  },
});

console.log("MULTER READY");
// =========================
// ROUTE
// =========================

router.use((req, res, next) => {

  req.on("aborted", () => {

    console.log("REQUEST ABORTED BY CLIENT");

  });

  next();

});


router.post(
  "/upload-analytics",

  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err) {
        console.log("MULTER ERROR:", err);

        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      next();
    });
  },

  uploadAnalyticsController
);

export default router;
