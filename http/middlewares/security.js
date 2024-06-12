import crypto from "node:crypto";

export const security = () => (req, res, next) => {
  const nonce = crypto.randomUUID();

  res.setHeader(
    "Content-Security-Policy",
    `default-src 'none'; script-src 'self' 'nonce-${nonce}'; connect-src 'self'; img-src 'self'; style-src 'self'; frame-ancestors 'self'; form-action 'self';`,
  );
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Strict-Transport-Security", "max-age=63072000");
  res.setHeader("X-Content-Type-Options", "nosniff");

  res.removeHeader("X-Powered-By");

  req.nonce = nonce;

  next();
};
