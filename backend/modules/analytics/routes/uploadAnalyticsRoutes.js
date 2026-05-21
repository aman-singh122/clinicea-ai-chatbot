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

const upload = multer({ storage });

// =========================
// ROUTE
// =========================

router.post(
  "/upload-analytics",

  upload.single("file"),

  uploadAnalyticsController,
);

export default router;
