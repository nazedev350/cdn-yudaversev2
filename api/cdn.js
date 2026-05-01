const GITHUB_RAW = "https://raw.githubusercontent.com/nazedev350/cdn-yudaversev2/main";

// Map ekstensi ke Content-Type yang benar
const MIME = {
  // Gambar
  png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg",
  gif: "image/gif", webp: "image/webp", svg: "image/svg+xml",
  ico: "image/x-icon", bmp: "image/bmp", avif: "image/avif",
  // Video
  mp4: "video/mp4", webm: "video/webm", ogg: "video/ogg",
  mov: "video/quicktime", avi: "video/x-msvideo", mkv: "video/x-matroska",
  // Audio
  mp3: "audio/mpeg", wav: "audio/wav", flac: "audio/flac",
  aac: "audio/aac", m4a: "audio/mp4", opus: "audio/opus",
  // Dokumen
  pdf: "application/pdf", txt: "text/plain",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  // Arsip
  zip: "application/zip", rar: "application/x-rar-compressed",
  "7z": "application/x-7z-compressed", tar: "application/x-tar",
  gz: "application/gzip",
  // Web
  json: "application/json", xml: "application/xml",
  js: "application/javascript", css: "text/css", html: "text/html",
};

export default async function handler(req, res) {
  const file = req.query.file;

  if (!file) {
    return res.status(400).json({ error: "File parameter required" });
  }

  const url = `${GITHUB_RAW}/${file}`;
  const ext = file.split(".").pop().toLowerCase();
  const contentType = MIME[ext] || "application/octet-stream";

  // Tipe file yang bisa di-preview di browser (inline)
  const inlineTypes = [
    "image/", "video/", "audio/", "text/", "application/pdf",
    "application/json", "application/javascript", "text/css",
  ];
  const isInline = inlineTypes.some((t) => contentType.startsWith(t));

  try {
    const ghRes = await fetch(url);

    if (!ghRes.ok) {
      if (ghRes.status === 404) return res.status(404).json({ error: "File not found" });
      return res.status(ghRes.status).json({ error: "GitHub error" });
    }

    // Set header agar browser preview (bukan download)
    res.setHeader("Content-Type", contentType);
    res.setHeader(
      "Content-Disposition",
      isInline ? `inline; filename="${file}"` : `attachment; filename="${file}"`
    );
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.setHeader("Access-Control-Allow-Origin", "*");

    // Stream response dari GitHub ke client
    const buffer = await ghRes.arrayBuffer();
    res.status(200).send(Buffer.from(buffer));
  } catch (err) {
    res.status(500).json({ error: "Fetch failed: " + err.message });
  }
    }

