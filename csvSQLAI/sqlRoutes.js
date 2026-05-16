import express from "express";

import sqlController
from "./sqlController.js";

const router =
  express.Router();

router.post(
  "/sql-chat",
  sqlController
);

export default router;


// if any post req will come then run sqlController
//  sqlController(req,res);