import express from "express";

import sqlController
from "../controllers/sqlController.js";

const router = express.Router();

router.post(
  "/sql-chat",
  sqlController
);

export default router;