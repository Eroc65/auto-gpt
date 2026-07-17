import { buildVoiceTwiml } from "../../../../lib/twilio-rank-rent";

export default function handler(req, res) {
  if (req.method !== "POST" && req.method !== "GET") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const { status, body } = buildVoiceTwiml(req, req.query?.market);
  res.setHeader("Content-Type", "text/xml; charset=utf-8");
  return res.status(status).send(body);
}