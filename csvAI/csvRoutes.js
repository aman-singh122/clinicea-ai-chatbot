import express from "express";

import csvController
from "./csvController.js";

const router =
  express.Router();

router.post(
  "/csv-chat",
  csvController
);

export default router;