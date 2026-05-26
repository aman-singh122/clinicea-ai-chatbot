import express
from "express";

import dashboardController
from "./dashboardController.js";

const router =
  express.Router();

router.get(

  "/dashboard/appointments",

  dashboardController

);

export default router;