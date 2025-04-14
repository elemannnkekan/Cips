import fs from "fs";
import path from "path";
import crypto from "crypto";

export default async function handler(req, res) {
  const filePath = path.resolve("/tmp", "tokens.json");

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({}));
  }

  let data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const now = Date.now();

  const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.connection.remoteAddress;
  const expiryDuration = 60 * 1000; // 1 dakika
  const existing = data[ip];

  if (existing && now < existing.expiresAfter) {
    return res.status(200).json({ valid: true, deleted: false, info: existing });
  }

  if (existing && now > existing.expiresAfter) {
    return res.status(200).json({ valid: false, deleted: true, info: null });
  }

  const token = crypto.randomUUID();
  const createdAt = now;
  const expiresAfter = now + expiryDuration;

  data[ip] = { token, createdAt, expiresAfter };
  fs.writeFileSync(filePath, JSON.stringify(data));

  return res.status(200).json({ valid: true, deleted: false, info: data[ip] });
}
