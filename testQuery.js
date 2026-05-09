import dotenv from "dotenv";

dotenv.config();

import queryToJson
from "./analytics/queryToJson.js";

const result =
  await queryToJson(
    "top 5 doctors by revenue from jan to march"
  );

console.log(result);