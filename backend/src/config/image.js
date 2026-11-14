// Builds the public photo URL from the stored object key, mirroring
// buildImageUrl() in backend/cloudflare/index.js.

function buildImageUrl(imageKey) {
  const base = (process.env.IMAGE_BASE_URL || "").trim().replace(/\/+$/, "");

  if (!base || typeof imageKey !== "string" || !imageKey) {
    return null;
  }

  const encodedKey = imageKey.split("/").map(encodeURIComponent).join("/");

  return `${base}/${encodedKey}`;
}

// Replace the internal image_key column with a public image_url.
function withImageUrl(vendor) {
  const { image_key: imageKey, ...rest } = vendor;

  return { ...rest, image_url: buildImageUrl(imageKey) };
}

module.exports = { buildImageUrl, withImageUrl };
