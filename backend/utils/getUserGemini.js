import fs from "fs";

import path from "path";

import {
  decrypt
}
from "./encryption.js";

// =========================
// PATH
// =========================

const apiKeysPath =
  path.join(
    "data",
    "apiKeys.json"
  );

// =========================
// GET USER GEMINI KEY
// =========================

function getUserGemini(user) {

  // =========================
  // FILE EXISTS
  // =========================

  if (
    !fs.existsSync(apiKeysPath)
  ) {

    return null;

  }

  // =========================
  // READ
  // =========================

  const apiKeys = JSON.parse(

    fs.readFileSync(
      apiKeysPath,
      "utf-8"
    )

  );

  // =========================
  // USER KEY
  // =========================

  const encryptedKey =
    apiKeys[user];

  if (!encryptedKey) {

    return null;

  }

  // =========================
  // RETURN DECRYPTED
  // =========================

  return decrypt(
    encryptedKey
  );

}

export default getUserGemini;