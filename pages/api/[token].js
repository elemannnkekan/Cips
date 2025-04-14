// Dinamik olarak verilen token'ı kontrol eden endpoint

const keys = {}; // Bu örnekte RAM'de tutuluyor, üretim için veritabanı önerilir

export function createKey(ip, userId, durationMs = 60000) {
  const token = crypto.randomUUID();
  const now = Date.now();
  const keyData = {
    valid: true,
    deleted: false,
    info: {
      token,
      createdAt: now,
      expiresAfter: now + durationMs,
      userId,
    },
  };
  keys[token] = keyData;
  return keyData;
}

export function getKeyByToken(token) {
  const keyData = keys[token];
  if (!keyData || Date.now() > keyData.info.expiresAfter) {
    return { valid: false };
  }
  return keyData;
}

export default function handler(req, res) {
  const { token } = req.query;

  const keyData = getKeyByToken(token);
  res.status(200).json(keyData);
}
