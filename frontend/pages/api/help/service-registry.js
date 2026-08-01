import { getServiceRegistry, getServiceRegistrySummary, GOFIELDWISE_SERVICE_REGISTRY_VERSION } from "../../../lib/gofieldwise-service-registry";

export default function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  return res.status(200).json({
    ok: true,
    version: GOFIELDWISE_SERVICE_REGISTRY_VERSION,
    registry: getServiceRegistry(),
    summary: getServiceRegistrySummary(),
  });
}
