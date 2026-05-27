import dotenv from "dotenv";

dotenv.config();

import CryptoJS from "crypto-js";

const SECRET =
  process.env.ENCRYPTION_SECRET;

// =========================
// ENCRYPT
// =========================

export function encrypt(text) {

  return CryptoJS.AES.encrypt(
    text,
    SECRET
  ).toString();

}

// =========================
// DECRYPT
// =========================

export function decrypt(cipher) {

  const bytes =
    CryptoJS.AES.decrypt(
      cipher,
      SECRET
    );

  return bytes.toString(
    CryptoJS.enc.Utf8
  );

}