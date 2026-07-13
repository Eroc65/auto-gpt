import fs from "fs";
import path from "path";

const FILE_NAME = "GoFieldWise_Trades_Page1_Guide.pdf";

export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const filePath = path.join(process.cwd(), "public", FILE_NAME);

  try {
    const fileBuffer = fs.readFileSync(filePath);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${FILE_NAME}"`);
    res.setHeader("Cache-Control", "public, max-age=3600");
    return res.status(200).send(fileBuffer);
  } catch (error) {
    return res.status(404).json({ ok: false, error: "Guide file not found" });
  }
}
